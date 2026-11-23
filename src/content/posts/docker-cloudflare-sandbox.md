---
title: "Docker · Cloudflare Workers: своя песочница для Code Mode"
description: "Два рабочих рецепта своей code execution: Docker с запретом сети и Cloudflare Dynamic Worker с capability-биндингами. Код, границы и что выбрать."
short: "Своя песочница"
uid: "AI-011"
date: 2026-11-22
format: recipe
kind: "technique"
domains: ["practice", "tools"]
tags: ["code-execution", "sandbox", "docker", "cloudflare", "workers", "tools", "security"]
level: hard
time: "14 мин"
tools: ["Docker", "Cloudflare Workers"]
---

Встроенная песочница Anthropic удобна, пока ты работаешь с Claude. Своя модель, данные внутри контура, нестандартный рантайм или цена за час контейнера — и нужен свой Code Runtime. Принцип тот же: код модели исполняется отдельно, инструменты вызывает шлюз, наверх возвращается только отфильтрованный результат.

Ниже два рецепта. **Docker** — когда нужен полный Linux и контроль над образом. **Cloudflare Workers** — когда код вызывает только твои методы и хочется обойтись без контейнера.

## Что должно быть на схеме

Три границы, без которых рецепт превращается в «запустим код модели на сервере»:

1. **Код не имеет сети.** Иначе он сходит куда угодно сам, а не через твой шлюз.
2. **Секреты не входят в песочницу.** Ключи, токены и права остаются в бэкенде.
3. **Наружу уходит результат, а не сырьё.** 15 ответов остаются внутри, модель получает 3 сбоя.

