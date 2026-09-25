// 迷雾纪元 - 物品数据

const ITEM_DEFS = [
    {
        id: 'herb_moonpetal',
        name: '月瓣草',
        description: '在月光下绽放的银色草药，据说能安抚不安的灵魂。',
        category: 'herb',
        iconShape: 'circle',
        iconColor: '#c0c0ff',
        isEasterEgg: false
    },
    {
        id: 'coin_ancient',
        name: '古币',
        description: '一枚磨损严重的古币，上面刻着已失传的文字。',
        category: 'coin',
        iconShape: 'circle',
        iconColor: '#d4a574',
        isEasterEgg: false
    },
    {
        id: 'letter_fragment',
        name: '残信碎片',
        description: '一封被撕碎的信，只剩下只言片语："...切勿在月圆之夜..."',
        category: 'letter',
        iconShape: 'rect',
        iconColor: '#e8d9a8',
        isEasterEgg: false
    },
    {
        id: 'crystal_shard',
        name: '水晶碎片',
        description: '一块散发着微弱蓝光的晶体碎片，触摸时感到一阵寒意。',
        category: 'easter_egg',
        iconShape: 'diamond',
        iconColor: '#80c0ff',
        isEasterEgg: true
    },
    {
        id: 'herb_sunroot',
        name: '阳根草',
        description: '生长在阳光充足之处的金色草药，有温暖的触感。',
        category: 'herb',
        iconShape: 'circle',
        iconColor: '#ffd700',
        isEasterEgg: false
    },
    {
        id: 'feather_phoenix',
        name: '凤凰羽',
        description: '一根燃烧着微弱火焰的羽毛，永远不会熄灭。',
        category: 'easter_egg',
        iconShape: 'diamond',
        iconColor: '#ff6b35',
        isEasterEgg: true
    },
    {
        id: 'scroll_mystery',
        name: '神秘卷轴',
        description: '一卷古老的羊皮纸，上面的符文在月光下才会显现。',
        category: 'letter',
        iconShape: 'rect',
        iconColor: '#8b7355',
        isEasterEgg: false
    },
    {
        id: 'stone_rune',
        name: '符文石',
        description: '刻有古老符文的石头，据说能指引迷途者找到归路。',
        category: 'easter_egg',
        iconShape: 'rect',
        iconColor: '#5a5a6a',
        isEasterEgg: true
    },
    {
        id: 'herb_shadowleaf',
        name: '影叶',
        description: '在阴影中生长的黑色叶片，据说能让人隐匿于黑暗。',
        category: 'herb',
        iconShape: 'circle',
        iconColor: '#2a2a3a',
        isEasterEgg: false
    },
    {
        id: 'coin_silver',
        name: '银币',
        description: '一枚保存完好的银币，上面印着已覆灭王国的徽章。',
        category: 'coin',
        iconShape: 'circle',
        iconColor: '#c0c0c0',
        isEasterEgg: false
    },
    {
        id: 'gem_emerald',
        name: '翡翠',
        description: '一块打磨光滑的翡翠，在光线下闪烁着深邃的绿色。',
        category: 'easter_egg',
        iconShape: 'diamond',
        iconColor: '#50c878',
        isEasterEgg: true
    },
    {
        id: 'letter_old',
        name: '旧信件',
        description: '一封泛黄的信件，墨迹已经模糊，但仍能辨认出几个字："...永恒..."',
        category: 'letter',
        iconShape: 'rect',
        iconColor: '#d4c5a0',
        isEasterEgg: false
    },
    {
        id: 'herb_starbloom',
        name: '星花',
        description: '只在午夜绽放的白色花朵，花瓣上闪烁着星光般的露珠。',
        category: 'herb',
        iconShape: 'circle',
        iconColor: '#ffffff',
        isEasterEgg: false
    },
    {
        id: 'coin_gold',
        name: '金币',
        description: '一枚沉甸甸的金币，边缘已经磨损，但依然价值不菲。',
        category: 'coin',
        iconShape: 'circle',
        iconColor: '#ffd700',
        isEasterEgg: false
    },
    {
        id: 'crystal_ice',
        name: '冰晶',
        description: '一块永不融化的冰晶，即使在最热的天气也保持着寒冷。',
        category: 'easter_egg',
        iconShape: 'diamond',
        iconColor: '#a0d0ff',
        isEasterEgg: true
    },
    {
        id: 'herb_bloodthorn',
        name: '血棘',
        description: '一株长着红色尖刺的草药，据说能治愈最顽固的伤口。',
        category: 'herb',
        iconShape: 'circle',
        iconColor: '#cc3333',
        isEasterEgg: false
    },
    {
        id: 'coin_bronze',
        name: '铜币',
        description: '一枚锈迹斑斑的铜币，上面隐约可见一头公牛的图案。',
        category: 'coin',
        iconShape: 'circle',
        iconColor: '#cd7f32',
        isEasterEgg: false
    },
    {
        id: 'mask_bone',
        name: '骨面具',
        description: '一个用未知生物骨骼制成的面具，戴上后能听到远方的低语。',
        category: 'easter_egg',
        iconShape: 'rect',
        iconColor: '#e0d8c0',
        isEasterEgg: true
    },
    {
        id: 'letter_warning',
        name: '警告信',
        description: '一封用火漆封印的信，展开后只有四个字："切勿回头"。',
        category: 'letter',
        iconShape: 'rect',
        iconColor: '#8b0000',
        isEasterEgg: false
    },
    {
        id: 'compass_broken',
        name: '碎罗盘',
        description: '一个指针永远指向北方的罗盘，即使北方并不存在。',
        category: 'easter_egg',
        iconShape: 'circle',
        iconColor: '#b87333',
        isEasterEgg: true
    }
];

function getItemDef(itemId) {
    return ITEM_DEFS.find(item => item.id === itemId);
}
