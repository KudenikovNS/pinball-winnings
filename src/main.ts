import { Game } from './game/Game';
import { UIManager } from './ui/UIManager';
import { BALL_COUNT } from './utils/Constants';

/**
 * Application entry point
 */
class App {
  private game: Game;
  private ui: UIManager;
  private totalScore: number = 0;

  constructor() {
    const gameContainer = document.getElementById('game-canvas');
    if (!gameContainer) {
      throw new Error('Game container not found');
    }

    this.game = new Game(gameContainer);
    this.ui = new UIManager();

    // Wait for game to be ready before setting up UI
    this.game.onReady(() => {
      this.setupGame();
    });
  }

  private setupGame(): void {
    // Initialize ball selector with game ball colors
    const ballColors = this.game.getBallColors();
    this.ui.initializeBallSelector(ballColors, BALL_COUNT);
    
    // Initialize UI state
    this.ui.updateGameState(this.game.getGameState(), null);

    // Setup callbacks
    this.game.onPrizeHit((score) => {
      this.totalScore += score;
      this.ui.updateScore(this.totalScore);
      this.ui.showWinMessage(score);
    });

    this.game.onGameStateChange((state) => {
      this.ui.updateGameState(state, this.ui.getSelectedBallId());
    });

    this.ui.onDropBalls(() => {
      const selectedBallId = this.ui.getSelectedBallId();
      if (selectedBallId !== null) {
        this.game.dropBalls(selectedBallId);
      }
    });

    this.ui.onReset(() => {
      this.reset();
    });

    this.ui.onBallSelect((id) => {
      this.ui.updateGameState(this.game.getGameState(), id);
    });
  }

  private reset(): void {
    this.totalScore = 0;
    this.game.reset();
    this.ui.reset();
    // Update UI state to show ball selector again
    this.ui.updateGameState(this.game.getGameState(), null);
  }
}

// Start the application
new App();
