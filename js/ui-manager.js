// 迷雾纪元 - UI管理器

class UIManager {
    constructor(eventBus) {
        this._eventBus = eventBus;
        this._regionPopupTimer = null;
        this._selectedItemIndex = 0;
        this._dayNightCycle = null;
        this._eventToastTimer = null;
        this._activePanel = null;
        this._menuSelectedIndex = 0;
        this._inventory = null;
        this._discoveryLog = null;
        this._settings = { showFPS: true, controlsHint: true, dayNightSpeed: 1 };
        this._fps = 0;
        this._gameRef = null;

        this._bindEvents();
    }

    setGameRef(game) {
        this._gameRef = game;
    }

    setDayNightCycle(dayNightCycle) {
        this._dayNightCycle = dayNightCycle;
    }

    getActivePanel() {
        return this._activePanel;
    }

    isPanelOpen() {
        return this._activePanel !== null;
    }

    getSettings() {
        return this._settings;
    }

    importSettings(data) {
        if (data) {
            if (data.showFPS !== undefined) this._settings.showFPS = data.showFPS;
            if (data.controlsHint !== undefined) this._settings.controlsHint = data.controlsHint;
            if (data.dayNightSpeed !== undefined) this._settings.dayNightSpeed = data.dayNightSpeed;
        }
    }

    _bindEvents() {
        this._eventBus.on('item:collected', () => {
            this.updateHUD(this._dayNightCycle);
        });

        this._eventBus.on('discovery:recorded', () => {
            this.updateHUD(this._dayNightCycle);
        });

        this._eventBus.on('region:entered', (data) => {
            this.showRegionPopup(data.region.name);
        });

        this._eventBus.on('world:event_triggered', (data) => {
            this.showEventToast(data.name, data.description);
        });

        this._eventBus.on('daynight:phaseChanged', () => {
            this.updateHUD(this._dayNightCycle);
        });

        this._eventBus.on('player:damaged', (data) => {
            this.updateHP(data.hp, data.maxHp);
        });

        this._eventBus.on('player:respawned', () => {
            this.updateHP(PLAYER_MAX_HP, PLAYER_MAX_HP);
        });
    }

    // ===== Title Screen =====

    async showTitleScreen() {
        let title = document.getElementById('title-screen');
        if (!title) {
            title = this._createTitleScreen();
        }
        title.style.display = 'flex';

        const gameContainer = document.getElementById('game-container');
        gameContainer.classList.add('title-mode');

        const continueBtn = document.getElementById('title-continue');
        if (continueBtn) {
            const saveManager = this._gameRef ? this._gameRef.saveManager : null;
            if (saveManager) {
                const hasSave = await saveManager.hasSave();
                continueBtn.style.display = hasSave ? 'block' : 'none';
            } else {
                continueBtn.style.display = 'none';
            }
        }

        const gameUI = document.getElementById('game-ui');
        if (gameUI) gameUI.style.display = 'none';
    }

    hideTitleScreen() {
        const title = document.getElementById('title-screen');
        if (title) title.style.display = 'none';

        const gameContainer = document.getElementById('game-container');
        gameContainer.classList.remove('title-mode');

        const gameUI = document.getElementById('game-ui');
        if (gameUI) gameUI.style.display = 'block';
    }

    _createTitleScreen() {
        const title = document.createElement('div');
        title.id = 'title-screen';
        title.className = 'title-screen';
        title.innerHTML = `
            <div class="title-content">
                <h1 class="title-main">\u25C6 \u8FF7\u96FE\u7EAA\u5143 \u25C6</h1>
                <h2 class="title-sub">Age of the Mist</h2>
                <div class="title-buttons">
                    <button id="title-start" class="btn title-btn">\u25B6 \u5F00\u59CB\u63A2\u7D22</button>
                    <button id="title-continue" class="btn title-btn" style="display:none;">\u21BB \u7EE7\u7EED\u65C5\u7A0B</button>
                </div>
                <div class="title-footer">
                    <p>WASD\u79FB\u52A8 \u00B7 E\u4EA4\u4E92 \u00B7 ESC\u83DC\u5355</p>
                    <p>v0.1 \u00B7 \u7EAF\u524D\u7AEF\u5355\u673A</p>
                </div>
            </div>
        `;
        document.getElementById('game-container').appendChild(title);

        title.querySelector('#title-start').addEventListener('click', () => {
            if (this._gameRef) this._gameRef.startNewGame();
        });
        title.querySelector('#title-continue').addEventListener('click', () => {
            if (this._gameRef) this._gameRef.continueGame();
        });

        return title;
    }

