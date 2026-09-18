# KHM SafeArea

Safe areas, dynamic mobile viewport and virtual keyboard handling for the modern web.

KHM SafeArea is a small, dependency-free TypeScript core inspired by Flutter's `SafeArea`
concept—not its implementation. It publishes native cutout insets and measured viewport state through
CSS variables, with optional adapters for Astro, React, Vue, and Svelte.

## What it solves

- Native notch, rounded-corner, home-indicator, and display-cutout insets exposed by the browser.
- Current layout and visual viewport geometry across resize, scroll, rotation, fullscreen, and PWA
  display-mode changes.
- Conservative virtual-keyboard estimation using `VisualViewport` and, when available, the
  VirtualKeyboard geometry API.
- SSR-safe imports and CSS fallbacks before JavaScript starts.

It cannot discover hardware geometry the browser does not expose. “Dynamic Island” support means
honoring WebKit's safe-area environment values; it does not inspect device models.

## Install

```bash
npm install @khm/safearea
```

Use this viewport policy in your document. KHM SafeArea warns during local development if
`viewport-fit=cover` is absent, but never rewrites the tag.

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

Do not add `maximum-scale=1` or `user-scalable=no`; users must retain pinch zoom.

## Quick start

```ts
import "@khm/safearea/css";
import "@khm/safearea/auto";
```

```html
<main class="safe-all safe-min-screen">...</main>
```

`auto` starts one browser-global controller, updates CSS variables, and remains a safe no-op during
SSR. Import CSS separately so applications control stylesheet order.

## Vanilla JavaScript

```ts
import { createSafeArea } from "@khm/safearea";
import "@khm/safearea/css";

const safeArea = createSafeArea({ keyboard: true, viewport: true });
const unsubscribe = safeArea.subscribe((state) => {
  console.log(state.keyboard.open, state.viewport.visibleHeight);
});

safeArea.start();
safeArea.refresh();

// On application teardown:
unsubscribe();
safeArea.stop();
```

`start()` and `stop()` are idempotent. `stop()` removes listeners, the debug UI, and restores inline
KHM variables that existed before startup.

## Astro

The Astro component renders static markup and adds no hydration:

```astro
---
import SafeArea from "@khm/safearea/astro";
import "@khm/safearea/css";
---

<SafeArea as="main" top bottom>
  <slot />
</SafeArea>
```

Props: `top`, `right`, `bottom`, `left`, `x`, `y`, `all`, `as`, and `class`. Other HTML attributes
pass through. Import `@khm/safearea/auto` in a client entry only when measured viewport or keyboard
state is needed; native safe-area padding works from CSS alone.

## React

React is an optional peer dependency.

```tsx
import { SafeArea, useSafeArea } from "@khm/safearea/react";
import "@khm/safearea/css";

function App() {
  const state = useSafeArea();
  return (
    <SafeArea as="main" all>
      Visible: {state.viewport.visibleHeight}px
    </SafeArea>
  );
}
```

Pass an existing controller to `useSafeArea(controller)` to share lifecycle and state.

## Vue

Vue is an optional peer dependency.

```vue
<script setup lang="ts">
import { SafeArea, useSafeArea } from "@khm/safearea/vue";
import "@khm/safearea/css";
const state = useSafeArea();
</script>

<template>
  <SafeArea as="main" all>Visible: {{ state.viewport.visibleHeight }}px</SafeArea>
</template>
```

## Svelte

Svelte is an optional peer dependency.

```svelte
<script>
  import SafeArea from "@khm/safearea/svelte";
  import "@khm/safearea/css";
</script>

<SafeArea as="main" all>Content</SafeArea>
```

## Custom element

The optional Light DOM component works without a framework and does not initialize the viewport
engine by itself:

```ts
import "@khm/safearea/css";
import "@khm/safearea/element/auto";
```

```html
<khm-safe-area top bottom class="page-shell">
  <main>Content</main>
</khm-safe-area>
```

Boolean attributes `top`, `right`, `bottom`, `left`, `x`, `y`, and `all` update reactively. Consumer
classes and attributes are preserved, content remains in the accessible Light DOM, and `hidden`
retains its native behavior. For explicit registration without import side effects:

```ts
import { defineSafeAreaElement } from "@khm/safearea/element";

defineSafeAreaElement();
```

Add `@khm/safearea/auto` separately if measured viewport and keyboard variables are required.

## CSS API

The stylesheet provides safe fallbacks immediately:

| Variable                           | Meaning                                                           |
| ---------------------------------- | ----------------------------------------------------------------- |
| `--khm-safe-top/right/bottom/left` | Current native safe-area insets                                   |
| `--khm-safe-max-*`                 | Browser-exposed maximum safe inset, falling back to current inset |
| `--khm-viewport-width/height`      | Layout viewport dimensions                                        |
| `--khm-visible-width/height`       | Visual viewport dimensions                                        |
| `--khm-offset-top/left`            | Visual viewport offset                                            |
| `--khm-viewport-scale`             | Visual viewport scale                                             |
| `--khm-keyboard-height`            | Conservative keyboard occlusion estimate                          |
| `--khm-keyboard-open`              | Numeric `0` or `1`                                                |
| `--khm-orientation-landscape`      | Numeric `0` or `1`                                                |
| `--khm-standalone`                 | Numeric `0` or `1`                                                |

