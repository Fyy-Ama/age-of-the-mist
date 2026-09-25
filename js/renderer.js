// 迷雾纪元 - 渲染器

const KNIGHT_COLORS = {
    P: '#5a7abf',
    A: '#9a9aaa',
    V: '#1a1a24',
    G: '#d4a574',
    B: '#3a4a6a',
    D: '#4a4a5a'
};

const KNIGHT_SPRITES = {
    down: {
        stand: [
            '...PPP...',
            '..AAAAA..',
            '..AVVVA..',
            '..AAAAA..',
            '.GAAAAAG.',
            '.AABBBAA.',
            '.AABBBAA.',
            '..ABBBA..',
            '..DDDDD..',
            '..DD.DD..',
            '..DD.DD..',
            '.DD...DD.'
        ],
        walk: [
            '...PPP...',
            '..AAAAA..',
            '..AVVVA..',
            '..AAAAA..',
            '.GAAAAAG.',
            '.AABBBAA.',
            '.AABBBAA.',
            '..ABBBA..',
            '..DDDDD..',
            '.DD..DD..',
            '.DD...DD.',
            'DD.....DD'
        ]
    },
    up: {
        stand: [
            '...PPP...',
            '..AAAAA..',
            '..AAAAA..',
            '..AAAAA..',
            '.GAAAAAG.',
            '.ABBBBBA.',
            '.ABBBBBA.',
            '..BBBBB..',
            '..DDDDD..',
            '..DD.DD..',
            '..DD.DD..',
            '.DD...DD.'
        ],
        walk: [
            '...PPP...',
            '..AAAAA..',
            '..AAAAA..',
            '..AAAAA..',
            '.GAAAAAG.',
            '.ABBBBBA.',
            '.ABBBBBA.',
            '..BBBBB..',
            '..DDDDD..',
            '.DD..DD..',
            '.DD...DD.',
            'DD.....DD'
        ]
    },
    side: {
        stand: [
            '...PP....',
            '..AAA....',
            '..AAV....',
            '..AAA....',
            '.GAAAG...',
            '.AABBA...',
            '.AABBA...',
            '..ABBA...',
            '..DDDD...',
            '..DD.DD..',
            '..DD.DD..',
            '.DD...DD.'
        ],
        walk: [
            '...PP....',
            '..AAA....',
            '..AAV....',
            '..AAA....',
            '.GAAAG...',
            '.AABBA...',
            '.AABBA...',
            '..ABBA...',
            '..DDDD...',
            '.DD..DD..',
            '.DD...DD.',
            'DD.....DD'
        ]
    }
};

const _knightSpriteCache = {};

function getKnightSpriteCanvas(direction, frameName) {
    const key = direction + ':' + frameName;
    if (_knightSpriteCache[key]) return _knightSpriteCache[key];

    let rows;
    if (direction === 'left' || direction === 'right') {
        rows = KNIGHT_SPRITES.side[frameName];
        if (direction === 'left') {
            rows = rows.map(r => r.split('').reverse().join(''));
        }
    } else {
        rows = KNIGHT_SPRITES[direction][frameName];
    }

    const cv = document.createElement('canvas');
    cv.width = 18;
    cv.height = 24;
    const c = cv.getContext('2d');
    for (let r = 0; r < rows.length; r++) {
        for (let col = 0; col < 9; col++) {
            const ch = rows[r][col];
            if (ch === '.') continue;
            c.fillStyle = KNIGHT_COLORS[ch];
            c.fillRect(col * 2, r * 2, 2, 2);
        }
    }
    _knightSpriteCache[key] = cv;
    return cv;
}

