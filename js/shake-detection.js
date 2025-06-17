class ShakeDetector {
    constructor(game) {
        this.game = game;
        this.lastX = 0;
        this.lastY = 0;
        this.lastZ = 0;
        this.shakeThreshold = 15;
        this.lastUpdate = 0;
        this.isShaking = false;
        this.shakeTimeout = null;
        this.mouseMoveCount = 0;
        this.lastMouseMove = 0;
        this.mouseShakeThreshold = 10;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Mobile device motion
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', (e) => this.handleDeviceMotion(e));
        }

        // Desktop mouse movement
        if (!window.DeviceMotionEvent) {
            document.addEventListener('mousemove', (e) => this.handleMouseMovement(e));
        }

        // Touch movement for mobile
        document.addEventListener('touchmove', (e) => this.handleTouchMovement(e));
    }

    handleDeviceMotion(e) {
        if (!e.accelerationIncludingGravity) return;

        const current = e.accelerationIncludingGravity;
        const currentTime = new Date().getTime();

        if ((currentTime - this.lastUpdate) > 100) {
            const diffTime = currentTime - this.lastUpdate;
            this.lastUpdate = currentTime;

            const x = current.x;
            const y = current.y;
            const z = current.z;

            const speed = Math.abs(x + y + z - this.lastX - this.lastY - this.lastZ) / diffTime * 10000;

            if (speed > this.shakeThreshold) {
                this.handleShake(speed);
            }

            this.lastX = x;
            this.lastY = y;
            this.lastZ = z;
        }
    }

    handleMouseMovement(e) {
        const currentTime = new Date().getTime();
        
        if (currentTime - this.lastMouseMove > 100) {
            this.mouseMoveCount = 0;
        }

        this.mouseMoveCount++;
        this.lastMouseMove = currentTime;

        if (this.mouseMoveCount > this.mouseShakeThreshold) {
            this.handleShake(this.mouseMoveCount * 2);
            this.mouseMoveCount = 0;
        }
    }

    handleTouchMovement(e) {
        const currentTime = new Date().getTime();
        
        if (currentTime - this.lastMouseMove > 100) {
            this.mouseMoveCount = 0;
        }

        this.mouseMoveCount++;
        this.lastMouseMove = currentTime;

        if (this.mouseMoveCount > this.mouseShakeThreshold) {
            this.handleShake(this.mouseMoveCount * 2);
            this.mouseMoveCount = 0;
        }
    }

    handleShake(intensity) {
        if (!this.isShaking) {
            this.isShaking = true;
            this.game.startShakePhase();
        }

        this.game.updateShakeIntensity(intensity);

        // Vibrate on mobile devices if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        // Clear any existing timeout
        if (this.shakeTimeout) {
            clearTimeout(this.shakeTimeout);
        }

        // Set a timeout to reset the shaking state
        this.shakeTimeout = setTimeout(() => {
            this.isShaking = false;
        }, 1000);
    }

    reset() {
        this.isShaking = false;
        this.mouseMoveCount = 0;
        this.lastMouseMove = 0;
        if (this.shakeTimeout) {
            clearTimeout(this.shakeTimeout);
        }
    }
}

// Initialize the shake detector when the game is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.game) {
        window.shakeDetector = new ShakeDetector(window.game);
    }
}); 