import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  PEG_RADIUS, 
  PEG_RESTITUTION, 
  PEG_FRICTION,
  COLOR_PEG,
  COLOR_TRIANGLE,
  COLOR_PLATFORM,
  COLOR_WALL
} from '../../utils/Constants';
import type { Obstacle } from '../../types';

function createWall(x: number, y: number, width: number, height: number): Obstacle {
  const body = Matter.Bodies.rectangle(x, y, width, height, {
    isStatic: true,
    label: 'wall'
  });
  
  const sprite = new PIXI.Graphics();
  sprite.rect(-width / 2, -height / 2, width, height);
  sprite.fill(COLOR_WALL);
  sprite.position.set(x, y);
  
  return { sprite, body, type: 'wall' };
}

export function createWalls(): Obstacle[] {
  return [
    createWall(GAME_WIDTH / 2, GAME_HEIGHT, GAME_WIDTH, 20),
    createWall(0, GAME_HEIGHT / 2, 20, GAME_HEIGHT),
    createWall(GAME_WIDTH, GAME_HEIGHT / 2, 20, GAME_HEIGHT),
  ];
}

export function createPegZone(startY: number, endY: number): Obstacle[] {
  const obstacles: Obstacle[] = [];
  const pegRows = 12;
  const pegCols = 9;
  const pegSpacingY = (endY - startY) / pegRows;
  const pegSpacingX = GAME_WIDTH / pegCols;

  for (let row = 0; row < pegRows; row++) {
    for (let col = 0; col < pegCols + 1; col++) {
      let x = col * pegSpacingX;
      
      if (row % 2 === 1) {
        x += pegSpacingX / 2;
      }
      
      if (x > GAME_WIDTH - PEG_RADIUS) continue;

      const y = row * pegSpacingY + startY;

      const body = Matter.Bodies.circle(x, y, PEG_RADIUS, {
        isStatic: true,
        restitution: PEG_RESTITUTION,
        friction: PEG_FRICTION,
        label: 'peg',
      });

      const sprite = new PIXI.Graphics();
      sprite.circle(0, 0, PEG_RADIUS);
      sprite.fill(COLOR_PEG);
      sprite.position.set(x, y);

      obstacles.push({ sprite, body, type: 'peg' });
    }
  }

  return obstacles;
}

export function createTriangleZone(startY: number, endY: number): Obstacle[] {
  const obstacles: Obstacle[] = [];
  const numTriangles = 25;

  for (let i = 0; i < numTriangles; i++) {
    const x = Math.random() * GAME_WIDTH;
    const y = startY + Math.random() * (endY - startY);
    const size = 20 + Math.random() * 20;
    const restitution = 0.5 + Math.random() * 0.5;
    const angle = (Math.random() - 0.5) * Math.PI;

    const body = Matter.Bodies.polygon(x, y, 3, size, {
      isStatic: true,
      restitution,
      friction: PEG_FRICTION,
      angle,
      label: 'triangle',
    });

    const sprite = new PIXI.Graphics();
    const vertices = body.vertices;
    sprite.poly([
      vertices[0].x - x, vertices[0].y - y,
      vertices[1].x - x, vertices[1].y - y,
      vertices[2].x - x, vertices[2].y - y,
    ]);
    sprite.fill(COLOR_TRIANGLE);
    sprite.position.set(x, y);
    sprite.rotation = angle;

    obstacles.push({ sprite, body, type: 'triangle' });
  }

  return obstacles;
}

function createPlatform(
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number,
  restitution: number
): Obstacle {
  const body = Matter.Bodies.rectangle(x, y, width, height, {
    isStatic: true,
    angle,
    restitution,
    label: 'platform',
  });

  const sprite = new PIXI.Graphics();
  sprite.rect(-width / 2, -height / 2, width, height);
  sprite.fill(COLOR_PLATFORM);
  sprite.position.set(x, y);
  sprite.rotation = angle;

  return { sprite, body, type: 'platform' };
}

export function createDonkeyKongZone(startY: number, endY: number): Obstacle[] {
  const obstacles: Obstacle[] = [];
  const rows = 10;
  const girderHeight = 15;
  const rowHeight = (endY - startY) / rows;
  const angle = Math.PI / 18;

  for (let i = 0; i < rows; i++) {
    const y = startY + i * rowHeight;
    const slantRight = i % 2 === 0;
    const restitution = 0.6 + Math.random() * 0.2;

    if (slantRight) {
      obstacles.push(
        createPlatform(GAME_WIDTH * 0.25, y, GAME_WIDTH * 0.4, girderHeight, angle, restitution)
      );
      obstacles.push(
        createPlatform(GAME_WIDTH * 0.75, y, GAME_WIDTH * 0.4, girderHeight, angle, restitution)
      );
    } else {
      obstacles.push(
        createPlatform(GAME_WIDTH / 2, y, GAME_WIDTH * 0.7, girderHeight, -angle, restitution)
      );
    }
  }

  return obstacles;
}