    // ===== Pause Menu =====

    showPauseMenu() {
        if (this._activePanel !== null) {
            this.closeActivePanel();
        }
        this._activePanel = 'pause';
        this._menuSelectedIndex = 0;

        let overlay = document.getElementById('pause-overlay');
        if (!overlay) {
            overlay = this._createPauseMenu();
        }
        overlay.style.display = 'flex';
        this._updateMenuSelection();
    }

    _createPauseMenu() {
        const overlay = document.createElement('div');
        overlay.id = 'pause-overlay';
        overlay.className = 'pause-overlay';

        const menu = document.createElement('div');
        menu.className = 'pause-menu parchment-panel';
        menu.innerHTML = `
            <h2>\u23F8 \u65C5\u9014\u6682\u6B47</h2>
            <div class="menu-items">
                <div class="menu-item" data-action="resume">\u25B6 \u7EE7\u7EED\u63A2\u7D22</div>
                <div class="menu-item" data-action="inventory">\uD83C\uDF92 \u6253\u5F00\u884C\u56CA</div>
                <div class="menu-item" data-action="map">\uD83D\uDDFA\uFE0F \u67E5\u770B\u5730\u56FE</div>
                <div class="menu-item" data-action="settings">\u2699 \u8BBE\u7F6E</div>
                <div class="menu-item" data-action="title">\uD83D\uDEAA \u8FD4\u56DE\u6807\u9898</div>
            </div>
        `;

        const items = menu.querySelectorAll('.menu-item');
        items.forEach((item) => {
            item.addEventListener('click', () => {
                this._executeMenuAction(item.dataset.action);
            });
            item.addEventListener('mouseenter', () => {
                const idx = Array.from(items).indexOf(item);
                this._menuSelectedIndex = idx;
                this._updateMenuSelection();
            });
        });

        overlay.appendChild(menu);
        document.getElementById('ui-layer').appendChild(overlay);
        return overlay;
    }

