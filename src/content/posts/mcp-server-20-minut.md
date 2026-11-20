---
title: "MCP-сервер за 20 минут: от пустого репозитория до подключения"
description: "Собрать свой сервер, подключить к клиенту и не потерять полдня на трёх типичных ошибках."
date: 2026-11-07
type: guide
tags: ["mcp", "agents", "typescript"]
level: medium
time: "15 мин"
tools: ["Node 22", "MCP SDK", "Claude Code"]
---

MCP — это способ дать модели инструменты, которые живут отдельно от неё: файлы, база, внутренний API, ваш CRM. Вместо того чтобы описывать интеграцию в промпте, вы поднимаете маленький сервер и подключаете его к клиенту.

Ниже — минимальный рабочий путь. Node 22, TypeScript, stdio-транспорт. Без Docker, OAuth и облака: сначала пусть заработает локально.

## Что понадобится

- Node.js 22+
- любой MCP-клиент (Claude Code, Cursor, Claude Desktop)
- 20 минут и один терминал

## Шаг 1. Пустой проект

```bash
mkdir mcp-notes && cd mcp-notes
npm init -y
npm i @modelcontextprotocol/sdk zod
npm i -D typescript tsx @types/node
npx tsc --init --module nodenext --moduleResolution nodenext \
  --target es2022 --outDir dist --rootDir src --strict
mkdir src
```

В `package.json` добавьте `"type": "module"` и скрипты:

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/server.ts",
    "inspect": "npx @modelcontextprotocol/inspector tsx src/server.ts"
  }
}
```

## Шаг 2. Сервер

Сервер — это набор инструментов с типизированными входами. Схема `zod` превращается в JSON Schema, которую видит модель.

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const NOTES_DIR = join(process.env.HOME ?? "", "notes");

const server = new McpServer({
  name: "notes",
  version: "1.0.0",
});

server.registerTool(
  "list_notes",
  {
    title: "Список заметок",
    description: "Возвращает имена markdown-файлов в каталоге заметок.",
    inputSchema: {
      prefix: z.string().optional().describe("Фильтр по началу имени"),
    },
  },
  async ({ prefix }) => {
    const files = (await readdir(NOTES_DIR))
      .filter((f) => f.endsWith(".md"))
      .filter((f) => (prefix ? f.startsWith(prefix) : true));

    return {
      content: [{ type: "text", text: files.join("\n") || "пусто" }],
    };
  },
);

server.registerTool(
  "read_note",
  {
    title: "Прочитать заметку",
    description: "Возвращает содержимое заметки по имени файла.",
    inputSchema: {
      name: z.string().describe("Имя файла, например ideas.md"),
    },
  },
  async ({ name }) => {
    const safe = name.replace(/\.\./g, "").replace(/^\/+/, "");
    try {
      const text = await readFile(join(NOTES_DIR, safe), "utf8");
      return { content: [{ type: "text", text }] };
    } catch {
      return { content: [{ type: "text", text: "не найдено" }] };
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("notes MCP запущен");
```

Последняя строка важна: **логи только в stderr**. Stdout занят протоколом.

## Шаг 3. Сборка и проверка

```bash
npm run build
npm run inspect
```

Откроется Inspector: список инструментов, поля ввода, вызов. Если инструменты видны и отрабатывают — сервер живой. Не подключайте к основному клиенту, пока не проверили здесь: отлаживать в чате дороже.

## Шаг 4. Подключение

Claude Code:

```bash
claude mcp add notes -- node /абсолютный/путь/mcp-notes/dist/server.js
```

Cursor / Claude Desktop — JSON:

```json
{
  "mcpServers": {
    "notes": {
      "command": "node",
      "args": ["/абсолютный/путь/mcp-notes/dist/server.js"],
      "env": { "NOTES_DIR": "/home/me/notes" }
    }
  }
}
```

Перезапустите клиент и проверьте `/mcp`. Инструменты должны появиться с описаниями.

## Три ошибки, которые съедают время

**1. `console.log` в сервере.** Любой вывод в stdout ломает JSON-RPC. Симптом: клиент пишет «сервер не отвечает», а руками всё работает. Всегда `console.error`.

**2. Относительные пути.** Клиент запускает процесс из своей рабочей директории. `./dist/server.js` не найдётся. Только абсолютные пути или `process.execPath`.

**3. Слишком широкие инструменты.** `run_command`, `query_database`, `do_anything` — модель не понимает границ и начинает импровизировать. Дробите: `list_notes`, `read_note`, `search_notes`. Один инструмент — одно действие.

## Что дальше

| Транспорт | Когда использовать |
| --- | --- |
| `stdio` | локально, один клиент, прототип |
| HTTP + SSE | несколько клиентов, удалённый сервер |
| Streamable HTTP | прод, стриминг, авторизация |

<div class="callout callout--warn">
<p><strong>Безопасность:</strong> MCP-сервер выполняется с вашими правами. Не подключайте чужой сервер, пока не прочитали, какие инструменты он регистрирует. Особенно если в описании есть «execute», «shell» или «fetch any URL».</p>
</div>

## Чек-лист

- [ ] инструменты видны в Inspector
- [ ] все пути абсолютные
- [ ] в stdout нет ничего, кроме протокола
- [ ] у каждого инструмента есть `description` и `inputSchema`
- [ ] на опасные операции есть подтверждение или dry-run
- [ ] секреты приходят через env, а не из файла в репозитории

Когда MCP-серверов станет несколько, их описания начнут занимать заметную часть контекста. Следующий шаг — [Tool Search](/guides/tool-search-mcp): он оставляет в промпте один поисковик и подгружает только нужные инструменты.

Начните с одного инструмента, который реально экономит вам время ежедневно. Не с десяти. С одного.
