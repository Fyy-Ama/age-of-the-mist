// 迷雾纪元 - 工具函数

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function aabbOverlap(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
}

function pointInAABB(px, py, rect) {
    return px >= rect.x &&
           px <= rect.x + rect.w &&
           py >= rect.y &&
           py <= rect.y + rect.h;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

function smoothstep(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
}
