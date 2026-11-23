# native/ · tactile material prompts

> Mode C: генератор изображений в этой сессии вернул `Invalid credential`, поэтому
> сайт собран на процедурных SVG-текстурах. Промпты ниже готовы для GPT Image 2 /
> любого image-инструмента. Когда доступ появится — сгенерируйте, сконвертируйте
> в WebP и замените `--tex-*` в `src/styles/tactile.css`.

## Общие правила

- Никакого текста, рукописей, логотипов и узнаваемых предметов.
- Материал заполняет весь кадр edge to edge.
- Мягкий ровный свет, без жёстких теней и бликов.
- Один и тот же масштаб макро для всех материалов.
- Формат 1:1, 1024–1536 px, затем WebP quality 82.

## 1. paper-light.webp

`/textures/paper-light.webp` · фон бумаги, светлая тема

> Extreme close-up macro photograph of warm cream cotton paper with fine visible fibers and subtle tooth. The paper fills the entire frame edge to edge. Flat, even, soft studio lighting, no shadows, no objects, no text, no handwriting, no logos. Natural off-white color with a faint warm beige tint, very subtle fiber texture, high-resolution scan quality, editorial material sample, minimalist, 1:1.

## 2. paper-dark.webp

`/textures/paper-dark.webp` · фон бумаги, тёмная тема

> Extreme close-up macro photograph of deep charcoal-black paper with fine visible fibers and a subtle olive-green undertone. The paper fills the entire frame edge to edge. Flat, even, soft studio lighting, no shadows, no objects, no text, no handwriting, no logos. Matte surface, natural fibrous texture, high-resolution scan quality, editorial material sample, minimalist, 1:1.

## 3. material-felt.webp

`/textures/material-felt.webp` · направление «Контекст»

> Extreme close-up macro photograph of dark forest-green wool felt fabric, dense matted fibers, slight fuzz. The material fills the entire frame edge to edge. Flat, even, soft studio lighting, no shadows, no objects, no text, no logos. Rich muted green, tactile natural texture, high detail, editorial material sample, minimalist, 1:1.

## 4. material-steel.webp

`/textures/material-steel.webp` · направление «Агенты»

> Extreme close-up macro photograph of brushed stainless steel, fine horizontal linear grain, cool silver-grey with a faint blue cast. The metal fills the entire frame edge to edge. Flat, even, soft studio lighting with a gentle diffuse sheen, no hard reflections, no objects, no text, no logos. Industrial material sample, high detail, minimalist, 1:1.

## 5. material-rubber.webp

`/textures/material-rubber.webp` · направление «Инструменты»

> Extreme close-up macro photograph of matte burnt-orange rubber or silicone with a fine pebbled surface, subtle specular sheen. The material fills the entire frame edge to edge. Flat, even, soft studio lighting, no hard reflections, no objects, no text, no logos. Muted terracotta-orange, tactile industrial material sample, high detail, minimalist, 1:1.

## 6. material-kraft.webp

`/textures/material-kraft.webp` · направление «Практика»

> Extreme close-up macro photograph of natural kraft cardboard, warm tan-brown, visible paper fibers and tiny flecks, slightly rough matte surface. The cardboard fills the entire frame edge to edge. Flat, even, soft studio lighting, no shadows, no objects, no text, no logos. Honest packaging material, editorial material sample, high detail, minimalist, 1:1.

## 7. surface-desk.webp

`/textures/surface-desk.webp` · подложка героя

> Top-down photograph of an empty warm light-grey wool felt desk mat, fine dense fibers, very subtle woven texture. The surface fills the entire frame edge to edge. Soft morning window light from the upper left creating a gentle gradient, no objects, no text, no logos, no hard shadows. Calm neutral studio still-life background, muted greige, high detail, 1:1.

## 8. surface-slate.webp

`/textures/surface-slate.webp` · подложка атласа

> Top-down macro photograph of dark charcoal slate stone with fine natural grain and subtle olive-green undertone, matte surface. The stone fills the entire frame edge to edge. Flat, even, soft diffused light, no objects, no text, no logos, no hard shadows, no water. Dark tactile surface for a studio tabletop, high detail, minimalist, 1:1.

## Как заменить

1. Сгенерируйте изображения и сохраните в `public/textures/` с именами выше.
2. Сконвертируйте в WebP:
   ```bash
   node -e "const sharp=require('sharp');sharp('in.png').webp({quality:82}).toFile('out.webp')"
   ```
3. В `src/styles/tactile.css` замените переменные:
   ```css
   --tex-grain: url("/textures/paper-light.webp");
   --tex-desk: url("/textures/surface-desk.webp");
   --tex-slate: url("/textures/surface-slate.webp");
   --tex-felt: url("/textures/material-felt.webp");
   --tex-steel: url("/textures/material-steel.webp");
   --tex-rubber: url("/textures/material-rubber.webp");
   --tex-kraft: url("/textures/material-kraft.webp");
   ```
4. Для тёмной темы добавьте `--tex-paper-dark` и переопределите `--tex-grain` в `.dark`.
5. Проверьте контраст: текст на плашках всегда лежит на бумажном лейбле, а не на материале.

Процедурные SVG остаются как fallback и не требуют внешних запросов.
