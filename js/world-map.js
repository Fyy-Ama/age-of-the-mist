// 迷雾纪元 - 世界地图

class WorldMap {
    constructor(tileMap, regionManager) {
        this.tileMap = tileMap;
        this.regionManager = regionManager;
        this._objectStates = new Map();
        this._interactables = [];
        this._guardians = [];
        this._npcs = [];
        this.terrainIndexMap = this._buildTerrainIndexMap();
        this._buildInteractables();
        this._buildGuardians();
        this._buildNpcs();
    }

    _buildTerrainIndexMap() {
        const map = new Uint8Array(WORLD_ROWS * WORLD_COLS);
        for (let row = 0; row < WORLD_ROWS; row++) {
            for (let col = 0; col < WORLD_COLS; col++) {
                const region = this.regionManager.getRegionAt(col * TILE_SIZE, row * TILE_SIZE);
                map[row * WORLD_COLS + col] = region ? TERRAIN_TYPE_IDS[region.terrainType] : 0;
            }
        }
        return map;
    }

    _buildInteractables() {
        const allRegions = this.regionManager.getAllRegions();
        for (const region of allRegions) {
            if (!region.interactables) continue;
            for (const def of region.interactables) {
                const interactable = new Interactable({
                    id: def.id,
                    type: def.type,
                    itemId: def.itemId,
                    bounds: {
                        x: def.tileX * TILE_SIZE,
                        y: def.tileY * TILE_SIZE,
                        w: TILE_SIZE,
                        h: TILE_SIZE
                    },
                    promptText: def.promptText,
                    flavorText: def.flavorText
                });
                this._interactables.push(interactable);
            }
        }
    }

    _buildGuardians() {
        const allRegions = this.regionManager.getAllRegions();
        for (const region of allRegions) {
            if (!region.guardians) continue;
            for (const def of region.guardians) {
                this._guardians.push(new Guardian(def));
            }
        }
    }

    _buildNpcs() {
        const allRegions = this.regionManager.getAllRegions();
        for (const region of allRegions) {
            if (!region.npcs) continue;
            for (const def of region.npcs) {
                const npc = new Npc(def);
                const snapped = this._findNearestWalkable(def.tileX, def.tileY, region.bounds);
                npc.x = snapped.col * TILE_SIZE;
                npc.y = snapped.row * TILE_SIZE;
                this._npcs.push(npc);
            }
        }
    }

    _isTileWalkable(col, row) {
        if (col < 0 || col >= WORLD_COLS || row < 0 || row >= WORLD_ROWS) return false;
        const tileId = this.tileMap[row * WORLD_COLS + col];
        const info = TILE_RENDER_INFO[tileId];
        return info ? info.walkable : false;
    }

    // 螺旋搜索最近的可通行瓦片，限制在区域范围内
    _findNearestWalkable(tileX, tileY, bounds) {
        if (this._isTileWalkable(tileX, tileY)) return { col: tileX, row: tileY };
        const maxRadius = 12;
        for (let r = 1; r <= maxRadius; r++) {
            for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
                    const col = tileX + dx;
                    const row = tileY + dy;
                    if (bounds && (col < bounds.x || col >= bounds.x + bounds.w || row < bounds.y || row >= bounds.y + bounds.h)) continue;
                    if (this._isTileWalkable(col, row)) return { col, row };
                }
            }
        }
        return { col: tileX, row: tileY };
    }

    getTile(worldX, worldY) {
        const col = Math.floor(worldX / TILE_SIZE);
        const row = Math.floor(worldY / TILE_SIZE);
        
        if (col < 0 || col >= WORLD_COLS || row < 0 || row >= WORLD_ROWS) {
            return null;
        }
        
        const index = row * WORLD_COLS + col;
        const tileId = this.tileMap[index];
        const renderInfo = TILE_RENDER_INFO[tileId];
        
        return {
            id: tileId,
            color: renderInfo.color,
            walkable: renderInfo.walkable,
            col: col,
            row: row
        };
    }

    getRegionAt(worldX, worldY) {
        return this.regionManager.getRegionAt(worldX, worldY);
    }

    getObstaclesInRect(rect) {
        const obstacles = [];
        
        const startCol = Math.max(0, Math.floor(rect.x / TILE_SIZE));
        const endCol = Math.min(WORLD_COLS - 1, Math.floor((rect.x + rect.w) / TILE_SIZE));
        const startRow = Math.max(0, Math.floor(rect.y / TILE_SIZE));
        const endRow = Math.min(WORLD_ROWS - 1, Math.floor((rect.y + rect.h) / TILE_SIZE));
        
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const index = row * WORLD_COLS + col;
                const tileId = this.tileMap[index];
                const renderInfo = TILE_RENDER_INFO[tileId];
                
                if (!renderInfo.walkable) {
                    obstacles.push({
                        x: col * TILE_SIZE,
                        y: row * TILE_SIZE,
                        w: TILE_SIZE,
                        h: TILE_SIZE
                    });
                }
            }
        }

        for (const guardian of this._guardians) {
            if (!guardian.isDefeated()) {
                obstacles.push(guardian.getAABB());
            }
        }
        
        return obstacles;
    }

    getInteractablesInRect(rect) {
        const result = [];
        for (const obj of this._interactables) {
            const b = obj.getBounds();
            if (aabbOverlap(rect, b)) {
                result.push(obj);
            }
        }
        return result;
    }

    getInteractableById(id) {
        return this._interactables.find(obj => obj.id === id) || null;
    }

    getAllInteractables() {
        return this._interactables;
    }

    getGuardianById(id) {
        return this._guardians.find(g => g.id === id) || null;
    }

    getAllGuardians() {
        return this._guardians;
    }

    getGuardiansNear(playerAABB) {
        const result = [];
        for (const g of this._guardians) {
            if (g.isDefeated()) continue;
            const range = GUARDIAN_RANGE_TILES * TILE_SIZE;
            const expanded = {
                x: g.x - range,
                y: g.y - range,
                w: g.width + range * 2,
                h: g.height + range * 2
            };
            if (aabbOverlap(playerAABB, expanded)) {
                result.push(g);
            }
        }
        return result;
    }

    getNpcsInRect(rect) {
        const result = [];
        for (const npc of this._npcs) {
            if (aabbOverlap(rect, npc.getBounds())) {
                result.push(npc);
            }
        }
        return result;
    }

    getNpcById(id) {
        return this._npcs.find(n => n.id === id) || null;
    }

    getAllNpcs() {
        return this._npcs;
    }

    setObjectState(id, state) {
        this._objectStates.set(id, state);
    }

    getObjectState(id) {
        return this._objectStates.get(id);
    }

    exportStates() {
        const states = {};
        for (const [key, value] of this._objectStates.entries()) {
            states[key] = value;
        }
        for (const obj of this._interactables) {
            states[obj.id] = obj.getState();
        }
        for (const g of this._guardians) {
            states[g.id] = g.getState();
        }
        for (const npc of this._npcs) {
            states[npc.id] = npc.getState();
        }
        return states;
    }

    importStates(states) {
        this._objectStates.clear();
        for (const key in states) {
            if (states.hasOwnProperty(key)) {
                const obj = this.getInteractableById(key);
                if (obj) {
                    obj.setState(states[key]);
                    continue;
                }
                const guardian = this.getGuardianById(key);
                if (guardian) {
                    guardian.setState(states[key]);
                    continue;
                }
                const npc = this.getNpcById(key);
                if (npc) {
                    npc.setState(states[key]);
                    continue;
                }
                this._objectStates.set(key, states[key]);
            }
        }
    }
}
