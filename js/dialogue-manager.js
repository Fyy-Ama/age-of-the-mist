// 迷雾纪元 - 对话引擎

const DIALOGUE_CHARS_PER_SECOND = 38;

// 条件类型：hasItem / questState / discovered / flag / always
// 效果类型：startQuest / completeQuest / addItem / recordDiscovery / setFlag
// context 由调用方注入，需提供：getItemCount / getQuestState / hasDiscovered / getFlag

class DialogueManager {
    constructor(eventBus) {
        this._eventBus = eventBus;
        this._active = false;
        this._tree = null;
        this._node = null;
        this._nodeId = null;
        this._context = {};
        this._fullText = '';
        this._displayedChars = 0;
        this._charsPerSecond = DIALOGUE_CHARS_PER_SECOND;
        this._rafId = null;
        this._lastTime = 0;
        this._effectsHandler = null;
    }

    setEffectsHandler(fn) {
        this._effectsHandler = fn;
    }

    isActive() {
        return this._active;
    }

    start(treeId, context, startNodeId) {
        if (this._active) this.end();

        const tree = DIALOGUE_TREES[treeId];
        if (!tree) return false;

        this._tree = tree;
        this._context = context || {};
        this._active = true;

        const startId = startNodeId || this._resolveStart(tree);
        this._eventBus.emit('dialogue:started', { treeId, npcName: tree.name });
        this._enterNode(startId);
        this._startTypewriter();
        return true;
    }

    _resolveStart(tree) {
        if (typeof tree.start === 'string') return tree.start;
        if (Array.isArray(tree.start)) {
            for (const entry of tree.start) {
                if (!entry.condition || this.evaluateCondition(entry.condition)) {
                    return entry.nodeId;
                }
            }
            const fallback = tree.start[tree.start.length - 1];
            return fallback ? fallback.nodeId : null;
        }
        return null;
    }

    _enterNode(nodeId) {
        if (!nodeId || !this._tree.nodes[nodeId]) {
            this.end();
            return;
        }

        this._nodeId = nodeId;
        this._node = this._tree.nodes[nodeId];
        this._fullText = this._node.text || '';
        this._displayedChars = 0;

        if (this._node.effects) {
            this._node.effects.forEach(e => this._applyEffect(e));
        }

        this._eventBus.emit('dialogue:node', {
            nodeId,
            speaker: this._node.speaker || this._tree.name,
            text: this._fullText,
            choices: this.getVisibleChoices()
        });
    }

    getVisibleChoices() {
        if (!this._node || !this._node.choices) return [];
        const result = [];
        for (let i = 0; i < this._node.choices.length; i++) {
            const choice = this._node.choices[i];
            if (!choice.condition || this.evaluateCondition(choice.condition)) {
                result.push({ text: choice.text, index: i });
            }
        }
        return result;
    }

    evaluateCondition(cond) {
        if (!cond) return true;
        const ctx = this._context || {};
        switch (cond.type) {
            case 'hasItem':
                return (ctx.getItemCount ? ctx.getItemCount(cond.itemId) : 0) >= (cond.count || 1);
            case 'questState':
                return ctx.getQuestState ? ctx.getQuestState(cond.questId) === cond.state : false;
            case 'canStartQuest':
                return ctx.canStartQuest ? ctx.canStartQuest(cond.questId) : false;
            case 'discovered':
                return ctx.hasDiscovered ? ctx.hasDiscovered(cond.id) : false;
            case 'flag':
                return ctx.getFlag ? !!ctx.getFlag(cond.flag) : false;
            case 'always':
                return true;
            default:
                return true;
        }
    }

    _applyEffect(effect) {
        if (this._effectsHandler) this._effectsHandler(effect);
        this._eventBus.emit('dialogue:effect', effect);
    }

    _startTypewriter() {
        this._lastTime = performance.now();
        const tick = (now) => {
            if (!this._active) return;
            const dt = (now - this._lastTime) / 1000;
            this._lastTime = now;
            this._advanceText(dt);
            this._rafId = requestAnimationFrame(tick);
        };
        this._rafId = requestAnimationFrame(tick);
    }

    _advanceText(dt) {
        if (this._displayedChars >= this._fullText.length) return;
        this._displayedChars = Math.min(
            this._fullText.length,
            this._displayedChars + dt * this._charsPerSecond
        );
        this._eventBus.emit('dialogue:textUpdate', {
            displayedText: this.getDisplayedText(),
            complete: this.isTextComplete()
        });
    }

    getDisplayedText() {
        return this._fullText.slice(0, Math.floor(this._displayedChars));
    }

    getFullText() {
        return this._fullText;
    }

    isTextComplete() {
        return Math.floor(this._displayedChars) >= this._fullText.length;
    }

    skipText() {
        if (this.isTextComplete()) return;
        this._displayedChars = this._fullText.length;
        this._eventBus.emit('dialogue:textUpdate', {
            displayedText: this.getDisplayedText(),
            complete: true
        });
    }

    // 推进：文本未完则跳过；无选项则跟随 next 或结束；有选项则等待 selectChoice
    advance() {
        if (!this._active) return;
        if (!this.isTextComplete()) {
            this.skipText();
            return;
        }
        const hasChoices = this._node && this._node.choices && this._node.choices.length > 0;
        if (!hasChoices) {
            const nextId = this._node ? this._node.next : null;
            if (nextId) this._enterNode(nextId);
            else this.end();
        }
    }

    selectChoice(index) {
        if (!this._active) return;
        if (!this.isTextComplete()) {
            this.skipText();
            return;
        }
        const visible = this.getVisibleChoices();
        if (!visible.some(v => v.index === index)) return;

        const choice = this._node.choices[index];
        if (choice.effects) {
            choice.effects.forEach(e => this._applyEffect(e));
        }
        this._enterNode(choice.next || null);
    }

    getCurrentNode() {
        return this._node;
    }

    getCurrentNodeId() {
        return this._nodeId;
    }

    getNpcName() {
        return this._tree ? this._tree.name : '';
    }

    getTreeId() {
        return this._tree ? this._tree.id : null;
    }

    end() {
        if (!this._active) return;
        this._active = false;
        if (this._rafId) cancelAnimationFrame(this._rafId);
        this._rafId = null;
        const treeId = this.getTreeId();
        this._tree = null;
        this._node = null;
        this._nodeId = null;
        this._eventBus.emit('dialogue:ended', { treeId });
    }

    export() {
        return {
            activeTreeId: this._active ? this.getTreeId() : null,
            activeNodeId: this._active ? this._nodeId : null
        };
    }
}