```css
.page {
  min-height: var(--khm-visible-height, 100dvh);
  padding-block-start: var(--khm-safe-top, 0px);
  padding-block-end: var(--khm-safe-bottom, 0px);
}
```

Utilities have short and prefixed aliases: `.safe-top`, `.safe-right`, `.safe-bottom`, `.safe-left`,
`.safe-x`, `.safe-y`, `.safe-all`, `.safe-screen`, `.safe-min-screen`, `.safe-fixed-top`, and
`.safe-fixed-bottom` (plus `.khm-*`). Generic utilities use zero specificity via `:where()`, so
application styles can override them.

## Keyboard handling

Keyboard detection requires focus in an editable control and a sufficiently large visible-viewport
reduction. Pinch zoom is explicitly excluded. The threshold defaults to the larger of 120 CSS px or
15% of the orientation baseline and can be changed with `keyboardThreshold`.

This is an estimate. Browser chrome can resize viewports, keyboards vary, and a library loaded while
the keyboard is already visible may not have a reliable baseline. Build layouts around
`--khm-visible-height`; use `keyboard.open` for enhancement, not for data integrity or security.

## PWA, fullscreen, and orientation

The state reports `standalone`, `fullscreen`, and `orientation`. An installable PWA still needs the
application's own manifest, icons, HTTPS, and service worker. This package does not register a service
worker or change display mode. See `examples/vanilla` for a minimal demo and test installed mode on
physical devices.

## JavaScript API

```ts
const controller = createSafeArea({
  safeArea: true,
  viewport: true,
  keyboard: true,
  orientation: true,
  keyboardThreshold: 120,
  debug: false,
  warnOnMissingViewportFit: true,
  root: document.documentElement
});
```

- `start()` attaches listeners and measures immediately.
- `stop()` cleans up and restores prior inline variables.
- `refresh()` schedules one measurement on the next animation frame.
- `getState()` returns an immutable snapshot.
- `subscribe(listener)` returns an unsubscribe function.
- `started` reports lifecycle state.

The root element dispatches `khm:safearea-change`, `khm:viewport-change`, `khm:keyboard-open`,
`khm:keyboard-close`, and `khm:orientation-change` custom events. Event detail contains `{ state,
previous }`.

## Debug overlay

```ts
createSafeArea({ debug: true }).start();
```

The local Shadow DOM overlay displays insets, viewport geometry, keyboard estimate, display mode, and
orientation. It has no pointer interaction, performs no network requests, and is removed by `stop()`.

## SSR

The core and `auto` entry guard all browser globals. Node, Astro SSR, Next.js, Nuxt, and SvelteKit can
import the package. Framework hooks start only after mounting. Components themselves only emit markup
and class names.

## Browser support

Modern evergreen browsers are the target. CSS environment insets require browser support and, on
iOS, `viewport-fit=cover`. `VisualViewport` and VirtualKeyboard are feature-detected; without them the
library falls back to `window.innerWidth/innerHeight` and reports the keyboard closed unless sufficient
supported geometry exists.

## Privacy and security

There is no telemetry, analytics, fingerprinting, user-agent sniffing, storage, or network access.
All measurements remain in the page.

## Limitations

- The browser—not this library—decides whether hardware cutout values are exposed.
- Virtual-keyboard detection is heuristic outside browsers with useful geometry APIs.
- CSS cannot repair a missing or restrictive viewport policy.
- Automated emulation does not prove behavior on physical iPhones or Android OEM browsers.
- `safe-area-max-inset-*` is progressive; unsupported browsers fall back to current insets.

See [technical decisions](./docs/TECHNICAL_DECISIONS.md) and the
[physical-device checklist](./docs/MANUAL_TESTING.md).

## Testing and development

```bash
npm install
npm run check
npm run test:browser
npm run check:tarball
```

`check` runs strict TypeScript, ESLint, Prettier verification, Vitest, the build, SSR import checks,
framework-source compilation, and export/file validation. The current tarball is 22.9 kB compressed
(83.1 kB unpacked, including types and source maps) with no bundled runtime dependencies.
`test:browser` exercises the built package in installed Chrome at desktop and mobile viewports. Set
`KHM_PLAYWRIGHT_CHANNEL=msedge` to use Microsoft Edge. `check:tarball` installs the actual packed
artifact into an isolated temporary consumer and verifies core, auto, element, and SSR imports.
`npm run check:all` runs every automated gate plus `npm audit`; publication also runs the browser,
tarball, and audit gates automatically. Before release, complete the physical-device matrix as well.

## Contributing

Please keep the core dependency-free, prefer feature detection, include cleanup tests for new
listeners, and avoid claims that cannot be demonstrated by web-platform APIs. See
[CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT © KHM Studio.
