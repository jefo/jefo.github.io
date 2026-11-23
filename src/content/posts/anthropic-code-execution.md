---
title: "Anthropic Code Execution: краткое руководство"
description: "Песочница Anthropic: как включить code execution, чем отличается programmatic tool calling, как устроен контейнер, что приходит в ответе и где границы."
short: "Code Execution"
uid: "AI-010"
date: 2026-11-22
format: guide
kind: "tool"
domains: ["tools", "agents"]
tags: ["anthropic", "code-execution", "tools", "context", "sandbox", "api"]
level: medium
time: "12 мин"
tools: ["Anthropic API", "Claude"]
featured: true
---

В выпуске «Агенту не нужно думать 15 раз» агент проверяет 15 сервисов и отдаёт модели только 3 сбоя. Половина этого механизма живёт на стороне Anthropic: модель пишет код, он исполняется в контейнере, а промежуточные ответы инструментов не попадают в контекст.

Здесь — короткая инструкция: что включать, что приходит в ответе, как не сломаться на паузе и где заканчиваются обещания песочницы. Код пишет модель, исполняет Anthropic, ты не запускаешь ничего у себя.

## Коротко

- **Code execution** — серверная песочница: Python 3.11 и Bash, без интернета, 1 CPU, 5 GiB RAM, 5 GiB диска.
- **Programmatic tool calling** — надстройка: твои инструменты становятся async-функциями Python, которые код вызывает напрямую.
- Нужна версия инструмента **`code_execution_20260120`** или новее. Она добавила состояние REPL и вызов инструментов из кода.
- В контекст модели попадает только **финальный результат кода**, а не 15 сырых ответов.
- Контейнер живёт **30 дней**, но после ~5 минут бездействия уходит в чекпоинт, а ожидание ответа инструмента истекает через ~4 минуты.

## Два уровня, которые часто путают

| Что включил | Что умеет модель | Что попадает в контекст |
| --- | --- | --- |
| `code_execution` | Считает, парсит файлы, запускает Bash и Python | stdout, stderr и созданные файлы |
| `code_execution` + `allowed_callers` | Пишет код, который сам вызывает твои инструменты | Только то, что код вернул наверх |
| Обычный tool calling | Просит инструмент отдельным ходом | Каждый сырой ответ инструмента |

Разница не в том, что «модель стала умнее». Разница в том, **кто выполняет цикл**. При обычном tool calling цикл идёт через модель: вызов → ответ в контекст → следующий вызов. При programmatic calling цикл идёт через код: 15 вызовов, `filter()`, и наверх уходит результат.

