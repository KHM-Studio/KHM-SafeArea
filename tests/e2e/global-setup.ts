import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const host = "127.0.0.1";
const port = 4173;
const root = resolve(import.meta.dirname, "../..");
const mime: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8"
};

export default async function globalSetup(): Promise<() => Promise<void>> {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", `http://${host}:${port}`);
    const pathname = url.pathname === "/" ? "/tests/e2e/fixture.html" : url.pathname;
    const target = resolve(root, `.${decodeURIComponent(pathname)}`);
    if (target !== root && !target.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    try {
      await access(target);
      if (!(await stat(target)).isFile()) throw new Error("Not a file");
      response.writeHead(200, {
        "Content-Type": mime[extname(target)] ?? "application/octet-stream",
        "Cache-Control": "no-store"
      });
      createReadStream(target).pipe(response);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });

  await new Promise<void>((resolveReady, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolveReady);
  });

  return async () => {
    await new Promise<void>((resolveClosed, reject) => {
      server.close((error) => (error ? reject(error) : resolveClosed()));
      server.closeAllConnections();
    });
  };
}
