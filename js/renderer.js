// 迷雾纪元 - 渲染器

class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    render(camera, worldMap, player, dayNightCycle) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this._renderGround(camera, worldMap);
        this._renderInteractables(camera, worldMap);
        this._renderGuardians(camera, worldMap);
        this._renderPlayer(camera, player);
        if (dayNightCycle) {
            this._renderDayNightOverlay(dayNightCycle);
        }
    }

    _renderGround(camera, worldMap) {
        const viewport = camera.getViewport();
        const camX = camera.x;
        const camY = camera.y;

        const startCol = Math.max(0, Math.floor(viewport.x / TILE_SIZE));
        const endCol = Math.min(WORLD_COLS - 1, Math.floor((viewport.x + viewport.w) / TILE_SIZE));
        const startRow = Math.max(0, Math.floor(viewport.y / TILE_SIZE));
        const endRow = Math.min(WORLD_ROWS - 1, Math.floor((viewport.y + viewport.h) / TILE_SIZE));

        const tileMap = worldMap.tileMap;

        for (let row = startRow; row <= endRow; row++) {
            const screenY = row * TILE_SIZE - camY;
            const rowOffset = row * WORLD_COLS;
            for (let col = startCol; col <= endCol; col++) {
                const renderInfo = TILE_RENDER_INFO[tileMap[rowOffset + col]];
                this.ctx.fillStyle = renderInfo.color;
                this.ctx.fillRect(col * TILE_SIZE - camX, screenY, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    _renderPlayer(camera, player) {
        const screenPos = camera.worldToScreen(player.x, player.y);
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.fillRect(screenPos.x, screenPos.y, player.width, player.height);
    }

    _renderGuardians(camera, worldMap) {
        const guardians = worldMap.getAllGuardians();
        const viewport = camera.getViewport();

        for (const g of guardians) {
            const aabb = g.getAABB();
            if (!aabbOverlap(aabb, viewport)) continue;

            const sp = camera.worldToScreen(g.x, g.y);
            const cx = sp.x + g.width / 2;
            const cy = sp.y + g.height / 2;

            if (g.isDefeated()) {
                this.ctx.globalAlpha = 0.25;
                this.ctx.fillStyle = '#888';
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, 10, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1.0;
                continue;
            }

            this.ctx.fillStyle = '#6a0dad';
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;

            this.ctx.beginPath();
            this.ctx.moveTo(cx, cy - 14);
            this.ctx.lineTo(cx + 12, cy + 8);
            this.ctx.lineTo(cx - 12, cy + 8);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.fillStyle = '#ff0000';
            this.ctx.beginPath();
            this.ctx.arc(cx - 4, cy - 2, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(cx + 4, cy - 2, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    _renderInteractables(camera, worldMap) {
        const viewport = camera.getViewport();
        const nearby = worldMap.getInteractablesInRect(viewport);

        for (const obj of nearby) {
            const state = obj.getState();
            if (state.cleared || !state.visible) continue;

            const b = obj.getBounds();
            const sp = camera.worldToScreen(b.x, b.y);

            const itemDef = getItemDef(obj.itemId);
            if (!itemDef) continue;

            const cx = sp.x + b.w / 2;
            const cy = sp.y + b.h / 2;
            const r = 6;

            this.ctx.fillStyle = itemDef.iconColor;
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 1;

            if (itemDef.iconShape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            } else if (itemDef.iconShape === 'diamond') {
                this.ctx.beginPath();
                this.ctx.moveTo(cx, cy - r);
                this.ctx.lineTo(cx + r, cy);
                this.ctx.lineTo(cx, cy + r);
                this.ctx.lineTo(cx - r, cy);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            } else {
                this.ctx.fillRect(cx - r, cy - r + 2, r * 2, r * 2 - 4);
                this.ctx.strokeRect(cx - r, cy - r + 2, r * 2, r * 2 - 4);
            }
        }
    }

    _renderDayNightOverlay(dayNightCycle) {
        const color = dayNightCycle.getOverlayColor();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