<figure class="diagram">
<div class="diagram__head">
<span class="diagram__kicker">схема 01</span>
<span class="diagram__title">Куда попадают 15 ответов</span>
</div>
<p class="diagram__hint">прокрути схему →</p>
<div class="diagram__scroll">
<svg viewBox="0 0 880 460" role="img" aria-labelledby="ce-fig1-title ce-fig1-desc">
<title id="ce-fig1-title">Обычный tool calling против programmatic tool calling</title>
<desc id="ce-fig1-desc">Слева все 15 ответов сервисов попадают в контекст модели. Справа код исполняется в песочнице, и в контекст возвращаются только 3 сбоя.</desc>
<defs>
<marker id="ce-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0 0 L8 4 L0 8 Z" fill="var(--line-strong)"/>
</marker>
<marker id="ce-arrow-a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0 0 L8 4 L0 8 Z" fill="var(--accent-text)"/>
</marker>
<marker id="ce-arrow-w" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0 0 L8 4 L0 8 Z" fill="var(--tok-var)"/>
</marker>
</defs>
<rect class="dgm-panel" x="16" y="44" width="404" height="392" rx="6"/>
<text class="dgm-t dgm-t--xs dgm-t--w" x="32" y="66">БЫЛО · 15 ВЫЗОВОВ</text>
<rect class="dgm-box" x="32" y="80" width="88" height="38" rx="4"/>
<text class="dgm-t dgm-t--b" x="76" y="104" text-anchor="middle">LLM</text>
<line class="dgm-wire" x1="120" y1="99" x2="190" y2="99" marker-end="url(#ce-arrow)"/>
<text class="dgm-t dgm-t--micro" x="124" y="116">×15 вызовов</text>
<rect class="dgm-box--soft" x="196" y="76" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro" x="213" y="93" text-anchor="middle">01</text>
<rect class="dgm-box--soft" x="236" y="76" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro" x="253" y="93" text-anchor="middle">02</text>
<rect class="dgm-box--soft" x="276" y="76" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro" x="293" y="93" text-anchor="middle">03</text>
<rect class="dgm-box--soft" x="316" y="76" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro" x="333" y="93" text-anchor="middle">04</text>
<rect class="dgm-box--soft" x="356" y="76" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro" x="373" y="93" text-anchor="middle">05</text>
<rect class="dgm-box--soft" x="196" y="108" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro" x="213" y="125" text-anchor="middle">06</text>
<rect class="dgm-box--soft" x="236" y="108" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro" x="253" y="125" text-anchor="middle">07</text>
<rect class="dgm-box--soft" x="276" y="108" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro" x="293" y="125" text-anchor="middle">08</text>
<rect class="dgm-box--soft" x="316" y="108" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro" x="333" y="125" text-anchor="middle">09</text>
<rect class="dgm-box--soft" x="356" y="108" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro" x="373" y="125" text-anchor="middle">10</text>
<rect class="dgm-box--soft" x="196" y="140" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro" x="213" y="157" text-anchor="middle">11</text>
<rect class="dgm-box--soft" x="236" y="140" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro" x="253" y="157" text-anchor="middle">12</text>
<rect class="dgm-box--warn" x="276" y="140" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro dgm-t--w" x="293" y="157" text-anchor="middle">13</text>
<rect class="dgm-box--warn" x="316" y="140" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro dgm-t--w" x="333" y="157" text-anchor="middle">14</text>
<rect class="dgm-box--warn" x="356" y="140" width="34" height="26" rx="2"/>
<text class="dgm-t dgm-t--micro dgm-t--w" x="373" y="157" text-anchor="middle">15</text>
<text class="dgm-t dgm-t--micro" x="196" y="182">15 сервисов · 12 в норме</text>
<line class="dgm-wire dgm-wire--warn" x1="293" y1="190" x2="293" y2="264" marker-end="url(#ce-arrow-w)"/>
<text class="dgm-t dgm-t--micro dgm-t--w" x="303" y="228">15 сырых JSON</text>
<rect class="dgm-box" x="32" y="272" width="356" height="136" rx="4"/>
<text class="dgm-t dgm-t--micro" x="44" y="292">КОНТЕКСТ LLM</text>
<text class="dgm-t dgm-t--big dgm-t--w" x="44" y="332">15 / 15</text>
<text class="dgm-t dgm-t--micro dgm-t--w" x="376" y="330" text-anchor="end">без фильтра</text>
<text class="dgm-t dgm-t--micro" x="44" y="354">12 здоровых ответов + 3 сбоя</text>
<rect x="44" y="368" width="332" height="10" rx="2" fill="var(--paper-3)" stroke="var(--line)"/>
<rect x="309.6" y="368" width="66.4" height="10" rx="2" fill="var(--tok-var)" opacity="0.85"/>
<text class="dgm-t dgm-t--micro" x="44" y="394">каждый ответ занимает место, даже если это 200 OK</text>
<rect class="dgm-panel" x="460" y="44" width="404" height="392" rx="6"/>
<text class="dgm-t dgm-t--xs dgm-t--a" x="476" y="66">СТАЛО · ОДИН СКРИПТ</text>
<rect class="dgm-box dgm-box--accent" x="476" y="80" width="88" height="38" rx="4"/>
<text class="dgm-t dgm-t--b" x="520" y="104" text-anchor="middle">LLM</text>
<line class="dgm-wire dgm-wire--accent" x1="520" y1="118" x2="520" y2="140" marker-end="url(#ce-arrow-a)"/>
<text class="dgm-t dgm-t--micro dgm-t--a" x="528" y="134">1 скрипт</text>
<rect class="dgm-dash" x="476" y="146" width="372" height="112" rx="6"/>
<text class="dgm-t dgm-t--micro dgm-t--a" x="490" y="164">SANDBOX · CODE RUNTIME</text>
<text class="dgm-t dgm-t--micro" x="834" y="164" text-anchor="end">нет сети · нет ключей</text>
<rect class="dgm-box--soft" x="490" y="176" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro" x="504" y="189" text-anchor="middle">01</text>
<rect class="dgm-box--soft" x="523" y="176" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro" x="537" y="189" text-anchor="middle">02</text>
<rect class="dgm-box--soft" x="556" y="176" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro" x="570" y="189" text-anchor="middle">03</text>
<rect class="dgm-box--soft" x="589" y="176" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro" x="603" y="189" text-anchor="middle">04</text>
<rect class="dgm-box--soft" x="622" y="176" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro" x="636" y="189" text-anchor="middle">05</text>
<rect class="dgm-box--soft" x="490" y="198" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro" x="504" y="211" text-anchor="middle">06</text>
<rect class="dgm-box--soft" x="523" y="198" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro" x="537" y="211" text-anchor="middle">07</text>
<rect class="dgm-box--soft" x="556" y="198" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro" x="570" y="211" text-anchor="middle">08</text>
<rect class="dgm-box--soft" x="589" y="198" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro" x="603" y="211" text-anchor="middle">09</text>
<rect class="dgm-box--soft" x="622" y="198" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro" x="636" y="211" text-anchor="middle">10</text>
<rect class="dgm-box--soft" x="490" y="220" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro" x="504" y="233" text-anchor="middle">11</text>
<rect class="dgm-box--soft" x="523" y="220" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro" x="537" y="233" text-anchor="middle">12</text>
<rect class="dgm-box--warn" x="556" y="220" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro dgm-t--w" x="570" y="233" text-anchor="middle">13</text>
<rect class="dgm-box--warn" x="589" y="220" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro dgm-t--w" x="603" y="233" text-anchor="middle">14</text>
<rect class="dgm-box--warn" x="622" y="220" width="28" height="18" rx="2"/>
<text class="dgm-t dgm-t--micro dgm-t--w" x="636" y="233" text-anchor="middle">15</text>
<text class="dgm-t dgm-t--micro dgm-t--a" x="670" y="198">12 ответов</text>
<text class="dgm-t dgm-t--micro dgm-t--a" x="670" y="214">гаснут здесь</text>
<text class="dgm-t dgm-t--micro" x="670" y="234">filter()</text>
<line class="dgm-wire dgm-wire--accent" x1="662" y1="258" x2="662" y2="266" marker-end="url(#ce-arrow-a)"/>
<text class="dgm-t dgm-t--micro dgm-t--a" x="674" y="267">3 сбоя</text>
<rect class="dgm-box dgm-box--accent" x="476" y="272" width="372" height="136" rx="4"/>
<text class="dgm-t dgm-t--micro" x="490" y="292">КОНТЕКСТ LLM</text>
<text class="dgm-t dgm-t--big dgm-t--a" x="490" y="332">3 / 15</text>
<text class="dgm-t dgm-t--micro dgm-t--a" x="834" y="330" text-anchor="end">−80% шума</text>
<text class="dgm-t dgm-t--micro" x="490" y="354">payments 503 · catalog 840 ms · auth timeout</text>
<rect x="490" y="368" width="342" height="10" rx="2" fill="var(--paper-3)" stroke="var(--line)"/>
<rect x="490" y="368" width="68" height="10" rx="2" fill="var(--accent)"/>
<text class="dgm-t dgm-t--micro" x="490" y="394">контекст платит за ответы, а не за вызовы</text>
</svg>
</div>
<figcaption>Слева модель читает все 15 ответов, включая 12 здоровых. Справа те же 15 вызовов делает код внутри песочницы, а наверх уходят только три сбоя. <b>Меняется не число вызовов, а то, что видит модель.</b></figcaption>
</figure>

