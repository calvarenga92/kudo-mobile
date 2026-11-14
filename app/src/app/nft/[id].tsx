import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { formatarEth } from '@calvarenga92/kurio-regras';
import { ErroApi } from '@/api/cliente';
import { consultaNft, useAdicionarItem } from '@/api/consultas';
import { Botao, Carregando, Falha, ImagemNft, Texto, Valor } from '@/ui/base';
import { TINTAS, espaco, tingir, useTema } from '@/ui/tema';

export default function DetalheNft() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cores } = useTema();
  const { data: nft, isPending, isError, refetch } = useQuery(consultaNft(id));
  const adicionar = useAdicionarItem();
  const [edicaoId, definirEdicaoId] = useState<string | null>(null);

  if (isPending) return <Carregando />;
  if (isError) return <Falha mensagem="Não foi possível carregar esta peça." aoTentar={refetch} />;

  const edicao = nft.edicoes.find((e) => e.id === edicaoId)
    ?? nft.edicoes.find((e) => e.disponivel > 0) ?? nft.edicoes[0];
  const erro = adicionar.error instanceof ErroApi ? adicionar.error : null;

  return (
    <ScrollView contentContainerStyle={{ padding: espaco(4), gap: espaco(4) }}>
      <Stack.Screen options={{ title: nft.titulo }} />
      <View style={{ padding: espaco(2), borderRadius: 28, backgroundColor: tingir(TINTAS[nft.imagemUrl], cores.surface, 0.35) }}>
        <ImagemNft chave={nft.imagemUrl} rotulo={nft.titulo} arredondamento={22} />
      </View>
      <View style={{ gap: espaco(1) }}>
        <Texto variante="legenda" style={{ color: cores.secondary, fontWeight: '700', letterSpacing: 1 }}>
          {nft.colecao.nome.toUpperCase()}
        </Texto>
        <Texto variante="destaque">{nft.titulo}</Texto>
        <Texto variante="legenda">por {nft.autor}</Texto>
      </View>
      <Texto style={{ color: cores.muted }}>{nft.descricao}</Texto>

      <View style={{ gap: espaco(2) }} accessibilityRole="radiogroup">
        <Texto variante="rotulo">Edição</Texto>
        {nft.edicoes.map((e) => {
          const ativa = e.id === edicao.id;
          const esgotada = e.disponivel === 0;
          return (
            <Pressable
              key={e.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: ativa, disabled: esgotada }}
              disabled={esgotada}
              onPress={() => { definirEdicaoId(e.id); adicionar.reset(); }}
              style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                padding: ativa ? espaco(3.5) - 1 : espaco(3.5), borderRadius: 16,
                borderWidth: ativa ? 2 : 1, backgroundColor: cores.surface,
                borderColor: ativa ? cores.primary : cores.borderSubtle,
                opacity: esgotada ? 0.5 : 1,
              }}
            >
              <View>
                <Texto variante="rotulo">{e.rotulo}</Texto>
                <Texto variante="legenda">
                  {esgotada ? 'Esgotada' : `${e.disponivel} ${e.disponivel === 1 ? 'disponível' : 'disponíveis'} · até ${e.limitePorPedido} por pedido`}
                </Texto>
              </View>
              <Valor style={{ fontWeight: '700', fontSize: 14 }}>{formatarEth(e.precoEth)}</Valor>
            </Pressable>
          );
        })}
      </View>

      {erro && <Texto style={{ color: cores.danger }} accessibilityLiveRegion="polite">{erro.message}</Texto>}
      {adicionar.isSuccess && (
        <Texto style={{ color: cores.success }} accessibilityLiveRegion="polite">Adicionado ao carrinho.</Texto>
      )}

      <Botao
        aoPressionar={() => adicionar.mutate({ nftId: nft.id, edicaoId: edicao.id })}
        carregando={adicionar.isPending}
        desabilitado={edicao.disponivel === 0}
      >
        Adicionar ao carrinho
      </Botao>
      {adicionar.isSuccess && (
        <Botao variante="secundario" aoPressionar={() => router.push('/carrinho')}>Ir para o carrinho</Botao>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: espaco(2) }}>
        {nft.atributos.map((a) => (
          <View key={a.nome} style={{ flexGrow: 1, minWidth: 96, padding: espaco(3), borderRadius: 14, backgroundColor: cores.surface2 }}>
            <Texto variante="legenda">{a.nome}</Texto>
            <Texto variante="rotulo">{a.valor}</Texto>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
