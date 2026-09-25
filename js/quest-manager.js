// 迷雾纪元 - 任务引擎

// 任务状态：active（进行中）→ ready（目标达成，待交付）→ completed（已完成）
// 自动完成任务（autoComplete）在目标达成时直接 completed，跳过 ready。
// 软失败：战斗任务失败（玩家倒下）不改变任务状态，可无限重试，无惩罚。

const QUEST_STATE = {
    ACTIVE: 'active',
    READY: 'ready',
    COMPLETED: 'completed'
};

class QuestManager {
    constructor(eventBus, deps) {
        this._eventBus = eventBus;
        this._deps = deps || {};
        this._quests = new Map();
        this._flags = new Set();
        this._bindEvents();
    }

    _bindEvents() {
        this._eventBus.on('item:collected', () => this._reevaluate('collect'));
        this._eventBus.on('world:stateChanged', (data) => {
            if (data && data.type === 'guardian_defeated') {
                this._reevaluate('defeat');
            }
        });
    }

    // ===== 查询 =====

    getDef(questId) {
        return QUEST_DEFS[questId] || null;
    }

    getState(questId) {
        const entry = this._quests.get(questId);
        return entry ? entry.state : undefined;
    }

    isStarted(questId) {
        return this._quests.has(questId);
    }

    getFlag(flag) {
        return this._flags.has(flag);
    }

    setFlag(flag) {
        if (!flag || this._flags.has(flag)) return;
        this._flags.add(flag);
        this._eventBus.emit('quest:flag', { flag });
    }

    canStart(questId) {
        const def = QUEST_DEFS[questId];
        if (!def) return false;
        if (this._quests.has(questId)) return false;
        const prereqs = def.prerequisites || [];
        return prereqs.every(p => this.getState(p) === QUEST_STATE.COMPLETED);
    }

    // ===== 生命周期 =====

    startQuest(questId) {
        if (!this.canStart(questId)) return false;
        this._quests.set(questId, {
            state: QUEST_STATE.ACTIVE,
            startedAt: Date.now(),
            completedAt: null
        });
        this._eventBus.emit('quest:started', { questId, def: QUEST_DEFS[questId] });
        this._evaluateQuest(questId);
        return true;
    }

    completeQuest(questId) {
        const entry = this._quests.get(questId);
        if (!entry || entry.state === QUEST_STATE.COMPLETED) return false;
        const def = QUEST_DEFS[questId];
        entry.state = QUEST_STATE.COMPLETED;
        entry.completedAt = Date.now();
        this._grantRewards(def);
        this._eventBus.emit('quest:completed', { questId, def, rewards: def ? def.rewards : null });
        return true;
    }

    _evaluateQuest(questId) {
        const entry = this._quests.get(questId);
        if (!entry || entry.state === QUEST_STATE.COMPLETED) return;
        const def = QUEST_DEFS[questId];
        if (!def || !def.objectives) return;

        const met = def.objectives.every(o => this._objectiveMet(o));
        if (!met) return;

        if (def.autoComplete) {
            this.completeQuest(questId);
        } else if (entry.state === QUEST_STATE.ACTIVE) {
            entry.state = QUEST_STATE.READY;
            this._eventBus.emit('quest:ready', { questId, def });
        }
    }

    _reevaluate(kind) {
        for (const [questId, entry] of this._quests) {
            if (entry.state === QUEST_STATE.COMPLETED) continue;
            const def = QUEST_DEFS[questId];
            if (!def || !def.objectives) continue;
            if (kind && !def.objectives.some(o => o.type === kind)) continue;
            this._evaluateQuest(questId);
        }
    }

    _objectiveMet(objective) {
        if (objective.type === 'collect') {
            return this._getItemCount(objective.itemId) >= (objective.count || 1);
        }
        if (objective.type === 'defeat') {
            return this._isGuardianDefeated(objective.guardianId);
        }
        return false;
    }

