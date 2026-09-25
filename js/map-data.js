// 迷雾纪元 - 地图数据

const TILE_RENDER_INFO = {
    [TILE_IDS.GRASS]: { color: '#4a7a3a', walkable: true },
    [TILE_IDS.FOREST_GRASS]: { color: '#2d4a2d', walkable: true },
    [TILE_IDS.STONE_FLOOR]: { color: '#5a5a6a', walkable: true },
    [TILE_IDS.WATER]: { color: '#3a5a8a', walkable: false },
    [TILE_IDS.PATH]: { color: '#8b7355', walkable: true },
    [TILE_IDS.WALL]: { color: '#3a3a3a', walkable: false },
    [TILE_IDS.TREE_TRUNK]: { color: '#3d2b1f', walkable: false },
    [TILE_IDS.RUIN_BRICK]: { color: '#5a5a6a', walkable: false },
    [TILE_IDS.CAMP_DIRT]: { color: '#8b7355', walkable: true },
    [TILE_IDS.CAVE_ROCK]: { color: '#2a2a3a', walkable: false },
    [TILE_IDS.COAST_SAND]: { color: '#c4a57b', walkable: true },
    [TILE_IDS.BRIDGE]: { color: '#6a4a2a', walkable: true }
};

const REGION_TILE_PALETTES = {
    forest: {
        [TILE_IDS.GRASS]: '#2a4a2a',
        [TILE_IDS.FOREST_GRASS]: '#1e3a1e',
        [TILE_IDS.TREE_TRUNK]: '#2a1a0a',
        [TILE_IDS.PATH]: '#3a5a2a',
        [TILE_IDS.WATER]: '#2a4a5a'
    },
    coast: {
        [TILE_IDS.GRASS]: '#5a7a6a',
        [TILE_IDS.COAST_SAND]: '#b8c8d4',
        [TILE_IDS.WATER]: '#3d5a75',
        [TILE_IDS.PATH]: '#8a9aa5',
        [TILE_IDS.CAVE_ROCK]: '#4a5a68'
    },
    cave: {
        [TILE_IDS.GRASS]: '#241a33',
        [TILE_IDS.CAVE_ROCK]: '#1a0f2a',
        [TILE_IDS.STONE_FLOOR]: '#2a1f3d',
        [TILE_IDS.PATH]: '#3a2a4a',
        [TILE_IDS.WATER]: '#1a1a3a'
    },
    ruins: {
        [TILE_IDS.GRASS]: '#5a6a4a',
        [TILE_IDS.STONE_FLOOR]: '#6a6a72',
        [TILE_IDS.RUIN_BRICK]: '#4a4a55',
        [TILE_IDS.PATH]: '#7a7a62',
        [TILE_IDS.WALL]: '#3a3a42'
    },
    camp: {
        [TILE_IDS.GRASS]: '#4a6a3a',
        [TILE_IDS.CAMP_DIRT]: '#7a5f3f',
        [TILE_IDS.PATH]: '#8b7355',
        [TILE_IDS.TREE_TRUNK]: '#3d2b1f'
    }
};

function shadeHexColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const f = 1 + percent / 100;
    const r = Math.min(255, Math.max(0, Math.round(((num >> 16) & 255) * f)));
    const g = Math.min(255, Math.max(0, Math.round(((num >> 8) & 255) * f)));
    const b = Math.min(255, Math.max(0, Math.round((num & 255) * f)));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const _tileColorVariantCache = {};
const TILE_SHADE_LEVELS = [-7, -3, 2, 6];

function getTileColorVariants(terrainType, tileId) {
    const key = terrainType + ':' + tileId;
    let variants = _tileColorVariantCache[key];
    if (!variants) {
        const palette = REGION_TILE_PALETTES[terrainType];
        const base = (palette && palette[tileId]) || TILE_RENDER_INFO[tileId].color;
        variants = TILE_SHADE_LEVELS.map(p => shadeHexColor(base, p));
        _tileColorVariantCache[key] = variants;
    }
    return variants;
}

function tileShadeIndex(col, row) {
    const h = (col * 374761393 + row * 668265263) >>> 0;
    return (h >>> 4) & 3;
}

function generateMapData() {
    const tileMap = new Uint8Array(WORLD_ROWS * WORLD_COLS);
    
    for (let row = 0; row < WORLD_ROWS; row++) {
        for (let col = 0; col < WORLD_COLS; col++) {
            const index = row * WORLD_COLS + col;
            let tileId = TILE_IDS.GRASS;
            
            if (row === 0 || row === WORLD_ROWS - 1 || col === 0 || col === WORLD_COLS - 1) {
                tileId = TILE_IDS.WALL;
            } else if (col < 80 && row < 100) {
                tileId = TILE_IDS.FOREST_GRASS;
                if (Math.random() < 0.05 && row > 1 && col > 1 && row < WORLD_ROWS - 2 && col < WORLD_COLS - 2) {
                    tileId = TILE_IDS.TREE_TRUNK;
                }
            } else if (col >= 80 && col < 140 && row < 80) {
                tileId = TILE_IDS.STONE_FLOOR;
                if (Math.random() < 0.03 && row > 1 && col > 1 && row < WORLD_ROWS - 2 && col < WORLD_COLS - 2) {
                    tileId = TILE_IDS.RUIN_BRICK;
                }
            } else if (col >= 140 && row < 80) {
                tileId = TILE_IDS.CAVE_ROCK;
                if (Math.random() < 0.1 && row > 1 && col > 1 && row < WORLD_ROWS - 2 && col < WORLD_COLS - 2) {
                    tileId = TILE_IDS.CAVE_ROCK;
                }
            } else if (col >= 80 && col < 120 && row >= 80 && row < 120) {
                tileId = TILE_IDS.CAMP_DIRT;
            } else if (row >= 100) {
                tileId = TILE_IDS.COAST_SAND;
                if (row >= 150 && Math.random() < 0.3) {
                    tileId = TILE_IDS.WATER;
                }
            }
            
            tileMap[index] = tileId;
        }
    }
    
    return tileMap;
}
