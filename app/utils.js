/* ============================================================
   Funções puras da Pokédex do Time — sem DOM, sem rede.
   Por isso são fáceis de testar (ver tests/utils.test.js).
   ============================================================ */

// Total de Pokémon da Pokédex Nacional
export const TOTAL_POKEMON = 1025;

// Higieniza o que o usuário digitou: a PokeAPI só aceita minúsculas
// e não entende espaços (ex.: "Mr Mime" -> "mr-mime")
export function normalizarTermo(texto) {
  return String(texto ?? "").trim().toLowerCase().replace(/\s+/g, "-");
}

// Um termo é válido se for um número dentro da Pokédex
// ou um nome com letras, números e hífens
export function validarTermo(texto) {
  const termo = normalizarTermo(texto);
  if (termo === "") return false;
  if (/^\d+$/.test(termo)) {
    const numero = Number(termo);
    return numero >= 1 && numero <= TOTAL_POKEMON;
  }
  return /^[a-z0-9-]+$/.test(termo);
}

// "mr-mime" -> "Mr Mime"
export function formatarNome(nome) {
  return String(nome ?? "")
    .split("-")
    .filter(Boolean)
    .map((parte) => parte[0].toUpperCase() + parte.slice(1))
    .join(" ");
}

// A PokeAPI devolve altura em decímetros e peso em hectogramas
export function converterAltura(decimetros) {
  return decimetros / 10;
}

export function converterPeso(hectogramas) {
  return hectogramas / 10;
}

// Número sempre com 3 dígitos, como na Pokédex dos jogos: 25 -> "#025"
export function formatarNumero(numero) {
  return "#" + String(numero).padStart(3, "0");
}

// ---------- Avaliações (persistidas no Supabase) ----------

// Nota é um inteiro de 1 a 5 estrelas (aceita "4" vindo do <select>)
export function validarNota(nota) {
  const n = Number(nota);
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

// Autor: 2 a 40 caracteres depois de tirar os espaços das pontas
export function validarAutor(autor) {
  const nome = String(autor ?? "").trim();
  return nome.length >= 2 && nome.length <= 40;
}

// 4 -> "★★★★☆"
export function estrelas(nota) {
  const n = Math.max(0, Math.min(5, Math.round(Number(nota) || 0)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

// Comentários e nomes vêm de outras pessoas: nunca entram no
// innerHTML sem escapar (senão um "<script>" viraria código)
export function escaparHTML(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Monta o registro que vai para a tabela "avaliacoes" a partir do
// JSON da PokeAPI + formulário. Retorna { erro } se algo for inválido.
export function montarAvaliacao(pokemon, { nota, comentario, autor }) {
  if (!validarNota(nota)) return { erro: "Escolha uma nota de 1 a 5." };
  if (!validarAutor(autor)) return { erro: "Informe seu nome (2 a 40 letras)." };
  const texto = String(comentario ?? "").trim();
  if (texto.length > 280) return { erro: "Comentário com no máximo 280 caracteres." };
  return {
    registro: {
      numero: pokemon.id,
      nome: pokemon.name,
      imagem: pokemon.sprites?.front_default ?? null,
      tipos: (pokemon.types ?? []).map((t) => t.type.name),
      nota: Number(nota),
      comentario: texto || null,
      autor: String(autor).trim(),
    },
  };
}

// ---------- Ranking do time ----------

// Agrupa as avaliações por Pokémon e ordena pela média de notas
// (desempate: quem tem mais avaliações; depois o número da Pokédex)
export function calcularRanking(avaliacoes, limite = 5) {
  const grupos = new Map();
  for (const a of avaliacoes) {
    const g = grupos.get(a.numero) ?? { numero: a.numero, nome: a.nome, imagem: a.imagem, soma: 0, total: 0 };
    g.soma += a.nota;
    g.total += 1;
    grupos.set(a.numero, g);
  }
  return [...grupos.values()]
    .map(({ soma, ...g }) => ({ ...g, media: Math.round((soma / g.total) * 10) / 10 }))
    .sort((x, y) => y.media - x.media || y.total - x.total || x.numero - y.numero)
    .slice(0, limite);
}
