// 迷雾纪元 - 摄像机

class Camera {
    constructor(width, height, worldW, worldH) {
        this.width = width;
        this.height = height;
        this.worldWidth = worldW;
        this.worldHeight = worldH;
        this.x = 0;
        this.y = 0;
        this.lerpFactor = 0.08;
    }

    update(targetPos, dt) {
        const targetX = targetPos.x - this.width / 2;
        const targetY = targetPos.y - this.height / 2;

        this.x = lerp(this.x, targetX, this.lerpFactor);
        this.y = lerp(this.y, targetY, this.lerpFactor);

        const maxX = this.worldWidth - this.width;
        const maxY = this.worldHeight - this.height;
        this.x = clamp(this.x, 0, maxX);
        this.y = clamp(this.y, 0, maxY);
    }

    worldToScreen(wx, wy) {
        return {
            x: wx - this.x,
            y: wy - this.y
        };
    }

    screenToWorld(sx, sy) {
        return {
            x: sx + this.x,
            y: sy + this.y
        };
    }

    isVisible(aabb) {
        const viewport = this.getViewport();
        return aabbOverlap(aabb, viewport);
    }

    getViewport() {
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        };
    }
}
