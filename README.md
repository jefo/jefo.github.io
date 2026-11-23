# native/ — картотека знаний

Хаб об инженерии ПО с ИИ, а не блог с лентой. Левый сайдбар, каталог концептов,
маршруты, атлас и словарь. Стабильные ID, тип знания отдельно от формата.
Сделан на **Astro 7 + Tailwind CSS 4**, полностью статический.

**Live:** https://jefo.github.io/

---

## Что внутри

- **11 концептов** со стабильными ID (`AI-001`…`AI-011`);
- **4 направления** — Контекст, Агенты, Инструменты, Практика; одно основное, остальные — связи;
- **6 типов знания** — принцип, паттерн, техника, процесс, инструмент, архитектура;
- **3 маршрута** с целью, результатом и прогрессом в `localStorage`;
- **Атлас** — интерактивная карта: цвет узла = направление, форма = тип;
- **Словарь** — 22 термина со ссылками на концепты;
- **Каталог** на `/` с фильтрами по направлению и типу;
- **Поиск** по заголовкам, описаниям, тегам, направлениям и тексту;
- **`/llms.txt`** — машинночитаемая карта хаба;
- тёмная и светлая темы, RSS, sitemap, JSON-LD, адаптив от 320 px, reduced-motion.

### URL

- канонический: `/concepts/<slug>` — например, `/concepts/tool-search-mcp`;
- стабильный пермалинк: `/c/<uid>` — например, `/c/AI-003`;
- старые `/recipes|guides|notes/<slug>` — статические редиректы на `/concepts/<slug>`;
- `/catalog` — редирект на `/`.

Тип, формат и направление **не входят** в ID и URL. Переезд концепта между
направлениями не ломает ссылки.

---

## Быстрый старт

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # статика в dist/
npm run preview    # проверить сборку
npm run check      # типы и разметка
```

Нужен Node.js 22+.

---

## Структура

```
src/
  config.ts              бренд, навигация, форматы, типы знания
  content.config.ts      схема коллекции
  content/posts/         11 концептов + шаблон
  data/hub.ts            направления, маршруты, словарь, координаты атласа
  components/
    Header, Footer       тонкая шапка и компактный подвал
    Sidebar              постоянная навигация: каталог, направления, маршруты
    CatalogView          каталог с фильтрами по направлению и типу
    ConceptCard          карточка: AI-ID, тип, формат, направления
    RouteTicket          билет маршрута
    AtlasMap             SVG-атлас: full / mini, форма узла = тип
    SectionHead, Icon, BaseHead
  layouts/BaseLayout.astro
  lib/utils.ts           даты, связи, маршруты, направления, теги
  pages/
    index.astro          каталог (главная)
    concepts/[slug].astro карточка концепта
    [type]/[slug].astro  старые URL → редирект на /concepts
    c/[uid].astro        стабильный пермалинк по AI-ID
    catalog/index.astro  редирект на /
    domains/[domain].astro
    paths/               маршруты и маршрут
    atlas.astro
    glossary.astro
    start.astro
    about.astro
    search.astro
    tags/                темы
    recipes|guides|notes форматы и архив
    search-index.json.ts
    rss.xml.ts
    llms.txt.ts
    404.astro
  styles/
    global.css           старая база (prose, код, поиск)
    tactile.css          бумага, карточки, атлас, диаграммы
    shell.css            сайдбар, app-shell, каталог, мобильный drawer
    labs/                style tiles (Signal, Editorial, Chrome)
public/
  textures/              процедурные SVG-текстуры
