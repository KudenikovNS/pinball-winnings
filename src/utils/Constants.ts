/**
 * Game constants
 */

export const GAME_WIDTH = 450;
export const GAME_HEIGHT = 4000;
export const VIEWPORT_HEIGHT = 800;
export const BALL_COUNT = 50;
export const BALL_RADIUS = 12;

export const PRIZE_VALUES = [
  { value: 100, color: 0x4A5568, alpha: 0.5 },
  { value: 500, color: 0x4299E1, alpha: 0.5 },
  { value: 1000, color: 0xED8936, alpha: 0.5 },
  { value: 0, color: 0xE53E3E, alpha: 0.5 },
  { value: 10000, color: 0xD53F8C, alpha: 0.5 },
  { value: 0, color: 0xE53E3E, alpha: 0.5 },
  { value: 1000, color: 0xED8936, alpha: 0.5 },
  { value: 500, color: 0x4299E1, alpha: 0.5 },
  { value: 100, color: 0x4A5568, alpha: 0.5 },
];

// Physics constants
export const PHYSICS_GRAVITY = 1;
export const BALL_RESTITUTION = 0.85;
export const BALL_FRICTION = 0.005;
export const PEG_RADIUS = 5;
export const PEG_RESTITUTION = 0.5;
export const PEG_FRICTION = 0.05;

// Camera constants
export const CAMERA_LERP_FACTOR = 0.05;

// Anti-stuck system
export const STUCK_FRAMES_LIMIT = 120;
export const STUCK_MOVE_THRESHOLD = 0.5;

// Colors
export const COLOR_PEG = 0xA0AEC0;
export const COLOR_TRIANGLE = 0x63B3ED;
export const COLOR_PLATFORM = 0x48BB78;
export const COLOR_WALL = 0x4A5568;
export const COLOR_PLAYER_GLOW = 0xF6E05E;

// Initialization constants
export const RENDERER_INIT_TIMEOUT = 10000; // 10 seconds
export const MAX_BALL_COUNT = 100;
export const MIN_BALL_COUNT = 1;

// Obstacle positioning
export const OBSTACLE_START_Y = 40;
export const BALL_SPAWN_Y_MIN = 20;
export const BALL_SPAWN_Y_RANGE = 40;
export const BALL_SPAWN_X_MIN_FACTOR = 0.2;
export const BALL_SPAWN_X_RANGE_FACTOR = 0.6;

// Game states
export enum GameState {
  PRE_GAME = 'pre-game',
  DROPPING = 'dropping',
  GAME_OVER = 'game-over',
}
