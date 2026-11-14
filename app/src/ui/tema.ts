import { createContext, createElement, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

/**
 * Três temas com os mesmos tokens da versão web do Kudo (src/index.css).
 * As telas pedem as cores ao contexto, então trocar de tema não exige
 * nenhuma tela saber qual tema está ativo.
 */
export interface Cores {
  ink: string;
  surface: string;
  surface2: string;
  borderSubtle: string;
  borderStrong: string;
  primary: string;
  primaryInk: string;
  secondary: string;
  foreground: string;
  muted: string;
  danger: string;
  success: string;
  preco: string;
  precoInk: string;
  /** CTA: uma cor só ou as duas pontas de um degradê. */
  cta: [string, string];
  ctaInk: string;
  /** Bloco de destaque do topo. */
  topo: [string, string, ...string[]];
  topoInk: string;
  escuro: boolean;
}

export const TEMAS = {
  quente: {
    nome: 'Gradiente quente',
    cores: {
      ink: '#fff7ef', surface: '#ffffff', surface2: '#f7eee5',
      borderSubtle: '#efe3d7', borderStrong: '#ddcbb9',
      primary: '#5b3df0', primaryInk: '#ffffff', secondary: '#c2410c',
      foreground: '#16110e', muted: '#6b5f57', danger: '#c62828', success: '#12804f',
      preco: '#16110e', precoInk: '#ffffff',
      cta: ['#d9361a', '#c8175a'], ctaInk: '#ffffff',
      topo: ['#6b4dff', '#b44be0', '#ff5a36'], topoInk: '#ffffff',
      escuro: false,
    },
  },
  neon: {
    nome: 'Noturna neon',
    cores: {
      ink: '#0e0c14', surface: '#1a1724', surface2: '#24203a',
      borderSubtle: '#2b2740', borderStrong: '#3d3858',
      primary: '#c8f05a', primaryInk: '#0e0c14', secondary: '#a08bff',
      foreground: '#f3f0ff', muted: '#a49fbd', danger: '#ff6b6b', success: '#5cf0a8',
      preco: '#c8f05a', precoInk: '#0e0c14',
      cta: ['#c8f05a', '#c8f05a'], ctaInk: '#0e0c14',
      topo: ['#15121f', '#2a1f63', '#5b3df5'], topoInk: '#f3f0ff',
      escuro: true,
    },
  },
  eletrica: {
    nome: 'Elétrica',
    cores: {
      ink: '#f4f5f9', surface: '#ffffff', surface2: '#eceef5',
      borderSubtle: '#e3e5ee', borderStrong: '#c9cedd',
      primary: '#2b45ff', primaryInk: '#ffffff', secondary: '#5b3df0',
      foreground: '#0b0b10', muted: '#5b6070', danger: '#c62828', success: '#12804f',
      preco: '#2b45ff', precoInk: '#ffffff',
      cta: ['#d4ff3a', '#d4ff3a'], ctaInk: '#0b0b10',
      topo: ['#2b45ff', '#2b45ff'], topoInk: '#ffffff',
      escuro: false,
    },
  },
} satisfies Record<string, { nome: string; cores: Cores }>;

export type Tema = keyof typeof TEMAS;
export const LISTA_TEMAS = Object.keys(TEMAS) as Tema[];

/** Amostra de cada tema no seletor. */
export const AMOSTRAS: Record<Tema, [string, string]> = {
  quente: ['#6b4dff', '#ff5a36'],
  neon: ['#15121f', '#c8f05a'],
  eletrica: ['#2b45ff', '#d4ff3a'],
};

export const fonte = Platform.select({
  web: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
  default: undefined,
});

export const fonteMono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: '"JetBrains Mono", ui-monospace, Menlo, monospace',
});

export const raio = 14;
export const espaco = (n: number) => n * 4;

const CHAVE = 'kudo:tema';

function valido(valor: unknown): valor is Tema {
  return typeof valor === 'string' && valor in TEMAS;
}

/** No web o tema vem de ?tema= ou do que ficou salvo; no app nativo começa no padrão. */
function temaInicial(): Tema {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return 'quente';
  try {
    const daUrl = new URLSearchParams(window.location.search).get('tema');
    if (valido(daUrl)) {
      window.localStorage.setItem(CHAVE, daUrl);
      return daUrl;
    }
    const salvo = window.localStorage.getItem(CHAVE);
    return valido(salvo) ? salvo : 'quente';
  } catch {
    return 'quente';
  }
}

interface ValorTema {
  tema: Tema;
  cores: Cores;
  definir: (tema: Tema) => void;
}

const Contexto = createContext<ValorTema | null>(null);

export function ProvedorTema({ children }: { children: ReactNode }) {
  const [tema, definirTema] = useState<Tema>(temaInicial);

  const definir = useCallback((novo: Tema) => {
    definirTema(novo);
    if (Platform.OS === 'web') {
      try { window.localStorage.setItem(CHAVE, novo); } catch { /* sem storage: vale só nesta visita */ }
    }
  }, []);

  const valor = useMemo(() => ({ tema, cores: TEMAS[tema].cores, definir }), [tema, definir]);
  return createElement(Contexto.Provider, { value: valor }, children);
}

export function useTema(): ValorTema {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useTema precisa do ProvedorTema');
  return valor;
}

/** Cor dominante de cada arte, para tingir o cartão (mesmo mapa do web). */
export const TINTAS: Record<string, string> = {
  'nft-01': '#2fd39a', 'nft-02': '#b9c27a', 'nft-03': '#ff3d9e', 'nft-04': '#ff7a59',
  'nft-05': '#7b5cff', 'nft-06': '#e0915f', 'nft-07': '#ffb800', 'nft-08': '#e8b54a',
  'nft-09': '#00c2b8', 'nft-10': '#ff9a2e', 'nft-11': '#5b6bff', 'nft-12': '#ff2e4d',
};

/** Mistura a tinta da arte com a superfície (equivalente ao color-mix do web). */
export function tingir(tinta: string | undefined, superficie: string, proporcao = 0.22): string {
  if (!tinta) return superficie;
  const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [a, b] = [rgb(tinta), rgb(superficie)];
  const mix = a.map((v, i) => Math.round(v * proporcao + b[i] * (1 - proporcao)));
  return `#${mix.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
