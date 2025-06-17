// Test suite for Slevens Game
class GameTest {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.game = new SlevensGame();
    }

    runTests() {
        console.log('Starting Slevens Game Tests...\n');

        // Test Player Management
        this.testPlayerManagement();
        
        // Test Dice Physics
        this.testDicePhysics();
        
        // Test Game Logic
        this.testGameLogic();
        
        // Test Shake Detection
        this.testShakeDetection();

        // Print results
        console.log('\nTest Results:');
        console.log(`Passed: ${this.passed}`);
        console.log(`Failed: ${this.failed}`);
    }

    testPlayerManagement() {
        console.log('Testing Player Management...');
        
        const playerManager = new PlayerManager(this.game);
        
        // Test adding players
        this.assert(
            'Should add player successfully',
            () => {
                const player = playerManager.addPlayer('Test Player');
                return player.name === 'Test Player' && player.score === 0;
            }
        );

        // Test player limits
        this.assert(
            'Should enforce maximum players limit',
            () => {
                try {
                    for (let i = 0; i < 9; i++) {
                        playerManager.addPlayer(`Player ${i}`);
                    }
                    return false;
                } catch (e) {
                    return e.message.includes('Maximum');
                }
            }
        );

        // Test player elimination
        this.assert(
            'Should eliminate player correctly',
            () => {
                playerManager.eliminatePlayer(0);
                return playerManager.getActivePlayers().length === 0;
            }
        );
    }

    testDicePhysics() {
        console.log('\nTesting Dice Physics...');
        
        const physics = new DicePhysics();
        
        // Test dice initialization
        this.assert(
            'Should initialize dice correctly',
            () => {
                physics.initializeDice(
                    document.createElement('div'),
                    document.createElement('div')
                );
                return physics.dice.length === 2;
            }
        );

        // Test dice throwing
        this.assert(
            'Should throw dice with correct physics',
            () => {
                physics.throwDice(0.5, Math.PI / 4);
                return physics.isAnimating === true;
            }
        );
    }

    testGameLogic() {
        console.log('\nTesting Game Logic...');
        
        // Test win conditions
        this.assert(
            'Should detect win on 7',
            () => {
                this.game.diceValues = [3, 4];
                return this.game.checkResult() === 'win';
            }
        );

        this.assert(
            'Should detect win on 11',
            () => {
                this.game.diceValues = [5, 6];
                return this.game.checkResult() === 'win';
            }
        );

        this.assert(
            'Should detect win on doubles',
            () => {
                this.game.diceValues = [6, 6];
                return this.game.checkResult() === 'win';
            }
        );
    }

    testShakeDetection() {
        console.log('\nTesting Shake Detection...');
        
        const detector = new ShakeDetector(this.game);
        
        // Test shake threshold
        this.assert(
            'Should detect shake above threshold',
            () => {
                detector.handleShake(20);
                return detector.isShaking === true;
            }
        );

        // Test shake timeout
        this.assert(
            'Should reset shake state after timeout',
            () => {
                return new Promise(resolve => {
                    detector.handleShake(20);
                    setTimeout(() => {
                        resolve(detector.isShaking === false);
                    }, 1100);
                });
            }
        );
    }

    assert(name, test) {
        try {
            const result = test();
            if (result instanceof Promise) {
                result.then(passed => {
                    if (passed) {
                        console.log(`✅ ${name}`);
                        this.passed++;
                    } else {
                        console.log(`❌ ${name}`);
                        this.failed++;
                    }
                });
            } else {
                if (result) {
                    console.log(`✅ ${name}`);
                    this.passed++;
                } else {
                    console.log(`❌ ${name}`);
                    this.failed++;
                }
            }
        } catch (error) {
            console.log(`❌ ${name}`);
            console.error(error);
            this.failed++;
        }
    }
}

// Run tests when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const tester = new GameTest();
    tester.runTests();
}); 