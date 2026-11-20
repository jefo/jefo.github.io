export const SITE = {
  /** Короткое имя бренда. Меняется в одном месте — подставляется в шапку, подвал, meta. */
  title: "native/",
  /** Часть после слэша в логотипе. */
  mark: "native",
  tagline: "Полевой журнал об инженерии ПО",
  description:
    "native/ — журнал об инженерии ПО в эпоху супер-интеллекта. Разбираем ИИ-инструменты, код и инженерное мышление. Миссия — повышение ИИ-грамотности.",
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
  { href: "/recipes", label: "Рецепты", note: "приёмы и конфиги" },
  { href: "/guides", label: "Гайды", note: "разборы и процессы" },
  { href: "/notes", label: "Архив", note: "все материалы" },
  { href: "/start", label: "Старт", note: "маршрут на пять шагов" },
  { href: "/about", label: "Журнал", note: "о журнале" },
];

export const TYPE_META = {
  recipe: {
    label: "Рецепт",
    pluralLabel: "рецепты",
    plural: "recipes",
    href: "/recipes",
    color: "var(--tok-str)",
  },
  guide: {
    label: "Гайд",
    pluralLabel: "гайды",
    plural: "guides",
    href: "/guides",
    color: "var(--tok-fn)",
  },
  note: {
    label: "Заметка",
    pluralLabel: "заметки",
    plural: "notes",
    href: "/notes",
    color: "var(--tok-num)",
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
