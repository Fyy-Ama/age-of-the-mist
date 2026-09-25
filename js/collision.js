// 迷雾纪元 - 碰撞系统

class Collision {
    static testAABB(a, b) {
        return a.x < b.x + b.w &&
               a.x + a.w > b.x &&
               a.y < b.y + b.h &&
               a.y + a.h > b.y;
    }

    static resolveMovement(entity, obstacles, dx, dy) {
        let newX = entity.x + dx;
        let testRectX = { x: newX, y: entity.y, w: entity.w, h: entity.h };
        let blockedX = false;
        
        for (let i = 0; i < obstacles.length; i++) {
            if (Collision.testAABB(testRectX, obstacles[i])) {
                blockedX = true;
                break;
            }
        }
        
        if (!blockedX) {
            entity.x = newX;
        }

        let newY = entity.y + dy;
        let testRectY = { x: entity.x, y: newY, w: entity.w, h: entity.h };
        let blockedY = false;
        
        for (let i = 0; i < obstacles.length; i++) {
            if (Collision.testAABB(testRectY, obstacles[i])) {
                blockedY = true;
                break;
            }
        }
        
        if (!blockedY) {
            entity.y = newY;
        }
    }

    static pointInAABB(px, py, rect) {
        return px >= rect.x &&
               px <= rect.x + rect.w &&
               py >= rect.y &&
               py <= rect.y + rect.h;
    }
}
