class PlayerManager {
    constructor(game) {
        this.game = game;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.maxPlayers = 8;
        this.minPlayers = 2;
    }

    addPlayer(name) {
        if (this.players.length >= this.maxPlayers) {
            throw new Error(`Maximum ${this.maxPlayers} players allowed`);
        }

        const player = {
            name: name.trim(),
            score: 0,
            eliminated: false,
            turns: 0,
            wins: 0,
            losses: 0
        };

        this.players.push(player);
        return player;
    }

    removePlayer(index) {
        if (index >= 0 && index < this.players.length) {
            this.players.splice(index, 1);
            if (this.currentPlayerIndex >= this.players.length) {
                this.currentPlayerIndex = 0;
            }
        }
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    nextTurn() {
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        } while (this.getCurrentPlayer().eliminated);

        const currentPlayer = this.getCurrentPlayer();
        currentPlayer.turns++;
        return currentPlayer;
    }

    updateScore(playerIndex, points) {
        if (playerIndex >= 0 && playerIndex < this.players.length) {
            this.players[playerIndex].score += points;
        }
    }

    eliminatePlayer(playerIndex) {
        if (playerIndex >= 0 && playerIndex < this.players.length) {
            this.players[playerIndex].eliminated = true;
            this.players[playerIndex].losses++;
        }
    }

    recordWin(playerIndex) {
        if (playerIndex >= 0 && playerIndex < this.players.length) {
            this.players[playerIndex].wins++;
        }
    }

    getActivePlayers() {
        return this.players.filter(player => !player.eliminated);
    }

    getPlayerStats() {
        return this.players.map(player => ({
            name: player.name,
            score: player.score,
            turns: player.turns,
            wins: player.wins,
            losses: player.losses,
            winRate: player.turns > 0 ? (player.wins / player.turns * 100).toFixed(1) : 0
        }));
    }

    getLeaderboard() {
        return [...this.players]
            .sort((a, b) => b.score - a.score)
            .map((player, index) => ({
                rank: index + 1,
                name: player.name,
                score: player.score,
                wins: player.wins,
                losses: player.losses
            }));
    }

    resetGame() {
        this.players.forEach(player => {
            player.score = 0;
            player.eliminated = false;
            player.turns = 0;
            player.wins = 0;
            player.losses = 0;
        });
        this.currentPlayerIndex = 0;
    }

    validatePlayerCount() {
        if (this.players.length < this.minPlayers) {
            throw new Error(`Minimum ${this.minPlayers} players required`);
        }
        if (this.players.length > this.maxPlayers) {
            throw new Error(`Maximum ${this.maxPlayers} players allowed`);
        }
    }

    getGameState() {
        return {
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            activePlayers: this.getActivePlayers().length,
            totalPlayers: this.players.length,
            leaderboard: this.getLeaderboard()
        };
    }
}

// Initialize the player manager when the game is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.game) {
        window.playerManager = new PlayerManager(window.game);
    }
}); 