garden-gpt-image-2/      промпты для AI-текстур (Mode C)
```

---

## Как добавить концепт

1. Создайте `src/content/posts/my-concept.md`.
2. Заполните frontmatter:

```yaml
---
title: "Название"
description: "Одно предложение: что получит читатель."
short: "Короткая подпись для атласа и сайдбара"
uid: "AI-012" # стабильный ID, не меняется
date: 2026-11-23
format: guide # recipe | guide | note — формат подачи
kind: technique # principle | pattern | technique | workflow | tool | architecture
domains: ["tools", "context"] # первое — основное направление
tags: ["tools", "context"]
level: medium
time: "10 мин"
tools: ["Claude Code"]
draft: false
---
```

3. `uid` — неизменяемый. `primaryDomain` (`domains[0]`), `kind` и `format` можно менять.
4. Добавьте координаты в `ATLAS_POSITIONS`, если нужен точный узел; без координат
   узел встанет в центр.
5. Если концепт входит в маршрут, используйте его `uid` в `ROUTES[].steps[].conceptId`.
6. Обновите словарь, если появился новый термин.

### Тип и формат — разные вещи

- `kind` — что это за знание: принцип, паттерн, техника, процесс, инструмент, архитектура.
- `format` — как это подано: рецепт, гайд, заметка.

Тип не создаёт отдельную ветку дерева. Он живёт в карточках, фильтрах каталога и
форме узла в атласе.

---

## Маршруты

Маршрут — самостоятельная сущность, а не подборка ссылок.

- `goal` — какую компетенцию получает читатель;
- `result` — что он умеет после;
- `steps[].conceptId` — стабильный ID;
- `steps[].note` — зачем этот шаг;
- `outcomes` — проверяемые результаты;
- прогресс хранится в `localStorage` (`native:route:<slug>`).

Маршруты лежат в `src/data/hub.ts`. Концепты в сайдбаре и карточках ссылаются на
маршруты, но не дублируют их.

---

## Дизайн-система

Все токены — в начале `src/styles/tactile.css`; оболочка — в `src/styles/shell.css`.

| Токен | Роль |
| --- | --- |
| `--paper`, `--paper-2`, `--paper-3` | бумага и поверхности |
| `--ink`, `--ink-2`, `--muted` | чернила |
| `--accent` | лаймовый хайлайтер |
| `--dom-context/agents/tools/practice` | цвета направлений |
| `--tex-grain`, `--tex-desk`, `--tex-slate` | бумага, стол, сланец |
| `--tex-felt/steel/rubber/kraft` | материалы направлений |

Три голоса: **Inter Tight** — интерфейс, **Literata** — чтение, **JetBrains Mono** —
шифры, метки и данные. Цвета в OKLCH.

Сайдбар — «каталожный ящик»: домены-ветки, раскрываются по клику; активная ветка
открыта. На главной все ветки открыты, чтобы был виден весь каталог. На мобильных —
drawer с тем же деревом.

---

## Лаборатория визуальных языков

`/labs` — три изолированных style tile, которые не меняют текущий хаб:

- `/labs/signal` — стекло, свет, генеративные поля и топология данных;
- `/labs/editorial` — сетка, крупная типографика, полутон и overprint;
- `/labs/chrome` — жидкий металл, иридесценция, тёмное стекло.

Страницы закрыты от индексации (`noindex`) и исключены из sitemap. Их можно
удалить целиком (`src/pages/labs`, `src/layouts/LabLayout.astro`,
`src/styles/labs`) без влияния на основной сайт.

---

## Текстуры

`public/textures/*.svg` — процедурные текстуры на `feTurbulence`. Без растровых
зависимостей и внешних запросов. Работают в обеих темах.

Готовые промпты для AI-текстур (GPT Image 2) лежат в
`garden-gpt-image-2/prompt/tactile-materials-20261122-2138.md`. В этой сессии
image-провайдер вернул `Invalid credential`, поэтому сайт собран на SVG-fallback.
Инструкция по замене — в конце prompt-файла и в `public/textures/README.md`.

---

## Деплой

**GitHub Pages:** репозиторий `jefo/jefo.github.io` деплоится через Actions
(`.github/workflows/deploy.yml`). Пуш в `main` запускает сборку и публикацию.

**Vercel / Netlify:** framework preset — Astro, build `npm run build`, output `dist`.

**Свой сервер:** `npm run build` и раздавайте `dist/` любым nginx/caddy.

---

## Что заменить перед публикацией

- [ ] ссылки на YouTube, Telegram, GitHub, почту и домен в `src/config.ts`;
- [ ] домен в `astro.config.mjs` и `public/robots.txt`;
- [ ] OG-картинку и favicon;
- [ ] тексты `about`, `start`, `paths` под себя;
- [ ] удалить или переписать демо-концепты;
- [ ] при желании — заменить SVG-текстуры на AI-текстуры по промптам.