<figure class="diagram">
<div class="diagram__head">
<span class="diagram__kicker">схема 01</span>
<span class="diagram__title">Где проходит граница</span>
</div>
<p class="diagram__hint">прокрути схему →</p>
<div class="diagram__scroll">
<svg viewBox="0 0 880 380" role="img" aria-labelledby="sb-fig1-title sb-fig1-desc">
<title id="sb-fig1-title">Архитектура своей песочницы для code mode</title>
<desc id="sb-fig1-desc">Модель пишет скрипт, скрипт исполняется в песочнице без сети и ключей. Вызовы инструментов уходят в шлюз, который хранит права и секреты. В модель возвращаются только отфильтрованные сбои.</desc>
<defs>
<marker id="sb-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0 0 L8 4 L0 8 Z" fill="var(--line-strong)"/>
</marker>
<marker id="sb-arrow-a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0 0 L8 4 L0 8 Z" fill="var(--accent-text)"/>
</marker>
</defs>
<rect class="dgm-box dgm-box--accent" x="20" y="140" width="120" height="66" rx="4"/>
<text class="dgm-t dgm-t--b" x="80" y="168" text-anchor="middle">МОДЕЛЬ</text>
<text class="dgm-t dgm-t--micro" x="80" y="186" text-anchor="middle">пишет код</text>
<rect class="dgm-dash" x="220" y="96" width="250" height="158" rx="6"/>
<text class="dgm-t dgm-t--micro dgm-t--a" x="236" y="118">ПЕСОЧНИЦА</text>
<text class="dgm-t dgm-t--b dgm-t--sans" x="236" y="142">код модели</text>
<text class="dgm-t dgm-t--micro" x="236" y="166">нет сети</text>
<text class="dgm-t dgm-t--micro" x="236" y="184">нет ключей</text>
<text class="dgm-t dgm-t--micro" x="236" y="202">нет доступа к хосту</text>
<text class="dgm-t dgm-t--micro" x="236" y="230">15 вызовов · filter()</text>
<rect class="dgm-box" x="550" y="96" width="170" height="158" rx="4"/>
<text class="dgm-t dgm-t--b" x="566" y="118">ШЛЮЗ</text>
<text class="dgm-t dgm-t--micro" x="566" y="142">твои права</text>
<text class="dgm-t dgm-t--micro" x="566" y="160">секреты</text>
<text class="dgm-t dgm-t--micro" x="566" y="178">allow-list</text>
<text class="dgm-t dgm-t--micro dgm-t--a" x="566" y="204">check_service()</text>
<text class="dgm-t dgm-t--micro" x="566" y="236">ключи не в песочнице</text>
<rect class="dgm-box dgm-box--soft" x="760" y="96" width="100" height="158" rx="4"/>
<text class="dgm-t dgm-t--b" x="810" y="118" text-anchor="middle">15 API</text>
<circle cx="790" cy="146" r="3" fill="var(--line-strong)"/>
<circle cx="810" cy="146" r="3" fill="var(--line-strong)"/>
<circle cx="830" cy="146" r="3" fill="var(--line-strong)"/>
<circle cx="790" cy="166" r="3" fill="var(--line-strong)"/>
<circle cx="810" cy="166" r="3" fill="var(--line-strong)"/>
<circle cx="830" cy="166" r="3" fill="var(--line-strong)"/>
<circle cx="790" cy="186" r="3" fill="var(--line-strong)"/>
<circle cx="810" cy="186" r="3" fill="var(--line-strong)"/>
<circle cx="830" cy="186" r="3" fill="var(--line-strong)"/>
<circle cx="790" cy="206" r="3" fill="var(--line-strong)"/>
<circle cx="810" cy="206" r="3" fill="var(--line-strong)"/>
<circle cx="830" cy="206" r="3" fill="var(--line-strong)"/>
<circle cx="790" cy="226" r="3" fill="var(--line-strong)"/>
<circle cx="810" cy="226" r="3" fill="var(--line-strong)"/>
<circle cx="830" cy="226" r="3" fill="var(--line-strong)"/>
<line class="dgm-wire" x1="140" y1="173" x2="212" y2="173" marker-end="url(#sb-arrow)"/>
<text class="dgm-t dgm-t--micro" x="176" y="165" text-anchor="middle">скрипт</text>
<line class="dgm-wire" x1="470" y1="152" x2="542" y2="152" marker-end="url(#sb-arrow)"/>
<text class="dgm-t dgm-t--micro" x="506" y="144" text-anchor="middle">tool_call</text>
<line class="dgm-wire dgm-wire--thin" x1="550" y1="196" x2="478" y2="196" marker-end="url(#sb-arrow)"/>
<text class="dgm-t dgm-t--micro" x="514" y="212" text-anchor="middle">tool_result</text>
<line class="dgm-wire" x1="720" y1="152" x2="752" y2="152" marker-end="url(#sb-arrow)"/>
<line class="dgm-wire" x1="720" y1="196" x2="752" y2="196" marker-end="url(#sb-arrow)"/>
<path class="dgm-wire dgm-wire--accent" d="M345 254 V304 H80 V214" fill="none" marker-end="url(#sb-arrow-a)"/>
<text class="dgm-t dgm-t--micro dgm-t--a" x="212" y="296" text-anchor="middle">3 сбоя вместо 15 JSON</text>
</svg>
</div>
<figcaption>Модель не видит ни вызовов, ни сырых ответов. <b>Наружу возвращается только результат фильтра</b>, а ключи и права остаются в шлюзе.</figcaption>
</figure>

## Docker: 15 минут до рабочей песочницы

Песочница — это контейнер, который читает код из stdin, пишет вызовы инструментов в stdout и ждёт ответы обратно в stdin. Никакой сети: инструменты вызываются на хосте.

<div class="callout callout--objection">
<p><strong>«Это же прототип, потом закрою».</strong> Потом — это когда привычка уже закрепилась. <code>--network=none</code> и <code>--user</code> добавляются одной строкой сейчас; через месяц ты будешь добавлять их в спешке перед демо.</p>
<p><strong>Шаг:</strong> добавь эти два флага в первый же <code>docker run</code>, до того как код модели что-то прочитает.</p>
</div>

