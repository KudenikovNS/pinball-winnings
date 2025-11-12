import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import { GAME_WIDTH, GAME_HEIGHT } from '../../utils/Constants';
import type { PrizeZone as IPrizeZone } from '../../types';

export class PrizeZone {
  public sprite: PIXI.Container;
  public sensor: Matter.Body;
  public value: number;
  public index: number;
  private graphics: PIXI.Graphics;
  private text: PIXI.Text;

  constructor(index: number, value: number, color: number, alpha: number, totalZones: number) {
    this.index = index;
    this.value = value;

    const bucketWidth = GAME_WIDTH / totalZones;
    const bucketHeight = 80;
    const x = bucketWidth * index + bucketWidth / 2;
    const y = GAME_HEIGHT - bucketHeight / 2;

    this.sprite = new PIXI.Container();
    this.sprite.position.set(x, y);

    this.graphics = new PIXI.Graphics();
    this.graphics.rect(-bucketWidth / 2, -bucketHeight / 2, bucketWidth, bucketHeight);
    this.graphics.fill({ color, alpha });
    this.graphics.rect(-bucketWidth / 2, -bucketHeight / 2, bucketWidth, bucketHeight);
    this.graphics.stroke({ color: 0xFFFFFF, width: 2 });
    this.sprite.addChild(this.graphics);

    this.text = new PIXI.Text({
      text: value.toString(),
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xFFFFFF,
        align: 'center',
      }
    });
    this.text.anchor.set(0.5);
    this.sprite.addChild(this.text);

    this.sensor = Matter.Bodies.rectangle(x, y, bucketWidth, bucketHeight, {
      isStatic: true,
      isSensor: true,
      label: `prize-${value}`,
    });
  }

  getData(): IPrizeZone {
    return {
      sprite: this.sprite,
      sensor: this.sensor,
      value: this.value,
      index: this.index,
    };
  }

  public animate(): void {
    const originalAlpha = this.graphics.alpha;
    this.graphics.alpha = 1;
    
    const originalScale = this.sprite.scale.x;
    this.sprite.scale.set(1.15);
    
    const duration = 300;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      this.sprite.scale.set(originalScale + (1.15 - originalScale) * (1 - easeOut));
      this.graphics.alpha = originalAlpha + (1 - originalAlpha) * (1 - easeOut);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
