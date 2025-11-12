# Архитектура проекта

## Общая схема

```
┌─────────────────┐
│   UI Layer      │  ← UIManager.ts (DOM)
└────────┬────────┘
         ↓
┌─────────────────┐
│   Game Logic    │  ← Game.ts (координатор)
└────────┬────────┘
         ↓
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌────────┐
│Renderer│ │Physics │
└────────┘ └────────┘
  Pixi.js   Matter.js
```

## Основные компоненты

### 1. main.ts
**Назначение:** Точка входа, связывает UI и игру

```typescript
class App {
  private game: Game;
  private ui: UIManager;
  
  constructor() {
    this.game = new Game(container);
    this.ui = new UIManager();
    this.game.onReady(() => this.setupGame());
  }
}
```

---

### 2. Game.ts
**Назначение:** Главный координатор всех систем

**Ответственность:**
- Управление игровым циклом
- Координация физики и рендеринга
- Обработка столкновений
- Подсчет рангов и очков

**Ключевые методы:**
- `initializeWhenReady()` - асинхронная инициализация с таймаутом
- `createWorld()` - создание препятствий и призов
- `update()` - обновление игры каждый кадр
- `dropBalls()` - запуск игры
- `handlePrizeCollision()` - обработка финиша

**Паттерны:** Facade, Mediator

---

### 3. Renderer.ts
**Назначение:** Рендеринг через Pixi.js

**Ответственность:**
- Инициализация PIXI.Application
- Управление камерой (плавное следование)
- Рендеринг игрового мира

**Особенности:**
- **Promise-based инициализация** (`waitForReady()`)
- **PIXI.Ticker** для render loop (requestAnimationFrame)
- **Lerp интерполяция** для плавной камеры
- **Два контейнера:** world (игра) + overlay (UI)

```typescript
private render(): void {
  // Плавное следование
  this.cameraY += (this.targetCameraY - this.cameraY) * CAMERA_LERP_FACTOR;
  this.worldContainer.y = -this.cameraY + VIEWPORT_HEIGHT / 2;
}
```

**Паттерн:** Adapter

---

### 4. PhysicsEngine.ts
**Назначение:** Обертка для Matter.js

**Ответственность:**
- Создание физического мира
- Управление физическими телами
- События столкновений

**События:**
- `beforeUpdate` - перед каждым физическим шагом
- `collisionStart` - при столкновении тел

**Паттерн:** Facade

---

### 5. BallEntity.ts
**Назначение:** Сущность шарика (физика + визуал)

**Структура:**
```typescript
class BallEntity {
  sprite: PIXI.Graphics;  // Визуал
  body: Matter.Body;      // Физика
  rankText: PIXI.Text;    // Ранг (для игрока)
  
  update() {
    // Синхронизация позиции
    this.sprite.position.set(this.body.position.x, this.body.position.y);
    this.sprite.rotation = this.body.angle;
  }
}
```

**Важно:** `update()` вызывается каждый кадр для синхронизации

---

### 6. ObstacleFactory.ts
**Назначение:** Создание препятствий

**Методы:**
- `createWalls()` - боковые стены
- `createPegZone()` - колышки (12 рядов)
- `createTriangleZone()` - треугольники (25 шт)
- `createDonkeyKongZone()` - платформы (10 рядов)

**Паттерн:** Factory Method

---

### 7. PrizeZone.ts
**Назначение:** Призовые зоны внизу

**Особенность:** 
- `isSensor: true` - не блокирует движение, только детектирует

---

### 8. UIManager.ts
**Назначение:** Управление DOM

**Ответственность:**
- Отображение кнопок выбора шариков
- Обновление счета
- Показ результата игры

**Валидация:** Проверка всех входных данных

---

## Игровой цикл

```
1. Инициализация
   ├─ Renderer.init() (async)
   ├─ validateConfiguration()
   ├─ generateBallColors()
   ├─ createWorld()
   └─ physics.start()

2. Игровой цикл (каждый кадр)
   ├─ Physics.beforeUpdate
   │  ├─ ball.update() - синхронизация позиций
   │  ├─ checkStuck() - анти-застревание
   │  └─ updateRankings() - обновление рангов
   │
   ├─ Physics step (Matter.js)
   │
   ├─ Renderer.render()
   │  └─ Обновление камеры (lerp)
   │
   └─ Collision detection
      └─ handlePrizeCollision()

3. Финиш
   ├─ Подсчет очков: prize × (50 - position + 1)
   ├─ UI.showRoundOver(score)
   └─ GameState = GAME_OVER
```

---

## Синхронизация физики и визуала

**Проблема:** Matter.js и Pixi.js работают независимо

**Решение:** В `beforeUpdate` синхронизируем позиции

```typescript
// PhysicsEngine beforeUpdate callback
balls.forEach(ball => {
  ball.update(); // Копирует позицию из Matter body в Pixi sprite
});

```

## Паттерны проектирования

| Паттерн | Где используется |
|---------|------------------|
| **Facade** | Game.ts, PhysicsEngine.ts |
| **Factory** | ObstacleFactory.ts |
| **Mediator** | Game.ts координирует системы |
| **Adapter** | Renderer.ts (обертка для Pixi.js) |
| **Observer** | Callbacks (onReady, onPrizeHit) |

---