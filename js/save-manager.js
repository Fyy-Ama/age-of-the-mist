// 迷雾纪元 - 存档管理器

const SAVE_DB_NAME = 'age_of_mist_save';
const SAVE_DB_VERSION = 1;
const SAVE_STORE = 'saves';
const SAVE_KEY = 'slot_0';
const SAVE_THROTTLE_MS = 5000;
const SAVE_POSITION_THROTTLE_MS = 30000;

class SaveManager {
    constructor(eventBus) {
        this._db = null;
        this._eventBus = eventBus;
        this._dirty = false;
        this._lastSaveTime = 0;
        this._lastPositionSaveTime = 0;
        this._useIndexedDB = true;
    }

    async init() {
        try {
            this._db = await this._openDB();
            this._useIndexedDB = true;
        } catch (e) {
            console.warn('IndexedDB unavailable, falling back to localStorage:', e);
            this._useIndexedDB = false;
        }

        this._bindEvents();
    }

    _openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(SAVE_DB_NAME, SAVE_DB_VERSION);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(SAVE_STORE)) {
                    db.createObjectStore(SAVE_STORE);
                }
            };
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    _bindEvents() {
        this._eventBus.on('item:collected', () => this.markDirty());
        this._eventBus.on('world:stateChanged', () => this.markDirty());
        this._eventBus.on('region:entered', () => this.markDirty());
        this._eventBus.on('daynight:phaseChanged', () => this.markDirty());
    }

    markDirty() {
        this._dirty = true;
    }

    autoSaveCheck(now, playerMoved) {
        if (!this._dirty) return false;

        const elapsed = now - this._lastSaveTime;
        if (playerMoved) {
            const posElapsed = now - this._lastPositionSaveTime;
            if (posElapsed < SAVE_POSITION_THROTTLE_MS) return false;
        } else if (elapsed < SAVE_THROTTLE_MS) {
            return false;
        }

        return true;
    }

    async save(data) {
        try {
            if (this._useIndexedDB) {
                await this._saveIndexedDB(data);
            } else {
                this._saveLocalStorage(data);
            }
            this._dirty = false;
            this._lastSaveTime = Date.now();
            this._lastPositionSaveTime = Date.now();
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    }

    async load() {
        try {
            if (this._useIndexedDB) {
                const data = await this._loadIndexedDB();
                if (data !== null) return data;
            }
            return this._loadLocalStorage();
        } catch (e) {
            console.error('Load failed:', e);
            return null;
        }
    }

    async hasSave() {
        try {
            if (this._useIndexedDB) {
                const data = await this._loadIndexedDB();
                if (data !== null) return true;
            }
            const raw = localStorage.getItem(SAVE_DB_NAME + '_' + SAVE_KEY);
            return raw !== null;
        } catch (e) {
            return false;
        }
    }

    async clearSave() {
        try {
            if (this._useIndexedDB) {
                await this._clearIndexedDB();
            }
            localStorage.removeItem(SAVE_DB_NAME + '_' + SAVE_KEY);
        } catch (e) {
            console.error('Clear save failed:', e);
        }
    }

    _saveIndexedDB(data) {
        return new Promise((resolve, reject) => {
            const tx = this._db.transaction(SAVE_STORE, 'readwrite');
            const store = tx.objectStore(SAVE_STORE);
            const request = store.put(data, SAVE_KEY);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }

    _loadIndexedDB() {
        return new Promise((resolve, reject) => {
            const tx = this._db.transaction(SAVE_STORE, 'readonly');
            const store = tx.objectStore(SAVE_STORE);
            const request = store.get(SAVE_KEY);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    _clearIndexedDB() {
        return new Promise((resolve, reject) => {
            const tx = this._db.transaction(SAVE_STORE, 'readwrite');
            const store = tx.objectStore(SAVE_STORE);
            const request = store.delete(SAVE_KEY);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }

    _saveLocalStorage(data) {
        const json = JSON.stringify(data);
        localStorage.setItem(SAVE_DB_NAME + '_' + SAVE_KEY, json);
    }

    _loadLocalStorage() {
        const raw = localStorage.getItem(SAVE_DB_NAME + '_' + SAVE_KEY);
        if (raw === null) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error('Failed to parse localStorage save:', e);
            return null;
        }
    }
}
