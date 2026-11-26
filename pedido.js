const statusCardapio = document.getElementById("cardapio-status");
const statusPedido = document.getElementById("pedido-status");
const statusConsulta = document.getElementById("consulta-status");
const lista = document.getElementById("meus-pedidos");
const cardapio = window.BUFFET_CARDAPIO;
const pessoasInput = document.getElementById("pessoas");
const passoCardapio = document.getElementById("passo-cardapio");
const passoCadastro = document.getElementById("passo-cadastro");
const passoConsulta = document.getElementById("passo-consulta");

function setStatus(el, message, kind) {
  el.textContent = message;
  el.classList.toggle("is-error", kind === "error");
  el.classList.toggle("is-ok", kind === "ok");
}

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

function dinheiro(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function mapaPrecos() {
  const mapa = new Map();
  cardapio.categorias.forEach((categoria) => {
    categoria.itens.forEach((item) => mapa.set(item.id, item));
  });
  return mapa;
}

const precos = mapaPrecos();

function itensSelecionados() {
  return [...document.querySelectorAll("[data-item]:checked")].map((input) => precos.get(input.dataset.item));
}

function pessoasInformadas() {
  const pessoas = Number(pessoasInput.value);
  if (!Number.isInteger(pessoas) || pessoas < 1) return 0;
  return pessoas;
}

function marcarNav(passo) {
  const pedido = document.getElementById("nav-pedido");
  const meus = document.getElementById("nav-meus");
  if (passo === "consulta") {
    pedido.removeAttribute("aria-current");
    meus.setAttribute("aria-current", "page");
  } else {
    meus.removeAttribute("aria-current");
    pedido.setAttribute("aria-current", "page");
  }
}

function mostrar(passo) {
  passoCardapio.hidden = passo !== "cardapio";
  passoCadastro.hidden = passo !== "cadastro";
  passoConsulta.hidden = passo !== "consulta";
  document.getElementById("pedido").hidden = passo !== "cardapio";
  marcarNav(passo);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function montarCardapio() {
  const root = document.getElementById("cardapio");
  cardapio.categorias.forEach((categoria) => {
    const grupo = document.createElement("fieldset");
    grupo.className = "menu-group";
    const legenda = document.createElement("legend");
    legenda.textContent = categoria.nome;
    grupo.append(legenda);

    categoria.itens.forEach((item) => {
      const linha = document.createElement("label");
      linha.className = "menu-item";
      const texto = document.createElement("span");
      const nome = document.createElement("span");
      nome.className = "menu-item__name";
      nome.textContent = item.nome;
      const meta = document.createElement("span");
      meta.className = "menu-item__meta";
      meta.textContent = item.medida
        ? `${dinheiro(item.preco)} · ${item.medida}`
        : dinheiro(item.preco);
      texto.append(nome, meta);

      const interruptor = document.createElement("span");
      interruptor.className = "switch";
      const marca = document.createElement("input");
      marca.type = "checkbox";
      marca.dataset.item = item.id;
      marca.setAttribute("aria-label", item.nome);
      const trilho = document.createElement("span");
      trilho.className = "switch__track";
      trilho.setAttribute("aria-hidden", "true");
      interruptor.append(marca, trilho);
      linha.append(texto, interruptor);
      grupo.append(linha);
    });
    root.append(grupo);
  });
}

function preencherResumo(itens, pessoas) {
  const resumo = document.getElementById("resumo");
  resumo.replaceChildren();
  const pratos = document.createElement("p");
  pratos.className = "resumo-pedido";
  pratos.textContent = itens.map((item) => item.nome).join(", ");
  const conta = document.createElement("p");
  conta.className = "resumo-pedido";
  const forte = document.createElement("strong");
  forte.textContent = `${pessoas} pessoas · valor a confirmar`;
  conta.append(forte);
  resumo.append(pratos, conta);
}

function mostrarBusca() {
  document.getElementById("consulta-busca").hidden = false;
  document.getElementById("consulta-perfil").hidden = true;
  lista.replaceChildren();
  document.getElementById("consulta-telefone").value = "";
  setStatus(statusConsulta, "", "ok");
}

function entrarPerfil(pedidos) {
  document.getElementById("perfil-nome").textContent = pedidos[0].nome;
  document.getElementById("consulta-busca").hidden = true;
  document.getElementById("consulta-perfil").hidden = false;
  renderPedidos(pedidos);
}

function renderPedidos(pedidos) {
  lista.replaceChildren();
  if (!pedidos.length) return;

  const ul = document.createElement("ul");
  ul.className = "order-list";
  pedidos.forEach((pedido) => {
    const li = document.createElement("li");
    li.className = "order-card";
    const top = document.createElement("div");
    top.className = "order-card__top";
    const title = document.createElement("h3");
    title.textContent = formatarData(pedido.dataEvento);
    const id = document.createElement("span");
    id.className = "order-card__id";
    id.textContent = `Nº ${pedido.id}`;
    top.append(title, id);

    const pratos = document.createElement("p");
    const itens = Array.isArray(pedido.itens) ? pedido.itens : [];
    pratos.textContent = itens.map((item) => item.nome).join(", ");

    const total = document.createElement("p");
    total.textContent = pedido.total
      ? `${pedido.pessoas} pessoas · ${dinheiro(pedido.total)}`
      : `${pedido.pessoas} pessoas · valor a confirmar`;

    const meta = document.createElement("p");
    meta.textContent = formatarQuando(pedido.criadoEm);
    li.append(top, pratos, total, meta);
    ul.append(li);
  });
  lista.append(ul);
}

montarCardapio();

document.getElementById("continuar").addEventListener("click", () => {
  const itens = itensSelecionados();
  const pessoas = pessoasInformadas();
  if (!itens.length) {
    setStatus(statusCardapio, "Escolha ao menos um prato.", "error");
    return;
  }
  if (!pessoas) {
    setStatus(statusCardapio, "Informe o número de pessoas.", "error");
    return;
  }
  setStatus(statusCardapio, "", "ok");
  preencherResumo(itens, pessoas);
  mostrar("cadastro");
});

document.getElementById("voltar").addEventListener("click", () => {
  setStatus(statusPedido, "", "ok");
  mostrar("cardapio");
});

document.getElementById("nav-pedido").addEventListener("click", (event) => {
  event.preventDefault();
  mostrar("cardapio");
});
document.getElementById("nav-meus").addEventListener("click", (event) => {
  event.preventDefault();
  mostrar("consulta");
});
document.getElementById("fechar-consulta").addEventListener("click", () => mostrar("cardapio"));

document.getElementById("form-pedido").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  data.itens = itensSelecionados().map((item) => ({ id: item.id }));
  setStatus(statusPedido, "Enviando…", "ok");

  try {
    const response = await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await response.json();
    if (!response.ok) {
      setStatus(statusPedido, body.error || "Não foi possível enviar.", "error");
      return;
    }
    setStatus(statusPedido, `Pedido nº ${body.pedido.id} guardado.`, "ok");
    form.reset();
    document.getElementById("resumo").replaceChildren();
    document.getElementById("consulta-telefone").value = body.pedido.telefone;
    mostrar("consulta");
    entrarPerfil([body.pedido]);
  } catch {
    setStatus(statusPedido, "Sem conexão com o servidor. Tente de novo.", "error");
  }
});

document.getElementById("form-consulta").addEventListener("submit", async (event) => {
  event.preventDefault();
  const telefone = document.getElementById("consulta-telefone").value;
  setStatus(statusConsulta, "", "ok");
  lista.replaceChildren();

  try {
    const response = await fetch(`/api/meus-pedidos?telefone=${encodeURIComponent(telefone)}`);
    const body = await response.json();
    if (!response.ok) {
      setStatus(statusConsulta, body.error || "Não foi possível consultar.", "error");
      return;
    }
    if (!body.pedidos.length) {
      setStatus(statusConsulta, "Nenhum pedido com esse telefone.", "error");
      return;
    }
    entrarPerfil(body.pedidos);
  } catch {
    setStatus(statusConsulta, "Sem conexão com o servidor. Tente de novo.", "error");
  }
});

document.getElementById("sair-perfil").addEventListener("click", mostrarBusca);