class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    render(camera, worldMap, player, dayNightCycle, visualEffects) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this._renderGround(camera, worldMap);
        this._renderInteractables(camera, worldMap);
        this._renderGuardians(camera, worldMap);
        this._renderPlayer(camera, player);
        if (visualEffects) {
            visualEffects.render(this.ctx, camera);
        }
        if (dayNightCycle) {
            this._renderDayNightOverlay(dayNightCycle, player, worldMap);
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
        const terrainMap = worldMap.terrainIndexMap;

        for (let row = startRow; row <= endRow; row++) {
            const screenY = row * TILE_SIZE - camY;
            const rowOffset = row * WORLD_COLS;
            for (let col = startCol; col <= endCol; col++) {
                const idx = rowOffset + col;
                const variants = getTileColorVariants(TERRAIN_TYPE_NAMES[terrainMap[idx]], tileMap[idx]);
                this.ctx.fillStyle = variants[tileShadeIndex(col, row)];
                this.ctx.fillRect(col * TILE_SIZE - camX, screenY, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    _renderPlayer(camera, player) {
        const screenPos = camera.worldToScreen(player.x, player.y);
        const frameName = player.walkFrame === 1 ? 'walk' : 'stand';
        const sprite = getKnightSpriteCanvas(player.facingDirection, frameName);
        this.ctx.drawImage(sprite, Math.round(screenPos.x) + 3, Math.round(screenPos.y));
    }

    _renderGuardians(camera, worldMap) {
        const guardians = worldMap.getAllGuardians();
        const viewport = camera.getViewport();
        const t = performance.now() / 1000;

        for (const g of guardians) {
            const aabb = g.getAABB();
            if (!aabbOverlap(aabb, viewport)) continue;

            const sp = camera.worldToScreen(g.x, g.y);
            const cx = sp.x + g.width / 2;
            const cy = sp.y + g.height / 2;
            const region = g.regionId ? worldMap.regionManager.getRegion(g.regionId) : null;
            const accent = REGION_ACCENTS[region ? region.terrainType : 'default'];

            if (g.isDefeated()) {
                this.ctx.globalAlpha = 0.25;
                this.ctx.fillStyle = accent.primary;
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, 10, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1.0;
                continue;
            }

            const pulse = 0.5 + 0.5 * Math.sin(t * 2.5 + cx * 0.01);
            this.ctx.globalAlpha = 0.12 + 0.14 * pulse;
            this.ctx.fillStyle = accent.particle;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, 18 + 3 * pulse, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;

            this.ctx.fillStyle = accent.primary;
            this.ctx.strokeStyle = accent.secondary;
            this.ctx.lineWidth = 2;

            this.ctx.beginPath();
            this.ctx.moveTo(cx, cy - 14);
            this.ctx.lineTo(cx + 12, cy + 8);
            this.ctx.lineTo(cx - 12, cy + 8);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.fillStyle = accent.particle;
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
        const t = performance.now() / 1000;

        for (const obj of nearby) {
            const state = obj.getState();
            if (state.cleared || !state.visible) continue;

            const b = obj.getBounds();
            const sp = camera.worldToScreen(b.x, b.y);

            const itemDef = getItemDef(obj.itemId);
            if (!itemDef) continue;

            let hash = 0;
            for (let i = 0; i < obj.id.length; i++) {
                hash = (hash * 31 + obj.id.charCodeAt(i)) | 0;
            }
            const bob = Math.sin(t * 2 + (hash & 7)) * 2;

            const cx = sp.x + b.w / 2;
            const cy = sp.y + b.h / 2 + bob;
            const r = 6;

            const tileX = Math.floor((b.x + b.w / 2) / TILE_SIZE);
            const tileY = Math.floor((b.y + b.h / 2) / TILE_SIZE);
            const terrain = TERRAIN_TYPE_NAMES[worldMap.terrainIndexMap[tileY * WORLD_COLS + tileX]];
            const accent = REGION_ACCENTS[terrain];

            this.ctx.globalAlpha = 0.16 + 0.08 * Math.sin(t * 3 + (hash & 7));
            this.ctx.fillStyle = accent.particle;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;

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

    _renderDayNightOverlay(dayNightCycle, player, worldMap) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.fillStyle = dayNightCycle.getInterpolatedOverlayColor();
        this.ctx.fillRect(0, 0, w, h);

        if (!player || !worldMap) return;

        const region = worldMap.getRegionAt(player.x + player.width / 2, player.y + player.height / 2);
        const tint = REGION_NIGHT_TINTS[region ? region.terrainType : 'default'];
        if (tint) {
            this.ctx.fillStyle = tint;
            this.ctx.fillRect(0, 0, w, h);
        }

        const ambient = dayNightCycle.getAmbientTint();
        const strength = clamp((1 - ambient) * 0.8, 0, 0.4);
        if (strength > 0.01) {
            const g = this.ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.78);
            g.addColorStop(0, 'rgba(0, 0, 0, 0)');
            g.addColorStop(1, `rgba(0, 0, 0, ${strength.toFixed(3)})`);
            this.ctx.fillStyle = g;
            this.ctx.fillRect(0, 0, w, h);
        }
    }
}
