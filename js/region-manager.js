// 迷雾纪元 - 区域管理器

const REGIONS = [
    {
        id: 'travelers_camp',
        name: '旅人营地',
        description: '一处温暖的营地，旅人们在此歇脚。',
        bounds: { x: 80, y: 80, w: 40, h: 40 },
        palette: {
            ground: '#8b7355',
            groundAlt: '#7a6548',
            obstacle: '#5c4033',
            accent: '#d4a574',
            labelColor: '#fff8e0'
        },
        terrainType: 'camp',
        obstacles: [],
        interactables: [
            { id: 'tc_herb1', type: 'collectible', itemId: 'herb_moonpetal', tileX: 90, tileY: 90, promptText: '采集月瓣草 [E]', flavorText: '营地旁的草丛中生长着一株月瓣草。' },
            { id: 'tc_coin1', type: 'collectible', itemId: 'coin_ancient', tileX: 105, tileY: 95, promptText: '捡起古币 [E]', flavorText: '泥土中露出一枚古币的边缘。' },
            { id: 'tc_letter1', type: 'collectible', itemId: 'letter_fragment', tileX: 95, tileY: 105, promptText: '拾取残信 [E]', flavorText: '篝火旁散落着几片碎纸。' },
            { id: 'tc_herb2', type: 'collectible', itemId: 'herb_sunroot', tileX: 110, tileY: 88, promptText: '采集阳根草 [E]', flavorText: '阳光照射的角落里生长着金色草药。' },
            { id: 'tc_herb3', type: 'collectible', itemId: 'herb_bloodthorn', tileX: 98, tileY: 112, promptText: '采集血棘 [E]', flavorText: '帐篷后面的荆棘丛中有一株红色草药。' },
            { id: 'tc_coin2', type: 'collectible', itemId: 'coin_bronze', tileX: 85, tileY: 98, promptText: '捡起铜币 [E]', flavorText: '水井旁有一枚被遗忘的铜币。' }
        ],
        npcs: [
            { id: 'npc_old_traveler', name: '老旅人', dialogueTreeId: 'npc_old_traveler', spriteKey: 'npc_old_traveler', tileX: 97, tileY: 97, regionId: 'travelers_camp', flavorText: '篝火旁，一位风尘仆仆的老人正望着火焰出神。' }
        ],
        ambientFeatures: ['campfire_glow', 'tent_markers']
    },
    {
        id: 'misty_forest',
        name: '迷雾森林',
        description: '浓雾弥漫的古老森林，隐藏着无数秘密。',
        bounds: { x: 0, y: 0, w: 80, h: 100 },
        palette: {
            ground: '#2d4a2d',
            groundAlt: '#3a5a3a',
            obstacle: '#1a2e1a',
            accent: '#6aaa6a',
            labelColor: '#c0ffc0'
        },
        terrainType: 'forest',
        obstacles: [],
        interactables: [
            { id: 'mf_herb1', type: 'collectible', itemId: 'herb_shadowleaf', tileX: 30, tileY: 40, promptText: '采集影叶 [E]', flavorText: '阴影中有一片黑色叶片在微微摇动。' },
            { id: 'mf_crystal1', type: 'easter_egg', itemId: 'crystal_shard', tileX: 15, tileY: 20, promptText: '拾取水晶碎片 [E]', flavorText: '树根间有什么东西在发光。' },
            { id: 'mf_herb2', type: 'collectible', itemId: 'herb_moonpetal', tileX: 55, tileY: 70, promptText: '采集月瓣草 [E]', flavorText: '迷雾中隐约可见银色花朵。' },
            { id: 'mf_scroll1', type: 'collectible', itemId: 'scroll_mystery', tileX: 40, tileY: 15, promptText: '拾取卷轴 [E]', flavorText: '一棵古树的树洞里塞着一卷羊皮纸。' },
            { id: 'mf_herb3', type: 'collectible', itemId: 'herb_bloodthorn', tileX: 20, tileY: 60, promptText: '采集血棘 [E]', flavorText: '苔藓覆盖的树干旁有一株红色尖刺草药。' },
            { id: 'mf_letter1', type: 'collectible', itemId: 'letter_warning', tileX: 65, tileY: 45, promptText: '拾取警告信 [E]', flavorText: '一根树枝上插着一封密封的信件。' },
            { id: 'mf_herb4', type: 'collectible', itemId: 'herb_moonpetal', tileX: 48, tileY: 85, promptText: '采集月瓣草 [E]', flavorText: '林间空地上，又一株银色花朵在幽暗中静静绽放。' }
        ],
        guardians: [
            { id: 'guardian_forest', name: '林地守卫者', tileX: 40, tileY: 50, regionId: 'misty_forest', flavorText: '一团浓雾凝聚成了人形，挡住了去路。' }
        ],
        npcs: [
            { id: 'npc_hermit_herbalist', name: '隐士药师', dialogueTreeId: 'npc_hermit_herbalist', spriteKey: 'npc_hermit_herbalist', tileX: 35, tileY: 45, regionId: 'misty_forest', flavorText: '树洞小屋前，一位披苔绿斗篷的药师正在捣药。' }
        ],
        ambientFeatures: ['fog_overlay', 'dense_trees']
    },
    {
        id: 'abandoned_temple',
        name: '废弃神殿',
        description: '曾经辉煌的神殿，如今只剩断壁残垣。',
        bounds: { x: 80, y: 0, w: 60, h: 80 },
        palette: {
            ground: '#5a5a6a',
            groundAlt: '#4a4a5a',
            obstacle: '#3a3a4a',
            accent: '#8a8a9a',
            labelColor: '#e0e0ff'
        },
        terrainType: 'ruins',
        obstacles: [],
        interactables: [
            { id: 'at_stone1', type: 'easter_egg', itemId: 'stone_rune', tileX: 100, tileY: 30, promptText: '拾取符文石 [E]', flavorText: '断壁上的符文似乎在微微发光。' },
            { id: 'at_coin1', type: 'collectible', itemId: 'coin_silver', tileX: 120, tileY: 50, promptText: '捡起银币 [E]', flavorText: '碎石中有一枚银币在闪光。' },
            { id: 'at_letter1', type: 'collectible', itemId: 'letter_old', tileX: 90, tileY: 60, promptText: '拾取旧信件 [E]', flavorText: '祭坛的缝隙中夹着一封旧信。' },
            { id: 'at_mask1', type: 'easter_egg', itemId: 'mask_bone', tileX: 130, tileY: 25, promptText: '拾取骨面具 [E]', flavorText: '倒塌的神像手中握着一个白色面具。' }
        ],
        guardians: [
            { id: 'guardian_temple', name: '神殿守望者', tileX: 110, tileY: 40, regionId: 'abandoned_temple', flavorText: '一尊石像突然转动了头颅，眼中亮起蓝光。' }
        ],
        npcs: [
            { id: 'npc_stele_warden', name: '石碑守卫', dialogueTreeId: 'npc_stele_warden', spriteKey: 'npc_stele_warden', tileX: 100, tileY: 35, regionId: 'abandoned_temple', flavorText: '断壁残垣间，一尊半人半石的守卫静静伫立。' }
        ],
        ambientFeatures: ['broken_pillars', 'moss']
    },
    {
        id: 'dark_cavern',
        name: '幽暗洞窟',
        description: '深邃的洞穴，黑暗中传来不明的声响。',
        bounds: { x: 140, y: 0, w: 60, h: 80 },
        palette: {
            ground: '#2a2a3a',
            groundAlt: '#1a1a2a',
            obstacle: '#0a0a1a',
            accent: '#4a4a5a',
            labelColor: '#a0a0ff'
        },
        terrainType: 'cave',
        obstacles: [],
        interactables: [
            { id: 'dc_crystal1', type: 'easter_egg', itemId: 'crystal_ice', tileX: 160, tileY: 30, promptText: '拾取冰晶 [E]', flavorText: '洞壁上凝结着一块永不融化的冰晶。' },
            { id: 'dc_feather1', type: 'easter_egg', itemId: 'feather_phoenix', tileX: 180, tileY: 50, promptText: '拾取凤凰羽 [E]', flavorText: '黑暗的深处，一根羽毛散发着温暖的光芒。' },
            { id: 'dc_herb1', type: 'collectible', itemId: 'herb_shadowleaf', tileX: 150, tileY: 60, promptText: '采集影叶 [E]', flavorText: '洞口的阴影中生长着黑色叶片。' },
            { id: 'dc_compass1', type: 'easter_egg', itemId: 'compass_broken', tileX: 190, tileY: 20, promptText: '拾取碎罗盘 [E]', flavorText: '一具骸骨旁散落着一个铜制罗盘。' }
        ],
        guardians: [
            { id: 'guardian_cavern', name: '洞窟巨影', tileX: 170, tileY: 45, regionId: 'dark_cavern', flavorText: '黑暗中浮现出一个巨大的影子，地面在颤抖。' }
        ],
        npcs: [
            { id: 'npc_lost_miner', name: '迷途矿工', dialogueTreeId: 'npc_lost_miner', spriteKey: 'npc_lost_miner', tileX: 150, tileY: 40, regionId: 'dark_cave', flavorText: '一盏摇曳的油灯下，满脸煤灰的矿工蜷坐在岩壁边。' }
        ],
        ambientFeatures: ['stalactites', 'glowing_mushrooms']
    },
    {
        id: 'silver_coast',
        name: '银色海岸',
        description: '月光下的银色沙滩，海浪轻拍着岸边。',
        bounds: { x: 0, y: 100, w: 200, h: 100 },
        palette: {
            ground: '#6a8a9a',
            groundAlt: '#5a7a8a',
            obstacle: '#4a6a7a',
            accent: '#8aaaba',
            labelColor: '#e0f0ff'
        },
        terrainType: 'coast',
        obstacles: [],
        interactables: [
            { id: 'sc_coin1', type: 'collectible', itemId: 'coin_gold', tileX: 50, tileY: 130, promptText: '捡起金币 [E]', flavorText: '沙滩上有一枚被海浪冲上来的金币。' },
            { id: 'sc_gem1', type: 'easter_egg', itemId: 'gem_emerald', tileX: 150, tileY: 160, promptText: '拾取翡翠 [E]', flavorText: '潮汐池里有什么东西在闪烁绿光。' },
            { id: 'sc_herb1', type: 'collectible', itemId: 'herb_starbloom', tileX: 100, tileY: 180, promptText: '采集星花 [E]', flavorText: '海风中摇曳着一朵白色的星花。' },
            { id: 'sc_coin2', type: 'collectible', itemId: 'coin_bronze', tileX: 30, tileY: 150, promptText: '捡起铜币 [E]', flavorText: '礁石缝隙中卡着一枚铜币。' },
            { id: 'sc_herb2', type: 'collectible', itemId: 'herb_moonpetal', tileX: 170, tileY: 140, promptText: '采集月瓣草 [E]', flavorText: '月光照耀的岩石上生长着银色花朵。' },
            { id: 'sc_ice1', type: 'collectible', itemId: 'crystal_ice', tileX: 75, tileY: 132, promptText: '拾取冰晶 [E]', flavorText: '退潮后的礁石缝里，一块冰晶散发着寒气。' },
            { id: 'sc_ice2', type: 'collectible', itemId: 'crystal_ice', tileX: 128, tileY: 138, promptText: '拾取冰晶 [E]', flavorText: '湿漉漉的岩石上凝结着一块永不融化的冰晶。' }
        ],
        npcs: [
            { id: 'npc_fisherman', name: '渔夫', dialogueTreeId: 'npc_fisherman', spriteKey: 'npc_fisherman', tileX: 60, tileY: 120, regionId: 'silver_coast', flavorText: '银色浪涛边，一位皮肤黝黑的渔夫正修补着渔网。' }
        ],
        ambientFeatures: ['waves', 'seashells']
    }
];

class RegionManager {
    constructor() {
        this.regions = REGIONS;
        this._regionMap = new Map();
        for (const region of this.regions) {
            this._regionMap.set(region.id, region);
        }
    }

    getRegion(id) {
        return this._regionMap.get(id);
    }

    getAllRegions() {
        return this.regions;
    }

    getRegionAt(worldX, worldY) {
        const tileX = Math.floor(worldX / TILE_SIZE);
        const tileY = Math.floor(worldY / TILE_SIZE);
        
        for (const region of this.regions) {
            const bounds = region.bounds;
            if (tileX >= bounds.x && tileX < bounds.x + bounds.w &&
                tileY >= bounds.y && tileY < bounds.y + bounds.h) {
                return region;
            }
        }
        return null;
    }

    detectTransition(oldPos, newPos) {
        const oldRegion = this.getRegionAt(oldPos.x, oldPos.y);
        const newRegion = this.getRegionAt(newPos.x, newPos.y);
        
        if (oldRegion !== newRegion && newRegion !== null) {
            return newRegion;
        }
        return null;
    }

    getPalette(regionId) {
        const region = this.getRegion(regionId);
        return region ? region.palette : null;
    }
}
