// 迷雾纪元 - 随机事件系统

const WORLD_EVENT_DEFS = [
    {
        id: 'merchant_appears',
        name: '流浪商人',
        description: '一位神秘的商人出现在营地附近，似乎在等待旅人。',
        triggerRegion: 'travelers_camp',
        triggerType: 'enter_region',
        weight: 3,
        cooldown: 120,
        repeatable: true
    },
    {
        id: 'forest_whisper',
        name: '森林低语',
        description: '迷雾中传来若有若无的低语声，仿佛在诉说着古老的秘密。',
        triggerRegion: 'misty_forest',
        triggerType: 'enter_region',
        weight: 4,
        cooldown: 180,
        repeatable: true
    },
    {
        id: 'temple_glow',
        name: '神殿微光',
        description: '废弃神殿的断壁间突然亮起微弱的蓝色光芒，转瞬即逝。',
        triggerRegion: 'abandoned_temple',
        triggerType: 'enter_region',
        weight: 3,
        cooldown: 150,
        repeatable: true
    },
    {
        id: 'cavern_rumble',
        name: '洞窟震动',
        description: '脚下传来轻微的震动，洞窟深处似乎有什么巨大的东西在移动。',
        triggerRegion: 'dark_cavern',
        triggerType: 'enter_region',
        weight: 4,
        cooldown: 120,
        repeatable: true
    },
    {
        id: 'coast_aurora',
        name: '海岸极光',
        description: '海面上方突然出现绚丽的极光，照亮了整片银色海岸。',
        triggerRegion: 'silver_coast',
        triggerType: 'enter_region',
        weight: 2,
        cooldown: 240,
        repeatable: true
    },
    {
        id: 'night_owl',
        name: '夜枭啼鸣',
        description: '一只巨大的夜枭从头顶掠过，发出低沉的啼鸣。',
        triggerRegion: null,
        triggerType: 'time_of_day',
        triggerPhase: 'night',
        weight: 3,
        cooldown: 200,
        repeatable: true
    },
    {
        id: 'dawn_mist',
        name: '晨雾弥漫',
        description: '黎明时分，一层金色的薄雾笼罩了大地，一切显得如梦似幻。',
        triggerRegion: null,
        triggerType: 'time_of_day',
        triggerPhase: 'dawn',
        weight: 2,
        cooldown: 300,
        repeatable: true
    },
    {
        id: 'camp_story',
        name: '旅人故事',
        description: '营地中一位老旅人向你招手，似乎想讲述一个古老的故事。',
        triggerRegion: 'travelers_camp',
        triggerType: 'enter_region',
        weight: 2,
        cooldown: 200,
        repeatable: true
    },
    {
        id: 'temple_echo',
        name: '神殿回声',
        description: '废弃神殿中传来一阵低沉的回声，仿佛有人在诵念古老的祈祷词。',
        triggerRegion: 'abandoned_temple',
        triggerType: 'enter_region',
        weight: 2,
        cooldown: 180,
        repeatable: true
    },
    {
        id: 'coast_whale',
        name: '远方鲸歌',
        description: '海平线上传来悠长的鲸歌，银色的海面上泛起一圈圈涟漪。',
        triggerRegion: 'silver_coast',
        triggerType: 'enter_region',
        weight: 2,
        cooldown: 240,
        repeatable: true
    },
    {
        id: 'dusk_fireflies',
        name: '黄昏萤火',
        description: '黄昏时分，成百上千的萤火虫从草丛中升起，如同漫天星辰。',
        triggerRegion: null,
        triggerType: 'time_of_day',
        triggerPhase: 'dusk',
        weight: 3,
        cooldown: 200,
        repeatable: true
    }
];

class WorldEvents {
    constructor(eventBus) {
        this._eventBus = eventBus;
        this._triggeredSet = new Set();
        this._cooldowns = new Map();
        this._lastRegionId = null;
        this._lastPhase = null;
    }

    onRegionEnter(regionId) {
        if (regionId === this._lastRegionId) return;
        this._lastRegionId = regionId;
        this._tryTrigger('enter_region', regionId);
    }

    onPhaseChange(phase) {
        if (phase === this._lastPhase) return;
        this._lastPhase = phase;
        this._tryTrigger('time_of_day', null, phase);
    }

    _tryTrigger(triggerType, regionId, phase) {
        const candidates = WORLD_EVENT_DEFS.filter(def => {
            if (def.triggerType !== triggerType) return false;
            if (triggerType === 'enter_region' && def.triggerRegion !== regionId) return false;
            if (triggerType === 'time_of_day' && def.triggerPhase !== phase) return false;
            if (!def.repeatable && this._triggeredSet.has(def.id)) return false;
            const lastTriggered = this._cooldowns.get(def.id);
            if (lastTriggered !== undefined) {
                const elapsed = (Date.now() - lastTriggered) / 1000;
                if (elapsed < def.cooldown) return false;
            }
            return true;
        });

        if (candidates.length === 0) return;

        const totalWeight = candidates.reduce((sum, def) => sum + def.weight, 0);
        let roll = Math.random() * totalWeight;
        let selected = candidates[0];
        for (const def of candidates) {
            roll -= def.weight;
            if (roll <= 0) {
                selected = def;
                break;
            }
        }

        this._triggeredSet.add(selected.id);
        this._cooldowns.set(selected.id, Date.now());

        this._eventBus.emit('world:event_triggered', {
            eventId: selected.id,
            name: selected.name,
            description: selected.description
        });
    }

    hasTriggered(eventId) {
        return this._triggeredSet.has(eventId);
    }

    getTriggeredIds() {
        return [...this._triggeredSet];
    }

    export() {
        const triggered = [...this._triggeredSet];
        const cooldowns = {};
        for (const [key, value] of this._cooldowns.entries()) {
            cooldowns[key] = value;
        }
        return { triggered, cooldowns };
    }

    import(data) {
        if (data.triggered) {
            this._triggeredSet = new Set(data.triggered);
        }
        if (data.cooldowns) {
            this._cooldowns.clear();
            for (const key in data.cooldowns) {
                if (data.cooldowns.hasOwnProperty(key)) {
                    this._cooldowns.set(key, data.cooldowns[key]);
                }
            }
        }
    }

    reset() {
        this._triggeredSet.clear();
        this._cooldowns.clear();
        this._lastRegionId = null;
        this._lastPhase = null;
    }
}
