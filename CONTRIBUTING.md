# Contributing

1. Open an issue describing observable browser behavior and affected versions.
2. Add or update tests before changing detection logic.
3. Run `npm run check`.
4. Keep runtime code free of telemetry, user-agent sniffing, and mandatory dependencies.
5. For device-specific fixes, attach a completed `docs/MANUAL_TESTING.md` matrix with real hardware
   and distinguish it from emulator evidence.

Public API changes require a changelog entry. Do not commit generated `dist`, coverage, or package
archives.
