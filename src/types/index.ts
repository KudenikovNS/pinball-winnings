import * as Matter from 'matter-js';
import * as PIXI from 'pixi.js';

export interface Ball {
  sprite: PIXI.Container;
  body: Matter.Body;
  id: number;
  color: number;
  isPlayer: boolean;
}

export interface Obstacle {
  sprite: PIXI.Graphics | PIXI.Container;
  body: Matter.Body;
  type: 'peg' | 'triangle' | 'platform' | 'wall';
}

export interface PrizeZone {
  sprite: PIXI.Container;
  sensor: Matter.Body;
  value: number;
  index: number;
}

export interface GameConfig {
  width: number;
  height: number;
  viewportHeight: number;
  ballCount: number;
}

export interface PhysicsConfig {
  gravity: number;
  positionIterations?: number;
  velocityIterations?: number;
}
