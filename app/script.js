/* ============================================================
   Pokédex do Time — Bootcamp II · Projeto Final
   PokeAPI (consulta) + Supabase (avaliações do time: C, R, D)
   ============================================================ */

// Funções puras (testadas no CI) ficam em utils.js
import {
  TOTAL_POKEMON, normalizarTermo, validarTermo, formatarNome,
  formatarNumero, converterAltura, converterPeso,
  estrelas, escaparHTML, montarAvaliacao,
} from "./utils.js";

// URL base da API: apenas o termo de busca muda a cada consulta
const URL_BASE = "https://pokeapi.co/api/v2/pokemon/";

// Referências aos elementos da página
const campoBusca = document.getElementById("campo-busca");
const botaoBuscar = document.getElementById("botao-buscar");
const botaoAleatorio = document.getElementById("botao-aleatorio");
const areaResultado = document.getElementById("resultado");
const listaAvaliacoes = document.getElementById("lista-avaliacoes");
const filtroMural = document.getElementById("filtro-mural");

// Pokémon exibido no cartão (é ele que o formulário avalia)
let pokemonAtual = null;
// Última lista vinda do banco (o filtro trabalha em cima dela)
let avaliacoes = [];

// ---------- Conexão com o banco (usa config.js) ----------
// Sem config válido a busca continua funcionando e o mural avisa.
const supabaseConfigurado =
  typeof SUPABASE_URL === "string" &&
  !SUPABASE_URL.includes("SEU-PROJETO") &&
  typeof supabase !== "undefined";

const db = supabaseConfigurado
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ---------- Consulta à PokeAPI e montagem do cartão ----------
async function buscarPokemon(termo) {
  areaResultado.innerHTML = '<p class="carregando">Carregando...</p>';

  try {
    const resposta = await fetch(URL_BASE + termo);
    // O fetch NÃO lança erro em 404 — verificamos manualmente
    if (!resposta.ok) throw new Error("nao-encontrado");
    const dados = await resposta.json();
    pokemonAtual = dados;

    const nome = formatarNome(dados.name);
    const imagem = dados.sprites.front_default;
    const tipos = dados.types
      .map((t) => `<span class="tipo">${t.type.name}</span>`)
      .join("");
    const imgHTML = imagem
      ? `<img src="${imagem}" alt="Imagem de ${nome}">`
      : `<p style="font-size:4rem">❓</p>`;

    areaResultado.innerHTML = `
      <article class="cartao">
        ${imgHTML}
        <h2>${formatarNumero(dados.id)} — ${nome}</h2>
        <p>${tipos}</p>
        <p class="info">
          <b>Altura:</b> ${converterAltura(dados.height)} m &nbsp;·&nbsp;
          <b>Peso:</b> ${converterPeso(dados.weight)} kg
        </p>
        <form id="form-avaliacao" class="form-avaliacao">
          <h3>Avaliar ${nome}</h3>
          <input name="autor" placeholder="Seu nome" maxlength="40" required>
          <select name="nota" required>
            <option value="">Nota…</option>
            <option value="5">★★★★★ (5)</option>
            <option value="4">★★★★☆ (4)</option>
            <option value="3">★★★☆☆ (3)</option>
            <option value="2">★★☆☆☆ (2)</option>
            <option value="1">★☆☆☆☆ (1)</option>
          </select>
          <textarea name="comentario" placeholder="Comentário (opcional)" maxlength="280"></textarea>
          <button type="submit">Publicar no mural</button>
          <p id="msg-form" class="msg-form" aria-live="polite"></p>
        </form>
      </article>`;

    document.getElementById("form-avaliacao")
      .addEventListener("submit", salvarAvaliacao);
  } catch (erro) {
    pokemonAtual = null;
    const mensagem =
      erro.message === "nao-encontrado"
        ? `Nenhum Pokémon encontrado para "<b>${escaparHTML(termo)}</b>".<br>Confira a grafia (em inglês) ou tente um número de 1 a ${TOTAL_POKEMON}.`
        : "Não foi possível consultar a PokeAPI agora.<br>Verifique sua conexão e tente novamente.";
    areaResultado.innerHTML = `<div class="erro">${mensagem}</div>`;
  }
}

