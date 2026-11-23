export const SITE = {
  /** Короткое имя бренда. Меняется в одном месте — подставляется в шапку, подвал, meta. */
  title: "native/ — картотека знаний",
  /** Часть после слэша в логотипе. */
  mark: "native",
  tagline: "Картотека инженерии ПО",
  description:
    "native/ — хаб знаний об инженерии ПО с ИИ. Не лента, а картотека: концепты, связи, маршруты, атлас и словарь.",
  mission: "повышение ИИ-грамотности",
  url: "https://jefo.github.io",
  author: "Евгений Кайзин",
  handle: "@your_handle",
  email: "hi@native.blog",
  locale: "ru_RU",
  lang: "ru",
  startYear: 2025,
  socials: {
    youtube: "https://www.youtube.com/@your_handle",
    telegram: "https://t.me/your_handle",
    github: "https://github.com/jefo",
    x: "https://x.com/your_handle",
  },
  /** Ссылка на обсуждение постов. */
  chat: "https://t.me/your_handle",
};

export const NAV = [
  { href: "/catalog", label: "Каталог", note: "все концепты картотеки" },
  { href: "/paths", label: "Маршруты", note: "куда идти и в каком порядке" },
  { href: "/atlas", label: "Атлас", note: "карта связей между концептами" },
  { href: "/glossary", label: "Словарь", note: "термины и короткие определения" },
  { href: "/start", label: "Старт", note: "как пользоваться картотекой" },
];

export const TYPE_META = {
  recipe: {
    label: "Рецепт",
    pluralLabel: "рецепты",
    plural: "recipes",
    href: "/recipes",
    color: "var(--dom-tools)",
  },
  guide: {
    label: "Гайд",
    pluralLabel: "гайды",
    plural: "guides",
    href: "/guides",
    color: "var(--dom-agents)",
  },
  note: {
    label: "Заметка",
    pluralLabel: "заметки",
    plural: "notes",
    href: "/notes",
    color: "var(--dom-context)",
  },
} as const;

export type PostType = keyof typeof TYPE_META;

export const LEVEL_META = {
  easy: { label: "легко", dots: 1 },
  medium: { label: "средне", dots: 2 },
  hard: { label: "хардкор", dots: 3 },
} as const;

/** Ссылки-заглушки не показываем на опубликованном сайте. */
export const isPlaceholderLink = (href: string) => href.includes("your_handle");
