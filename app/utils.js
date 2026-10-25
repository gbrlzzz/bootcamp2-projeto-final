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
