import { describe, test, expect } from "vitest";
import { calcularRanking } from "../app/utils.js";

const av = (numero, nome, nota) => ({ numero, nome, imagem: null, nota });

describe("calcularRanking", () => {
  test("agrupa por Pokémon e calcula a média com 1 casa", () => {
    const ranking = calcularRanking([av(25, "pikachu", 5), av(25, "pikachu", 4), av(1, "bulbasaur", 3)]);
    expect(ranking[0]).toEqual({ numero: 25, nome: "pikachu", imagem: null, total: 2, media: 4.5 });
    expect(ranking[1].media).toBe(3);
  });

  test("desempata pelo número de avaliações", () => {
    const ranking = calcularRanking([av(4, "charmander", 4), av(7, "squirtle", 4), av(7, "squirtle", 4)]);
    expect(ranking.map((r) => r.nome)).toEqual(["squirtle", "charmander"]);
  });

  test("ordena pela média exata, não pela arredondada", () => {
    // charmander: 4.04 (25 votos) · squirtle: 4.0 (30 votos) — ambos exibem 4.0
    const charmander = [...Array(24).fill(4), 5].map((n) => av(4, "charmander", n));
    const squirtle = Array(30).fill(4).map((n) => av(7, "squirtle", n));
    const ranking = calcularRanking([...squirtle, ...charmander]);
    expect(ranking.map((r) => r.nome)).toEqual(["charmander", "squirtle"]);
    expect(ranking[0].media).toBe(4);
  });

  test("respeita o limite e funciona com lista vazia", () => {
    const muitas = Array.from({ length: 8 }, (_, i) => av(i + 1, `p${i + 1}`, 3));
    expect(calcularRanking(muitas, 3)).toHaveLength(3);
    expect(calcularRanking([])).toEqual([]);
  });
});
