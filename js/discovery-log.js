// 迷雾纪元 - 发现记录

class DiscoveryLog {
    constructor(eventBus) {
        this._entries = [];
        this._eventBus = eventBus;
    }

    record(type, id, text) {
        if (this.hasRecorded(id)) {
            return false;
        }
        
        this._entries.push({
            type: type,
            id: id,
            text: text,
            discoveredAt: Date.now()
        });
        
        this._eventBus.emit('discovery:recorded', { type, id, text });
        return true;
    }

    hasRecorded(id) {
        return this._entries.some(entry => entry.id === id);
    }

    getEntries() {
        return [...this._entries];
    }

    getLocationIds() {
        return this._entries.filter(e => e.type === 'location').map(e => e.id);
    }

    getEasterEggIds() {
        return this._entries.filter(e => e.type === 'easter_egg').map(e => e.id);
    }

    export() {
        return this._entries.map(entry => ({ ...entry }));
    }

    import(entries) {
        this._entries = entries.map(entry => ({ ...entry }));
    }
}