    _updateMenuSelection() {
        const items = document.querySelectorAll('.pause-menu .menu-item');
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === this._menuSelectedIndex);
        });
    }

    handleMenuNavigation(direction) {
        const items = document.querySelectorAll('.pause-menu .menu-item');
        if (items.length === 0) return;

        if (direction === 'up') {
            this._menuSelectedIndex = (this._menuSelectedIndex - 1 + items.length) % items.length;
        } else if (direction === 'down') {
            this._menuSelectedIndex = (this._menuSelectedIndex + 1) % items.length;
        }
        this._updateMenuSelection();
    }

    handleMenuConfirm() {
        const items = document.querySelectorAll('.pause-menu .menu-item');
        if (this._menuSelectedIndex < items.length) {
            const action = items[this._menuSelectedIndex].dataset.action;
            this._executeMenuAction(action);
        }
    }

    _executeMenuAction(action) {
        switch (action) {
            case 'resume':
                this.closeActivePanel();
                if (this._gameRef) this._gameRef.resume();
                break;
            case 'inventory':
                this._showOverlay();
                this.toggleInventory(this._gameRef.inventory, this._gameRef.discoveryLog);
                break;
            case 'map':
                this._showOverlay();
                this.showMapOverview();
                break;
            case 'settings':
                this._showOverlay();
                this.showSettings();
                break;
            case 'title':
                this.closeActivePanel();
                if (this._gameRef) this._gameRef.returnToTitle();
                break;
        }
    }

    _showOverlay() {
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) pauseOverlay.style.display = 'none';
    }

    _hideOverlay() {
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) pauseOverlay.style.display = 'flex';
    }

    closeActivePanel() {
        const prev = this._activePanel;
        this._activePanel = null;

        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) pauseOverlay.style.display = 'none';

        const inventoryPanel = document.getElementById('inventory-panel');
        if (inventoryPanel) inventoryPanel.style.display = 'none';

        const mapPanel = document.getElementById('map-panel');
        if (mapPanel) mapPanel.style.display = 'none';

        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) settingsPanel.style.display = 'none';

        const mapOverlay = document.getElementById('map-overlay');
        if (mapOverlay) mapOverlay.style.display = 'none';

        const settingsOverlay = document.getElementById('settings-overlay');
        if (settingsOverlay) settingsOverlay.style.display = 'none';

        return prev;
    }

    // ===== Settings Panel =====

    showSettings() {
        let overlay = document.getElementById('settings-overlay');
        if (!overlay) {
            overlay = this._createSettingsPanel();
        }
        overlay.style.display = 'flex';
        this._updateSettingsUI();
    }

    _createSettingsPanel() {
        const overlay = document.createElement('div');
        overlay.id = 'settings-overlay';
        overlay.className = 'panel-overlay';

        const panel = document.createElement('div');
        panel.className = 'settings-panel parchment-panel';
        panel.innerHTML = `
            <h2>\u2699 \u8BBE\u7F6E</h2>
            <div class="settings-list">
                <div class="setting-row">
                    <label>\u663E\u793AFPS\u8BA1\u6570\u5668</label>
                    <button id="setting-fps" class="btn setting-toggle">\u2713</button>
                </div>
                <div class="setting-row">
                    <label>\u64CD\u4F5C\u63D0\u793A</label>
                    <button id="setting-hints" class="btn setting-toggle">\u2713</button>
                </div>
                <div class="setting-row">
                    <label>\u663C\u591C\u5FAA\u73AF\u901F\u5EA6</label>
                    <button id="setting-speed" class="btn setting-toggle">1x</button>
                </div>
            </div>
            <div class="settings-divider"></div>
            <button id="setting-reset" class="btn btn-danger">\uD83D\uDD04 \u91CD\u7F6E\u4E16\u754C</button>
            <p class="reset-hint">\u6E05\u9664\u6240\u6709\u8FDB\u5EA6\uFF0C\u91CD\u65B0\u5F00\u59CB</p>
            <button id="setting-back" class="btn">\u8FD4\u56DE</button>
        `;

        overlay.appendChild(panel);
        document.getElementById('ui-layer').appendChild(overlay);

        panel.querySelector('#setting-fps').addEventListener('click', () => {
            this._settings.showFPS = !this._settings.showFPS;
            this._updateSettingsUI();
            this._updateFPSDisplay();
            this._markSettingsDirty();
        });

        panel.querySelector('#setting-hints').addEventListener('click', () => {
            this._settings.controlsHint = !this._settings.controlsHint;
            this._updateSettingsUI();
            this._markSettingsDirty();
        });

        panel.querySelector('#setting-speed').addEventListener('click', () => {
            const speeds = [0.5, 1, 2];
            const idx = speeds.indexOf(this._settings.dayNightSpeed);
            this._settings.dayNightSpeed = speeds[(idx + 1) % speeds.length];
            if (this._dayNightCycle) {
                this._dayNightCycle.setSpeedMultiplier(this._settings.dayNightSpeed);
            }
            this._updateSettingsUI();
            this._markSettingsDirty();
        });

        panel.querySelector('#setting-reset').addEventListener('click', () => {
            this._showResetConfirm();
        });

        panel.querySelector('#setting-back').addEventListener('click', () => {
            this._activePanel = 'pause';
            const settingsOverlay = document.getElementById('settings-overlay');
            if (settingsOverlay) settingsOverlay.style.display = 'none';
            this._showOverlay();
            this.showPauseMenu();
        });

        return overlay;
    }

    _updateSettingsUI() {
        const fpsBtn = document.getElementById('setting-fps');
        if (fpsBtn) fpsBtn.textContent = this._settings.showFPS ? '\u2713' : '\u2717';

        const hintsBtn = document.getElementById('setting-hints');
        if (hintsBtn) hintsBtn.textContent = this._settings.controlsHint ? '\u2713' : '\u2717';

        const speedBtn = document.getElementById('setting-speed');
        if (speedBtn) speedBtn.textContent = this._settings.dayNightSpeed + 'x';
    }

    _updateFPSDisplay() {
        const fpsEl = document.getElementById('fps-counter');
        if (fpsEl) {
            fpsEl.style.display = this._settings.showFPS ? 'block' : 'none';
        }
    }

    _markSettingsDirty() {
        if (this._gameRef && this._gameRef.saveManager) {
            this._gameRef.saveManager.markDirty();
        }
    }

    _showResetConfirm() {
        let confirm = document.getElementById('reset-confirm');
        if (confirm) confirm.remove();

        confirm = document.createElement('div');
        confirm.id = 'reset-confirm';
        confirm.className = 'confirm-dialog';
        confirm.innerHTML = `
            <div class="confirm-content parchment-panel">
                <p>\u786E\u5B9A\u8981\u9057\u5FD8\u4E00\u5207\u5417\uFF1F</p>
                <p class="confirm-warn">\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002</p>
                <div class="confirm-buttons">
                    <button id="confirm-yes" class="btn btn-danger">\u786E\u8BA4\u91CD\u7F6E</button>
                    <button id="confirm-no" class="btn">\u53D6\u6D88</button>
                </div>
            </div>
        `;
        document.getElementById('ui-layer').appendChild(confirm);

        confirm.querySelector('#confirm-yes').addEventListener('click', () => {
            confirm.remove();
            if (this._gameRef) this._gameRef.resetWorld();
        });

        confirm.querySelector('#confirm-no').addEventListener('click', () => {
            confirm.remove();
        });
    }

    // ===== Map Overview =====

    showMapOverview(regionManager, discoveryLog, playerX, playerY) {
        let overlay = document.getElementById('map-overlay');
        if (!overlay) {
            overlay = this._createMapOverview();
        }
        overlay.style.display = 'flex';
        this._renderMapContent(regionManager, discoveryLog, playerX, playerY);
    }

    _createMapOverview() {
        const overlay = document.createElement('div');
        overlay.id = 'map-overlay';
        overlay.className = 'panel-overlay';

        const panel = document.createElement('div');
        panel.className = 'map-panel parchment-panel';
        panel.innerHTML = `
            <h2>\uD83D\uDDFA\uFE0F \u5DF2\u77E5\u4E16\u754C</h2>
            <div id="map-content" class="map-content"></div>
            <div class="map-legend">
                <span>\u25CF \u5F53\u524D\u4F4D\u7F6E</span>
                <span>\u2605 \u5DF2\u53D1\u73B0</span>
                <span>\u2591 \u672A\u63A2\u7D22</span>
            </div>
            <button id="map-close" class="btn">\u5173\u95ED</button>
        `;

        overlay.appendChild(panel);
        document.getElementById('ui-layer').appendChild(overlay);

        panel.querySelector('#map-close').addEventListener('click', () => {
            this._activePanel = 'pause';
            overlay.style.display = 'none';
            this._showOverlay();
            this.showPauseMenu();
        });

        return overlay;
    }

    _renderMapContent(regionManager, discoveryLog, playerX, playerY) {
        const content = document.getElementById('map-content');
        if (!content || !regionManager) return;

        const allRegions = regionManager.getAllRegions();
        const visitedIds = discoveryLog ? discoveryLog.getLocationIds() : [];
        const discoveryEntries = discoveryLog ? discoveryLog.getEntries() : [];

        let html = '<div class="map-grid">';
        for (const region of allRegions) {
            const visited = visitedIds.includes(region.id);
            const cls = visited ? 'map-region visited' : 'map-region unvisited';
            const borderColor = region.palette ? region.palette.labelColor : '#888';

            html += `<div class="${cls}" style="border-color: ${borderColor}">`;
            if (visited) {
                html += `<div class="map-region-name">${region.name}</div>`;
                html += `<div class="map-region-area" style="background-color: ${region.palette ? region.palette.ground : '#ccc'}"></div>`;

                const regionDiscoveries = discoveryEntries.filter(e => {
                    const rb = region.bounds;
                    const ex = e.tileX !== undefined ? e.tileX : 0;
                    const ey = e.tileY !== undefined ? e.tileY : 0;
                    return ex >= rb.x && ex < rb.x + rb.w && ey >= rb.y && ey < rb.y + rb.h;
                });
                for (const disc of regionDiscoveries) {
                    html += `<span class="map-discovery-mark" title="${disc.text || disc.id}">\u2605</span>`;
                }
            } else {
                html += `<div class="map-region-name">???</div>`;
                html += `<div class="map-region-area unvisited-area"></div>`;
            }
            html += '</div>';
        }
        html += '</div>';

        content.innerHTML = html;
    }

    toggleMapOverview(regionManager, discoveryLog, playerX, playerY) {
        const overlay = document.getElementById('map-overlay');
        if (overlay && overlay.style.display !== 'none') {
            this._activePanel = null;
            overlay.style.display = 'none';
            return false;
        }

        this._activePanel = 'map';
        this.showMapOverview(regionManager, discoveryLog, playerX, playerY);
        return true;
    }

    // ===== Inventory =====

    toggleInventory(inventory, discoveryLog) {
        this._inventory = inventory;
        this._discoveryLog = discoveryLog;

        if (!inventory) {
            const panel = document.getElementById('inventory-panel');
            if (panel) panel.style.display = 'none';
            return false;
        }

        const isOpen = this._activePanel === 'inventory';

        let panel = document.getElementById('inventory-panel');
        if (!panel) {
            panel = this._createInventoryPanel();
        }

        if (!isOpen) {
            this._activePanel = 'inventory';
            panel.style.display = 'block';
            this._renderInventoryGrid();
        } else {
            this._activePanel = null;
            panel.style.display = 'none';
        }

        return !isOpen;
    }

    _createInventoryPanel() {
        const panel = document.createElement('div');
        panel.id = 'inventory-panel';
        panel.className = 'inventory-panel parchment-panel';
        panel.innerHTML = `
            <h2>\uD83C\uDF92 \u884C\u56CA</h2>
            <div id="inventory-grid" class="inventory-grid"></div>
            <div id="inventory-description" class="inventory-description"></div>
            <button id="inventory-close" class="btn">\u5173\u95ED</button>
        `;

        document.getElementById('ui-layer').appendChild(panel);

        panel.querySelector('#inventory-close').addEventListener('click', () => {
            this._activePanel = null;
            panel.style.display = 'none';
        });

        return panel;
    }

    _renderInventoryGrid() {
        const grid = document.getElementById('inventory-grid');
        if (!this._inventory) return;
        const items = this._inventory.getItems();

        grid.innerHTML = '';

        for (let i = 0; i < 16; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';

            if (i < items.length) {
                const item = items[i];
                const itemDef = this._inventory.getItemDef(item.id);
                slot.innerHTML = `
                    <div class="item-icon" style="background-color: ${itemDef.iconColor}"></div>
                    <div class="item-name">${itemDef.name}</div>
                `;
                slot.addEventListener('click', () => {
                    this._selectItem(i, items);
                });
            }

            grid.appendChild(slot);
        }

        if (items.length > 0) {
            this._selectItem(0, items);
        } else {
            const desc = document.getElementById('inventory-description');
            if (desc) desc.textContent = '\u80CC\u5305\u7A7A\u7A7A\u5982\u4E5F...';
        }
    }

    _selectItem(index, items) {
        this._selectedItemIndex = index;

        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach((slot, i) => {
            slot.classList.toggle('selected', i === index);
        });

        const item = items[index];
        const itemDef = this._inventory.getItemDef(item.id);
        const desc = document.getElementById('inventory-description');
        if (desc) {
            desc.innerHTML = `
                <h3>\u3010${itemDef.name}\u3011</h3>
                <p>${itemDef.description}</p>
            `;
        }
    }

    // ===== HUD =====

    updateHUD(dayNightCycle) {
        const quickbar = document.getElementById('quickbar');
        if (!quickbar) return;

        const inventoryCount = this._inventory ? this._inventory.getCount() : 0;
        const discoveryCount = this._discoveryLog ? this._discoveryLog.getEntries().length : 0;
        const phaseIcon = dayNightCycle ? dayNightCycle.getPhaseIcon() : '\u2600';

        quickbar.innerHTML = `
            <span>\uD83C\uDF92 ${inventoryCount}\u4EF6</span>
            <span>\uD83D\uDCCD ${discoveryCount}\u5904\u53D1\u73B0</span>
            <span>${phaseIcon} ${this._getTimePhase(dayNightCycle)}</span>
        `;

        const gameRef = this._gameRef;
        if (gameRef && gameRef.player) {
            this.updateHP(gameRef.player.hp, gameRef.player.maxHp);
        }
    }

    updateHP(hp, maxHp) {
        let bar = document.getElementById('hp-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'hp-bar';
            bar.className = 'hp-bar';
            bar.innerHTML = '<div class="hp-fill"></div><span class="hp-text"></span>';
            document.getElementById('ui-layer').appendChild(bar);
        }

        const fill = bar.querySelector('.hp-fill');
        const text = bar.querySelector('.hp-text');
        const pct = maxHp > 0 ? (hp / maxHp) * 100 : 0;
        fill.style.width = pct + '%';

        if (pct > 60) {
            fill.style.backgroundColor = '#5a5';
        } else if (pct > 30) {
            fill.style.backgroundColor = '#da5';
        } else {
            fill.style.backgroundColor = '#d55';
        }

        text.textContent = `\u2764 ${hp}/${maxHp}`;
    }

    updateFPS(fps) {
        this._fps = fps;
        let el = document.getElementById('fps-counter');
        if (!el) {
            el = document.createElement('div');
            el.id = 'fps-counter';
            el.className = 'fps-counter';
            document.getElementById('ui-layer').appendChild(el);
        }
        el.textContent = `FPS: ${fps}`;
        el.style.display = this._settings.showFPS ? 'block' : 'none';
    }

    _getTimePhase(dayNightCycle) {
        if (dayNightCycle) {
            const phase = dayNightCycle.getPhase();
            const phaseNames = {
                'night': '\u591C\u665A',
                'dawn': '\u9ECE\u660E',
                'day': '\u767D\u5929',
                'dusk': '\u9EC4\u660F'
            };
            return phaseNames[phase] || '\u672A\u77E5';
        }
        return '\u767D\u5929';
    }

    // ===== Region Popup =====

    showRegionPopup(name) {
        let popup = document.getElementById('region-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'region-popup';
            popup.className = 'region-popup';
            document.getElementById('ui-layer').appendChild(popup);
        }

        popup.textContent = name;
        popup.classList.remove('fade-out');
        popup.classList.add('fade-in');
        popup.style.display = 'block';

        if (this._regionPopupTimer) {
            clearTimeout(this._regionPopupTimer);
        }

        this._regionPopupTimer = setTimeout(() => {
            popup.classList.remove('fade-in');
            popup.classList.add('fade-out');
            setTimeout(() => {
                popup.style.display = 'none';
            }, 300);
        }, 3000);
    }

    // ===== Interaction Prompt =====

    showInteractionPrompt(text) {
        if (!this._settings.controlsHint) return;

        let prompt = document.getElementById('interaction-prompt');
        if (!prompt) {
            prompt = document.createElement('div');
            prompt.id = 'interaction-prompt';
            prompt.className = 'interaction-prompt';
            document.getElementById('ui-layer').appendChild(prompt);
        }

        prompt.textContent = text;
        prompt.style.display = 'block';
    }

    hideInteractionPrompt() {
        const prompt = document.getElementById('interaction-prompt');
        if (prompt) {
            prompt.style.display = 'none';
        }
    }

    // ===== Event Toast =====

    showEventToast(title, description) {
        let toast = document.getElementById('event-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'event-toast';
            toast.className = 'event-toast';
            document.getElementById('ui-layer').appendChild(toast);
        }

        toast.innerHTML = `<strong>${title}</strong><br><span>${description}</span>`;
        toast.classList.remove('slide-out-up', 'fade-out');
        toast.classList.add('slide-in-down');
        toast.style.display = 'block';

        if (this._eventToastTimer) {
            clearTimeout(this._eventToastTimer);
        }

        this._eventToastTimer = setTimeout(() => {
            toast.classList.remove('slide-in-down');
            toast.classList.add('slide-out-up');
            setTimeout(() => {
                toast.style.display = 'none';
            }, 400);
        }, 4000);
    }

    // ===== Minimap =====

    renderMinimap(regionManager, discoveryLog, playerX, playerY) {
        let canvas = document.getElementById('minimap-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'minimap-canvas';
            canvas.width = 120;
            canvas.height = 120;
            canvas.className = 'minimap';

            let wrapper = document.getElementById('minimap-wrapper');
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.id = 'minimap-wrapper';
                wrapper.className = 'minimap-wrapper';
                document.getElementById('ui-layer').appendChild(wrapper);
            }
            wrapper.appendChild(canvas);
            this._minimapCache = null;
            this._minimapDiscoveryCount = -1;
        }

        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const worldW = WORLD_COLS * TILE_SIZE;
        const worldH = WORLD_ROWS * TILE_SIZE;
        const scaleX = w / worldW;
        const scaleY = h / worldH;

        const currentDiscoveryCount = discoveryLog ? discoveryLog.getLocationIds().length : 0;
        if (!this._minimapCache || this._minimapDiscoveryCount !== currentDiscoveryCount) {
            this._minimapDiscoveryCount = currentDiscoveryCount;

            if (!this._minimapCache) {
                this._minimapCache = document.createElement('canvas');
                this._minimapCache.width = w;
                this._minimapCache.height = h;
            }
            const bgCtx = this._minimapCache.getContext('2d');
            bgCtx.clearRect(0, 0, w, h);
            bgCtx.fillStyle = 'rgba(244, 232, 193, 0.7)';
            bgCtx.fillRect(0, 0, w, h);

            const allRegions = regionManager.getAllRegions();
            const visitedIds = discoveryLog ? discoveryLog.getLocationIds() : [];

            for (const region of allRegions) {
                const b = region.bounds;
                const rx = b.x * TILE_SIZE * scaleX;
                const ry = b.y * TILE_SIZE * scaleY;
                const rw = b.w * TILE_SIZE * scaleX;
                const rh = b.h * TILE_SIZE * scaleY;

                if (visitedIds.includes(region.id)) {
                    bgCtx.fillStyle = region.palette ? region.palette.ground : '#ccc';
                    bgCtx.globalAlpha = 0.6;
                    bgCtx.fillRect(rx, ry, rw, rh);
                    bgCtx.globalAlpha = 1.0;
                    bgCtx.strokeStyle = region.palette ? region.palette.labelColor : '#888';
                    bgCtx.lineWidth = 1;
                    bgCtx.strokeRect(rx, ry, rw, rh);
                } else {
                    bgCtx.strokeStyle = '#aaa';
                    bgCtx.lineWidth = 1;
                    bgCtx.setLineDash([2, 2]);
                    bgCtx.strokeRect(rx, ry, rw, rh);
                    bgCtx.setLineDash([]);
                }
            }

            if (discoveryLog) {
                const entries = discoveryLog.getEntries();
                bgCtx.fillStyle = '#ffd700';
                for (const entry of entries) {
                    if (entry.tileX !== undefined && entry.tileY !== undefined) {
                        const ex = entry.tileX * TILE_SIZE * scaleX;
                        const ey = entry.tileY * TILE_SIZE * scaleY;
                        bgCtx.beginPath();
                        bgCtx.arc(ex, ey, 1.5, 0, Math.PI * 2);
                        bgCtx.fill();
                    }
                }
            }
        }

        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(this._minimapCache, 0, 0);

        const px = playerX * scaleX;
        const py = playerY * scaleY;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // ===== Hide All =====

    invalidateMinimapCache() {
        this._minimapDiscoveryCount = -1;
    }

    hideAll() {
        this.closeActivePanel();
        this.hideInteractionPrompt();
    }
}
