/**
 * Картотека native/.
 *
 * Здесь живёт структура хаба: направления, маршруты, словарь и шифры
 * концептов. Контент — в src/content/posts, здесь только рамка.
 */

export type DomainId = "context" | "agents" | "tools" | "practice";

export interface Domain {
  id: DomainId;
  /** Порядковый номер направления. */
  index: string;
  /** Префикс шифра концепта: K-01, A-01, T-01, P-01. */
  code: string;
  name: string;
  tagline: string;
  description: string;
  /** Материал плашки: класс .plate--felt и т.п. */
  material: "felt" | "steel" | "rubber" | "kraft";
  icon: "context" | "loop" | "plug" | "nib";
  /** CSS-переменная цвета направления. */
  color: string;
}

export const DOMAINS: Domain[] = [
  {
    id: "context",
    index: "01",
    code: "K",
    name: "Контекст",
    tagline: "Бюджет внимания модели",
    description:
      "Окно, внимание, бюджет. Что модель видит, почему середина окна проваливается и как удержать смысл.",
    material: "felt",
    icon: "context",
    color: "var(--dom-context)",
  },
  {
    id: "agents",
    index: "02",
    code: "A",
    name: "Агенты",
    tagline: "Контракты и границы",
    description:
      "Файлы правил, спеки и границы. Как превратить намерение в проверяемое поведение агента.",
    material: "steel",
    icon: "loop",
    color: "var(--dom-agents)",
  },
  {
    id: "tools",
    index: "03",
    code: "T",
    name: "Инструменты",
    tagline: "MCP, поиск, локальный контур",
    description:
      "MCP-серверы, tool search и модели на своём железе. Инструменты должны расширять агента, а не забивать контекст.",
    material: "rubber",
    icon: "plug",
    color: "var(--dom-tools)",
  },
  {
    id: "practice",
    index: "04",
    code: "P",
    name: "Практика",
    tagline: "Приёмы, которые применяются",
    description:
      "Паттерны и чек-листы, которые пережили не один проект. Берите и применяйте в следующей задаче.",
    material: "kraft",
    icon: "nib",
    color: "var(--dom-practice)",
  },
];

export const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map((d) => [d.id, d])) as Record<
  DomainId,
  Domain
>;

export interface RouteStep {
  /** id поста без расширения. */
  post: string;
  note: string;
}

export interface Route {
  slug: string;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  audience: string;
  domain: DomainId;
  outcomes: string[];
  steps: RouteStep[];
}

export const ROUTES: Route[] = [
  {
    slug: "first-contact",
    code: "R-01",
    title: "Первый контакт",
    subtitle: "Собрать рабочий процесс с агентом",
    description:
      "Пять карточек от «сделай фичу» до предсказуемого процесса: контракт проекта, бюджет контекста, спека, свой инструмент и гигиена сессий.",
    audience: "Если вы только начинаете работать с агентом",
    domain: "practice",
    outcomes: [
      "Файл правил, который не хочется переписывать каждый спринт",
      "Бюджет контекста и понятные границы задачи",
      "Спека на одну страницу вместо пересказа в чате",
      "Свой MCP-инструмент и способ проверить его в Inspector",
      "Диагностика деградации агентской сессии за две минуты",
    ],
    steps: [
      {
        post: "claude-md-recept",
        note: "Начните с контракта: команды, границы, definition of done.",
      },
      {
        post: "context-budget",
        note: "Разложите окно по статьям, прежде чем добавлять код.",
      },
      {
        post: "spec-driven",
        note: "Закройте зазор между «что сказал» и «что имел в виду».",
      },
      {
        post: "mcp-server-20-minut",
        note: "Подключите один инструмент, который экономит время каждый день.",
      },
      {
        post: "agent-40-shagov",
        note: "Научитесь замечать context rot до того, как он станет дорогим.",
      },
    ],
  },
  {
    slug: "context-control",
    code: "R-02",
    title: "Контекст под контролем",
    subtitle: "Перестать тонуть в окне",
    description:
      "Четыре карточки о том, что съедает внимание модели и как вернуть контекст под контроль: бюджет, деградация, tool search и подключение.",
    audience: "Если агент «поглупел» на длинной сессии",
    domain: "context",
    outcomes: [
      "Понимание, из чего состоит бюджет контекста",
      "Симптомы context rot и протокол перезапуска",
      "Tool search вместо полусотни описаний инструментов",
      "Рабочая схема с defer_loading в своём агенте",
    ],
    steps: [
      {
        post: "context-budget",
        note: "Пять правил упаковки и раскладка бюджета по статьям.",
      },
      {
        post: "agent-40-shagov",
        note: "Почему история растёт, а результат — нет.",
      },
      {
        post: "tool-search-mcp",
        note: "Как 55K токенов схем превращаются в 0,5K.",
      },
      {
        post: "tool-search-5-minut",
        note: "Подключение и проверка на реальной задаче.",
      },
    ],
  },
  {
    slug: "own-tool",
    code: "R-03",
    title: "Свой инструмент",
    subtitle: "MCP за вечер",
    description:
      "От пустого репозитория до сервера, который модель находит сама. Три карточки: собрать, объяснить, подключить динамическую загрузку.",
    audience: "Если агенту не хватает вашего контекста",
    domain: "tools",
    outcomes: [
      "MCP-сервер на Node и TypeScript",
      "Проверка инструментов в Inspector до подключения",
      "Понимание цены схем в контексте",
      "Tool search и defer_loading в рабочем клиенте",
    ],
    steps: [
      {
        post: "mcp-server-20-minut",
        note: "Минимальный сервер, три типичные ошибки и чек-лист.",
      },
      {
        post: "tool-search-mcp",
        note: "Почему описания инструментов стоят дороже, чем кажется.",
      },
      {
        post: "tool-search-5-minut",
        note: "Подключите поисковик и оставьте 3–5 частых ручек.",
      },
    ],
  },
];