<div class="callout callout--objection">
<p><strong>«Пусть модель сама разберётся».</strong> Разберётся — в том, что ты дал. Если критерий «только сбои» не записан в коде, она вернёт все 15 ответов и формально будет права.</p>
<p><strong>Шаг:</strong> выпиши критерий фильтра одной строкой до запроса. Эта строка и станет <code>filter()</code>.</p>
</div>

## Минимальный запрос

Добавь инструмент `code_execution` и разреши своим инструментам вызываться из кода через `allowed_callers`.

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const tools = [
  { type: "code_execution_20260120" as const, name: "code_execution" },
  {
    name: "check_service",
    description:
      "Проверяет health-endpoint сервиса. Возвращает JSON: " +
      "{ name: string, status: number, ms: number, error?: string }.",
    input_schema: {
      type: "object" as const,
      properties: { name: { type: "string" } },
      required: ["name"],
    },
    allowed_callers: ["code_execution_20260120"],
  },
];

const response = await client.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 4096,
  messages: [
    {
      role: "user",
      content: "Проверь 15 сервисов после релиза и покажи только сбои.",
    },
  ],
  tools,
});
```

Два поля решают всё:

- `type: "code_execution_20260120"` включает песочницу. Имя инструмента фиксировано: `code_execution`.
- `allowed_callers: ["code_execution_20260120"]` говорит API превратить `check_service` в async-функцию Python внутри этой песочницы.

Если оставить `allowed_callers` пустым, модель будет вызывать `check_service` обычным ходом, и каждый ответ снова окажется в контексте. Это самый частый способ «включить механизм и не получить эффекта».

<div class="callout callout--warn">
<p><strong>allowed_callers — не граница безопасности.</strong> Это подсказка модели, а не запрет на прямой вызов. Твой обработчик всё равно обязан проверять, что запрошено, кем и с какими правами. Модель может ошибиться или попросить инструмент напрямую.</p>
</div>

## Что происходит после паузы

Код не может сам сходить в твой сервис: у контейнера нет сети. Поэтому API останавливает исполнение, возвращает тебе обычный `tool_use` и ждёт результат.

<figure class="diagram">
<div class="diagram__head">
<span class="diagram__kicker">схема 02</span>
<span class="diagram__title">Один programmatic-вызов по шагам</span>
</div>
<p class="diagram__hint">прокрути схему →</p>
<div class="diagram__scroll">
<svg viewBox="0 0 880 500" role="img" aria-labelledby="ce-fig2-title ce-fig2-desc">
<title id="ce-fig2-title">Последовательность вызова инструмента из песочницы</title>
<desc id="ce-fig2-desc">Claude пишет код, API запускает его в контейнере. Контейнер просит инструмент, API возвращает паузу бэкенду, бэкенд присылает результат и container id, после чего код завершается и модель получает итог.</desc>
<defs>
<marker id="ce-seq-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0 0 L8 4 L0 8 Z" fill="var(--line-strong)"/>
</marker>
<marker id="ce-seq-arrow-a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0 0 L8 4 L0 8 Z" fill="var(--accent-text)"/>
</marker>
</defs>
<rect class="dgm-box dgm-box--accent" x="40" y="18" width="120" height="36" rx="4"/>
<text class="dgm-t dgm-t--b" x="100" y="41" text-anchor="middle">CLAUDE</text>
<rect class="dgm-box" x="290" y="18" width="120" height="36" rx="4"/>
<text class="dgm-t dgm-t--b" x="350" y="41" text-anchor="middle">API</text>
<rect class="dgm-box dgm-box--soft" x="530" y="18" width="120" height="36" rx="4"/>
<text class="dgm-t dgm-t--b" x="590" y="41" text-anchor="middle">CONTAINER</text>
<rect class="dgm-box" x="710" y="18" width="140" height="36" rx="4"/>
<text class="dgm-t dgm-t--b" x="780" y="41" text-anchor="middle">ТВОЙ КОД</text>
<line class="dgm-dash" x1="100" y1="54" x2="100" y2="408"/>
<line class="dgm-dash" x1="350" y1="54" x2="350" y2="408"/>
<line class="dgm-dash" x1="590" y1="54" x2="590" y2="408"/>
<line class="dgm-dash" x1="780" y1="54" x2="780" y2="408"/>
<line class="dgm-wire" x1="160" y1="90" x2="280" y2="90" marker-end="url(#ce-seq-arrow)"/>
<text class="dgm-t dgm-t--micro" x="220" y="82" text-anchor="middle">1 · код и tools</text>
<line class="dgm-wire" x1="410" y1="124" x2="520" y2="124" marker-end="url(#ce-seq-arrow)"/>
<text class="dgm-t dgm-t--micro" x="465" y="116" text-anchor="middle">2 · запуск</text>
<line class="dgm-wire" x1="530" y1="158" x2="420" y2="158" marker-end="url(#ce-seq-arrow)"/>
<text class="dgm-t dgm-t--micro" x="475" y="150" text-anchor="middle">3 · tool_use</text>
<line class="dgm-wire dgm-wire--accent" x1="410" y1="200" x2="700" y2="200" marker-end="url(#ce-seq-arrow-a)"/>
<text class="dgm-t dgm-t--micro dgm-t--a" x="555" y="192" text-anchor="middle">4 · paused response · stop_reason: tool_use</text>
<line class="dgm-wire" x1="710" y1="252" x2="420" y2="252" marker-end="url(#ce-seq-arrow)"/>
<text class="dgm-t dgm-t--micro" x="565" y="244" text-anchor="middle">5 · tool_result + container id</text>
<line class="dgm-wire" x1="410" y1="286" x2="520" y2="286" marker-end="url(#ce-seq-arrow)"/>
<text class="dgm-t dgm-t--micro" x="465" y="278" text-anchor="middle">6 · продолжить</text>
<line class="dgm-wire" x1="530" y1="344" x2="420" y2="344" marker-end="url(#ce-seq-arrow)"/>
<text class="dgm-t dgm-t--micro" x="475" y="336" text-anchor="middle">7 · stdout</text>
<line class="dgm-wire dgm-wire--accent" x1="410" y1="386" x2="170" y2="386" marker-end="url(#ce-seq-arrow-a)"/>
<text class="dgm-t dgm-t--micro dgm-t--a" x="290" y="378" text-anchor="middle">8 · итог: только 3 сбоя</text>
<rect class="dgm-box--warn" x="40" y="420" width="790" height="28" rx="4" opacity="0.7"/>
<text class="dgm-t dgm-t--micro" x="56" y="438">Модель получает только шаг 8. Всё, что между, остаётся в контейнере и в твоём обработчике.</text>
</svg>
</div>
<figcaption>Пауза — не ошибка, а штатный режим. Пока код ждёт инструмент, <b>container id обязателен</b>: без него API не возобновит исполнение. Ответ с результатами должен содержать только <code>tool_result</code>, без текста.</figcaption>
</figure>

Пять правил паузы:

1. **Отправляй тот же массив `tools`.** Иначе запущенный код не найдёт определение инструмента.
2. **Передавай `container` из прошлого ответа.** Пока есть ожидающий programmatic-вызов, без него запрос отклонят.
3. **Клади в `content` только `tool_result`.** Текст в том же сообщении ломает формат.
4. **Возвращай строку.** Для programmatic-вызова `content` — строка или текстовые блоки; картинки и документы отклоняются.
5. **Укладывайся в ~4 минуты.** Дольше — внутри кода поднимется `TimeoutError`, и модель, скорее всего, повторит вызов.

## Цикл на TypeScript

Один цикл, который доводит ход до конца. В реальном агенте сюда добавляются лимит шагов, таймаут и логирование.

```ts
import type Anthropic from "@anthropic-ai/sdk";