### Жёсткий запуск

```bash
docker run --rm -i \
  --network=none \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=32m \
  --user 65534:65534 \
  --cap-drop=ALL \
  --security-opt=no-new-privileges \
  --pids-limit=64 \
  --memory=256m --memory-swap=256m \
  --cpus=1 \
  -v "$PWD/runner.py:/sandbox/runner.py:ro" \
  python:3.12-slim \
  python -I -B /sandbox/runner.py
```

| Флаг | Зачем |
| --- | --- |
| `--network=none` | у кода нет egress: только твой шлюз |
| `--read-only` | корневая ФС не меняется |
| `--tmpfs /tmp` | единственное место записи, без `exec` |
| `--user 65534:65534` | процесс не root |
| `--cap-drop=ALL` | никаких Linux capabilities |
| `--security-opt=no-new-privileges` | нельзя повысить права |
| `--pids-limit=64` | защита от fork bomb |
| `--memory` / `--cpus` | потолок ресурсов |
| `-v runner.py:ro` | каркас только на чтение |
| `python -I -B` | изолированный режим, без `__pycache__` |

<div class="callout callout--warn">
<p><strong>Не монтируй Docker-сокет.</strong> <code>-v /var/run/docker.sock:...</code> превращает песочницу в root на хосте. Также не передавай ключи через переменные окружения: <code>docker inspect</code> покажет их тому, у кого есть доступ к демону.</p>
</div>

### Протокол: JSON-строки в обе стороны

- Хост пишет одну строку `{"type":"init","tools":[...],"code":"..."}`.
- Песочница отвечает `{"type":"tool_call","name":"check_service","args":{...}}`.
- Хост возвращает `{"type":"tool_result","content":"{...}"}`.
- В конце песочница пишет `{"type":"final","result":[...]}`.

Инструменты появляются в коде как async-функции Python. Контракт для модели: **определи `async def main()` и верни JSON-сериализуемый результат**.

```js
const { result } = await runInSandbox(
  `
async def main():
    names = ["search", "auth", "payments", "catalog", "orders"]
    raw = await asyncio.gather(*[check_service({"name": n}) for n in names])
    rows = [json.loads(r) for r in raw]
    print("checked", len(rows))
    return [r for r in rows if r["status"] != 200 or r["ms"] > 500]
`,
  {
    check_service: async ({ name }) => {
      const started = Date.now();
      const res = await fetch(`https://status.internal/${name}`, {
        headers: { authorization: `Bearer ${process.env.STATUS_TOKEN}` },
        signal: AbortSignal.timeout(5_000),
      });
      return JSON.stringify({
        name,
        status: res.status,
        ms: Date.now() - started,
      });
    },
  },
);
```

В контекст модели уходит `result` — три объекта. `stdout` с `"checked 15"` остаётся диагностикой.

### Полный каркас

`bridge.mjs` запускает Docker, обслуживает вызовы и убивает контейнер по таймауту. `runner.py` держит один поток чтения stdin: несколько параллельных `readline()` на одном `TextIOWrapper` зависают.

<details>
<summary>bridge.mjs · хост-сторона</summary>

```js
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

const RUNNER = "/sandbox/runner.py";
const RUNNER_PATH = fileURLToPath(new URL("./runner.py", import.meta.url));

const dockerArgs = (name) => [
  "run", "--rm", "-i", "--name", name,
  "--network=none",
  "--read-only",
  "--tmpfs", "/tmp:rw,noexec,nosuid,size=32m",
  "--user", "65534:65534",
  "--cap-drop=ALL",
  "--security-opt=no-new-privileges",
  "--pids-limit=64",
  "--memory=256m", "--memory-swap=256m",
  "--cpus=1",
  "-v", `${RUNNER_PATH}:${RUNNER}:ro`,
  "python:3.12-slim",
  "python", "-I", "-B", RUNNER,
];