/** Шифры фиксированы: на них ссылаются карточки, атлас и словарь. */
export const CONCEPT_CODES: Record<string, string> = {
  "context-budget": "K-01",
  "agent-40-shagov": "K-02",
  "tool-search-mcp": "K-03",
  "tool-search-5-minut": "K-04",
  "claude-md-recept": "A-01",
  "spec-driven": "A-02",
  "mcp-server-20-minut": "A-03",
  "local-llm-16gb": "T-01",
  "anthropic-code-execution": "T-02",
  "prompt-kritik": "P-01",
  "docker-cloudflare-sandbox": "P-02",
};

/** Короткие подписи для атласа — чтобы узлы читались без заголовков. */
export const ATLAS_LABELS: Record<string, string> = {
  "context-budget": "Бюджет контекста",
  "agent-40-shagov": "40-й шаг",
  "tool-search-mcp": "Tool Search",
  "tool-search-5-minut": "Tool Search: рецепт",
  "claude-md-recept": "CLAUDE.md",
  "spec-driven": "Spec-driven",
  "mcp-server-20-minut": "MCP за 20 минут",
  "local-llm-16gb": "Локальная модель",
  "anthropic-code-execution": "Code execution",
  "prompt-kritik": "Критик",
  "docker-cloudflare-sandbox": "Своя песочница",
};

/** Кураторские координаты атласа в viewBox 0 0 1100 700. */
export const ATLAS_POSITIONS: Record<string, { x: number; y: number }> = {
  "context-budget": { x: 170, y: 180 },
  "agent-40-shagov": { x: 320, y: 110 },
  "tool-search-mcp": { x: 180, y: 350 },
  "tool-search-5-minut": { x: 330, y: 420 },
  "claude-md-recept": { x: 540, y: 140 },
  "spec-driven": { x: 620, y: 300 },
  "mcp-server-20-minut": { x: 780, y: 170 },
  "local-llm-16gb": { x: 900, y: 350 },
  "prompt-kritik": { x: 580, y: 520 },
  "anthropic-code-execution": { x: 420, y: 240 },
  "docker-cloudflare-sandbox": { x: 790, y: 520 },
};

