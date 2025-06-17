class SlevensGame {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gamePhase = 'setup'; // setup, shake, aim, roll, results
        this.shakeIntensity = 0;
        this.aimDirection = 0;
        this.throwPower = 0;
        this.diceValues = [0, 0];
        this.timer = null;
        this.timerDuration = 5;
        this.minShakeThreshold = 15;
        this.maxShakeThreshold = 50;

        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        // Screens
        this.setupScreen = document.getElementById('setup-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultsScreen = document.getElementById('results-screen');

        // Game elements
        this.diceCup = document.querySelector('.dice-cup');
        this.diceContainer = document.querySelector('.dice-container');
        this.dice1 = document.getElementById('dice1');
        this.dice2 = document.getElementById('dice2');
        this.playerName = document.getElementById('player-name');
        this.gamePhase = document.getElementById('game-phase');
        this.timer = document.getElementById('timer');
        this.playersContainer = document.getElementById('players-container');
        this.aimInterface = document.querySelector('.aim-interface');
        this.trajectoryPreview = document.querySelector('.trajectory-preview');

        // Buttons
        this.addPlayerBtn = document.getElementById('add-player');
        this.startGameBtn = document.getElementById('start-game');
        this.rollDiceBtn = document.getElementById('roll-dice');
        this.newGameBtn = document.getElementById('new-game');

        // Audio
        this.initializeAudio();
    }

    initializeAudio() {
        this.audioElements = {
            diceRattle: document.getElementById('dice-rattle'),
            diceRoll: document.getElementById('dice-roll'),
            diceLand: document.getElementById('dice-land')
        };

        // Handle missing audio files
        Object.entries(this.audioElements).forEach(([key, element]) => {
            if (element) {
                element.onerror = () => {
                    console.warn(`Audio file for ${key} not found, sound will be disabled`);
                    this.audioElements[key] = null;
                };
            }
        });
    }

    playSound(soundName) {
        const sound = this.audioElements[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.warn(`Could not play ${soundName} sound:`, error);
            });
        }
    }

    initializeEventListeners() {
        // Setup screen
        this.addPlayerBtn.addEventListener('click', () => this.addPlayerInput());
        this.startGameBtn.addEventListener('click', () => this.startGame());

        // Game screen
        this.diceCup.addEventListener('mousedown', (e) => this.startAim(e));
        this.diceCup.addEventListener('mousemove', (e) => this.updateAim(e));
        this.diceCup.addEventListener('mouseup', () => this.throwDice());
        this.diceCup.addEventListener('touchstart', (e) => this.startAim(e));
        this.diceCup.addEventListener('touchmove', (e) => this.updateAim(e));
        this.diceCup.addEventListener('touchend', () => this.throwDice());

        // Results screen
        this.newGameBtn.addEventListener('click', () => this.resetGame());
    }

    addPlayerInput() {
        const playerInputs = document.querySelector('.player-inputs');
        const playerCount = playerInputs.children.length;

        if (playerCount >= 8) {
            alert('Maximum 8 players allowed!');
            return;
        }

        const newPlayerInput = document.createElement('div');
        newPlayerInput.className = 'player-input';
        newPlayerInput.innerHTML = `
            <input type="text" placeholder="Player ${playerCount + 1} Name" required>
            <button class="remove-player">×</button>
        `;

        playerInputs.appendChild(newPlayerInput);

        // Show remove buttons if more than 2 players
        if (playerCount >= 1) {
            document.querySelectorAll('.remove-player').forEach(btn => {
                btn.style.display = 'block';
            });
        }

        // Add remove button listener
        newPlayerInput.querySelector('.remove-player').addEventListener('click', () => {
            newPlayerInput.remove();
            this.updatePlayerNumbers();
        });
    }

    updatePlayerNumbers() {
        const inputs = document.querySelectorAll('.player-input input');
        inputs.forEach((input, index) => {
            input.placeholder = `Player ${index + 1} Name`;
        });
    }

    startGame() {
        const playerInputs = document.querySelectorAll('.player-input input');
        this.players = Array.from(playerInputs)
            .map(input => ({
                name: input.value.trim(),
                score: 0,
                eliminated: false
            }))
            .filter(player => player.name !== '');

        if (this.players.length < 2) {
            alert('Please add at least 2 players!');
            return;
        }

        this.setupScreen.classList.remove('active');
        this.gameScreen.classList.add('active');
        this.updatePlayerDisplay();
        this.startTurn();
    }

    startTurn() {
        this.currentPlayerIndex = this.players.findIndex(player => !player.eliminated);
        if (this.currentPlayerIndex === -1) {
            this.endGame();
            return;
        }

        this.playerName.textContent = this.players[this.currentPlayerIndex].name;
        this.gamePhase.textContent = 'Shake Phase';
        this.resetDice();
        this.startShakePhase();
    }

    startShakePhase() {
        this.gamePhase = 'shake';
        this.shakeIntensity = 0;
        this.diceCup.classList.add('shaking');
        this.diceContainer.classList.add('rattling');
        this.playSound('diceRattle');
    }

    updateShakeIntensity(intensity) {
        this.shakeIntensity = intensity;
        if (intensity >= this.minShakeThreshold) {
            this.diceCup.classList.remove('shaking');
            this.diceContainer.classList.remove('rattling');
            this.playSound('diceRattle');
            this.startAimPhase();
        }
    }

    startAimPhase() {
        this.gamePhase = 'aim';
        this.gamePhase.textContent = 'Aim Phase';
        this.aimInterface.classList.remove('hidden');
        this.startTimer();
    }

    startAim(e) {
        if (this.gamePhase !== 'aim') return;
        this.aimStartX = e.clientX || e.touches[0].clientX;
        this.aimStartY = e.clientY || e.touches[0].clientY;
    }

    updateAim(e) {
        if (this.gamePhase !== 'aim' || !this.aimStartX) return;
        
        const currentX = e.clientX || e.touches[0].clientX;
        const currentY = e.clientY || e.touches[0].clientY;
        
        const dx = currentX - this.aimStartX;
        const dy = currentY - this.aimStartY;
        
        this.aimDirection = Math.atan2(dy, dx);
        this.throwPower = Math.min(Math.sqrt(dx * dx + dy * dy) / 100, 1);
        
        this.updateTrajectoryPreview();
    }

    updateTrajectoryPreview() {
        const length = 100 + this.throwPower * 200;
        this.trajectoryPreview.style.width = `${length}px`;
        this.trajectoryPreview.style.transform = `rotate(${this.aimDirection}rad)`;
    }

    throwDice() {
        if (this.gamePhase !== 'aim') return;
        
        this.gamePhase = 'roll';
        this.gamePhase.textContent = 'Roll Phase';
        this.aimInterface.classList.add('hidden');
        this.stopTimer();
        
        this.playSound('diceRoll');
        this.animateDiceThrow();
    }

    animateDiceThrow() {
        const power = this.throwPower;
        const direction = this.aimDirection;
        
        this.dice1.classList.add('rolling');
        this.dice2.classList.add('rolling');
        
        setTimeout(() => {
            this.rollDice();
            this.checkResult();
        }, 1000);
    }

    rollDice() {
        this.diceValues = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
        
        this.updateDiceDisplay();
        this.playSound('diceLand');
    }

    updateDiceDisplay() {
        this.dice1.textContent = this.diceValues[0];
        this.dice2.textContent = this.diceValues[1];
    }

    checkResult() {
        const sum = this.diceValues[0] + this.diceValues[1];
        const isDoubles = this.diceValues[0] === this.diceValues[1];
        
        if (sum === 7 || sum === 11 || isDoubles) {
            this.handleWin();
        } else {
            this.handleLoss();
        }
    }

    handleWin() {
        this.players[this.currentPlayerIndex].score += 1;
        this.createConfetti();
        this.updatePlayerDisplay();
        setTimeout(() => this.startTurn(), 2000);
    }

    handleLoss() {
        this.players[this.currentPlayerIndex].eliminated = true;
        this.updatePlayerDisplay();
        setTimeout(() => this.startTurn(), 2000);
    }

    createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'particle confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 1000);
        }
    }

    startTimer() {
        let timeLeft = this.timerDuration;
        this.timer.textContent = timeLeft;
        this.timer.classList.remove('hidden');
        
        this.timer = setInterval(() => {
            timeLeft--;
            this.timer.textContent = timeLeft;
            
            if (timeLeft <= 3) {
                this.timer.classList.add('timer-warning');
            }
            
            if (timeLeft <= 0) {
                this.stopTimer();
                this.handleTimeout();
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timer);
        this.timer.classList.add('hidden');
        this.timer.classList.remove('timer-warning');
    }

    handleTimeout() {
        this.players[this.currentPlayerIndex].eliminated = true;
        this.updatePlayerDisplay();
        setTimeout(() => this.startTurn(), 2000);
    }

    updatePlayerDisplay() {
        this.playersContainer.innerHTML = this.players.map((player, index) => `
            <div class="player-card ${index === this.currentPlayerIndex ? 'active' : ''}">
                <span>${player.name}</span>
                <span>Score: ${player.score}</span>
                ${player.eliminated ? '<span class="eliminated">Eliminated</span>' : ''}
            </div>
        `).join('');
    }

    endGame() {
        this.gameScreen.classList.remove('active');
        this.resultsScreen.classList.add('active');
        
        const winner = this.players.reduce((prev, current) => 
            (current.score > prev.score) ? current : prev
        );
        
        document.getElementById('results-container').innerHTML = `
            <h3>Winner: ${winner.name}</h3>
            <p>Final Score: ${winner.score}</p>
        `;
    }

    resetGame() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.gamePhase = 'setup';
        this.resultsScreen.classList.remove('active');
        this.setupScreen.classList.add('active');
        
        // Reset player inputs
        const playerInputs = document.querySelector('.player-inputs');
        playerInputs.innerHTML = `
            <div class="player-input">
                <input type="text" placeholder="Player 1 Name" required>
                <button class="remove-player" style="display: none;">×</button>
            </div>
            <div class="player-input">
                <input type="text" placeholder="Player 2 Name" required>
                <button class="remove-player" style="display: none;">×</button>
            </div>
        `;
    }

    resetDice() {
        this.dice1.classList.remove('rolling');
        this.dice2.classList.remove('rolling');
        this.diceValues = [0, 0];
        this.updateDiceDisplay();
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SlevensGame();
}); 