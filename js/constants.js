// 迷雾纪元 - 全局常量

const TILE_SIZE = 32;
const CANVAS_W = 1280;
const CANVAS_H = 720;
const PLAYER_SIZE = 24;
const PLAYER_SPEED = 180;
const PLAYER_MAX_HP = 5;
const FIXED_DT = 1 / 60;
const MAX_FRAME_SKIP = 5;
const WORLD_COLS = 200;
const WORLD_ROWS = 200;

const TILE_IDS = {
    GRASS: 0,
    FOREST_GRASS: 1,
    STONE_FLOOR: 2,
    WATER: 3,
    PATH: 4,
    WALL: 5,
    TREE_TRUNK: 6,
    RUIN_BRICK: 7,
    CAMP_DIRT: 8,
    CAVE_ROCK: 9,
    COAST_SAND: 10,
    BRIDGE: 11
};

const COLORS = {
    PARCHMENT: '#f4e8c1',
    PARCHMENT_DARK: '#e8d9a8',
    BROWN_DARK: '#3d2b1f',
    BROWN_MEDIUM: '#5c4033',
    BROWN_LIGHT: '#8b7355',
    GOLD: '#d4a574',
    GOLD_BRIGHT: '#ffd700',
    CREAM: '#fff8e0',
    SHADOW: 'rgba(0, 0, 0, 0.5)',
    OVERLAY: 'rgba(0, 0, 0, 0.3)'
};

const GAME_STATES = {
    LOADING: 'loading',
    TITLE: 'title',
    PLAYING: 'playing',
    PAUSED: 'paused'
};