export interface GlossaryTerm {
  term: string;
  definition: string;
  /** id постов, где термин раскрывается. */
  posts: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "Агент",
    definition:
      "Модель, которая сама делает шаги: читает файлы, вызывает инструменты и проверяет результат. Чем длиннее сессия, тем важнее внешние границы и записанное состояние.",
    posts: ["agent-40-shagov", "spec-driven"],
  },
  {
    term: "Бюджет контекста",
    definition:
      "Распределение токенов между задачей, правилами, кодом, примерами и запасом. Не «сколько влезет», а «сколько действительно нужно на этом шаге».",
    posts: ["context-budget"],
  },
  {
    term: "Галлюцинация",
    definition:
      "Уверенный ответ, не опирающийся на контекст. В длинной агентской сессии ошибки накапливаются: следующее исправление опирается на предыдущую выдумку.",
    posts: ["agent-40-shagov"],
  },
  {
    term: "Границы",
    definition:
      "Явные запреты в файле правил: что нельзя трогать, менять и добавлять. Самый недооценённый раздел контракта, потому что именно он спасает от дрейфа задачи.",
    posts: ["claude-md-recept", "spec-driven"],
  },
  {
    term: "Context rot",
    definition:
      "Деградация из-за истории: текста больше, чем смысла. Симптомы — повтор отвергнутых решений, дрейф задачи, потеря границ и ложная уверенность.",
    posts: ["agent-40-shagov"],
  },
  {
    term: "Defer loading",
    definition:
      "Флаг, который убирает определение инструмента из контекста, пока его не найдут через tool search. Не уменьшает запрос — уменьшает промпт.",
    posts: ["tool-search-mcp", "tool-search-5-minut"],
  },
  {
    term: "Code Mode",
    definition:
      "Паттерн, при котором модель пишет код вместо серии отдельных вызовов инструментов. Циклы, условия и фильтрация остаются в песочнице, а в контекст возвращается только итог.",
    posts: ["anthropic-code-execution", "docker-cloudflare-sandbox"],
  },
  {
    term: "Programmatic tool calling",
    definition:
      "Вызов инструментов из кода внутри песочницы. Инструмент становится async-функцией, промежуточные результаты не попадают в контекст модели, но проходят через твой обработчик.",
    posts: ["anthropic-code-execution", "docker-cloudflare-sandbox"],
  },
  {
    term: "Definition of done",
    definition:
      "Проверяемый критерий закрытия задачи: тесты, typecheck, отсутствие предупреждений, размер diff. Агенту нужен явный признак «готово».",
    posts: ["claude-md-recept"],
  },
  {
    term: "Квантизация",
    definition:
      "Сжатие весов модели: Q8, Q5, Q4, Q3. Меньше памяти и быстрее ответ, но на длинных инструкциях качество заметно падает.",
    posts: ["local-llm-16gb"],
  },
  {
    term: "Контекстное окно",
    definition:
      "Лимит токенов, которые модель видит за один шаг. Внимание неравномерно: начало и конец весят больше середины, поэтому «просто добавить файл» не работает.",
    posts: ["context-budget"],
  },
  {
    term: "MCP",
    definition:
      "Model Context Protocol — способ дать модели инструменты, которые живут отдельно от неё: файлы, база, внутренний API. Вместо интеграции в промпте вы поднимаете сервер.",
    posts: ["mcp-server-20-minut"],
  },
  {
    term: "MCP-клиент",
    definition:
      "Приложение, которое запускает MCP-сервер и передаёт его инструменты модели: Claude Code, Cursor, Claude Desktop. Клиент решает, что попадёт в контекст.",
    posts: ["mcp-server-20-minut"],
  },
  {
    term: "Промпт-паттерн «Критик»",
    definition:
      "Три роли и три контекста: генератор пишет, критик ищет дыры, редактор чинит. Критик не защищает авторское решение, потому что не видел его объяснений.",
    posts: ["prompt-kritik"],
  },
  {
    term: "Спека",
    definition:
      "Одностраничный интерфейс между намерением и агентом: зачем, что должно быть, чего быть не должно, критерии готовности и открытые вопросы.",
    posts: ["spec-driven"],
  },
  {
    term: "STATE.md",
    definition:
      "Файл состояния вне чата: что сделано, что осталось и какие ограничения нельзя нарушать. Дешевле, чем сорок шагов истории.",
    posts: ["agent-40-shagov"],
  },
  {
    term: "Stdio-транспорт",
    definition:
      "Локальная связь MCP-клиента и сервера через stdin/stdout. Любой console.log в stdout ломает JSON-RPC: логи пишутся только в stderr.",
    posts: ["mcp-server-20-minut"],
  },
  {
    term: "Tool search",
    definition:
      "Динамическая загрузка инструментов: в контексте остаётся один поисковик, а нужные схемы подгружаются по запросу. Экономит описания, но не ответы инструментов.",
    posts: ["tool-search-mcp", "tool-search-5-minut"],
  },
  {
    term: "Токен",
    definition:
      "Единица текста для модели. Стоят не только сообщения: описания инструментов, история диалога и ответы тоже занимают бюджет контекста.",
    posts: ["context-budget", "tool-search-mcp"],
  },
  {
    term: "Q4_K_M",
    definition:
      "Квантизация, которая обычно даёт лучшее соотношение качества и памяти на ноутбуке с 16 ГБ. Q3 экономит гигабайт, но теряет связность.",
    posts: ["local-llm-16gb"],
  },
  {
    term: "BM25",
    definition:
      "Поисковый алгоритм для tool search по естественным запросам вроде «найди инструмент для проверки билда». Альтернатива regex для точных имён.",
    posts: ["tool-search-mcp"],
  },
  {
    term: "Regex tool search",
    definition:
      "Поиск инструментов по точным именам, префиксам и шаблонам. Хорош, когда вы знаете, как называется ручка, и не хотите угадывать формулировку.",
    posts: ["tool-search-mcp", "tool-search-5-minut"],
  },
];

export function domainById(id: string): Domain | undefined {
  return DOMAIN_BY_ID[id as DomainId];
}

/** Якорь термина в словаре. Кириллица допустима в id, но приводим к предсказуемому виду. */
export function glossarySlug(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}
