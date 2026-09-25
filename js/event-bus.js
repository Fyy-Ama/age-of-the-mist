// 迷雾纪元 - 事件总线

class EventBus {
    constructor() {
        this._listeners = new Map();
    }

    on(event, callback) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        this._listeners.get(event).add(callback);
    }

    off(event, callback) {
        if (this._listeners.has(event)) {
            this._listeners.get(event).delete(callback);
        }
    }

    emit(event, data) {
        if (this._listeners.has(event)) {
            for (const callback of this._listeners.get(event)) {
                callback(data);
            }
        }
    }
}
