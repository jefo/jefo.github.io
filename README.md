# native/ — картотека знаний

Хаб об инженерии ПО с ИИ, а не блог с лентой. Концепты, направления, связи,
маршруты, атлас и словарь. Сделан на **Astro 7 + Tailwind CSS 4**, полностью
статический.

**Live:** https://jefo.github.io/

---

## Что внутри

- **9 концептов** с шифрами (`K-01`, `A-01`, `T-01`, `P-01`), форматами, уровнями и временем чтения;
- **4 направления** — Контекст, Агенты, Инструменты, Практика; концепт может лежать на пересечении;
- **3 маршрута** с прогрессом в `localStorage`: «Первый контакт», «Контекст под контролем», «Свой инструмент»;
- **Атлас** — интерактивная карта связей по общим тегам, с фильтром по направлениям;
- **Словарь** — 20 терминов со ссылками на концепты;
- **Каталог** с фильтрами по направлению и формату;
- **Поиск** по заголовкам, описаниям, тегам, направлениям и тексту без сервера;
- **`/llms.txt`** — машинночитаемая карта хаба для AI-агентов;
- тёмная и светлая темы, RSS, sitemap, JSON-LD, адаптив от 320 px, reduced-motion.

Старые URL форматов сохранены: `/recipes/...`, `/guides/...`, `/notes/...`.
Это форматы и архив, но главный вход — каталог, маршруты и атлас.

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
  config.ts              бренд, навигация, форматы, уровни
  content.config.ts      схема коллекции
  content/posts/         9 концептов + шаблон
  data/hub.ts            направления, маршруты, словарь, шифры, координаты атласа
  components/
    Header, Footer       тактильная шапка и подвал
    DomainPlate          плашка направления из материала
    ConceptCard          карточка концепта
    RouteTicket          билет маршрута
    AtlasMap             SVG-атлас: full / mini
    SectionHead, Icon, BaseHead
  layouts/BaseLayout.astro
  lib/utils.ts           даты, связи, маршруты, направления, теги
  pages/
    index.astro          главная-картотека
    catalog/             каталог с фильтрами
    domains/[domain].astro
    paths/               маршруты и маршрут
    atlas.astro
    glossary.astro
    [type]/[slug].astro  карточка концепта
    start.astro          как пользоваться
    about.astro
    search.astro
    tags/                темы
    recipes|guides|notes форматы и архив
    search-index.json.ts
    rss.xml.ts
    404.astro
  styles/
    global.css           старая база (prose, код, поиск)
    tactile.css          тактильный слой: токены, материалы, карточки, атлас
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
short: "Короткая подпись для атласа"
date: 2026-11-22
type: recipe # recipe | guide | note
domains: ["context", "tools"] # первое — основное
tags: ["context", "tool-search"]
level: easy # easy | medium | hard
time: "6 мин"
tools: ["Claude Code"]
draft: false
---
```

3. Добавьте шифр в `CONCEPT_CODES` и координаты в `ATLAS_POSITIONS` в
   `src/data/hub.ts`. Без координат узел попадёт в центр атласа, без шифра
   получит `X-00`.
4. Если нужен маршрут — добавьте шаг в `ROUTES` там же.
5. Обновите словарь, если появился новый термин.

URL собирается из формата: `recipe → /recipes/slug`, `guide → /guides/slug`,
`note → /notes/slug`. Смена формата у опубликованного материала меняет URL.

### Callout-блоки

```html
<div class="callout">Заметка</div>
<div class="callout callout--key">Главная мысль</div>
<div class="callout callout--warn">Предупреждение / грабли</div>
```

### Шаблон

Скопируйте `src/content/posts/_template.md` — он исключён из сборки.

---

## Направления и связи

- Направления описаны в `DOMAINS` (`src/data/hub.ts`): материал, цвет, иконка, тексты.
- Основное направление — первый элемент `domains`; остальные дают пересечения.
- Связи в атласе и блоке «Связи» строятся по общим тегам. Чем больше общих тегов,
  тем толще линия. Это прозрачно и не требует ручной разметки.
- Счётчик связей считается динамически в `tagConnections()`.

---

## Дизайн-система

Все токены — в начале `src/styles/tactile.css`.

| Токен | Роль |
| --- | --- |
| `--paper`, `--paper-2`, `--paper-3` | бумага и поверхности |
| `--ink`, `--ink-2`, `--muted` | чернила |
| `--accent` | лаймовый хайлайтер |
| `--dom-context/agents/tools/practice` | цвета направлений |
| `--tex-grain`, `--tex-desk`, `--tex-slate` | бумага, стол, сланец |
| `--tex-felt/steel/rubber/kraft` | материалы направлений |
| `--radius`, `--shadow-1/2/3` | физика карточек и кнопок |

Три голоса: **Inter Tight** — интерфейс и заголовки-хаба, **Literata** — чтение,
**JetBrains Mono** — шифры, метки и данные. Цвета в OKLCH.

### Текстуры

`public/textures/*.svg` — процедурные текстуры на `feTurbulence`. Без растровых
зависимостей и внешних запросов. Работают в обеих темах.

Готовые промпты для AI-текстур (GPT Image 2) лежат в
`garden-gpt-image-2/prompt/tactile-materials-20261122-2138.md`. В этой сессии
image-провайдер вернул `Invalid credential`, поэтому сайт собран на SVG-fallback.
Инструкция по замене — в конце prompt-файла и в `public/textures/README.md`.

---

## Настройка бренда

- `src/config.ts`: `title`, `mark`, `tagline`, `description`, `author`, `socials`, `NAV`.
- Домен: `site` в `astro.config.mjs` и `public/robots.txt`.
- OG-картинка: `public/og.png` (исходник `public/og.svg`, 1200×630).
- Favicon: `public/favicon.svg`.

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

## Деплой

Сайт полностью статический.

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
