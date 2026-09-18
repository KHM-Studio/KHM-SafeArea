# Technical decisions

## Keyboard detection is deliberately approximate

The web has no universal keyboard-open boolean. KHM SafeArea combines editable focus, VisualViewport
or VirtualKeyboard geometry, a per-orientation baseline, and a conservative threshold. Pinch zoom is
excluded. This reduces false positives from browser chrome but cannot identify every OEM keyboard.

## The viewport meta tag is never rewritten

`viewport-fit=cover` is required for useful iOS safe-area environment values. The library only warns
on localhost (or in debug mode) when it is missing. Rewriting an application's viewport policy would
be unsafe and surprising.

## Dynamic viewport units remain the no-JavaScript fallback

CSS starts with `100vh` and upgrades to `100dvh` through `@supports`. JavaScript publishes measured
pixel values after startup. `svh` and `lvh` describe useful bounds, but neither represents the current
visible viewport, so the library does not pretend they do.

## No user-agent or device-model detection

Notches, Dynamic Island, rounded corners, and Android cutouts are exposed only through browser/OS
environment values. Feature detection is more durable and avoids fingerprinting.

## Framework adapters are isolated

Astro and Svelte components are shipped as framework source; React and Vue entries compile to ESM.
All framework packages are optional peers. Importing the core never loads them.

## No automatic VirtualKeyboard overlay policy

The library reads `navigator.virtualKeyboard.boundingRect` when available but does not set
`overlaysContent`. That choice changes application layout semantics and belongs to the application.
