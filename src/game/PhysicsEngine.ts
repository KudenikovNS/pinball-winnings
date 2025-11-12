import * as Matter from 'matter-js';
import type { PhysicsConfig } from '../types';
import { PHYSICS_GRAVITY } from '../utils/Constants';

export class PhysicsEngine {
  public engine: Matter.Engine;
  public world: Matter.World;
  private runner: Matter.Runner;

  constructor(config: PhysicsConfig = { gravity: PHYSICS_GRAVITY }) {
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: config.gravity },
      positionIterations: config.positionIterations || 8,
      velocityIterations: config.velocityIterations || 6,
    });

    this.world = this.engine.world;
    this.runner = Matter.Runner.create();
  }

  start(): void {
    Matter.Runner.run(this.runner, this.engine);
  }

  stop(): void {
    Matter.Runner.stop(this.runner);
  }

  update(): void {
    Matter.Engine.update(this.engine);
  }

  addBody(body: Matter.Body): void {
    Matter.World.add(this.world, body);
  }

  addBodies(bodies: Matter.Body[]): void {
    Matter.World.add(this.world, bodies);
  }

  removeBody(body: Matter.Body): void {
    Matter.World.remove(this.world, body);
  }

  removeBodies(bodies: Matter.Body[]): void {
    Matter.World.remove(this.world, bodies);
  }

  clear(): void {
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
  }

  onCollisionStart(callback: (event: Matter.IEventCollision<Matter.Engine>) => void): void {
    Matter.Events.on(this.engine, 'collisionStart', callback);
  }

  onBeforeUpdate(callback: (event: Matter.IEventTimestamped<Matter.Engine>) => void): void {
    Matter.Events.on(this.engine, 'beforeUpdate', callback);
  }
}
