const http = require("http");
const fs = require("fs");
const path = require("path");
const { handle } = require("./lib/api");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 4173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function send(res, status, body, headers = {}) {
  const payload = Buffer.from(body);
  res.writeHead(status, {
    "Content-Length": payload.length,
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(payload);
}

function safeFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  let rel = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  if (rel && !path.extname(rel)) rel = `${rel}.html`;
  if (!rel || rel.includes("\0") || rel.split("/").includes("..")) return null;
  if (rel.startsWith(".") || rel.includes("/.")) return null;
  const blocked = ["data", "node_modules", "lib", "config.server.js", "server.js"];
  if (blocked.some((name) => rel === name || rel.startsWith(`${name}/`))) return null;
  const file = path.resolve(ROOT, rel);
  if (!file.startsWith(ROOT + path.sep) && file !== ROOT) return null;
  return file;
}

function serveStatic(req, res, url) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, "Método não permitido", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }
  const file = safeFile(url.pathname);
  if (!file) {
    send(res, 404, "Não encontrado", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      send(res, 404, "Não encontrado", { "Content-Type": "text/plain; charset=utf-8" });
      return;
    }
    const type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": stat.size,
      "Cache-Control": file.endsWith(".html") ? "no-store" : "public, max-age=3600",
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) {
    await handle(req, res, url);
    return;
  }
  if (url.pathname.endsWith(".html")) {
    const clean = url.pathname === "/index.html" ? "/" : url.pathname.slice(0, -5);
    res.writeHead(308, { Location: clean + url.search });
    res.end();
    return;
  }
  serveStatic(req, res, url);
});

server.listen(PORT, () => {
  console.log(`Buffet Karla Rios em http://localhost:${PORT}`);
});
