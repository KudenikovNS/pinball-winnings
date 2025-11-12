import { GameState } from '../utils/Constants';

export class UIManager {
  private winningsElement: HTMLElement;
  private dropBallsBtn: HTMLButtonElement;
  private resetBtn: HTMLButtonElement;
  private ballSelector: HTMLElement;
  private ballGrid: HTMLElement;
  private winMessageContainer: HTMLElement;
  private roundOverContainer: HTMLElement;

  private score: number = 0;
  private selectedBallId: number | null = null;

  private onDropBallsCallback?: () => void;
  private onResetCallback?: () => void;
  private onBallSelectCallback?: (id: number) => void;

  constructor() {
    this.winningsElement = document.getElementById('winnings-amount')!;
    this.dropBallsBtn = document.getElementById('drop-balls-btn') as HTMLButtonElement;
    this.resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
    this.ballSelector = document.getElementById('ball-selector')!;
    this.ballGrid = document.getElementById('ball-grid')!;
    this.winMessageContainer = document.getElementById('win-message-container')!;
    this.roundOverContainer = document.getElementById('round-over-container')!;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.dropBallsBtn.addEventListener('click', () => {
      if (this.onDropBallsCallback) {
        this.onDropBallsCallback();
      }
    });

    this.resetBtn.addEventListener('click', () => {
      if (this.onResetCallback) {
        this.onResetCallback();
      }
    });
  }

  public initializeBallSelector(ballColors: number[], ballCount: number): void {
    if (!ballColors || ballColors.length === 0) {
      console.error('Ball colors array is empty or undefined');
      return;
    }
    
    if (ballCount <= 0 || ballCount > 100) {
      console.error('Invalid ball count:', ballCount);
      return;
    }
    
    this.ballGrid.innerHTML = '';

    for (let i = 0; i < ballCount; i++) {
      const ball = document.createElement('button');
      ball.className = 'ball-option';
      ball.style.backgroundColor = this.numberToHexColor(ballColors[i]);
      ball.addEventListener('click', () => this.selectBall(i));
      this.ballGrid.appendChild(ball);
    }
  }

  private selectBall(id: number): void {
    this.selectedBallId = id;

    const balls = this.ballGrid.querySelectorAll('.ball-option');
    balls.forEach((ball, index) => {
      ball.classList.toggle('selected', index === id);
    });
    this.hideBallSelector();

    if (this.onBallSelectCallback) {
      this.onBallSelectCallback(id);
    }
  }

  public showBallSelector(): void {
    this.ballSelector.classList.remove('hidden');
  }

  public hideBallSelector(): void {
    this.ballSelector.classList.add('hidden');
  }

  public updateScore(score: number): void {
    this.score = score;
    this.winningsElement.textContent = `$${score.toLocaleString()}`;
  }

  public showWinMessage(amount: number): void {
    this.winMessageContainer.innerHTML = `
      <div class="win-message">
        You won $${amount.toLocaleString()}!
      </div>
    `;

    setTimeout(() => {
      this.winMessageContainer.innerHTML = '';
    }, 4000);
  }

  public showRoundOver(finalScore: number): void {
    this.roundOverContainer.innerHTML = `
      <div class="round-over-box">
        <h3>Round Over!</h3>
        <p>Your final score is $${finalScore.toLocaleString()}.</p>
        <p style="margin-top: 10px; font-size: 0.9rem;">Reset to play again!</p>
      </div>
    `;
  }

  public hideRoundOver(): void {
    this.roundOverContainer.innerHTML = '';
  }

  public updateGameState(state: GameState, selectedBallId: number | null): void {
    switch (state) {
      case GameState.PRE_GAME:
        if (selectedBallId === null) {
          this.showBallSelector();
        }
        this.hideRoundOver();
        this.dropBallsBtn.disabled = selectedBallId === null;
        this.dropBallsBtn.textContent = 'DROP BALLS';
        break;

      case GameState.DROPPING:
        this.hideBallSelector();
        this.dropBallsBtn.disabled = true;
        this.dropBallsBtn.textContent = '...';
        break;

      case GameState.GAME_OVER:
        this.dropBallsBtn.disabled = true;
        this.showRoundOver(this.score);
        break;
    }
  }

  public reset(): void {
    this.score = 0;
    this.selectedBallId = null;
    this.updateScore(0);
    this.hideRoundOver();
    this.winMessageContainer.innerHTML = '';
    
    const balls = this.ballGrid.querySelectorAll('.ball-option');
    balls.forEach(ball => ball.classList.remove('selected'));
  }

  private numberToHexColor(color: number | undefined): string {
    if (!color || isNaN(color)) {
      console.warn('Invalid color value:', color);
      return '#FFFFFF';
    }
    return `#${color.toString(16).padStart(6, '0')}`;
  }

  public onDropBalls(callback: () => void): void {
    this.onDropBallsCallback = callback;
  }

  public onReset(callback: () => void): void {
    this.onResetCallback = callback;
  }

  public onBallSelect(callback: (id: number) => void): void {
    this.onBallSelectCallback = callback;
  }

  public getSelectedBallId(): number | null {
    return this.selectedBallId;
  }
}
