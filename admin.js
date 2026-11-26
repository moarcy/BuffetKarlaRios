const gate = document.getElementById("gate");
const painel = document.getElementById("painel");
const lista = document.getElementById("lista-pedidos");
const resumo = document.getElementById("admin-resumo");
const statusSenha = document.getElementById("senha-status");

function formatarData(iso) {
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function formatarQuando(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function telefoneWa(digits) {
  const raw = String(digits || "");
  const withCountry = raw.startsWith("55") ? raw : `55${raw}`;
  return `https://wa.me/${withCountry}`;
}

function render(pedidos) {
  lista.replaceChildren();
  resumo.textContent = pedidos.length
    ? `${pedidos.length} pedido(s) no total.`
    : "Nenhum pedido ainda.";

  if (!pedidos.length) {
    const note = document.createElement("p");
    note.className = "empty-note";
    note.textContent = "Quando alguém enviar pelo site, aparece aqui.";
    lista.append(note);
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "order-list";
  pedidos.forEach((pedido) => {
    const li = document.createElement("li");
    li.className = "order-card";

    const top = document.createElement("div");
    top.className = "order-card__top";
    const title = document.createElement("h3");
    title.textContent = pedido.nome;
    const id = document.createElement("span");
    id.className = "order-card__id";
    id.textContent = `Nº ${pedido.id}`;
    top.append(title, id);

    const linha = document.createElement("p");
    const pessoas = pedido.pessoas ? `${pedido.pessoas} pessoas · ` : "";
    linha.textContent = `Retirada ${formatarData(pedido.dataEvento)} · ${pessoas}${pedido.local}`;

    const pratos = document.createElement("p");
    const itens = Array.isArray(pedido.itens) ? pedido.itens : [];
    pratos.textContent = itens.map((item) => item.nome).join(", ");

    const total = document.createElement("p");
    total.textContent = Number(pedido.total || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    const fone = document.createElement("p");
    const link = document.createElement("a");
    link.href = telefoneWa(pedido.telefone);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = pedido.telefone;
    fone.append(link);

    li.append(top, linha, pratos, total, fone);
    if (pedido.observacoes) {
      const obs = document.createElement("p");
      obs.textContent = pedido.observacoes;
      li.append(obs);
    }
    const meta = document.createElement("p");
    meta.textContent = `Recebido ${formatarQuando(pedido.criadoEm)}`;
    li.append(meta);
    ul.append(li);
  });
  lista.append(ul);
}

function mostrarPainel() {
  gate.hidden = true;
  painel.hidden = false;
}

async function carregar() {
  const response = await fetch("/api/admin/pedidos");
  if (response.status === 401) {
    gate.hidden = false;
    painel.hidden = true;
    return;
  }
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "erro");
  mostrarPainel();
  render(body.pedidos);
}

document.getElementById("form-senha").addEventListener("submit", async (event) => {
  event.preventDefault();
  statusSenha.textContent = "Entrando…";
  statusSenha.classList.remove("is-error");
  try {
    const response = await fetch("/api/admin/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha: document.getElementById("senha").value }),
    });
    const body = await response.json();
    if (!response.ok) {
      statusSenha.textContent = body.error || "Senha incorreta.";
      statusSenha.classList.add("is-error");
      return;
    }
    statusSenha.textContent = "";
    await carregar();
  } catch {
    statusSenha.textContent = "Sem conexão com o servidor.";
    statusSenha.classList.add("is-error");
  }
});

document.getElementById("sair").addEventListener("click", async () => {
  await fetch("/api/admin/sair", { method: "POST" });
  lista.replaceChildren();
  gate.hidden = false;
  painel.hidden = true;
  document.getElementById("senha").value = "";
});

carregar().catch(() => {
  statusSenha.textContent = "Não foi possível carregar os pedidos.";
  statusSenha.classList.add("is-error");
});
