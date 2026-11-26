const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const SESSION_MS = 1000 * 60 * 60 * 12;

function adminSenha() {
  if (process.env.ADMIN_SENHA) return String(process.env.ADMIN_SENHA);
  const file = path.join(__dirname, "..", "config.server.js");
  if (!fs.existsSync(file)) return "";
  delete require.cache[require.resolve(file)];
  return String(require(file).ADMIN_SENHA || "");
}

function senhaConfere(input) {
  const expected = adminSenha();
  const given = Buffer.from(String(input || ""));
  const real = Buffer.from(expected);
  if (!expected || given.length !== real.length) return false;
  return crypto.timingSafeEqual(given, real);
}

function assinarSessao() {
  const senha = adminSenha();
  const exp = Date.now() + SESSION_MS;
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  const sig = crypto.createHmac("sha256", senha).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function sessaoValida(token) {
  const senha = adminSenha();
  if (!senha || !token || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", senha).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

function cookieAdmin(token) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `kr_admin=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_MS / 1000}${secure}`;
}

function cookieLimpo() {
  return "kr_admin=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
}

function cookies(req) {
  const out = {};
  String(req.headers.cookie || "")
    .split(";")
    .forEach((part) => {
      const index = part.indexOf("=");
      if (index < 1) return;
      out[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
    });
  return out;
}

module.exports = { senhaConfere, assinarSessao, sessaoValida, cookieAdmin, cookieLimpo, cookies };
