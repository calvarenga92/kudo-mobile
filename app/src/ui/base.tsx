import type { ReactNode } from 'react';
import {
  ActivityIndicator, Pressable, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AMOSTRAS, LISTA_TEMAS, TEMAS, espaco, fonte, fonteMono, raio, useTema, type Cores,
} from './tema';

type Variante = 'titulo' | 'corpo' | 'legenda' | 'rotulo' | 'destaque';

function estiloTexto(cores: Cores, variante: Variante): TextStyle {
  const base: TextStyle = { color: cores.foreground, fontFamily: fonte };
  switch (variante) {
    case 'destaque': return { ...base, fontSize: 30, lineHeight: 34, fontWeight: '800', letterSpacing: -0.8 };
    case 'titulo': return { ...base, fontSize: 22, lineHeight: 28, fontWeight: '800', letterSpacing: -0.4 };
    case 'legenda': return { ...base, fontSize: 12, lineHeight: 18, color: cores.muted };
    case 'rotulo': return { ...base, fontSize: 14, lineHeight: 18, fontWeight: '700' };
    default: return { ...base, fontSize: 14, lineHeight: 22 };
  }
}

export function Texto({ style, variante = 'corpo', ...props }: TextProps & { variante?: Variante }) {
  const { cores } = useTema();
  return <Text {...props} style={[estiloTexto(cores, variante), style]} />;
}

/** Valores em ETH: mono, para os dígitos alinharem. */
export function Valor({ style, ...props }: TextProps) {
  const { cores } = useTema();
  return <Text {...props} style={[{ color: cores.foreground, fontFamily: fonteMono, fontSize: 13 }, style]} />;
}

export function PrecoPilula({ children }: { children: ReactNode }) {
  const { cores } = useTema();
  return (
    <View style={{ backgroundColor: cores.preco, borderRadius: 999, paddingHorizontal: espaco(2.5), paddingVertical: espaco(1) }}>
      <Text style={{ color: cores.precoInk, fontFamily: fonteMono, fontSize: 12, fontWeight: '700' }}>{children}</Text>
    </View>
  );
}

interface PropsBotao {
  children: ReactNode;
  aoPressionar: () => void;
  variante?: 'primario' | 'secundario' | 'claro';
  desabilitado?: boolean;
  carregando?: boolean;
  estilo?: StyleProp<ViewStyle>;
  rotuloAcessivel?: string;
  compacto?: boolean;
}

export function Botao({
  children, aoPressionar, variante = 'primario', desabilitado, carregando, estilo, rotuloAcessivel, compacto,
}: PropsBotao) {
  const { cores } = useTema();
  const inativo = desabilitado || carregando;
  const corTexto = variante === 'primario' ? cores.ctaInk : variante === 'claro' ? '#16110e' : cores.foreground;
  const caixa: ViewStyle = {
    minHeight: compacto ? 36 : 52, paddingHorizontal: compacto ? espaco(3) : espaco(5),
    borderRadius: compacto ? 12 : 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  };
  const conteudo = carregando ? (
    <ActivityIndicator color={corTexto} />
  ) : (
    <Text style={{ color: corTexto, fontFamily: fonte, fontSize: compacto ? 14 : 15, fontWeight: '700' }}>{children}</Text>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      disabled={inativo}
      onPress={aoPressionar}
      style={({ pressed }) => [
        { borderRadius: caixa.borderRadius, opacity: inativo ? 0.5 : pressed ? 0.85 : 1 },
        variante === 'primario' && !cores.escuro && {
          shadowColor: cores.cta[1], shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 8 },
        },
        estilo,
      ]}
    >
      {variante === 'primario' ? (
        <LinearGradient colors={cores.cta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={caixa}>{conteudo}</LinearGradient>
      ) : (
        <View style={[caixa, variante === 'claro'
          ? { backgroundColor: '#ffffff' }
          : { borderWidth: 1, borderColor: cores.borderStrong, backgroundColor: cores.surface }]}
        >
          {conteudo}
        </View>
      )}
    </Pressable>
  );
}

export function Carregando() {
  const { cores } = useTema();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: espaco(6) }}>
      <ActivityIndicator color={cores.primary} size="large" />
    </View>
  );
}