type PendingCall = Anthropic.ToolUseBlock & {
  caller?: { type: string; tool_id?: string };
};

const isProgrammatic = (block: Anthropic.ContentBlock): block is PendingCall =>
  block.type === "tool_use" &&
  String((block as PendingCall).caller?.type ?? "").startsWith("code_execution");

async function runTurn(prompt: string) {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
  let container: string | undefined;

  for (let step = 0; step < 8; step++) {
    const response = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4096,
      messages,
      tools,
      container,
    });

    messages.push({ role: "assistant", content: response.content });
    container = response.container?.id ?? container;

    if (response.stop_reason !== "tool_use") break;

    const calls = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    if (calls.length === 0) break;
    if (calls.some(isProgrammatic) && !container) break;

    const results = await Promise.all(
      calls.map(async (call) => ({
        type: "tool_result" as const,
        tool_use_id: call.id,
        content: await runTool(call.name, call.input as Record<string, unknown>),
      })),
    );

    messages.push({ role: "user", content: results });
  }

  return messages;
}
```

`runTool` — твой обычный диспетчер: валидация аргументов, права, таймаут, запись в аудит. Возвращает строку, которую код разберёт сам.

`stop_reason: "pause_turn"` обрабатывается отдельно: верни ответ как есть вместе с `container`, чтобы API продолжил длинный ход. Цикл выше такой случай просто останавливает.

<div class="callout callout--key">
<p><strong>Проверяй не только <code>stop_reason</code>, но и <code>caller</code>.</strong> <code>stop_reason: "tool_use"</code> бывает и у обычных вызовов. Programmatic-вызов отличается полем <code>caller.type</code> и <code>caller.tool_id</code> — идентификатором запуска кода, который его породил.</p>
</div>

## Что внутри контейнера

| Параметр | Значение |
| --- | --- |
| Python | 3.11, x86_64, Linux |
| Память и диск | 5 GiB и 5 GiB |
| CPU | 1 ядро |
| Сеть | полностью отключена |
| Библиотеки | pandas, numpy, scipy, matplotlib, openpyxl, pypdf и другие |
| Файлы | только рабочая директория запроса |
| Жизнь контейнера | 30 дней; чекпоинт после ~5 минут простоя |
| Лимит ячейки | 90 секунд; с `code_execution_20260521` модель о нём предупреждена |
| Цена | 1 550 бесплатных часов в месяц, дальше $0,05 за час контейнера |

Версии инструмента:

- `code_execution_20250825` — Bash и файлы. База.
- `code_execution_20260120` — плюс состояние Python между запросами и programmatic tool calling.
- `code_execution_20260521` — тот же рантайм; в описании появляется предупреждение про 90-секундный лимит ячейки, чтобы модель планировала длинные вычисления.

Beta-заголовок для текущих версий не нужен. Но модели поддерживают разное: например, Haiku 4.5 принимает тип инструмента, однако programmatic calling на ней недоступен. Проверяй в Models API два разных поля: `capabilities.server_tools.code_execution.supported` — принимает ли модель инструмент, `capabilities.code_execution.supported` — умеет ли код вызывать твои инструменты.

## Где механизм ломается

**Промежуточные данные всё равно где-то есть.** Они не попадают в контекст модели, но проходят через твой бэкенд при каждом `tool_use`. Если инструмент отдаёт 10 МБ, ты их получишь и передашь в контейнер — экономия касается контекста, а не трафика.

**Инструмент вернул не строку.** Programmatic-вызов принимает только текст. `content` с изображением или документом будет отклонён.

**Рекурсивная схема.** Если `input_schema` содержит ссылку на саму себя, запрос с `allowed_callers` падает с `Circular $ref detected`. Оставь такой инструмент прямым.

**`strict: true`, `tool_choice`, `disable_parallel_tool_use`.** С programmatic calling несовместимы. Нельзя и принудительно выбрать конкретный инструмент через `tool_choice`.

**MCP-коннектор и computer/browser.** Их инструменты нельзя вызывать из кода: у MCP-коннектора другой транспорт, у computer/browser `allowed_callers` принимает только `direct`.

**Контейнер истёк.** После 30 дней или удаления контейнера `container` не восстанавливается. Запрос с ним вернёт ошибку — начни новый ход без `container`.

## Когда это не надо

- **Один-два простых вызова.** Кода больше, чем пользы: добавляется контейнер, пауза и обработка `caller`.
- **Модели нужно видеть промежуточные данные.** Если решение зависит от каждого сырого ответа, фильтрация в коде лишит её контекста.
- **Ответы маленькие.** 3 вызова по 200 токенов не создают проблемы, которую стоит решать песочницей.
- **Нужен недоступный пакет.** У контейнера нет интернета: поставить зависимость на лету нельзя.
- **Нужна своя среда.** Версия Python, системные библиотеки и сеть не настраиваются. Тогда — [своя песочница на Docker или Workers](/concepts/docker-cloudflare-sandbox).

## Цифры и их границы

В замере Anthropic на сложных research-задачах средний расход упал с **43 588 до 27 297 токенов** — это **−37%** (в выпуске — «−38%»). На BrowseComp и DeepSearchQA programmatic calling поверх поиска дал **+11% к качеству** при **−24% входных токенов**.

Это не универсальная константа. Экономия зависит от того, сколько мусора производят инструменты и какую его долю можно отфильтровать кодом. Если все ответы нужны модели, экономии не будет.

## Чек-лист

- [ ] инструмент `code_execution` версии `20260120` или новее добавлен;
- [ ] нужные инструменты имеют `allowed_callers` с той же версией;
- [ ] описания инструментов содержат формат ответа: код будет его парсить;
- [ ] цикл передаёт `container` и тот же `tools`;
- [ ] на паузу отвечаешь только `tool_result`;
- [ ] есть таймаут меньше ~4 минут на выполнение инструмента;
- [ ] обработчик проверяет права, а не полагается на `allowed_callers`;
- [ ] замеряешь контекст, а не только размер запроса.

## Источники

- [Claude API: Code execution tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool)
- [Claude API: Programmatic tool calling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)
- [Anthropic Engineering: Introducing advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use)

Если хочешь сначала понять, почему промежуточные результаты вообще дороги, — [«Контекстное окно — это бюджет, а не склад»](/concepts/context-budget). Если инструментов слишком много ещё до первого вызова — [«Tool Search в своём агенте»](/concepts/tool-search-5-minut).
