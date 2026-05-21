import { createServer } from "node:http";
import { handleLeadRequest } from "./leadHandler.js";

const port = Number(process.env.PORT ?? 8080);

function toRequest(nodeRequest, body) {
  return new Request(`http://localhost${nodeRequest.url ?? "/"}`, {
    method: nodeRequest.method,
    headers: nodeRequest.headers,
    body: nodeRequest.method === "GET" || nodeRequest.method === "HEAD" ? undefined : body,
  });
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

createServer(async (nodeRequest, nodeResponse) => {
  if (nodeRequest.url === "/health") {
    nodeResponse.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    nodeResponse.end("ok");
    return;
  }

  if (nodeRequest.url !== "/api/leads") {
    nodeResponse.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    nodeResponse.end("not found");
    return;
  }

  try {
    const body = await readBody(nodeRequest);
    const response = await handleLeadRequest(toRequest(nodeRequest, body), process.env);
    nodeResponse.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    nodeResponse.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    nodeResponse.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    nodeResponse.end(JSON.stringify({ ok: false, error: "Internal lead capture error." }));
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`Lead capture edge listening on :${port}`);
});
