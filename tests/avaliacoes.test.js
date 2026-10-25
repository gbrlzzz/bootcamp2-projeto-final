import { describe, test, expect } from "vitest";
import {
  validarNota,
  validarAutor,
  estrelas,
  escaparHTML,
  montarAvaliacao,
} from "../app/utils.js";

// Recorte do JSON real de https://pokeapi.co/api/v2/pokemon/pikachu
const pikachu = {
  id: 25,
  name: "pikachu",
  sprites: { front_default: "https://exemplo/25.png" },
  types: [{ type: { name: "electric" } }],
};

describe("validações da avaliação", () => {
  test("nota só de 1 a 5, inteira", () => {
    expect(validarNota("4")).toBe(true);
    expect(validarNota(0)).toBe(false);
    expect(validarNota(6)).toBe(false);
    expect(validarNota(3.5)).toBe(false);
  });

  test("autor precisa de 2 a 40 caracteres", () => {
    expect(validarAutor("Gabriel")).toBe(true);
    expect(validarAutor(" a ")).toBe(false);
    expect(validarAutor("x".repeat(41))).toBe(false);
  });
});

describe("exibição", () => {
  test("converte nota em estrelas", () => {
    expect(estrelas(4)).toBe("★★★★☆");
    expect(estrelas(0)).toBe("☆☆☆☆☆");
  });

  test("escapa HTML de comentários", () => {
    expect(escaparHTML('<img src=x onerror="alert(1)">')).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"
    );
  });
});

describe("montarAvaliacao", () => {
  test("monta o registro a partir da PokeAPI e do formulário", () => {
    const { registro, erro } = montarAvaliacao(pikachu, {
      nota: "5",
      comentario: "  O melhor!  ",
      autor: " Gabriel ",
    });
    expect(erro).toBeUndefined();
    expect(registro).toEqual({
      numero: 25,
      nome: "pikachu",
      imagem: "https://exemplo/25.png",
      tipos: ["electric"],
      nota: 5,
      comentario: "O melhor!",
      autor: "Gabriel",
    });
  });

  test("devolve erro com nota inválida e comentário vazio vira null", () => {
    expect(montarAvaliacao(pikachu, { nota: 9, autor: "Ana" }).erro).toMatch(/nota/);
    expect(montarAvaliacao(pikachu, { nota: 3, autor: "Ana" }).registro.comentario).toBeNull();
  });
});
