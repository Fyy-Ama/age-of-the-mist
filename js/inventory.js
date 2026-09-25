// 迷雾纪元 - 背包

class Inventory {
    constructor(eventBus) {
        this._items = [];
        this._eventBus = eventBus;
    }

    addItem(itemId) {
        const itemDef = getItemDef(itemId);
        if (!itemDef) {
            return false;
        }
        
        this._items.push({
            id: itemId,
            collectedAt: Date.now()
        });
        
        this._eventBus.emit('item:collected', { itemId });
        return true;
    }

    hasItem(itemId) {
        return this._items.some(item => item.id === itemId);
    }

    getItems() {
        return [...this._items].sort((a, b) => b.collectedAt - a.collectedAt);
    }

    getItemDef(itemId) {
        return getItemDef(itemId);
    }

    getCount() {
        return this._items.length;
    }

    export() {
        return this._items.map(item => ({ ...item }));
    }

    import(items) {
        this._items = items.map(item => ({ ...item }));
    }
}
