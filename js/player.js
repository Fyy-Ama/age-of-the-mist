// 迷雾纪元 - 玩家

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = PLAYER_SIZE;
        this.height = PLAYER_SIZE;
        this.speed = PLAYER_SPEED;
        this.facingDirection = 'down';
        this.isMoving = false;
        this.currentRegionId = null;
        this.hp = PLAYER_MAX_HP;
        this.maxHp = PLAYER_MAX_HP;
        this.walkFrame = 0;
        this._walkTime = 0;
    }

    update(dt, input, worldMap) {
        let dx = 0;
        let dy = 0;

        if (input.isKeyDown('w') || input.isKeyDown('arrowup')) {
            dy -= 1;
            this.facingDirection = 'up';
        }
        if (input.isKeyDown('s') || input.isKeyDown('arrowdown')) {
            dy += 1;
            this.facingDirection = 'down';
        }
        if (input.isKeyDown('a') || input.isKeyDown('arrowleft')) {
            dx -= 1;
            this.facingDirection = 'left';
        }
        if (input.isKeyDown('d') || input.isKeyDown('arrowright')) {
            dx += 1;
            this.facingDirection = 'right';
        }

        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        this.isMoving = dx !== 0 || dy !== 0;

        if (this.isMoving) {
            this._walkTime += dt;
            this.walkFrame = Math.floor(this._walkTime / 0.15) % 2;
        } else {
            this._walkTime = 0;
            this.walkFrame = 0;
        }

        const moveX = dx * this.speed * dt;
        const moveY = dy * this.speed * dt;

        if (worldMap) {
            const entity = { x: this.x, y: this.y, w: this.width, h: this.height };
            const searchRect = {
                x: this.x - TILE_SIZE,
                y: this.y - TILE_SIZE,
                w: this.width + TILE_SIZE * 2,
                h: this.height + TILE_SIZE * 2
            };
            const obstacles = worldMap.getObstaclesInRect(searchRect);
            Collision.resolveMovement(entity, obstacles, moveX, moveY);
            this.x = entity.x;
            this.y = entity.y;
        } else {
            this.x += moveX;
            this.y += moveY;
        }
    }

    getFacingOffset() {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const reach = TILE_SIZE;
        switch (this.facingDirection) {
            case 'up':    return { x: cx - 8, y: cy - reach, w: 16, h: reach };
            case 'down':  return { x: cx - 8, y: cy, w: 16, h: reach };
            case 'left':  return { x: cx - reach, y: cy - 8, w: reach, h: 16 };
            case 'right': return { x: cx, y: cy - 8, w: reach, h: 16 };
        }
        return { x: cx - 8, y: cy - 8, w: 16, h: 16 };
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    getAABB() {
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        };
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
    }

    heal() {
        this.hp = this.maxHp;
    }

    isDead() {
        return this.hp <= 0;
    }

    exportState() {
        return {
            x: this.x,
            y: this.y,
            facingDirection: this.facingDirection,
            currentRegionId: this.currentRegionId,
            hp: this.hp
        };
    }

    importState(state) {
        this.x = state.x;
        this.y = state.y;
        this.facingDirection = state.facingDirection;
        this.currentRegionId = state.currentRegionId;
        if (state.hp !== undefined) {
            this.hp = state.hp;
        } else {
            this.hp = this.maxHp;
        }
    }
}
