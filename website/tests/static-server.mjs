import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "out");
const port = Number(process.argv[3] ?? 4173);
const leads = [];

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function send(response, status, body, contentType = "text/plain; charset=utf-8") {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": contentType,
  });
  response.end(body);
}

function readBody(request) {
  return new Promise((resolveBody) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolveBody(body));
  });
}

createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    send(response, 204, "");
    return;
  }

  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (url.pathname === "/lead-test" && request.method === "POST") {
    const body = await readBody(request);
    leads.push(JSON.parse(body || "{}"));
    send(response, 200, JSON.stringify({ ok: true, count: leads.length }), "application/json; charset=utf-8");
    return;
  }

  if (url.pathname === "/lead-test" && request.method === "GET") {
    send(response, 200, JSON.stringify(leads), "application/json; charset=utf-8");
    return;
  }

  const requested = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  const candidates = [
    join(root, requested),
    join(root, `${requested}.html`),
    join(root, requested, "index.html"),
    join(root, "index.html"),
  ];
  const filePath = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());

  if (!filePath || !filePath.startsWith(root)) {
    send(response, 404, "Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Static test server listening on http://127.0.0.1:${port}`);
});
