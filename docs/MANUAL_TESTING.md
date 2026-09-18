# Manual device checklist

Automated tests validate API behavior with simulated browser primitives. They cannot prove physical
cutout geometry, browser chrome animation, OEM navigation modes, or keyboard behavior. Record the
device, OS, browser version, display mode, and result for every manual run.

## iPhone Safari

- [ ] Portrait: header clears the notch or Dynamic Island.
- [ ] Landscape: content clears both rounded/cutout edges.
- [ ] Keyboard open: focused input and bottom composer remain visible.
- [ ] Keyboard close: layout returns without a persistent gap.
- [ ] Safari bar expanded and collapsed: no false keyboard event.
- [ ] Pinch zoom: no keyboard event and zoom remains available.
- [ ] Rotate while keyboard is open and after it closes.

## iPhone installed PWA

- [ ] Standalone mode is reported.
- [ ] Top and home-indicator insets are respected.
- [ ] Keyboard open/close and orientation changes update once.

## Android Chrome

- [ ] Gesture navigation and three-button navigation.
- [ ] Portrait and landscape, with and without a display cutout.
- [ ] Keyboard open/close for text, email, and textarea controls.
- [ ] Address bar expansion/collapse does not report a keyboard.
- [ ] Installed PWA and fullscreen mode.

## Samsung Internet

- [ ] Portrait and landscape.
- [ ] Keyboard open/close.
- [ ] Browser toolbar expansion/collapse.
- [ ] Gesture navigation bottom inset.

## Desktop and accessibility

- [ ] Insets remain zero unless the environment exposes them.
- [ ] Browser zoom and text zoom work.
- [ ] No horizontal overflow at 320 CSS px.
- [ ] Debug overlay does not capture pointer or keyboard input.
- [ ] Importing the core in Node SSR does not access browser globals.
