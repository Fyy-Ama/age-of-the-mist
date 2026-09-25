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

// NPC 独特像素画：12 列 × 16 行网格，每格 2px → 24×32
const NPC_SPRITE_DEFS = {
    npc_old_traveler: {
        palette: { H: '#8a6440', K: '#4a3524', C: '#6b4c33', W: '#d8d0c0', S: '#241a12', T: '#9a7a44', B: '#2a1e16' },
        rows: [
            '....HHHH....',
            '...HHHHHH...',
            '..HHHHHHHH..',
            '..HHSSSSHH.T',
            '..HSWWWWSH.T',
            '..HSWWWWSH.T',
            '.KCCCCCCCK.T',
            'KCCCCCCCCK.T',
            'KCCCCCCCCK.T',
            '.KCCCCCCCK.T',
            '.KCCCCCCCK.T',
            '..KCCCCCK..T',
            '..KCCCCCK..T',
            '..KK..KK...T',
            '..BB..BB....',
            '.BBB..BBB...'
        ]
    },
    npc_hermit_herbalist: {
        palette: { H: '#4a6b3a', K: '#243a1f', C: '#33522b', A: '#ffb347', S: '#1a2414', P: '#8a6a3a', B: '#1f2a18' },
        rows: [
            '....HHHH....',
            '...HHHHHH...',
            '..HHHHHHHH..',
            '..HHSSSSHH..',
            '..HSAASAAH..',
            '..HSSSSSSH..',
            '.KCCCCCCCK..',
            'KCCCCCCCCK..',
            'KCCCCCCCCK..',
            '.KCPPPPCK...',
            '.KCCCCCCCK..',
            '..KCCCCCK...',
            '..KCCCCCK...',
            '..KK..KK....',
            '..BB..BB....',
            '.BBB..BBB...'
        ]
    },
    npc_stele_warden: {
        palette: { H: '#7a7a88', K: '#3a3a46', C: '#5a5a68', G: '#66d9ff', S: '#2a2a34', B: '#2a2a34' },
        rows: [
            '..HHHHHHHH..',
            '..HHHHHHHH..',
            '..HGGHHGGH..',
            '..HHHHHHHH..',
            '...HHHHHH...',
            'KHHHHHHHHHHK',
            'KCCCCCCCCCCK',
            'KCCCGGGGCCCK',
            'KCCCGGGGCCCK',
            'KCCCCCCCCCCK',
            '.KCCCCCCCCK.',
            '.KCCCCCCCCK.',
            '..KKCCCCKK..',
            '..KK....KK..',
            '..BB....BB..',
            '.BBB....BBB.'
        ]
    },
    npc_lost_miner: {
        palette: { H: '#c0a060', K: '#3a3a44', C: '#6b5a44', L: '#ffe066', S: '#2a2018', A: '#d0a878', T: '#8a6a3a', M: '#9a9aa4', B: '#2a2018' },
        rows: [
            '...HHHHHH...',
            '..HHHHHHHH..',
            '..HLLLLLLH..',
            '..HAAAAAAH..',
            '..HASAASAH..',
            '...AAAAAA...',
            '.KCCCCCCCK..',
            'KCCCCCCCCK.T',
            'KCCCCCCCCKMT',
            '.KCCCCCCCK.T',
            '.KCCCCCCCK.T',
            '..KCCCCCK..T',
            '..KCCCCCK..T',
            '..KK..KK...T',
            '..BB..BB....',
            '.BBB..BBB...'
        ]
    },
    npc_fisherman: {
        palette: { H: '#5a7a8a', K: '#2a3a44', C: '#4a6a7a', S: '#c09878', A: '#2a2018', N: '#d8d0b0', B: '#2a2018', R: '#8a6a3a' },
        rows: [
            '....HHHH....',
            '...HHHHHH...',
            '..HHHHHHHH..',
            'HHHHHHHHHHHH',
            '...SSSSSS...',
            '...SASSAS...',
            '....SSSS....',
            '.KCCCCCCCK.R',
            'KCCCCCCCCK.R',
            'KCCNNNNCCK.R',
            '.KCCCCCCCK.R',
            '..KCCCCCK..R',
            '..KCCCCCK..R',
            '..KK..KK...R',
            '..BB..BB....',
            '.BBB..BBB...'
        ]
    }
};

const _npcSpriteCache = {};

function getNpcSpriteCanvas(spriteKey) {
    if (_npcSpriteCache[spriteKey]) return _npcSpriteCache[spriteKey];

    const def = NPC_SPRITE_DEFS[spriteKey];
    const cv = document.createElement('canvas');
    cv.width = 24;
    cv.height = 32;
    if (!def) {
        _npcSpriteCache[spriteKey] = cv;
        return cv;
    }
    const c = cv.getContext('2d');
    for (let r = 0; r < def.rows.length; r++) {
        const row = def.rows[r];
        for (let col = 0; col < 12; col++) {
            const ch = row[col];
            if (!ch || ch === '.' || !def.palette[ch]) continue;
            c.fillStyle = def.palette[ch];
            c.fillRect(col * 2, r * 2, 2, 2);
        }
    }
    _npcSpriteCache[spriteKey] = cv;
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
        this._renderNpcs(camera, worldMap);
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

    _renderNpcs(camera, worldMap) {
        const npcs = worldMap.getAllNpcs();
        const viewport = camera.getViewport();
        const t = performance.now() / 1000;

        for (const npc of npcs) {
            const b = npc.getBounds();
            if (!aabbOverlap(b, viewport)) continue;

            const sp = camera.worldToScreen(b.x, b.y);
            const drawX = Math.round(sp.x) + 4;
            const drawY = Math.round(sp.y);
            const cx = sp.x + b.w / 2;

            // 脚下阴影
            this.ctx.globalAlpha = 0.28;
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.ellipse(cx, sp.y + 30, 10, 4, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;

            // 柔和环境光晕
            const glow = 0.10 + 0.05 * Math.sin(t * 1.6 + cx * 0.02);
            this.ctx.globalAlpha = glow;
            this.ctx.fillStyle = '#ffd700';
            this.ctx.beginPath();
            this.ctx.arc(cx, sp.y + 16, 20, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;

            // 像素立绘
            const sprite = getNpcSpriteCanvas(npc.spriteKey);
            this.ctx.drawImage(sprite, drawX, drawY);

            // 头顶任务标记
            const marker = npc.getMarker();
            if (marker) {
                const bob = Math.sin(t * 3) * 2;
                const mx = cx;
                const my = sp.y - 8 + bob;
                this.ctx.save();
                this.ctx.font = 'bold 16px Georgia, serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.shadowColor = marker.color;
                this.ctx.shadowBlur = 8;
                this.ctx.fillStyle = marker.color;
                this.ctx.fillText(marker.char, mx, my);
                this.ctx.restore();
            }
        }
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