export function Falha({ mensagem, aoTentar }: { mensagem: string; aoTentar?: () => void }) {
  const { cores } = useTema();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: espaco(6) }}>
      <Texto style={{ color: cores.danger, textAlign: 'center' }}>{mensagem}</Texto>
      {aoTentar && <Botao variante="secundario" aoPressionar={aoTentar} estilo={{ marginTop: espaco(4) }}>Tentar de novo</Botao>}
    </View>
  );
}

export function Linha({ termo, valor, destaque, cor }: { termo: string; valor: string; destaque?: boolean; cor?: string }) {
  const { cores } = useTema();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingVertical: espaco(1.5), gap: espaco(3) }}>
      <Texto variante={destaque ? 'rotulo' : 'corpo'} style={[{ flexShrink: 1 }, !destaque && { color: cores.muted }]}>{termo}</Texto>
      <Valor style={[destaque && { fontSize: 16, fontWeight: '700' }, cor ? { color: cor } : null]}>{valor}</Valor>
    </View>
  );
}

export function Cartao({ children, estilo }: { children: ReactNode; estilo?: StyleProp<ViewStyle> }) {
  const { cores } = useTema();
  return (
    <View style={[{
      backgroundColor: cores.surface, borderColor: cores.borderSubtle, borderWidth: 1,
      borderRadius: 20, padding: espaco(4),
    }, estilo]}
    >
      {children}
    </View>
  );
}

/** Bloco colorido do topo: degradê do tema, texto sempre legível sobre ele. */
export function BlocoTopo({ children, estilo }: { children: ReactNode; estilo?: StyleProp<ViewStyle> }) {
  const { cores } = useTema();
  return (
    <LinearGradient
      colors={cores.topo}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: 28, padding: espaco(5), gap: espaco(3), overflow: 'hidden' }, estilo]}
    >
      {children}
    </LinearGradient>
  );
}

/** Troca de tema: grupo de rádio com uma amostra por tema. */
export function SeletorTema() {
  const { tema, definir, cores } = useTema();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Tema de cores"
      style={{
        flexDirection: 'row', gap: espaco(1), padding: espaco(1), borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.18)',
      }}
    >
      {LISTA_TEMAS.map((opcao) => {
        const ativo = opcao === tema;
        return (
          <Pressable
            key={opcao}
            accessibilityRole="radio"
            accessibilityLabel={TEMAS[opcao].nome}
            accessibilityState={{ checked: ativo }}
            onPress={() => definir(opcao)}
            hitSlop={6}
            style={{
              borderRadius: 999, padding: 2,
              borderWidth: 2, borderColor: ativo ? cores.topoInk : 'transparent',
            }}
          >
            <LinearGradient colors={AMOSTRAS[opcao]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ width: 22, height: 22, borderRadius: 11 }} />
          </Pressable>
        );
      })}
    </View>
  );
}

const ILUSTRACOES: Record<string, number> = {
  'nft-01': require('../../assets/nfts/nft-01.png'),
  'nft-02': require('../../assets/nfts/nft-02.png'),
  'nft-03': require('../../assets/nfts/nft-03.png'),
  'nft-04': require('../../assets/nfts/nft-04.png'),
  'nft-05': require('../../assets/nfts/nft-05.png'),
  'nft-06': require('../../assets/nfts/nft-06.png'),
  'nft-07': require('../../assets/nfts/nft-07.png'),
  'nft-08': require('../../assets/nfts/nft-08.png'),
  'nft-09': require('../../assets/nfts/nft-09.png'),
  'nft-10': require('../../assets/nfts/nft-10.png'),
  'nft-11': require('../../assets/nfts/nft-11.png'),
  'nft-12': require('../../assets/nfts/nft-12.png'),
};

export function ImagemNft({ chave, tamanho, rotulo, arredondamento = raio }: {
  chave: string; tamanho?: number; rotulo: string; arredondamento?: number;
}) {
  const { cores } = useTema();
  return (
    <Image
      source={ILUSTRACOES[chave]}
      accessibilityLabel={rotulo}
      contentFit="cover"
      style={[{ aspectRatio: 1, borderRadius: arredondamento, backgroundColor: cores.surface2 },
        tamanho ? { width: tamanho } : { width: '100%' }]}
    />
  );
}
