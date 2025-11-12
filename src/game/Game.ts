import * as Matter from 'matter-js';
import * as PIXI from 'pixi.js';
import { PhysicsEngine } from './PhysicsEngine';
import { Renderer } from './Renderer';
import { BallEntity } from './entities/Ball';
import { createWalls, createPegZone, createTriangleZone, createDonkeyKongZone } from './entities/ObstacleFactory';
import { PrizeZone } from './entities/PrizeZone';
import { 
  GAME_WIDTH,
  GAME_HEIGHT,
  BALL_COUNT, 
  PRIZE_VALUES,
  GameState,
  STUCK_FRAMES_LIMIT,
  STUCK_MOVE_THRESHOLD,
  RENDERER_INIT_TIMEOUT,
  MAX_BALL_COUNT,
  MIN_BALL_COUNT,
  OBSTACLE_START_Y,
  BALL_SPAWN_Y_MIN,
  BALL_SPAWN_Y_RANGE,
  BALL_SPAWN_X_MIN_FACTOR,
  BALL_SPAWN_X_RANGE_FACTOR
} from '../utils/Constants';
import type { Obstacle } from '../types';

export class Game {
  private physics: PhysicsEngine;
  private renderer: Renderer;
  private balls: BallEntity[] = [];
  private obstacles: Obstacle[] = [];
  private prizeZones: PrizeZone[] = [];
  private playerBall: BallEntity | null = null;
  private finishedCount: number = 0;
  private gameState: GameState = GameState.PRE_GAME;
  private ballColors: number[] = [];
  
  // Anti-stuck system
  private lastBallPosition: Matter.Vector | null = null;
  private stuckFrames: number = 0;

  // Callbacks
  private onPrizeHitCallback?: (score: number) => void;
  private onGameStateChangeCallback?: (state: GameState) => void;
  private onReadyCallback?: () => void;

  constructor(container: HTMLElement) {
    this.physics = new PhysicsEngine();
    this.renderer = new Renderer(container);
    this.initializeWhenReady();
  }

