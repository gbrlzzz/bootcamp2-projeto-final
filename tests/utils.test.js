import { describe, test, expect } from "vitest";
import {
  normalizarTermo,
  validarTermo,
  formatarNome,
  converterAltura,
  converterPeso,
  formatarNumero,
} from "../app/utils.js";

describe("normalizarTermo", () => {
  test("remove espaços das pontas e passa para minúsculas", () => {
    expect(normalizarTermo("  PikaChu ")).toBe("pikachu");
  });

  test("troca espaços internos por hífen", () => {
    expect(normalizarTermo("Mr Mime")).toBe("mr-mime");
  });
});

describe("validarTermo", () => {
  test("rejeita entrada vazia", () => {
    expect(validarTermo("")).toBe(false);
    expect(validarTermo("   ")).toBe(false);
  });

  test("aceita nome válido", () => {
    expect(validarTermo("pikachu")).toBe(true);
  });

  test("aceita número dentro da Pokédex e rejeita fora dela", () => {
    expect(validarTermo("25")).toBe(true);
    expect(validarTermo("0")).toBe(false);
    expect(validarTermo("1026")).toBe(false);
  });

  test("rejeita caracteres especiais", () => {
    expect(validarTermo("pika<script>")).toBe(false);
  });
});

describe("formatação", () => {
  test("formata nome com inicial maiúscula", () => {
    expect(formatarNome("pikachu")).toBe("Pikachu");
    expect(formatarNome("mr-mime")).toBe("Mr Mime");
  });

  test("converte decímetros em metros e hectogramas em kg", () => {
    expect(converterAltura(4)).toBe(0.4);
    expect(converterPeso(60)).toBe(6);
  });

  test("formata número com 3 dígitos", () => {
    expect(formatarNumero(25)).toBe("#025");
    expect(formatarNumero(1025)).toBe("#1025");
  });
});