export function runInSandbox(code, tools, { timeoutMs = 60_000 } = {}) {
  const name = `code-sandbox-${crypto.randomUUID()}`;

  return new Promise((resolve, reject) => {
    const child = spawn("docker", dockerArgs(name), {
      stdio: ["pipe", "pipe", "pipe"],
    });
    const lines = readline.createInterface({ input: child.stdout });
    let settled = false;

    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      spawn("docker", ["kill", name], { stdio: "ignore" });
      child.kill("SIGKILL");
      fn(value);
    };

    const timer = setTimeout(
      () => finish(reject, new Error("sandbox timeout")),
      timeoutMs,
    );

    child.on("error", (error) => finish(reject, error));
    child.on("close", (code) => {
      finish(reject, new Error(`sandbox closed without a result (${code})`));
    });
    child.stderr.on("data", (chunk) => process.stderr.write(chunk));

    lines.on("line", async (line) => {
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        return;
      }

      if (message.type === "final") {
        finish(resolve, message);
        return;
      }
      if (message.type !== "tool_call") return;

      let content;
      try {
        const tool = tools[message.name];
        if (!tool) throw new Error(`unknown tool: ${message.name}`);
        content = String(await tool(message.args));
      } catch (error) {
        content = JSON.stringify({ error: String(error) });
      }
      const reply = JSON.stringify({ type: "tool_result", content });
      child.stdin.write(reply + "\n");
    });

    const init = JSON.stringify({ type: "init", tools: Object.keys(tools), code });
    child.stdin.write(init + "\n");
  });
}
```

</details>

<details>
<summary>runner.py · песочница</summary>

```python
import asyncio
import contextlib
import io
import json
import queue
import sys
import threading

PROTO = sys.__stdout__  # канал протокола, его не перехватываем
inbox = queue.Queue()


def send(message):
    PROTO.write(json.dumps(message, ensure_ascii=False) + "\n")
    PROTO.flush()


def read_stdin():
    for line in sys.stdin:
        inbox.put(line.strip())


def make_tool(name):
    async def call(args):
        send({"type": "tool_call", "name": name, "args": args})
        line = await asyncio.to_thread(inbox.get)
        reply = json.loads(line)
        if reply.get("type") != "tool_result":
            raise RuntimeError(f"protocol error for {name}")
        return reply["content"]

    call.__name__ = name
    return call


async def main():
    init = json.loads(sys.stdin.readline())
    threading.Thread(target=read_stdin, daemon=True).start()
    scope = {name: make_tool(name) for name in init["tools"]}
    scope.update(asyncio=asyncio, json=json)

    output = io.StringIO()
    with contextlib.redirect_stdout(output):
        exec(init["code"], scope)
        entry = scope.get("main")
        if entry is None:
            raise RuntimeError("define `async def main()`")
        result = entry()
        if asyncio.iscoroutine(result):
            result = await result

    try:
        json.dumps(result)
    except TypeError:
        result = str(result)

    send({"type": "final", "result": result, "stdout": output.getvalue()})


