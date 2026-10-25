/* ============================================================
   Pokédex — Bootcamp II · Etapa 02
   Etapa 01: consumo da PokeAPI com fetch + tratamento de erros
   Etapa 02: persistência de favoritos no Supabase (CRUD)
   ============================================================ */

// ---------- Etapa 01: consulta à API pública ----------

// URL base da API: apenas o termo de busca muda a cada consulta
const URL_BASE = "https://pokeapi.co/api/v2/pokemon/";

// Total de Pokémon da Pokédex Nacional (usado no botão Aleatório)
const TOTAL_POKEMON = 1025;

// Referências aos elementos da página (as "alças" do HTML)
const campoBusca = document.getElementById("campo-busca");
const botaoBuscar = document.getElementById("botao-buscar");
const botaoAleatorio = document.getElementById("botao-aleatorio");
const areaResultado = document.getElementById("resultado");
const listaFavoritos = document.getElementById("lista-favoritos");

// ---------- Etapa 02: conexão com o banco (usa config.js) ----------
// Se o config.js ainda estiver com os placeholders, a aplicação segue
// funcionando (busca da Etapa 01) e avisa na área de favoritos.

const supabaseConfigurado =
  typeof SUPABASE_URL === "string" &&
  !SUPABASE_URL.includes("SEU-PROJETO") &&
  typeof supabase !== "undefined";

const db = supabaseConfigurado
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ---------- Função principal da Etapa 01: consulta e monta o cartão ----------
async function buscarPokemon(termo) {
  // Feedback imediato: a requisição demora, o usuário precisa saber
  areaResultado.innerHTML = '<p class="carregando">Carregando...</p>';

  try {
    // 1) Requisição assíncrona à API
    const resposta = await fetch(URL_BASE + termo);

    // 2) O fetch NÃO lança erro em 404 — verificamos manualmente.
    if (!resposta.ok) throw new Error("nao-encontrado");

    // 3) Converte o corpo da resposta (texto JSON) em objeto JavaScript
    const dados = await resposta.json();

    // 4) Extrai as informações (6 — o mínimo exigido era 3)
    const nome = dados.name;
    const numero = dados.id;
    const imagem = dados.sprites.front_default;
    const altura = dados.height / 10; // decímetros -> metros
    const peso = dados.weight / 10;   // hectogramas -> kg
    const tipos = dados.types
      .map((t) => `<span class="tipo">${t.type.name}</span>`)
      .join("");

    // 5) Monta o HTML do cartão (sprite nulo ganha um marcador)
    const imgHTML = imagem
      ? `<img src="${imagem}" alt="Imagem de ${nome}">`
      : `<p style="font-size:4rem">❓</p>`;

    // NOVO (Etapa 02): botão de salvar nos favoritos dentro do cartão
    areaResultado.innerHTML = `
      <article class="cartao">
        ${imgHTML}
        <h2>#${numero} — ${nome}</h2>
        <p>${tipos}</p>
        <p class="info">
          <b>Altura:</b> ${altura} m &nbsp;·&nbsp; <b>Peso:</b> ${peso} kg
        </p>
        <button class="btn-favoritar"
          onclick="salvarFavorito(${numero}, '${nome}', '${imagem}')">
          ⭐ Salvar nos favoritos
        </button>
      </article>`;
  } catch (erro) {
    // Dois erros, duas mensagens (como na Etapa 01)
    const mensagem =
      erro.message === "nao-encontrado"
        ? `Nenhum Pokémon encontrado para "<b>${termo}</b>".<br>Confira a grafia (em inglês) ou tente um número de 1 a ${TOTAL_POKEMON}.`
        : "Não foi possível consultar a PokeAPI agora.<br>Verifique sua conexão e tente novamente.";

    areaResultado.innerHTML = `<div class="erro">${mensagem}</div>`;
  }
}

// ============================================================
// Etapa 02 — CRUD de favoritos no Supabase
// Padrão do supabase-js: toda chamada retorna { data, error }.
// Ignorar o error é a causa nº 1 de "salvei mas não salvou".
// ============================================================

// ---------- CREATE: salvar o Pokémon exibido como favorito ----------
async function salvarFavorito(numero, nome, imagem) {
  if (!db) {
    alert("Configure o Supabase no config.js para salvar favoritos (tutorial, Passo 2).");
    return;
  }
  const { error } = await db.from("favoritos")
                            .insert({ numero, nome, imagem });
  if (error) {
    // 23505 = violação de UNIQUE no banco: o Pokémon já é favorito
    const msg = error.code === "23505"
      ? `${nome} já está nos seus favoritos!`
      : "Não foi possível salvar agora. Tente novamente.";
    alert(msg);
    return;
  }
  carregarFavoritos();   // atualiza a lista na tela
}

// ---------- READ: carregar e exibir os favoritos ----------
async function carregarFavoritos() {
  if (!db) {
    listaFavoritos.innerHTML =
      '<div class="aviso-config">Favoritos ainda não configurados.<br>' +
      "Siga o Passo 2 do tutorial para conectar o Supabase — " +
      "a busca acima já funciona normalmente.</div>";
    return;
  }

  const { data, error } = await db.from("favoritos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    listaFavoritos.innerHTML =
      '<div class="erro">Não foi possível carregar os favoritos.<br>' +
      "Verifique sua conexão e as políticas RLS (tutorial, Passo 2.3).</div>";
    return;
  }
  if (data.length === 0) {
    listaFavoritos.innerHTML = "<p>Nenhum favorito ainda. Busque e salve!</p>";
    return;
  }
  listaFavoritos.innerHTML = data.map((f) => `
    <div class="fav-item">
      <img src="${f.imagem}" alt="${f.nome}">
      <span>#${f.numero} ${f.nome}</span>
      <button onclick="removerFavorito(${f.numero})" title="Remover">✖</button>
    </div>`).join("");
}

// ---------- DELETE: remover um favorito ----------
async function removerFavorito(numero) {
  const { error } = await db.from("favoritos")
                            .delete().eq("numero", numero);
  if (error) {
    alert("Não foi possível remover agora.");
    return;
  }
  carregarFavoritos();
}

// ---------- Eventos: botão Buscar, tecla Enter e botão Aleatório ----------
function dispararBusca() {
  // Higienização: a PokeAPI só aceita minúsculas
  const termo = campoBusca.value.toLowerCase().trim();
  if (termo) buscarPokemon(termo);
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

// ---------- Carrega a lista de favoritos assim que a página abre ----------
carregarFavoritos();
