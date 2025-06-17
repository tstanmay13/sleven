class DicePhysics {
    constructor() {
        this.gravity = 9.8;
        this.friction = 0.8;
        this.bounce = 0.6;
        this.airResistance = 0.02;
        this.rotationSpeed = 0.1;
        this.dice = [];
        this.isAnimating = false;
        this.animationFrame = null;
    }

    initializeDice(dice1, dice2) {
        this.dice = [
            {
                element: dice1,
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                angularVelocity: { x: 0, y: 0, z: 0 }
            },
            {
                element: dice2,
                position: { x: 30, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                angularVelocity: { x: 0, y: 0, z: 0 }
            }
        ];
    }

    throwDice(power, direction) {
        if (this.isAnimating) return;

        this.isAnimating = true;
        const throwPower = power * 20;
        const throwAngle = direction;

        this.dice.forEach((die, index) => {
            // Add some randomness to the throw
            const randomOffset = (Math.random() - 0.5) * 0.2;
            const randomPower = throwPower * (0.8 + Math.random() * 0.4);

            die.velocity = {
                x: Math.cos(throwAngle) * randomPower,
                y: -randomPower * 0.8, // Upward velocity
                z: Math.sin(throwAngle) * randomPower
            };

            die.angularVelocity = {
                x: (Math.random() - 0.5) * this.rotationSpeed,
                y: (Math.random() - 0.5) * this.rotationSpeed,
                z: (Math.random() - 0.5) * this.rotationSpeed
            };
        });

        this.animate();
    }

    animate() {
        if (!this.isAnimating) return;

        let allStopped = true;

        this.dice.forEach(die => {
            // Update position
            die.position.x += die.velocity.x;
            die.position.y += die.velocity.y;
            die.position.z += die.velocity.z;

            // Apply gravity
            die.velocity.y += this.gravity * 0.016; // 60fps

            // Apply air resistance
            die.velocity.x *= (1 - this.airResistance);
            die.velocity.y *= (1 - this.airResistance);
            die.velocity.z *= (1 - this.airResistance);

            // Update rotation
            die.rotation.x += die.angularVelocity.x;
            die.rotation.y += die.angularVelocity.y;
            die.rotation.z += die.angularVelocity.z;

            // Check for collision with table (y = 0)
            if (die.position.y <= 0) {
                die.position.y = 0;
                die.velocity.y = -die.velocity.y * this.bounce;
                die.velocity.x *= this.friction;
                die.velocity.z *= this.friction;
                die.angularVelocity.x *= this.friction;
                die.angularVelocity.y *= this.friction;
                die.angularVelocity.z *= this.friction;
            }

            // Check if dice has stopped
            const speed = Math.sqrt(
                die.velocity.x * die.velocity.x +
                die.velocity.y * die.velocity.y +
                die.velocity.z * die.velocity.z
            );

            if (speed > 0.1) {
                allStopped = false;
            }

            // Update dice element transform
            die.element.style.transform = `
                translate3d(${die.position.x}px, ${die.position.y}px, ${die.position.z}px)
                rotateX(${die.rotation.x}deg)
                rotateY(${die.rotation.y}deg)
                rotateZ(${die.rotation.z}deg)
            `;
        });

        if (allStopped) {
            this.isAnimating = false;
            this.onDiceStopped();
        } else {
            this.animationFrame = requestAnimationFrame(() => this.animate());
        }
    }

    onDiceStopped() {
        // Calculate final dice values based on rotation
        this.dice.forEach(die => {
            const normalizedRotation = {
                x: (die.rotation.x % 360 + 360) % 360,
                y: (die.rotation.y % 360 + 360) % 360,
                z: (die.rotation.z % 360 + 360) % 360
            };

            // Determine which face is up based on rotation
            let value = 1;
            if (normalizedRotation.x > 45 && normalizedRotation.x <= 135) value = 2;
            else if (normalizedRotation.x > 135 && normalizedRotation.x <= 225) value = 3;
            else if (normalizedRotation.x > 225 && normalizedRotation.x <= 315) value = 4;
            else if (normalizedRotation.x > 315 || normalizedRotation.x <= 45) {
                if (normalizedRotation.y > 180) value = 5;
                else value = 6;
            }

            die.value = value;
        });

        // Trigger callback with final values
        if (this.onComplete) {
            this.onComplete(this.dice.map(die => die.value));
        }
    }

    reset() {
        this.isAnimating = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        this.dice.forEach(die => {
            die.position = { x: 0, y: 0, z: 0 };
            die.velocity = { x: 0, y: 0, z: 0 };
            die.rotation = { x: 0, y: 0, z: 0 };
            die.angularVelocity = { x: 0, y: 0, z: 0 };
            die.element.style.transform = 'translate3d(0, 0, 0) rotateX(0) rotateY(0) rotateZ(0)';
        });
    }
}

// Initialize the physics engine when the game is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.game) {
        window.dicePhysics = new DicePhysics();
        window.dicePhysics.initializeDice(
            document.getElementById('dice1'),
            document.getElementById('dice2')
        );
    }
}); 