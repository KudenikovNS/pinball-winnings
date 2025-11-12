# Pinball Winnings

Игра Pinball Winnings на Pixi.js + Matter.js + TypeScript.

## Установка

```bash
cd game
npm install
```

## Запуск

### Режим разработки

```bash
npm run dev
```

Игра откроется в браузере на `http://localhost:3000`

### Production сборка

```bash
npm run build
```

Готовые файлы в папке `dist/`

### Просмотр production

```bash
npm run preview
```

### Проверка типов

```bash
npm run type-check
```

## Технологии

- **Pixi.js 8.5.2** - рендеринг
- **Matter.js 0.20.0** - физика
- **TypeScript 5.6** - типизация
- **Vite 5.4** - сборка

## Игровой процесс

1. Выберите цвет шарика
2. Нажмите "DROP BALLS"
3. Следите за своим шариком с белой обводкой
4. Ваш ранг показывается внутри шарика
5. Выигрыш = `приз × (50 - позиция + 1)`

## Структура проекта

```
game/
├── src/
│   ├── main.ts              # Точка входа
│   ├── game/                # Игровая логика
│   │   ├── Game.ts
│   │   ├── PhysicsEngine.ts
│   │   ├── Renderer.ts
│   │   └── entities/
│   ├── ui/                  # UI управление
│   ├── utils/               # Константы
│   └── types/               # TypeScript типы
├── index.html
├── style.css
└── package.json
```

## Дополнительно

Подробное описание архитектуры см. в `ARCHITECTURE.md`
