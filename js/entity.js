// 迷雾纪元 - 实体

class Interactable {
    constructor(def) {
        this.id = def.id;
        this.type = def.type;
        this.itemId = def.itemId;
        this.bounds = def.bounds;
        this.promptText = def.promptText;
        this.defaultState = def.defaultState || { activated: false, visible: true, cleared: false };
        this.flavorText = def.flavorText || '';
        this.state = { ...this.defaultState };
    }

    getBounds() {
        return this.bounds;
    }

    getPrompt() {
        if (!this.state.visible || this.state.cleared) {
            return null;
        }
        return this.promptText;
    }

    interact(player, inventory, discoveryLog) {
        if (this.type === 'collectible' || this.type === 'easter_egg') {
            if (inventory.addItem(this.itemId)) {
                this.state.cleared = true;
                return true;
            }
        }
        return false;
    }

    getState() {
        return { ...this.state };
    }

    setState(state) {
        this.state = { ...state };
    }
}


const GUARDIAN_ATTACK_INTERVAL = 0.5;
const GUARDIAN_DAMAGE = 1;
const GUARDIAN_RANGE_TILES = 1;

class Guardian {
    constructor(def) {
        this.id = def.id;
        this.name = def.name;
        this.x = def.tileX * TILE_SIZE;
        this.y = def.tileY * TILE_SIZE;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE;
        this.hp = 1;
        this.maxHp = 1;
        this.defeated = false;
        this.attackTimer = 0;
        this.attackInterval = GUARDIAN_ATTACK_INTERVAL;
        this.regionId = def.regionId || null;
        this.flavorText = def.flavorText || '';
    }

    getAABB() {
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }

    isDefeated() {
        return this.defeated;
    }

    takeDamage(amount) {
        if (this.defeated) return false;
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.defeated = true;
            return true;
        }
        return false;
    }

    update(dt, playerAABB) {
        if (this.defeated) return null;

        if (!this._isPlayerInRange(playerAABB)) {
            this.attackTimer = 0;
            return null;
        }

        this.attackTimer += dt;
        if (this.attackTimer >= this.attackInterval) {
            this.attackTimer -= this.attackInterval;
            return { damage: GUARDIAN_DAMAGE };
        }
        return null;
    }

    _isPlayerInRange(playerAABB) {
        const range = GUARDIAN_RANGE_TILES * TILE_SIZE;
        const expanded = {
            x: this.x - range,
            y: this.y - range,
            w: this.width + range * 2,
            h: this.height + range * 2
        };
        return aabbOverlap(playerAABB, expanded);
    }

    getState() {
        return { defeated: this.defeated };
    }

    setState(state) {
        if (state && state.defeated) {
            this.defeated = true;
            this.hp = 0;
        }
    }
}
