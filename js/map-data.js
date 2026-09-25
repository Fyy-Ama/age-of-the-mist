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