    // 返回 [{ text, current, required, met }]，供任务 UI 显示进度
    getObjectiveProgress(questId) {
        const def = QUEST_DEFS[questId];
        if (!def || !def.objectives) return [];
        return def.objectives.map(o => {
            if (o.type === 'collect') {
                const required = o.count || 1;
                const current = Math.min(required, this._getItemCount(o.itemId));
                return { text: o.text, current, required, met: current >= required };
            }
            if (o.type === 'defeat') {
                const met = this._isGuardianDefeated(o.guardianId);
                return { text: o.text, current: met ? 1 : 0, required: 1, met };
            }
            return { text: o.text, current: 0, required: 1, met: false };
        });
    }

    // ===== 奖励 =====

    _grantRewards(def) {
        if (!def || !def.rewards) return;
        const items = def.rewards.items || [];
        for (const r of items) {
            const count = r.count || 1;
            for (let i = 0; i < count; i++) this._addItem(r.id);
        }
        const discoveries = def.rewards.discoveries || [];
        for (const d of discoveries) {
            this._recordDiscovery(d.id, d.text);
        }
    }

    // ===== NPC 头顶标记 =====

    // none / available(!) / active(?) / complete(✓)
    // 一个 NPC 可能给出多个任务，取优先级最高的状态：available > active > complete > none
    getNpcMarkerState(npcId) {
        const rank = { none: 0, complete: 1, active: 2, available: 3 };
        let best = 'none';
        for (const questId in QUEST_DEFS) {
            const def = QUEST_DEFS[questId];
            if (def.giverNpc !== npcId) continue;
            const state = this.getState(questId);
            let s;
            if (state === QUEST_STATE.COMPLETED) s = 'complete';
            else if (state === QUEST_STATE.READY) s = 'available';
            else if (state === QUEST_STATE.ACTIVE) s = 'active';
            else s = this.canStart(questId) ? 'available' : 'none';
            if (rank[s] > rank[best]) best = s;
        }
        return best;
    }

    // ===== 列表（供任务 UI）=====

    getTrackedQuestIds() {
        const out = [];
        for (const [questId, entry] of this._quests) {
            if (entry.state === QUEST_STATE.ACTIVE || entry.state === QUEST_STATE.READY) {
                out.push(questId);
            }
        }
        return out;
    }

    getCompletedQuestIds() {
        const out = [];
        for (const [questId, entry] of this._quests) {
            if (entry.state === QUEST_STATE.COMPLETED) out.push(questId);
        }
        return out;
    }

    // ===== 依赖注入的间接层 =====

    _getItemCount(itemId) {
        return this._deps.getItemCount ? this._deps.getItemCount(itemId) : 0;
    }

    _isGuardianDefeated(guardianId) {
        return this._deps.isGuardianDefeated ? this._deps.isGuardianDefeated(guardianId) : false;
    }

    _addItem(itemId) {
        if (this._deps.addItem) this._deps.addItem(itemId);
    }

    _recordDiscovery(id, text) {
        if (this._deps.recordDiscovery) this._deps.recordDiscovery(id, text);
    }

    // ===== 存档（步骤 6 接入持久化）=====

    reset() {
        this._quests.clear();
        this._flags.clear();
    }

    export() {
        const quests = {};
        for (const [questId, entry] of this._quests) {
            quests[questId] = {
                state: entry.state,
                startedAt: entry.startedAt,
                completedAt: entry.completedAt
            };
        }
        return { quests, flags: Array.from(this._flags) };
    }

    import(data) {
        this.reset();
        if (!data) return;
        if (data.quests) {
            for (const questId in data.quests) {
                const entry = data.quests[questId];
                if (!QUEST_DEFS[questId] || !entry || !entry.state) continue;
                this._quests.set(questId, {
                    state: entry.state,
                    startedAt: entry.startedAt || null,
                    completedAt: entry.completedAt || null
                });
            }
        }
        if (Array.isArray(data.flags)) {
            for (const f of data.flags) this._flags.add(f);
        }
    }
}
