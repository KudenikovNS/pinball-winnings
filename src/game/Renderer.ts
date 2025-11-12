import * as PIXI from 'pixi.js';
import { GAME_WIDTH, VIEWPORT_HEIGHT, CAMERA_LERP_FACTOR } from '../utils/Constants';

export class Renderer {
  public app: PIXI.Application;
  public worldContainer: PIXI.Container;
  private overlayContainer: PIXI.Container;
  private cameraY: number = VIEWPORT_HEIGHT / 2;
  private targetCameraY: number = VIEWPORT_HEIGHT / 2;
  private initialized: boolean = false;
  private initPromise: Promise<void>;

  constructor(container: HTMLElement) {
    this.app = new PIXI.Application();
    this.worldContainer = new PIXI.Container();
    this.overlayContainer = new PIXI.Container();
    this.initPromise = this.init(container);
  }

  private async init(container: HTMLElement): Promise<void> {
    await this.app.init({
      width: GAME_WIDTH,
      height: VIEWPORT_HEIGHT,
      background: '#2d2d2d',
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });

    container.appendChild(this.app.canvas);
    this.app.stage.addChild(this.worldContainer);
    this.app.stage.addChild(this.overlayContainer);
    this.app.ticker.add(() => this.render());
    this.initialized = true;
  }

  public isReady(): boolean {
    return this.initialized;
  }

  /**
   * Wait for renderer initialization to complete
   * Returns a Promise that resolves when renderer is ready
   */
  public waitForReady(): Promise<void> {
    return this.initPromise;
  }

  private render(): void {
    this.cameraY += (this.targetCameraY - this.cameraY) * CAMERA_LERP_FACTOR;
    this.cameraY = Math.max(VIEWPORT_HEIGHT / 2, this.cameraY);
    this.worldContainer.y = -this.cameraY + VIEWPORT_HEIGHT / 2;
  }

  setCameraTarget(y: number): void {
    this.targetCameraY = y;
  }

  getCameraY(): number {
    return this.cameraY;
  }

  addToWorld(displayObject: PIXI.Container): void {
    this.worldContainer.addChild(displayObject);
  }

  removeFromWorld(displayObject: PIXI.Container): void {
    this.worldContainer.removeChild(displayObject);
  }

  addToOverlay(displayObject: PIXI.Container): void {
    this.overlayContainer.addChild(displayObject);
  }

  removeFromOverlay(displayObject: PIXI.Container): void {
    this.overlayContainer.removeChild(displayObject);
  }

  clear(): void {
    this.worldContainer.removeChildren();
    this.overlayContainer.removeChildren();
  }

  destroy(): void {
    this.app.destroy(true, { children: true, texture: true });
  }
}
