import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import { BALL_RADIUS, BALL_RESTITUTION, BALL_FRICTION, COLOR_PLAYER_GLOW } from '../../utils/Constants';

export class BallEntity {
  public sprite: PIXI.Container;
  public body: Matter.Body;
  public id: number;
  public color: number;
  public isPlayer: boolean;
  private rankText: PIXI.Text | null = null;
  private graphics: PIXI.Graphics;

  constructor(id: number, x: number, y: number, color: number, isPlayer: boolean = false) {
    this.id = id;
    this.color = color;
    this.isPlayer = isPlayer;

    this.sprite = new PIXI.Container();
    this.graphics = new PIXI.Graphics();
    this.sprite.addChild(this.graphics);
    this.drawBall();

    if (this.isPlayer) {
      this.createRankText();
    }

    this.body = Matter.Bodies.circle(x, y, BALL_RADIUS, {
      restitution: BALL_RESTITUTION,
      friction: BALL_FRICTION,
      frictionAir: 0,
      frictionStatic: 0,
      label: isPlayer ? 'player-ball' : `ball-${id}`,
    });

    this.sprite.position.set(x, y);
  }

  private createRankText(): void {
    this.rankText = new PIXI.Text({
      text: '1st',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xFFFFFF,
        align: 'center',
      }
    });
    this.rankText.anchor.set(0.5, 1);
    this.rankText.y = -BALL_RADIUS - 5;
    this.sprite.addChild(this.rankText);
  }

  public updateRank(rank: number): void {
    if (!this.rankText) return;

    let suffix = 'th';
    if (rank === 1) suffix = 'st';
    else if (rank === 2) suffix = 'nd';
    else if (rank === 3) suffix = 'rd';

    this.rankText.text = `${rank}${suffix}`;
  }

  public ensureRankText(): void {
    if (!this.rankText) {
      this.createRankText();
    }
  }

  public removeRankText(): void {
    if (this.rankText) {
      this.sprite.removeChild(this.rankText);
      this.rankText.destroy();
      this.rankText = null;
    }
  }

  public drawBall(): void {
    this.graphics.clear();

    if (this.isPlayer) {
      this.graphics.circle(0, 0, BALL_RADIUS + 5);
      this.graphics.fill({ color: COLOR_PLAYER_GLOW, alpha: 0.3 });
    }

    this.graphics.circle(0, 0, BALL_RADIUS);
    this.graphics.fill({ color: this.color, alpha: this.isPlayer ? 1 : 0.4 });

    if (this.isPlayer) {
      this.graphics.circle(0, 0, BALL_RADIUS);
      this.graphics.stroke({ color: 0xFFFFFF, width: 3 });

      const blurFilter = new PIXI.BlurFilter();
      blurFilter.strength = 5;
      this.graphics.filters = [blurFilter];
    }
  }

  update(): void {
    this.sprite.position.set(this.body.position.x, this.body.position.y);
    this.sprite.rotation = this.body.angle;
  }

  public fadeOut(callback?: () => void): void {
    const duration = 200;
    const startTime = Date.now();
    const originalAlpha = this.sprite.alpha;
    let animationStopped = false;
    
    const animate = () => {
      if (animationStopped || !this.sprite || this.sprite.destroyed) {
        if (callback && !animationStopped) callback();
        return;
      }

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      this.sprite.alpha = originalAlpha * (1 - progress);
      this.sprite.scale.set(1 + progress * 0.2);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        animationStopped = true;
        if (callback) callback();
      }
    };
    
    requestAnimationFrame(animate);
  }

  destroy(): void {
    if (this.sprite && !this.sprite.destroyed) {
      this.sprite.destroy();
    }
  }
}
