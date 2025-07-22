class DiceGame {
    constructor() {
        this.playerName = '';
        this.rollCount = 0;
        this.isRolling = false;
        this.isTracing = false;
        this.pathPoints = [];
        this.accuracy = 0;
        this.flickVelocity = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateNewPath();
    }

    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        
        const svg = document.getElementById('path-svg');
        svg.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        svg.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        svg.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Mouse events for testing
        svg.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        svg.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        svg.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }

    startGame() {
        const nameInput = document.getElementById('player-name');
        this.playerName = nameInput.value.trim() || 'Player';
        
        document.getElementById('home-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        document.getElementById('current-player').textContent = this.playerName;
        
        this.vibrate(50);
    }

    generateNewPath() {
        // Generate different complex paths
        const paths = [
            // S-curves
            "M 150 350 Q 100 300 150 250 T 150 150",
            "M 150 350 Q 200 300 150 250 T 150 150",
            "M 120 350 S 180 280 120 210 S 180 140 150 70",
            
            // Figure-8 patterns
            "M 150 350 Q 100 300 150 250 Q 200 200 150 150 Q 100 100 150 50",
            "M 150 350 C 80 350 80 250 150 250 C 220 250 220 150 150 150",
            
            // Zigzag patterns
            "M 100 350 L 150 300 L 100 250 L 150 200 L 100 150 L 150 100 L 150 50",
            "M 200 350 L 150 300 L 200 250 L 150 200 L 200 150 L 150 100 L 150 50",
            "M 120 350 L 180 320 L 120 290 L 180 260 L 120 230 L 180 200 L 120 170 L 150 50",
            
            // Spiral patterns
            "M 150 300 Q 120 280 150 260 Q 180 240 150 220 Q 120 200 150 180 Q 180 160 150 140",
            "M 150 350 A 30 30 0 0 1 120 320 A 30 30 0 0 1 150 290 A 30 30 0 0 1 180 260 A 30 30 0 0 1 150 230 A 30 30 0 0 1 120 200",
            
            // Loop patterns
            "M 150 350 Q 80 300 150 250 Q 220 200 150 150 Q 80 100 150 50",
            "M 100 350 C 100 300 200 300 200 250 C 200 200 100 200 100 150",
            
            // Complex combinations
            "M 150 350 L 120 320 Q 100 290 150 260 L 180 230 Q 200 200 150 170 L 120 140",
            "M 150 350 S 100 300 150 250 L 180 200 S 220 150 150 100"
        ];
        
        const randomPath = paths[Math.floor(Math.random() * paths.length)];
        document.getElementById('guide-path').setAttribute('d', randomPath);
        
        // Store path for accuracy calculation
        this.guidePath = randomPath;
        
        // Adjust stroke width based on path complexity
        const isZigzag = randomPath.includes('L');
        const strokeWidth = isZigzag ? '25' : '30';
        document.getElementById('guide-path').setAttribute('stroke-width', strokeWidth);
    }

    handleTouchStart(e) {
        if (this.isRolling) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const point = this.getSVGPoint(touch.clientX, touch.clientY);
        
        this.startTracing(point);
    }

    handleMouseDown(e) {
        if (this.isRolling) return;
        
        const point = this.getSVGPoint(e.clientX, e.clientY);
        this.startTracing(point);
    }

    startTracing(point) {
        this.isTracing = true;
        this.pathPoints = [point];
        this.lastPoint = point;
        this.lastTime = Date.now();
        
        // Clear previous user path
        document.getElementById('user-path').setAttribute('d', '');
        
        this.vibrate(20);
    }

    handleTouchMove(e) {
        if (!this.isTracing) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const point = this.getSVGPoint(touch.clientX, touch.clientY);
        
        this.updateTracing(point);
    }

    handleMouseMove(e) {
        if (!this.isTracing) return;
        
        const point = this.getSVGPoint(e.clientX, e.clientY);
        this.updateTracing(point);
    }

    updateTracing(point) {
        this.pathPoints.push(point);
        
        // Calculate velocity for flick detection
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        const deltaY = this.lastPoint.y - point.y;
        
        this.flickVelocity = deltaY / deltaTime * 100;
        
        // Update user path
        const pathString = this.pathPoints.reduce((acc, p, i) => {
            return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
        }, '');
        
        document.getElementById('user-path').setAttribute('d', pathString);
        
        // Calculate accuracy in real-time
        this.calculateAccuracy();
        
        this.lastPoint = point;
        this.lastTime = currentTime;
    }

    handleTouchEnd(e) {
        if (!this.isTracing) return;
        e.preventDefault();
        
        this.endTracing();
    }

    handleMouseUp() {
        if (!this.isTracing) return;
        
        this.endTracing();
    }

    endTracing() {
        this.isTracing = false;
        
        // Check if user completed enough of the path
        const pathCompletion = this.pathPoints.length > 30; // Need decent path length
        
        // Check if it was a flick (upward velocity)
        if (this.flickVelocity > 15 && this.accuracy > 40 && pathCompletion) {
            this.rollDice();
        } else if (!pathCompletion) {
            this.showMessage("Trace the entire path!");
        } else if (this.accuracy < 40) {
            this.showMessage("Stay on the path! Only " + Math.round(this.accuracy) + "% accurate");
        } else {
            this.showMessage("Flick upward at the end!");
        }
        
        // Reset for next attempt
        setTimeout(() => {
            document.getElementById('user-path').setAttribute('d', '');
            this.updateAccuracyBar(0);
        }, 2000);
    }

    calculateAccuracy() {
        if (this.pathPoints.length < 5) return;
        
        // Calculate how well the user is following the actual path
        let onPathCount = 0;
        let totalChecked = 0;
        
        // Check every 3rd point for performance
        for (let i = 0; i < this.pathPoints.length; i += 3) {
            const userPoint = this.pathPoints[i];
            const progress = i / this.pathPoints.length; // 0 to 1
            
            if (this.isPointNearPath(userPoint, progress)) {
                onPathCount++;
            }
            totalChecked++;
        }
        
        // Calculate accuracy as percentage of points on path
        const accuracy = (onPathCount / totalChecked) * 100;
        this.accuracy = accuracy;
        
        this.updateAccuracyBar(accuracy);
    }
    
    isPointNearPath(point, progress) {
        const baseTolerance = 40; // Base tolerance in pixels
        
        // More forgiving tolerance for complex paths
        let tolerance = baseTolerance;
        if (this.guidePath.includes('L')) {
            tolerance = 50; // Zigzags need more tolerance for sharp turns
        } else if (this.guidePath.includes('S') || this.guidePath.includes('C')) {
            tolerance = 45; // Curves are a bit easier
        }
        
        // Get expected position based on progress (0-1)
        const expectedPoint = this.getExpectedPoint(progress);
        
        // Calculate distance from expected point
        const distance = Math.sqrt(
            Math.pow(point.x - expectedPoint.x, 2) + 
            Math.pow(point.y - expectedPoint.y, 2)
        );
        
        return distance < tolerance;
    }
    
    getExpectedPoint(progress) {
        // Map progress (0-1) to Y position (350 to 50)
        const expectedY = 350 - (progress * 300);
        
        // For different path types, calculate expected X
        let expectedX = 150; // default center
        
        if (this.guidePath.includes('M 100 350') && this.guidePath.includes('L')) {
            // Left-starting zigzag - smooth transitions
            const segment = progress * 6;
            const segmentFloor = Math.floor(segment);
            const segmentProgress = segment - segmentFloor;
            
            if (segmentFloor % 2 === 0) {
                // Moving from left (100) to center (150)
                expectedX = 100 + (segmentProgress * 50);
            } else {
                // Moving from center (150) to left (100)
                expectedX = 150 - (segmentProgress * 50);
            }
        } else if (this.guidePath.includes('M 200 350') && this.guidePath.includes('L')) {
            // Right-starting zigzag
            const segment = Math.floor(progress * 6);
            expectedX = (segment % 2 === 0) ? 200 : 150;
        } else if (this.guidePath.includes('M 120 350') && this.guidePath.includes('L')) {
            // Alternating zigzag
            const segment = Math.floor(progress * 8);
            expectedX = (segment % 2 === 0) ? 120 : 180;
        } else if (this.guidePath.includes('S')) {
            // S-curves
            const wave = Math.sin(progress * Math.PI * 2);
            expectedX = 150 + (wave * 30);
        } else if (this.guidePath.includes('Q') && !this.guidePath.includes('150 50')) {
            // Figure-8 or complex curves
            const wave = Math.sin(progress * Math.PI * 3);
            expectedX = 150 + (wave * 50);
        }
        
        return { x: expectedX, y: expectedY };
    }

    updateAccuracyBar(accuracy) {
        const fill = document.querySelector('.accuracy-fill');
        fill.style.width = `${accuracy}%`;
        
        // Change color based on accuracy
        if (accuracy > 70) {
            fill.style.background = 'linear-gradient(45deg, #51cf66, #4ecdc4)';
        } else if (accuracy > 40) {
            fill.style.background = 'linear-gradient(45deg, #f9ca24, #ff6b6b)';
        } else {
            fill.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a24)';
        }
    }

    showMessage(text) {
        const instruction = document.getElementById('flick-instruction');
        instruction.textContent = text;
        this.vibrate(50);
    }

    rollDice() {
        if (this.isRolling) return;
        
        this.isRolling = true;
        this.vibrate(100);
        
        const dice1 = document.getElementById('dice1');
        const dice2 = document.getElementById('dice2');
        
        dice1.classList.add('rolling');
        dice2.classList.add('rolling');
        
        // Roll power based on accuracy and flick velocity
        const rollPower = (this.accuracy / 100) * (Math.min(this.flickVelocity, 100) / 100);
        const rollDuration = 1000 + (rollPower * 500);
        
        setTimeout(() => {
            this.finishRoll();
        }, rollDuration);
        
        this.showMessage("Rolling!");
    }

    finishRoll() {
        const dice1 = document.getElementById('dice1');
        const dice2 = document.getElementById('dice2');
        
        dice1.classList.remove('rolling');
        dice2.classList.remove('rolling');
        
        const value1 = Math.floor(Math.random() * 6) + 1;
        const value2 = Math.floor(Math.random() * 6) + 1;
        
        this.setDiceFace(dice1, value1);
        this.setDiceFace(dice2, value2);
        
        this.rollCount++;
        document.getElementById('roll-count').textContent = `Rolls: ${this.rollCount}`;
        
        this.checkResult(value1, value2);
        this.isRolling = false;
        
        // Generate new path for next roll
        this.generateNewPath();
        this.showMessage("Trace the path and flick!");
        
        this.vibrate([50, 100, 50]);
    }

    setDiceFace(dice, value) {
        const rotations = {
            1: 'rotateX(0deg) rotateY(0deg)',
            2: 'rotateX(0deg) rotateY(90deg)',
            3: 'rotateX(-90deg) rotateY(0deg)',
            4: 'rotateX(90deg) rotateY(0deg)',
            5: 'rotateX(0deg) rotateY(-90deg)',
            6: 'rotateX(0deg) rotateY(180deg)'
        };
        
        dice.style.transform = rotations[value];
    }

    checkResult(die1, die2) {
        const sum = die1 + die2;
        const resultDisplay = document.getElementById('result');
        const resultText = document.getElementById('result-text');
        const resultAction = document.getElementById('result-action');
        
        resultDisplay.classList.remove('hidden');
        
        if (sum === 7) {
            resultText.textContent = 'Seven!';
            resultAction.textContent = 'Take a drink!';
            this.vibrate([100, 50, 100, 50, 200]);
        } else if (sum === 11) {
            resultText.textContent = 'Eleven!';
            resultAction.textContent = 'Take a drink!';
            this.vibrate([100, 50, 100, 50, 200]);
        } else if (die1 === die2) {
            if (die1 === 1) {
                resultText.textContent = 'Snake Eyes!';
                resultAction.textContent = 'Everyone drinks!';
                this.vibrate([200, 100, 200, 100, 200]);
            } else {
                resultText.textContent = `Double ${die1}s!`;
                resultAction.textContent = 'Give out drinks!';
                this.vibrate([150, 50, 150]);
            }
        } else {
            resultText.textContent = `${sum}`;
            resultAction.textContent = 'Pass the phone!';
            this.vibrate(50);
        }
        
        setTimeout(() => {
            resultDisplay.classList.add('hidden');
        }, 3000);
    }

    getSVGPoint(clientX, clientY) {
        const svg = document.getElementById('path-svg');
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        
        const screenCTM = svg.getScreenCTM();
        return pt.matrixTransform(screenCTM.inverse());
    }

    vibrate(pattern) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }
}

new DiceGame();