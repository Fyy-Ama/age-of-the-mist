// 迷雾纪元 - 输入管理器

class InputManager {
    constructor() {
        this._keysDown = new Set();
        this._keysPressed = new Set();
        this._keysPrevious = new Set();
        
        this._mouseX = 0;
        this._mouseY = 0;
        this._mouseClicked = false;
        this._mouseDown = false;

        this._bindEvents();
    }

    _bindEvents() {
        window.addEventListener('keydown', (e) => {
            this._keysDown.add(e.key.toLowerCase());
        });

        window.addEventListener('keyup', (e) => {
            this._keysDown.delete(e.key.toLowerCase());
        });

        window.addEventListener('mousemove', (e) => {
            const canvas = document.getElementById('game-canvas');
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this._mouseX = (e.clientX - rect.left) * scaleX;
            this._mouseY = (e.clientY - rect.top) * scaleY;
        });

        window.addEventListener('mousedown', (e) => {
            this._mouseDown = true;
            this._mouseClicked = true;
        });

        window.addEventListener('mouseup', (e) => {
            this._mouseDown = false;
        });
    }

    update() {
        this._keysPressed.clear();
        for (const key of this._keysDown) {
            if (!this._keysPrevious.has(key)) {
                this._keysPressed.add(key);
            }
        }
        this._keysPrevious = new Set(this._keysDown);
        this._mouseClicked = false;
    }

    isKeyDown(key) {
        return this._keysDown.has(key.toLowerCase());
    }

    isKeyPressed(key) {
        return this._keysPressed.has(key.toLowerCase());
    }

    getMouseWorldPos(camera) {
        return camera.screenToWorld(this._mouseX, this._mouseY);
    }

    isMouseClicked() {
        return this._mouseClicked;
    }

    isMouseDown() {
        return this._mouseDown;
    }
}
