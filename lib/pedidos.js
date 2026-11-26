const cardapio = require("../cardapio");

const RETIRADA = cardapio.retirada;
const catalogo = new Map();
cardapio.categorias.forEach((categoria) => {
  categoria.itens.forEach((item) => catalogo.set(item.id, item));
});

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

function cleanText(value, max) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return false;
  }
  const today = new Date();
  const start = Date.UTC(today.getFullYear() - 1, today.getMonth(), today.getDate());
  const end = Date.UTC(today.getFullYear() + 2, today.getMonth(), today.getDate());
  const stamp = Date.UTC(y, m - 1, d);
  return stamp >= start && stamp <= end;
}

function validatePedido(body) {
  const nome = cleanText(body.nome, 80);
  const telefone = digits(body.telefone);
  const dataEvento = cleanText(body.dataEvento, 10);
  const observacoes = cleanText(body.observacoes, 800);

  if (nome.length < 2) return { error: "Informe o nome de quem está pedindo." };
  if (telefone.length < 10 || telefone.length > 13) {
    return { error: "Informe um telefone com DDD." };
  }
  if (!validDate(dataEvento)) return { error: "Informe a data da retirada." };

  const pessoas = Number(body.pessoas);
  if (!Number.isInteger(pessoas) || pessoas < 1 || pessoas > 5000) {
    return { error: "Informe para quantas pessoas é o pedido." };
  }
  if (!Array.isArray(body.itens) || body.itens.length === 0) {
    return { error: "Escolha ao menos um prato." };
  }
  if (body.itens.length > catalogo.size) {
    return { error: "Há um item inválido no pedido." };
  }

  const vistos = new Set();
  const itens = [];
  let somaTabela = 0;
  for (const linha of body.itens) {
    const item = catalogo.get(linha && linha.id);
    if (!item || vistos.has(item.id)) return { error: "Há um item inválido no pedido." };
    vistos.add(item.id);
    somaTabela += item.preco;
    itens.push({
      id: item.id,
      nome: item.nome,
      medida: item.medida || "",
      preco: item.preco,
    });
  }

  return {
    value: {
      nome,
      telefone,
      dataEvento,
      pessoas,
      local: RETIRADA,
      observacoes,
      itens,
      total: Math.round((somaTabela * pessoas * 100) / 10) / 100,
    },
  };
}

module.exports = { digits, validatePedido };
