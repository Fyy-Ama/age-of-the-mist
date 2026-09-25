// 迷雾纪元 - 游戏主类

class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.eventBus = null;
        this.input = null;
        this.camera = null;
        this.player = null;
        this.regionManager = null;
        this.worldMap = null;
        this.renderer = null;
        this.inventory = null;
        this.discoveryLog = null;
        this.uiManager = null;
        this.saveManager = null;
        this.dayNightCycle = null;
        this.worldEvents = null;
        this.dialogueManager = null;
        this.questManager = null;
        this.state = GAME_STATES.LOADING;
        this.lastTime = 0;
        this.accumulator = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.fpsTimer = 0;
        this._prevPlayerX = 0;
        this._prevPlayerY = 0;
        this._titleFogParticles = [];
    }

    async init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.eventBus = new EventBus();
        this.input = new InputManager();

        this.regionManager = new RegionManager();
        const tileMap = generateMapData();
        this.worldMap = new WorldMap(tileMap, this.regionManager);

        const worldW = WORLD_COLS * TILE_SIZE;
        const worldH = WORLD_ROWS * TILE_SIZE;
        this.camera = new Camera(CANVAS_W, CANVAS_H, worldW, worldH);

        const spawnX = 100 * TILE_SIZE;
        const spawnY = 100 * TILE_SIZE;
        this.player = new Player(spawnX, spawnY);

        this.renderer = new Renderer(this.canvas, this.ctx);
        this.visualEffects = new VisualEffects();

        this.inventory = new Inventory(this.eventBus);
        this.discoveryLog = new DiscoveryLog(this.eventBus);
        this.uiManager = new UIManager(this.eventBus);
        this.uiManager.setGameRef(this);
        this.saveManager = new SaveManager(this.eventBus);
        await this.saveManager.init();

        this.dayNightCycle = new DayNightCycle(this.eventBus);
        this.worldEvents = new WorldEvents(this.eventBus);
        this.dialogueManager = new DialogueManager(this.eventBus);
        this.dialogueManager.setEffectsHandler((effect) => this._handleDialogueEffect(effect));

        this.questManager = new QuestManager(this.eventBus, {
            getItemCount: (itemId) => this.inventory ? this.inventory.countItem(itemId) : 0,
            isGuardianDefeated: (guardianId) => {
                const g = this.worldMap ? this.worldMap.getGuardianById(guardianId) : null;
                return g ? g.isDefeated() : false;
            },
            addItem: (itemId) => { if (this.inventory) this.inventory.addItem(itemId); },
            recordDiscovery: (id, text) => { if (this.discoveryLog) this.discoveryLog.record('quest', id, text || ''); }
        });

        this.eventBus.on('daynight:phaseChanged', (data) => {
            this.worldEvents.onPhaseChange(data.phase);
        });

        this.eventBus.on('quest:started', () => this._refreshNpcMarkers());
        this.eventBus.on('quest:ready', () => this._refreshNpcMarkers());
        this.eventBus.on('quest:completed', () => this._refreshNpcMarkers());

        this.eventBus.on('dialogue:started', () => {
            this._pauseForDialogue();
        });

        this.eventBus.on('dialogue:ended', () => {
            this._resumeFromDialogue();
        });

        this._prevPlayerX = this.player.x;
        this._prevPlayerY = this.player.y;

        this._resizeCanvas();
        window.addEventListener('resize', () => this._resizeCanvas());

        this._initTitleFog();

        this.state = GAME_STATES.TITLE;
        await this.uiManager.showTitleScreen();

        console.log('Game initialized successfully');
    }

    async startNewGame() {
        this.player.x = 100 * TILE_SIZE;
        this.player.y = 100 * TILE_SIZE;
        this.player.heal();
        this.inventory = new Inventory(this.eventBus);
        this.discoveryLog = new DiscoveryLog(this.eventBus);
        if (this.questManager) this.questManager.reset();
        this.worldEvents.reset();
        this.dayNightCycle.setTime(0.4);
        this.worldMap = new WorldMap(generateMapData(), this.regionManager);
        this.uiManager.invalidateMinimapCache();
        this._refreshNpcMarkers();

        this.uiManager.closeActivePanel();
        this.uiManager.hideTitleScreen();

        const startRegion = this.regionManager.getRegionAt(this.player.x, this.player.y);
        if (startRegion) {
            this.player.currentRegionId = startRegion.id;
            this.discoveryLog.record('location', startRegion.id, startRegion.description);
        }

        this.uiManager.setDayNightCycle(this.dayNightCycle);
        this.uiManager.updateHUD(this.dayNightCycle);
        this._prevPlayerX = this.player.x;
        this._prevPlayerY = this.player.y;

        this.state = GAME_STATES.PLAYING;
        this.lastTime = performance.now();
        this.accumulator = 0;
        requestAnimationFrame((now) => this._loop(now));
    }

    async continueGame() {
        let savedData = null;
        try {
            savedData = await this.saveManager.load();
        } catch (e) {
            console.warn('Save data corrupted, starting fresh:', e);
            await this.saveManager.clearSave();
            this.uiManager.showEventToast('存档已损坏', '已重置世界，请重新开始探索。');
            this.startNewGame();
            return;
        }

        if (savedData) {
            try {
                this._restoreSave(savedData);
            } catch (e) {
                console.warn('Failed to restore save:', e);
                await this.saveManager.clearSave();
                this.uiManager.showEventToast('存档已损坏', '已重置世界，请重新开始探索。');
                this.startNewGame();
                return;
            }
        }

        this.uiManager.closeActivePanel();
        this.uiManager.hideTitleScreen();
        this._refreshNpcMarkers();

        this.uiManager.setDayNightCycle(this.dayNightCycle);
        if (this.dayNightCycle) {
            const speed = this.uiManager.getSettings().dayNightSpeed;
            this.dayNightCycle.setSpeedMultiplier(speed);
        }
        this.uiManager.updateHUD(this.dayNightCycle);
        this._prevPlayerX = this.player.x;
        this._prevPlayerY = this.player.y;

        this.state = GAME_STATES.PLAYING;
        this.lastTime = performance.now();
        this.accumulator = 0;
        requestAnimationFrame((now) => this._loop(now));
    }

    returnToTitle() {
        this.state = GAME_STATES.TITLE;
        this.uiManager.closeActivePanel();
        this.uiManager.hideAll();
        this.uiManager.showTitleScreen();
    }

    async resetWorld() {
        await this.saveManager.clearSave();
        this.player.x = 100 * TILE_SIZE;
        this.player.y = 100 * TILE_SIZE;
        this.inventory = new Inventory(this.eventBus);
        this.discoveryLog = new DiscoveryLog(this.eventBus);
        if (this.questManager) this.questManager.reset();
        this.worldEvents.reset();
        this.dayNightCycle.setTime(0.4);
        this.worldMap = new WorldMap(generateMapData(), this.regionManager);
        this.uiManager.invalidateMinimapCache();
        this.uiManager.closeActivePanel();
        this.returnToTitle();
    }

    start() {
        this.state = GAME_STATES.PLAYING;
        this.lastTime = performance.now();
        this.accumulator = 0;
        requestAnimationFrame((now) => this._loop(now));
    }

    pause() {
        if (this.state !== GAME_STATES.PLAYING) return;
        this.state = GAME_STATES.PAUSED;
        this.uiManager.showPauseMenu();
    }

    resume() {
        if (this.state !== GAME_STATES.PAUSED) return;
        this.uiManager.closeActivePanel();
        this.state = GAME_STATES.PLAYING;
        this.lastTime = performance.now();
        this.accumulator = 0;
        requestAnimationFrame((now) => this._loop(now));
    }

    _pauseForDialogue() {
        if (this.state !== GAME_STATES.PLAYING) return;
        this.state = GAME_STATES.PAUSED;
    }

    _resumeFromDialogue() {
        if (this.state !== GAME_STATES.PAUSED) return;
        this.state = GAME_STATES.PLAYING;
        this.input.syncState();
        this.lastTime = performance.now();
        this.accumulator = 0;
        requestAnimationFrame((now) => this._loop(now));
    }

    _loop(now) {
        if (this.state === GAME_STATES.TITLE) {
            this._renderTitleFog();
            requestAnimationFrame((t) => this._loop(t));
            return;
        }

        if (this.state !== GAME_STATES.PLAYING) {
            return;
        }

        const frameDt = (now - this.lastTime) / 1000;
        this.lastTime = now;
        this.accumulator += frameDt;

        let updates = 0;
        while (this.accumulator >= FIXED_DT && updates < MAX_FRAME_SKIP) {
            this._fixedUpdate(FIXED_DT);
            this.accumulator -= FIXED_DT;
            updates++;
        }

        this._render();

        this._updateFPS(frameDt);
        this._tryAutoSave();
        requestAnimationFrame((now) => this._loop(now));
    }

    _fixedUpdate(dt) {
        this.input.update();

        this._handleGlobalInput();

        if (this.state !== GAME_STATES.PLAYING) return;

        this.dayNightCycle.update(dt);

        const prevX = this.player.x;
        const prevY = this.player.y;
        this.player.update(dt, this.input, this.worldMap);

        const newPos = { x: this.player.x, y: this.player.y };
        const transition = this.regionManager.detectTransition(
            { x: prevX, y: prevY },
            newPos
        );
        if (transition) {
            this.player.currentRegionId = transition.id;
            this.discoveryLog.record('location', transition.id, transition.description);
            this.eventBus.emit('region:entered', { region: transition });
            this.worldEvents.onRegionEnter(transition.id);
        }

        this._updateGuardians(dt);
        this._handleInteraction();

        const currentRegion = this.player.currentRegionId
            ? this.regionManager.getRegion(this.player.currentRegionId)
            : null;
        this.visualEffects.update(dt, this.player, currentRegion ? currentRegion.terrainType : 'default');

        this.camera.update(this.player.getPosition(), dt);
    }

    _handleGlobalInput() {
        if (this.input.isKeyPressed('escape')) {
            this._handleESC();
            return;
        }

        if (this.state === GAME_STATES.PAUSED && this.uiManager.getActivePanel() === 'pause') {
            if (this.input.isKeyPressed('arrowup') || this.input.isKeyPressed('w')) {
                this.uiManager.handleMenuNavigation('up');
            }
            if (this.input.isKeyPressed('arrowdown') || this.input.isKeyPressed('s')) {
                this.uiManager.handleMenuNavigation('down');
            }
            if (this.input.isKeyPressed('enter')) {
                this.uiManager.handleMenuConfirm();
            }
            return;
        }

        if (this.state === GAME_STATES.PLAYING) {
            if (this.input.isKeyPressed('m')) {
                this.uiManager.toggleMapOverview(
                    this.regionManager,
                    this.discoveryLog,
                    this.player.x,
                    this.player.y
                );
                if (this.uiManager.isPanelOpen()) {
                    this.state = GAME_STATES.PAUSED;
                }
            }
        }
    }

    _handleESC() {
        const activePanel = this.uiManager.getActivePanel();

        if (activePanel === 'inventory' || activePanel === 'map' || activePanel === 'settings') {
            this.uiManager.closeActivePanel();
            this.uiManager.showPauseMenu();
            return;
        }

        if (this.state === GAME_STATES.PLAYING) {
            this.pause();
        } else if (this.state === GAME_STATES.PAUSED) {
            this.resume();
        }
    }

    _handleInteraction() {
        const facingRect = this.player.getFacingOffset();
        const playerAABB = this.player.getAABB();

        const nearbyGuardians = this.worldMap.getGuardiansNear(playerAABB);
        let activeGuardian = null;
        for (const g of nearbyGuardians) {
            const gAABB = g.getAABB();
            if (aabbOverlap(facingRect, gAABB)) {
                activeGuardian = g;
                break;
            }
        }

        if (activeGuardian) {
            this.uiManager.showInteractionPrompt(`挑战${activeGuardian.name} [E]`);

            if (this.input.isKeyPressed('e') || this.input.isMouseClicked()) {
                const defeated = activeGuardian.takeDamage(1);
                if (defeated) {
                    this.eventBus.emit('world:stateChanged', {
                        type: 'guardian_defeated',
                        id: activeGuardian.id,
                        name: activeGuardian.name
                    });
                    this.uiManager.showEventToast(
                        `${activeGuardian.name}已被击败`,
                        activeGuardian.flavorText || '通路已清除。'
                    );
                }
            }
            return;
        }

        const nearbyNpcs = this.worldMap.getNpcsInRect(facingRect);
        let activeNpc = null;
        let nearestNpcDist = Infinity;
        const ncx = this.player.x + this.player.width / 2;
        const ncy = this.player.y + this.player.height / 2;
        for (const npc of nearbyNpcs) {
            const b = npc.getBounds();
            const dist = Math.sqrt((ncx - (b.x + b.w / 2)) ** 2 + (ncy - (b.y + b.h / 2)) ** 2);
            if (dist < nearestNpcDist) {
                nearestNpcDist = dist;
                activeNpc = npc;
            }
        }

        if (activeNpc) {
            this.uiManager.showInteractionPrompt(activeNpc.getPrompt());
            if (this.input.isKeyPressed('e') || this.input.isMouseClicked()) {
                this._startNpcDialogue(activeNpc);
            }
            return;
        }

        const nearby = this.worldMap.getInteractablesInRect(facingRect);

        let nearest = null;
        let nearestDist = Infinity;
        const pcx = this.player.x + this.player.width / 2;
        const pcy = this.player.y + this.player.height / 2;

        for (const obj of nearby) {
            const b = obj.getBounds();
            const ocx = b.x + b.w / 2;
            const ocy = b.y + b.h / 2;
            const dist = Math.sqrt((pcx - ocx) ** 2 + (pcy - ocy) ** 2);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = obj;
            }
        }

        if (nearest && nearest.getPrompt()) {
            this.uiManager.showInteractionPrompt(nearest.getPrompt());

            if (this.input.isKeyPressed('e') || this.input.isMouseClicked()) {
                if (nearest.interact(this.player, this.inventory, this.discoveryLog)) {
                    const itemDef = getItemDef(nearest.itemId);
                    if (itemDef && itemDef.isEasterEgg) {
                        this.discoveryLog.record('easter_egg', nearest.id, itemDef.description);
                    }
                }
            }
        } else {
            this.uiManager.hideInteractionPrompt();
        }
    }

    _startNpcDialogue(npc) {
        if (this.dialogueManager.isActive()) return;
        this.dialogueManager.start(npc.dialogueTreeId, this._buildDialogueContext());
    }

    _buildDialogueContext() {
        return {
            getItemCount: (itemId) => this.inventory ? this.inventory.countItem(itemId) : 0,
            getQuestState: (questId) => this.questManager ? this.questManager.getState(questId) : undefined,
            hasDiscovered: (id) => this.discoveryLog ? this.discoveryLog.hasRecorded(id) : false,
            getFlag: (flag) => this.questManager ? this.questManager.getFlag(flag) : false
        };
    }

    _handleDialogueEffect(effect) {
        if (!effect) return;
        switch (effect.type) {
            case 'addItem':
                if (this.inventory && effect.itemId) this.inventory.addItem(effect.itemId);
                break;
            case 'recordDiscovery':
                if (this.discoveryLog && effect.id) {
                    this.discoveryLog.record('quest', effect.id, effect.text || '');
                }
                break;
            case 'startQuest':
                if (this.questManager && effect.questId) this.questManager.startQuest(effect.questId);
                break;
            case 'completeQuest':
                if (this.questManager && effect.questId) this.questManager.completeQuest(effect.questId);
                break;
            case 'setFlag':
                if (this.questManager && effect.flag) this.questManager.setFlag(effect.flag);
                break;
        }
    }

    _refreshNpcMarkers() {
        if (!this.worldMap || !this.questManager) return;
        for (const npc of this.worldMap.getAllNpcs()) {
            npc.setMarkerState(this.questManager.getNpcMarkerState(npc.id));
        }
    }

    _updateGuardians(dt) {
        const playerAABB = this.player.getAABB();
        const guardians = this.worldMap.getAllGuardians();

        for (const g of guardians) {
            const attackResult = g.update(dt, playerAABB);
            if (attackResult) {
                this.player.takeDamage(attackResult.damage);
                this.eventBus.emit('player:damaged', { hp: this.player.hp, maxHp: this.player.maxHp });

                if (this.player.isDead()) {
                    this._respawnPlayer();
                }
            }
        }
    }

    _respawnPlayer() {
        this.player.x = 100 * TILE_SIZE;
        this.player.y = 100 * TILE_SIZE;
        this.player.heal();
        this.eventBus.emit('player:respawned', {});
        this.uiManager.showEventToast('你倒下了...', '你在旅人营地醒来，身上的伤痛已经痊愈。');
    }

    _render() {
        this.renderer.render(this.camera, this.worldMap, this.player, this.dayNightCycle, this.visualEffects);

        this.uiManager.renderMinimap(
            this.regionManager,
            this.discoveryLog,
            this.player.x,
            this.player.y
        );
    }

    _resizeCanvas() {
        const container = document.getElementById('game-container');
        const containerW = container.clientWidth;
        const containerH = container.clientHeight;

        const scaleX = containerW / CANVAS_W;
        const scaleY = containerH / CANVAS_H;
        const scale = Math.min(scaleX, scaleY);

        this.canvas.width = CANVAS_W;
        this.canvas.height = CANVAS_H;
        this.canvas.style.width = (CANVAS_W * scale) + 'px';
        this.canvas.style.height = (CANVAS_H * scale) + 'px';
    }

    _updateFPS(frameDt) {
        this.frameCount++;
        this.fpsTimer += frameDt;
        if (this.fpsTimer >= 1.0) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = 0;
            this.uiManager.updateFPS(this.fps);
        }
    }

    _buildSaveData() {
        return {
            version: 1,
            savedAt: Date.now(),
            player: this.player.exportState(),
            inventory: this.inventory.export(),
            discoveryLog: this.discoveryLog.export(),
            worldStates: this.worldMap.exportStates(),
            dayNight: this.dayNightCycle.export(),
            worldEvents: this.worldEvents.export(),
            quests: this.questManager ? this.questManager.export() : null,
            settings: this.uiManager.getSettings()
        };
    }

    _restoreSave(data) {
        if (!data || data.version !== 1) return;

        if (data.player) {
            this.player.importState(data.player);
        }
        if (data.inventory) {
            this.inventory.import(data.inventory);
        }
        if (data.discoveryLog) {
            this.discoveryLog.import(data.discoveryLog);
        }
        if (data.worldStates) {
            this.worldMap.importStates(data.worldStates);
        }
        if (data.dayNight) {
            this.dayNightCycle.import(data.dayNight);
        }
        if (data.worldEvents) {
            this.worldEvents.import(data.worldEvents);
        }
        if (data.quests && this.questManager) {
            this.questManager.import(data.quests);
        }
        if (data.settings) {
            this.uiManager.importSettings(data.settings);
        }
    }

    async _tryAutoSave() {
        if (!this.saveManager) return;
        const playerMoved = this.player.x !== this._prevPlayerX || this.player.y !== this._prevPlayerY;
        if (this.saveManager.autoSaveCheck(Date.now(), playerMoved)) {
            await this.saveManager.save(this._buildSaveData());
        }
        this._prevPlayerX = this.player.x;
        this._prevPlayerY = this.player.y;
    }

    _initTitleFog() {
        this._titleFogParticles = [];
        for (let i = 0; i < 20; i++) {
            this._titleFogParticles.push({
                x: Math.random() * CANVAS_W,
                y: Math.random() * CANVAS_H,
                r: 30 + Math.random() * 60,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 8,
                alpha: 0.03 + Math.random() * 0.06
            });
        }
    }

    _renderTitleFog() {
        this.ctx.fillStyle = '#f4e8c1';
        this.ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        for (const p of this._titleFogParticles) {
            p.x += p.vx * FIXED_DT;
            p.y += p.vy * FIXED_DT;

            if (p.x < -p.r) p.x = CANVAS_W + p.r;
            if (p.x > CANVAS_W + p.r) p.x = -p.r;
            if (p.y < -p.r) p.y = CANVAS_H + p.r;
            if (p.y > CANVAS_H + p.r) p.y = -p.r;

            this.ctx.fillStyle = `rgba(200, 190, 170, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}