  private async initializeWhenReady(): Promise<void> {
    try {
      await Promise.race([
        this.renderer.waitForReady(),
        new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error(`Renderer initialization timeout after ${RENDERER_INIT_TIMEOUT}ms`)), RENDERER_INIT_TIMEOUT)
        )
      ]);
      
      console.log('✅ Renderer initialized successfully');
      
      try {
        this.validateConfiguration();
      } catch (error) {
        console.error('❌ Game configuration validation failed:', error);
        this.showFatalError('Game cannot start: Invalid configuration');
        throw error;
      }
      
      this.generateBallColors();
      this.createWorld();
      this.setupPhysicsEvents();
      this.physics.start();
      
      console.log('✅ Game initialized successfully');
      this.safeCall(this.onReadyCallback);
    } catch (error) {
      console.error('❌ Game initialization failed:', error);
      this.showFatalError(`Game initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private validateConfiguration(): void {
    if (BALL_COUNT < MIN_BALL_COUNT || BALL_COUNT > MAX_BALL_COUNT) {
      throw new Error(`Invalid BALL_COUNT: ${BALL_COUNT}. Must be between ${MIN_BALL_COUNT} and ${MAX_BALL_COUNT}`);
    }
    
    if (!PRIZE_VALUES || PRIZE_VALUES.length === 0) {
      throw new Error('PRIZE_VALUES must not be empty');
    }
    
    if (GAME_WIDTH <= 0 || GAME_HEIGHT <= 0) {
      throw new Error(`Invalid game dimensions: ${GAME_WIDTH}x${GAME_HEIGHT}`);
    }
    
    if (RENDERER_INIT_TIMEOUT <= 0) {
      throw new Error(`Invalid RENDERER_INIT_TIMEOUT: ${RENDERER_INIT_TIMEOUT}`);
    }
    
    console.log('✅ Game configuration validated successfully');
  }

  private generateBallColors(): void {
    this.ballColors = Array.from(
      { length: BALL_COUNT },
      () => {
        const hue = Math.random() * 360;
        return this.hslToHex(hue, 80, 70);
      }
    );
  }

  private hslToHex(h: number, s: number, l: number): number {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color);
    };
    return (f(0) << 16) | (f(8) << 8) | f(4);
  }

  private createWorld(): void {
    const walls = createWalls();
    walls.forEach(wall => {
      this.obstacles.push(wall);
      this.renderer.addToWorld(wall.sprite);
      this.physics.addBody(wall.body);
    });

    const obstacleStartY = OBSTACLE_START_Y;
    const zoneHeight = (GAME_HEIGHT - 500) / 4;

    const zone1 = createPegZone(obstacleStartY, obstacleStartY + zoneHeight);
    this.addObstacles(zone1);

    const zone2 = createTriangleZone(
      obstacleStartY + zoneHeight,
      obstacleStartY + zoneHeight * 2
    );
    this.addObstacles(zone2);

    const zone3 = createDonkeyKongZone(
      obstacleStartY + zoneHeight * 2,
      obstacleStartY + zoneHeight * 3
    );
    this.addObstacles(zone3);

    const zone4 = createPegZone(
      obstacleStartY + zoneHeight * 3,
      obstacleStartY + zoneHeight * 4
    );
    this.addObstacles(zone4);

    PRIZE_VALUES.forEach((prize, index) => {
      const prizeZone = new PrizeZone(index, prize.value, prize.color, prize.alpha, PRIZE_VALUES.length);
      this.prizeZones.push(prizeZone);
      this.renderer.addToWorld(prizeZone.sprite);
      this.physics.addBody(prizeZone.sensor);
    });

    this.createPrizeDividers();
  }

  private createPrizeDividers(): void {
    const bucketWidth = GAME_WIDTH / PRIZE_VALUES.length;
    const dividerHeight = 40;
    const dividerWidth = 8;

    for (let i = 1; i < PRIZE_VALUES.length; i++) {
      const x = bucketWidth * i;
      const y = GAME_HEIGHT - dividerHeight / 2;

      const body = Matter.Bodies.rectangle(x, y, dividerWidth, dividerHeight, {
        isStatic: true,
        label: 'divider',
      });

      const sprite = new PIXI.Graphics();
      sprite.rect(-dividerWidth / 2, -dividerHeight / 2, dividerWidth, dividerHeight);
      sprite.fill(0x4A5568);
      sprite.position.set(x, y);
      this.renderer.worldContainer.addChild(sprite);

      this.physics.addBody(body);
      this.obstacles.push({ sprite, body, type: 'wall' });
    }
  }

  private addObstacles(obstacles: Obstacle[]): void {
    obstacles.forEach(obstacle => {
      this.obstacles.push(obstacle);
      this.renderer.addToWorld(obstacle.sprite);
      this.physics.addBody(obstacle.body);
    });
  }

  private updateRankings(): void {
    if (!this.playerBall || this.balls.length === 0) return;

    const sortedBalls = [...this.balls].sort((a, b) => b.body.position.y - a.body.position.y);
    const rankAmongRemaining = sortedBalls.findIndex(ball => ball.id === this.playerBall!.id) + 1;
    
    // Ranking logic: finished balls count + current position among remaining
    const actualRank = this.finishedCount + rankAmongRemaining;

    if (actualRank > 0) {
      this.playerBall.updateRank(actualRank);
    }
  }

  private setupPhysicsEvents(): void {
    this.physics.onBeforeUpdate(() => {
      if (this.playerBall && this.balls.length > 0) {
        this.renderer.setCameraTarget(this.playerBall.body.position.y);

        // Anti-stuck: detect if ball hasn't moved significantly
        if (this.lastBallPosition) {
          const dx = this.playerBall.body.position.x - this.lastBallPosition.x;
          const dy = this.playerBall.body.position.y - this.lastBallPosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < STUCK_MOVE_THRESHOLD) {
            this.stuckFrames++;
          } else {
            this.stuckFrames = 0;
          }
        }

        this.lastBallPosition = { ...this.playerBall.body.position };

        if (this.stuckFrames > STUCK_FRAMES_LIMIT) {
          Matter.Body.applyForce(this.playerBall.body, this.playerBall.body.position, {
            x: (Math.random() - 0.5) * 0.05,
            y: -0.05,
          });
          this.stuckFrames = 0;
        }
      }

      this.balls.forEach(ball => ball.update());
      this.updateRankings();
    });

    this.physics.onCollisionStart((event) => {
      event.pairs.forEach((pair: Matter.Pair) => {
        const { bodyA, bodyB } = pair;

        const ballBody = bodyA.label.includes('ball') ? bodyA : 
                        (bodyB.label.includes('ball') ? bodyB : null);
        const prizeBody = bodyA.label.startsWith('prize-') ? bodyA :
                         (bodyB.label.startsWith('prize-') ? bodyB : null);

        if (ballBody && prizeBody) {
          this.handlePrizeCollision(ballBody, prizeBody);
        }
      });
    });
  }

  private handlePrizeCollision(ballBody: Matter.Body, prizeBody: Matter.Body): void {
    const ball = this.balls.find(b => b.body === ballBody);
    if (!ball) return;

    this.finishedCount++;
    const isPlayerBall = ball.isPlayer;

    const prizeZone = this.prizeZones.find(pz => pz.sensor === prizeBody);
    if (!prizeZone) {
      console.error('Prize zone not found for body:', prizeBody.label);
      return;
    }

    prizeZone.animate();

    if (isPlayerBall) {
      const scoreMultiplier = BALL_COUNT - this.finishedCount + 1;
      const finalScore = prizeZone.value * scoreMultiplier;

      this.safeCall(this.onPrizeHitCallback, finalScore);

      this.playerBall = null;
      this.stuckFrames = 0;
      this.lastBallPosition = null;
      this.setGameState(GameState.GAME_OVER);
    }

    ball.fadeOut(() => {
      this.renderer.removeFromWorld(ball.sprite);
      this.physics.removeBody(ball.body);
      ball.destroy();
      this.balls = this.balls.filter(b => b !== ball);
    });
  }

  private clearAllBalls(): void {
    this.balls.forEach(ball => {
      this.renderer.removeFromWorld(ball.sprite);
      this.physics.removeBody(ball.body);
      ball.destroy();
    });
    this.balls = [];
    this.playerBall = null;
    this.finishedCount = 0;
    this.stuckFrames = 0;
    this.lastBallPosition = null;
  }

  public dropBalls(selectedBallId: number): void {
    if (this.gameState !== GameState.PRE_GAME) return;

    if (selectedBallId < 0 || selectedBallId >= BALL_COUNT) {
      console.error(`Invalid ball ID: ${selectedBallId}. Must be between 0 and ${BALL_COUNT - 1}`);
      return;
    }

    this.clearAllBalls();

    for (let i = 0; i < BALL_COUNT; i++) {
      const isPlayer = i === selectedBallId;
      const x = GAME_WIDTH * BALL_SPAWN_X_MIN_FACTOR + Math.random() * GAME_WIDTH * BALL_SPAWN_X_RANGE_FACTOR;
      const y = BALL_SPAWN_Y_MIN + Math.random() * BALL_SPAWN_Y_RANGE;

      const ball = new BallEntity(i, x, y, this.ballColors[i], isPlayer);
      this.balls.push(ball);
      this.renderer.addToWorld(ball.sprite);
      this.physics.addBody(ball.body);

      if (isPlayer) {
        this.playerBall = ball;
      }
    }

    this.setGameState(GameState.DROPPING);
  }

  public reset(): void {
    this.clearAllBalls();
    this.renderer.setCameraTarget(400);

    this.setGameState(GameState.PRE_GAME);
  }

  private setGameState(state: GameState): void {
    this.gameState = state;
    this.safeCall(this.onGameStateChangeCallback, state);
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public getBallColors(): number[] {
    return this.ballColors;
  }

  private safeCall<T extends (...args: any[]) => void>(
    callback: T | undefined,
    ...args: Parameters<T>
  ): void {
    if (typeof callback === 'function') {
      try {
        callback(...args);
      } catch (error) {
        console.error('Error in callback:', error);
      }
    }
  }

  public onPrizeHit(callback: (score: number) => void): void {
    this.onPrizeHitCallback = callback;
  }

  public onGameStateChange(callback: (state: GameState) => void): void {
    this.onGameStateChangeCallback = callback;
  }

  public onReady(callback: () => void): void {
    this.onReadyCallback = callback;
  }

  /**
   * Show fatal error message to user
   */
  private showFatalError(message: string): void {
    const errorContainer = document.createElement('div');
    errorContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #E53E3E;
      color: white;
      padding: 20px 40px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 16px;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      text-align: center;
      max-width: 400px;
    `;
    errorContainer.innerHTML = `
      <div>❌ ${message}</div>
      <div style="margin-top: 12px; font-size: 14px; font-weight: normal;">
        Please check console for details and refresh the page.
      </div>
    `;
    document.body.appendChild(errorContainer);
  }

  public destroy(): void {
    this.physics.stop();
    this.renderer.destroy();
  }
}
