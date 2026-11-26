const { digits, validatePedido } = require("./pedidos");
const { criarPedido, pedidosPorTelefone, todosPedidos } = require("./store");
const { senhaConfere, assinarSessao, sessaoValida, cookieAdmin, cookieLimpo, cookies } = require("./auth");

const hits = new Map();

function limited(req) {
  const now = Date.now();
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "local").split(",")[0].trim();
  const bucket = hits.get(ip) || { count: 0, reset: now + 60_000 };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + 60_000;
  }
  bucket.count += 1;
  hits.set(ip, bucket);
  return bucket.count > 30;
}

function sendJson(res, status, data, extraHeaders = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
    ...extraHeaders,
  });
  res.end(body);
}

function readJson(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return Promise.resolve(req.body);
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch {
      return Promise.reject(Object.assign(new Error("json"), { code: "json" }));
    }
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 32_000) {
        reject(Object.assign(new Error("payload"), { code: "payload" }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error("json"), { code: "json" }));
      }
    });
    req.on("error", reject);
  });
}

async function handle(req, res, url) {
  try {
    if (req.method === "POST" && url.pathname === "/api/pedidos") {
      if (limited(req)) {
        sendJson(res, 429, { error: "Muitas tentativas. Espere um minuto e tente de novo." });
        return;
      }
      const body = await readJson(req);
      const parsed = validatePedido(body);
      if (parsed.error) {
        sendJson(res, 400, { error: parsed.error });
        return;
      }
      const pedido = await criarPedido(parsed.value);
      sendJson(res, 201, { pedido });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/meus-pedidos") {
      if (limited(req)) {
        sendJson(res, 429, { error: "Muitas consultas. Espere um minuto e tente de novo." });
        return;
      }
      const telefone = digits(url.searchParams.get("telefone"));
      if (telefone.length < 10 || telefone.length > 13) {
        sendJson(res, 400, { error: "Informe o telefone com DDD usado no pedido." });
        return;
      }
      sendJson(res, 200, { pedidos: await pedidosPorTelefone(telefone) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/admin/entrar") {
      if (limited(req)) {
        sendJson(res, 429, { error: "Muitas tentativas. Espere um minuto." });
        return;
      }
      const body = await readJson(req);
      if (!senhaConfere(body.senha)) {
        sendJson(res, 401, { error: "Senha incorreta." });
        return;
      }
      sendJson(res, 200, { ok: true }, { "Set-Cookie": cookieAdmin(assinarSessao()) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/admin/sair") {
      sendJson(res, 200, { ok: true }, { "Set-Cookie": cookieLimpo() });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/admin/pedidos") {
      if (!sessaoValida(cookies(req).kr_admin)) {
        sendJson(res, 401, { error: "Entre com a senha da casa." });
        return;
      }
      sendJson(res, 200, { pedidos: await todosPedidos() });
      return;
    }

    sendJson(res, 404, { error: "Não encontrado." });
  } catch (error) {
    if (error.code === "json") {
      sendJson(res, 400, { error: "Não foi possível ler os dados enviados." });
      return;
    }
    if (error.code === "payload") {
      sendJson(res, 413, { error: "Mensagem longa demais." });
      return;
    }
    console.error(error);
    if (!res.headersSent) sendJson(res, 500, { error: "Erro ao salvar. Tente de novo." });
  }
}

module.exports = { handle };