asyncio.run(main())
```

</details>

Каркас намеренно короткий: в продакшене добавь лимит размера строки, метрики и очередь запусков. Главное — граница, а не количество обвязки.

### Что ломается на практике

**Код печатает в stdout.** Он сломает протокол, если писать напрямую. `redirect_stdout` уводит вывод модели в буфер, а протокол идёт через `sys.__stdout__`.

**Параллельные вызовы зависают.** Один поток читает stdin и складывает строки в очередь, а корутины ждут `queue.get()`. Это не оптимизация, а условие работы `asyncio.gather`.

**`while True: pass` не убивается лимитом памяти.** Нужен внешний wall-clock таймаут и `SIGKILL`, как в `bridge.mjs`. `--cpus=1` только замедлит цикл.

**Огромный ответ инструмента.** Ограничь размер строки и итогового `result` до разумных килобайт. Иначе «экономия контекста» превратится в передачу гигабайта по pipe.

**Нужен пакет.** `--network=none` не даст `pip install`. Собери образ с зависимостями заранее; версия Python фиксируется образом, а не хостом.

## Cloudflare Workers: без контейнера

<div class="callout callout--objection">
<p><strong>«Мне нужен обычный контейнер, зачем эти биндинги?»</strong> Затем, что контейнеру для вызовов инструментов всё равно нужен мост с токеном и правами. Dynamic Worker даёт этот мост из коробки — и только те методы, которые ты передал.</p>
<p><strong>Шаг:</strong> если код не запускает бинарники и не ставит пакеты, начни с Dynamic Worker. Контейнер оставь на потом.</p>
</div>

Если код вызывает только твои методы, Linux не нужен. **Dynamic Worker** — это V8-isolate, который получает ровно те биндинги, которые ты передал. Модель пишет JavaScript, вызывает `tools.check_service()`, а ключи остаются в loader-Worker.

Сначала биндинг инструментов. Класс экспортируется из того же Worker и получает `props` — список разрешённых сервисов:

```ts
import { WorkerEntrypoint } from "cloudflare:workers";

type Env = { LOADER: WorkerLoader; STATUS_TOKEN: string };
type Props = { allowed: string[] };

export class Tools extends WorkerEntrypoint<Env, Props> {
  async check_service({ name }: { name: string }): Promise<string> {
    if (!this.ctx.props.allowed.includes(name)) {
      throw new Error(`service ${name} is not allowed`);
    }

    const started = Date.now();
    const res = await fetch(`https://status.example.com/${name}`, {
      headers: { authorization: `Bearer ${this.env.STATUS_TOKEN}` },
      signal: AbortSignal.timeout(5_000),
    });

    return JSON.stringify({
      name,
      status: res.status,
      ms: Date.now() - started,
    });
  }
}
```

Теперь загрузчик: он оборачивает код модели в `WorkerEntrypoint`, передаёт биндинг и запрещает сеть.

```ts
const ALLOWED = ["search", "auth", "payments", "catalog", "orders"];

// Tools и загрузчик живут в одном src/index.ts:
// ctx.exports видит только экспорты этого файла
const planModule = (code: string) => `
  import { WorkerEntrypoint } from "cloudflare:workers";

  export class Plan extends WorkerEntrypoint {
    async run() {
      const tools = this.env.TOOLS;
      return await (async () => {
        ${code}
      })();
    }
  }
`;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const { code } = (await request.json()) as { code: string };

    const worker = env.LOADER.load({
      compatibilityDate: "2026-11-22",
      mainModule: "plan.js",
      modules: { "plan.js": planModule(code) },
      env: {
        TOOLS: ctx.exports.Tools({ props: { allowed: ALLOWED } }),
      },
      globalOutbound: null,
      limits: { cpuMs: 200 },
    });

    const plan = worker.getEntrypoint<
      WorkerEntrypoint & { run(): Promise<unknown> }
    >("Plan");
    const result = await plan.run();

    return Response.json({ result });
  },
};
```

Код, который пишет модель:

```js
const names = ["search", "auth", "payments", "catalog", "orders"];
const raw = await Promise.all(names.map((name) => tools.check_service({ name })));
const rows = raw.map((row) => JSON.parse(row));
return rows.filter((row) => row.status !== 200 || row.ms > 500);
```

Конфиг Wrangler:

```jsonc
{
  "main": "src/index.ts",
  "compatibility_date": "2026-11-22",
  "worker_loaders": [{ "binding": "LOADER" }]
}
```

Секрет — `wrangler secret put STATUS_TOKEN`. В `props` его нет: динамический Worker видит только методы `Tools`, но не окружение loader-Worker.

Что даёт эта конструкция:

- `globalOutbound: null` блокирует `fetch()` и `connect()`; остаётся только RPC к биндингам.
- `props.allowed` сужает список сервисов: код не может попросить чужой.
- `limits.cpuMs` ограничивает CPU, но не wall-clock: таймауты на `fetch` всё равно нужны.
- `WorkerEntrypoint` не наследует биндинги, данные и ключи родителя. Только то, что явно передали.

<div class="callout">
<p><strong>Code Mode как паттерн в документации Cloudflare помечен экспериментальным.</strong> API Worker Loader и Dynamic Workers описаны как рабочая поверхность, но перед продакшеном проверь changelog и закрепи версию Wrangler.</p>
</div>

### Если всё-таки нужен Linux

Dynamic Worker не запускает дочерние процессы и нативные модули, не грузит произвольные пакеты. Для `npm test`, `ffmpeg` или Python-библиотек нужен контейнер. На Cloudflare это Durable Object с контейнером:

```ts
import { DurableObject } from "cloudflare:workers";