// ---------- CREATE: publicar avaliação ----------
async function salvarAvaliacao(evento) {
  evento.preventDefault();
  const form = evento.target;
  const msg = document.getElementById("msg-form");

  if (!db) {
    msg.textContent = "Supabase não configurado — veja o README.";
    return;
  }

  const { registro, erro } = montarAvaliacao(pokemonAtual, {
    nota: form.nota.value,
    comentario: form.comentario.value,
    autor: form.autor.value,
  });
  if (erro) {
    msg.textContent = erro;
    return;
  }

  form.querySelector("button").disabled = true;
  const { error } = await db.from("avaliacoes").insert(registro);
  form.querySelector("button").disabled = false;

  if (error) {
    msg.textContent = "Não foi possível salvar agora. Tente novamente.";
    return;
  }
  msg.textContent = "Avaliação publicada! ✅";
  form.nota.value = "";
  form.comentario.value = "";
  carregarAvaliacoes();
}

// ---------- READ: carregar o mural ----------
async function carregarAvaliacoes() {
  if (!db) {
    listaAvaliacoes.innerHTML =
      '<div class="aviso-config">Mural ainda não configurado.<br>' +
      "Preencha o config.js (ou as variáveis do Docker) — a busca acima já funciona.</div>";
    return;
  }

  const { data, error } = await db.from("avaliacoes")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    listaAvaliacoes.innerHTML =
      '<div class="erro">Não foi possível carregar o mural.<br>' +
      "Verifique sua conexão e as políticas RLS.</div>";
    return;
  }
  avaliacoes = data;
  renderizarMural();
}

function renderizarMural() {
  const filtro = filtroMural.value.trim().toLowerCase();
  const visiveis = avaliacoes.filter((a) =>
    !filtro ||
    a.nome.includes(normalizarTermo(filtro)) ||
    a.autor.toLowerCase().includes(filtro)
  );

  if (avaliacoes.length === 0) {
    listaAvaliacoes.innerHTML = "<p>Nenhuma avaliação ainda. Busque um Pokémon e seja o primeiro!</p>";
    return;
  }
  if (visiveis.length === 0) {
    listaAvaliacoes.innerHTML = "<p>Nada encontrado para esse filtro.</p>";
    return;
  }

  listaAvaliacoes.innerHTML = visiveis.map((a) => `
    <div class="aval-item">
      ${a.imagem ? `<img src="${escaparHTML(a.imagem)}" alt="${escaparHTML(a.nome)}">` : ""}
      <div class="aval-corpo">
        <div class="aval-titulo">
          <b>${formatarNumero(a.numero)} ${escaparHTML(formatarNome(a.nome))}</b>
          <span class="estrelas" title="${a.nota} de 5">${estrelas(a.nota)}</span>
        </div>
        ${a.comentario ? `<p>${escaparHTML(a.comentario)}</p>` : ""}
        <small>por ${escaparHTML(a.autor)} · ${new Date(a.criado_em).toLocaleDateString("pt-BR")}</small>
      </div>
      <button data-excluir="${a.id}" title="Excluir avaliação">✖</button>
    </div>`).join("");
}

// ---------- DELETE: excluir avaliação ----------
async function excluirAvaliacao(id) {
  if (!confirm("Excluir esta avaliação do mural?")) return;
  const { error } = await db.from("avaliacoes").delete().eq("id", id);
  if (error) {
    alert("Não foi possível excluir agora.");
    return;
  }
  carregarAvaliacoes();
}

// ---------- Eventos ----------
function dispararBusca() {
  if (!validarTermo(campoBusca.value)) {
    areaResultado.innerHTML =
      '<div class="erro">Digite um nome (ex.: pikachu) ou um número de 1 a ' + TOTAL_POKEMON + ".</div>";
    return;
  }
  buscarPokemon(normalizarTermo(campoBusca.value));
}

botaoBuscar.addEventListener("click", dispararBusca);

campoBusca.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") dispararBusca();
});

botaoAleatorio.addEventListener("click", () => {
  const sorteado = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
  campoBusca.value = sorteado;
  buscarPokemon(sorteado);
});

filtroMural.addEventListener("input", renderizarMural);

// Um único listener cuida de todos os botões de excluir do mural
listaAvaliacoes.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-excluir]");
  if (botao) excluirAvaliacao(Number(botao.dataset.excluir));
});

// Carrega o mural assim que a página abre
carregarAvaliacoes();
