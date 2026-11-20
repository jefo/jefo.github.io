# native/ — журнал об инженерии ПО

Готовый к ведению журнал на **Astro 7 + Tailwind CSS 4**. Тёмная и светлая темы, палитра в OKLCH,
редакционная типографика: Literata для голоса, Inter Tight для интерфейса, JetBrains Mono
для кода и данных.

Не лендинг с карточками, а рабочий индекс: мастхед с реальным листингом из материала,
список записей, маргинальная колонка журнала. Сделан под формат:
**YouTube Shorts → полный рецепт в блоге → закладки**.

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

## Что уже есть

- главная-журнал: мастхед с листингом из рецепта, лид-история, индекс всех записей,
  авторская колонка, цитата из заметки, подписка;
- разделы **Рецепты**, **Гайды**, **Архив** (с фильтром по формату);
- страницы тегов, поиск по индексу без сервера, страница «С чего начать», «О журнале»;
- статья: серифный заголовок и набор, буквица, byline, TOC с подсветкой активного раздела,
  прогресс чтения, копирование кода и ссылки, рецептурная врезка, подпись автора,
  related, prev/next;
- на мобильных — раскрывающееся содержание статьи;
- RSS, sitemap, robots, OG-изображение, JSON-LD;
- тёмная тема по умолчанию, переключатель, `prefers-reduced-motion`;
- адаптив от 320 px, клавиатурная навигация, skip-link.

---

## Как добавить материал

1. Создайте файл в `src/content/posts/`, например `my-recipe.md`.
2. Заполните frontmatter:

```yaml
---
title: "Название"
description: "Одно предложение: что получит читатель."
date: 2026-11-18
type: recipe # recipe | guide | note
tags: ["context", "agents"]
level: easy # easy | medium | hard (опционально)
time: "6 мин" # опционально, иначе считается автоматически
tools: ["Claude Code", "Cursor"] # опционально
youtube: "https://www.youtube.com/shorts/XXXX" # опционально
featured: false # один материал можно вынести на главную
draft: false # true — не попадёт в сборку
---
```

3. Пишите markdown. Поддерживаются заголовки `##`/`###` (попадут в TOC), таблицы, списки,
   цитаты, код с подсветкой, чек-листы, `<details>`.

URL собирается из типа: `recipe → /recipes/slug`, `guide → /guides/slug`, `note → /notes/slug`.
Менять тип у опубликованного материала — значит менять URL.

### Callout-блоки

```html
<div class="callout">Заметка</div>
<div class="callout callout--key">Главная мысль</div>
<div class="callout callout--warn">Предупреждение / грабли</div>
```

### Шаблон

Скопируйте `src/content/posts/_template.md` — он исключён из сборки.

---

## Настройка бренда

Почти всё меняется в **`src/config.ts`**:

- `title`, `mark` — логотип и имя;
- `tagline`, `description` — подпись в шапке и meta;
- `author`, `email`, `socials`, `chat` — ссылки;
- `NAV` — пункты меню.

Домен: `site` в `astro.config.mjs` **и** `public/robots.txt` (sitemap). После смены домена
пересоберите сайт.

OG-картинка: `public/og.png` (исходник — `public/og.svg`). Замените на свою, сохранив 1200×630.

---

## Дизайн-система

Все токены — в `src/styles/global.css`, в начале файла.

| Токен | Роль |
| --- | --- |
| `--paper`, `--paper-2`, `--ink`, `--ink-2` | фон и текст |
| `--accent` | кислотный лайм: хайлайтер, ссылки, активные состояния |
| `--tok-key/str/num/fn/var` | палитра подсветки: фиолетовый, зелёный, янтарный, голубой, коралловый |
| `--line`, `--line-strong` | hairline-границы |
| `--code-bg` | фон кода |

Цвета заданы в **OKLCH**, поэтому светлая и тёмная темы сохраняют одинаковую воспринимаемую
яркость. Код подсвечивается через Shiki-тему `css-variables`, которая читает эти же токены.

Три голоса: **Literata** — заголовки, статьи и маргиналии, **Inter Tight** — интерфейс и индексы,
**JetBrains Mono** — код, даты и измерения. Акценты не случайные: это пять цветов синтаксиса;
теги хешируются в тот же набор. Заголовки статей помечены `##` и `###`, как в markdown.

---

## Структура

```
src/
  config.ts            бренд и навигация
  content.config.ts    схема коллекции
  content/posts/       материалы
  components/          Header, Footer, PostRow, Icon, BaseHead
  layouts/             BaseLayout
  lib/utils.ts         даты, чтение, теги, related
  pages/
    index.astro        главная
    recipes/index.astro
    guides/index.astro
    notes/index.astro  архив + фильтр
    [type]/[slug].astro статья
    tags/              темы
    start.astro        маршрут
    about.astro
    search.astro       клиентский поиск
    search-index.json.ts
    rss.xml.ts
    404.astro
  styles/global.css    токены и вся визуальная система
```

---

## Деплой

Сайт полностью статический — подойдёт любой хостинг.

**Vercel / Netlify:** framework preset — Astro, build `npm run build`, output `dist`.

**GitHub Pages:** добавьте `base` в `astro.config.mjs`, если сайт живёт в подпапке,
и задеплойте `dist/` через Actions.

**Свой сервер:** `npm run build` и раздавайте `dist/` любым nginx/caddy.

---

## Что заменить перед публикацией

- [ ] ссылки на YouTube, Telegram, GitHub, почту и домен в `src/config.ts`;
- [ ] домен в `astro.config.mjs` и `public/robots.txt`;
- [ ] `youtube`-ссылки — добавьте свои, если к материалу есть шортс;
- [ ] OG-картинку и favicon;
- [ ] тексты `about` и `start` под себя;
- [ ] удалить демо-посты или переписать их.

Дизайн и код можно использовать как угодно. Контент демо-постов — пример структуры, а не
единственно верные советы.