// Env приходит из `wrangler types`
export class Runner extends DurableObject<Env> {
  async run(code: string) {
    const container = this.ctx.container;
    if (!container) throw new Error("no container configured");

    if (!container.running) {
      container.start({
        image: "cloudflare/debian-trixie",
        entrypoint: ["sleep", "infinity"],
        enableInternet: false,
      });
    }

    // контракт контейнера: код печатает JSON в stdout
    const proc = await container.exec([
      "node",
      "--input-type=module",
      "-e",
      code,
    ]);
    const output = await proc.output();

    return {
      stdout: new TextDecoder().decode(output.stdout),
      exitCode: output.exitCode,
    };
  }
}
```

У контейнера другой контракт: код печатает JSON в stdout, а не делает `return`. Для длинных скриптов передавай файл, а не `-e`.

Здесь есть цена: контейнер стартует секунды, а для вызовов инструментов нужен узкий HTTP-мост с одноразовым токеном. При выключенном интернете внешний HTTP-мост недоступен: его придётся открывать отдельно или передавать данные внутрь заранее. Поэтому для «код вызывает методы» бери Dynamic Worker, а контейнер оставь для Linux-задач.

## Что выбрать

<figure class="diagram">
<div class="diagram__head">
<span class="diagram__kicker">схема 02</span>
<span class="diagram__title">Решение за две развилки</span>
</div>
<p class="diagram__hint">прокрути схему →</p>
<div class="diagram__scroll">
<svg viewBox="0 0 880 340" role="img" aria-labelledby="sb-fig2-title sb-fig2-desc">
<title id="sb-fig2-title">Выбор между Dynamic Worker, Docker и Cloudflare Container</title>
<desc id="sb-fig2-desc">Если коду не нужен Linux, подходит Dynamic Worker. Если нужен Linux, выбирают Docker на своём хосте или контейнер Cloudflare.</desc>
<defs>
<marker id="sb-dec-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0 0 L8 4 L0 8 Z" fill="var(--line-strong)"/>
</marker>
<marker id="sb-dec-arrow-a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0 0 L8 4 L0 8 Z" fill="var(--accent-text)"/>
</marker>
</defs>
<rect class="dgm-box" x="20" y="120" width="250" height="88" rx="4"/>
<text class="dgm-t dgm-t--b dgm-t--sans" x="145" y="150" text-anchor="middle">Коду нужен Linux?</text>
<text class="dgm-t dgm-t--micro" x="145" y="172" text-anchor="middle">pip · ffmpeg · бинарники</text>
<text class="dgm-t dgm-t--micro" x="145" y="190" text-anchor="middle">npm test · файлы</text>
<path class="dgm-wire" d="M270 164 H315 V84 H352" fill="none" marker-end="url(#sb-dec-arrow)"/>
<text class="dgm-t dgm-t--micro" x="320" y="78">нет</text>
<path class="dgm-wire" d="M270 164 H315 V250 H352" fill="none" marker-end="url(#sb-dec-arrow)"/>
<text class="dgm-t dgm-t--micro" x="320" y="244">да</text>
<rect class="dgm-box dgm-box--accent" x="360" y="44" width="500" height="80" rx="4"/>
<text class="dgm-t dgm-t--b dgm-t--sans" x="380" y="70">Dynamic Worker</text>
<text class="dgm-t dgm-t--micro" x="380" y="92">V8 isolate · без Linux · capability bindings</text>
<text class="dgm-t dgm-t--micro" x="380" y="110">сеть выключена · секреты остаются в бэкенде</text>
<rect class="dgm-box" x="360" y="214" width="230" height="76" rx="4"/>
<text class="dgm-t dgm-t--b dgm-t--sans" x="378" y="240">Docker</text>
<text class="dgm-t dgm-t--micro" x="378" y="260">свой хост · --network=none</text>
<text class="dgm-t dgm-t--micro" x="378" y="278">любой образ · полный Linux</text>
<rect class="dgm-box" x="620" y="214" width="240" height="76" rx="4"/>
<text class="dgm-t dgm-t--b dgm-t--sans" x="638" y="240">Cloudflare Container</text>
<text class="dgm-t dgm-t--micro" x="638" y="260">Firecracker microVM · edge</text>
<text class="dgm-t dgm-t--micro" x="638" y="278">enableInternet: false</text>
<text class="dgm-t dgm-t--micro" x="605" y="206" text-anchor="middle">или</text>
</svg>
</div>
<figcaption>Развилка простая: если код только вызывает твои методы — <b>Dynamic Worker</b>. Если нужен Linux — контейнер, но мост к инструментам придётся строить отдельно.</figcaption>
</figure>

| | Anthropic | Docker | Dynamic Worker | Cloudflare Container |
| --- | --- | --- | --- | --- |
| Рантайм | Python 3.11, Bash | любой образ | JavaScript | любой образ |
| Изоляция | контейнер Anthropic | контейнер + ядро хоста | V8 isolate | Firecracker microVM |
| Старт | серверный, без твоих действий | секунды | без VM | секунды |
| Сеть | выключена | `--network=none` | outbound `null` | internet `false` |
| Секреты | у тебя, в `tool_result` | в шлюзе на хосте | в биндинге loader-Worker | в Worker, не в VM |
| Мост к инструментам | API уже делает | JSON-lines по stdin | RPC-биндинг | нужен HTTP-мост |
| Когда брать | работаешь с Claude | свой контур, Linux | код вызывает методы | Linux на edge |

## Чек-лист

- [ ] код модели не имеет сети: `--network=none` или `globalOutbound: null`;
- [ ] секреты не передаются в песочницу ни файлом, ни env;
- [ ] инструменты вызываются через шлюз с allow-list;
- [ ] есть wall-clock таймаут и `SIGKILL`, а не только лимит памяти;
- [ ] stdout модели не смешан с протоколом;
- [ ] размер `tool_result` и финального результата ограничен;
- [ ] зависимости запечены в образ, а не ставятся на лету;
- [ ] проверено, что модель получает только отфильтрованный итог.

## Источники

- [Cloudflare: Sandboxes — выбери окружение](https://developers.cloudflare.com/sandbox/concepts/)
- [Cloudflare: Dynamic Workers — bindings](https://developers.cloudflare.com/dynamic-workers/usage/bindings/)
- [Cloudflare: Worker Loader API](https://developers.cloudflare.com/dynamic-workers/api-reference/)
- [Cloudflare: Code Mode](https://developers.cloudflare.com/agents/tools/codemode/)
- [Cloudflare: Run a Linux command](https://developers.cloudflare.com/sandbox/get-started/)
- [Docker: `docker run` security options](https://docs.docker.com/engine/containers/run/)

Механику встроенной песочницы Anthropic разбирает [краткое руководство по Code Execution](/concepts/anthropic-code-execution). Если пока не решено, нужен ли вообще код вместо обычных вызовов, начни с [«Контекстное окно — это бюджет, а не склад»](/concepts/context-budget).
