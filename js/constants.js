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

const REGION_ACCENTS = {
    forest: { primary: '#1e3a1e', secondary: '#d4a574', particle: '#ffd700' },
    coast: { primary: '#6a8a9a', secondary: '#e0f0ff', particle: '#ffffff' },
    cave: { primary: '#2a1a3a', secondary: '#ff8c00', particle: '#ff6600' },
    ruins: { primary: '#5a5a6a', secondary: '#d4a574', particle: '#ffbf00' },
    camp: { primary: '#7a6040', secondary: '#6aaa6a', particle: '#ff9944' },
    default: { primary: '#4a7a3a', secondary: '#d4a574', particle: '#ffd700' }
};

const TERRAIN_TYPE_IDS = { forest: 1, coast: 2, cave: 3, ruins: 4, camp: 5 };
const TERRAIN_TYPE_NAMES = ['default', 'forest', 'coast', 'cave', 'ruins', 'camp'];

const REGION_NIGHT_TINTS = {
    forest: 'rgba(20, 60, 30, 0.10)',
    coast: 'rgba(70, 100, 130, 0.10)',
    cave: 'rgba(40, 20, 70, 0.12)',
    ruins: 'rgba(60, 60, 80, 0.10)',
    camp: 'rgba(90, 60, 30, 0.08)',
    default: null
};
