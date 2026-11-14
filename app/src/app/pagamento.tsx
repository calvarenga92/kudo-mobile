import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ErroApi } from '@/api/cliente';
import { consultaCarrinho, consultaCarteiras } from '@/api/consultas';
import { useFinalizarPedido } from '@/hooks/usePedido';
import { Botao, Cartao, Carregando, Falha, Texto } from '@/ui/base';
import { PainelCenarios } from '@/ui/PainelCenarios';
import { ResumoCotacao } from '@/ui/ResumoCotacao';
import { espaco, tingir, useTema } from '@/ui/tema';

export default function Pagamento() {
  const router = useRouter();
  const { cores } = useTema();
  const { data: cotacao, isPending, isError, isFetching, refetch } = useQuery(consultaCarrinho);
  const { data: carteiras } = useQuery(consultaCarteiras);
  const finalizar = useFinalizarPedido();
  const [carteiraId, definirCarteiraId] = useState<string | null>(null);

  useEffect(() => {
    if (!carteiraId && carteiras?.length) {
      definirCarteiraId((carteiras.find((c) => c.principal) ?? carteiras[0]).id);
    }
  }, [carteiras, carteiraId]);

  if (isPending) return <Carregando />;
  if (isError) return <Falha mensagem="Não foi possível carregar a cotação." aoTentar={refetch} />;

  function confirmar() {
    if (!cotacao || !carteiraId) return;
    finalizar.mutate(
      { versaoCotacao: cotacao.versao, carteiraId },
      { onSuccess: (pedido) => router.replace(`/pedido/${pedido.id}`) },
    );
  }

  const erro = finalizar.error instanceof ErroApi ? finalizar.error : null;
  const semConexao = erro?.codigo === 'SEM_CONEXAO';
  const cotacaoVelha = erro?.codigo === 'COTACAO_DESATUALIZADA';
  const vazio = cotacao.itens.length === 0;

  return (
    <ScrollView contentContainerStyle={{ padding: espaco(4), gap: espaco(4) }}>
      <View style={{ gap: espaco(2) }} accessibilityRole="radiogroup">
        <Texto variante="rotulo">Carteira</Texto>
        {carteiras?.map((c) => {
          const ativa = c.id === carteiraId;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: ativa }}
              onPress={() => definirCarteiraId(c.id)}
              disabled={finalizar.isPending || semConexao}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: espaco(3),
                padding: ativa ? espaco(3.5) - 1 : espaco(3.5), borderRadius: 16,
                borderWidth: ativa ? 2 : 1, backgroundColor: cores.surface,
                borderColor: ativa ? cores.primary : cores.borderSubtle,
              }}
            >
              <View style={{ flex: 1 }}>
                <Texto variante="rotulo">{c.apelido} · {c.rede}</Texto>
                <Texto variante="legenda" numberOfLines={1} ellipsizeMode="middle">{c.endereco}</Texto>
              </View>
              <View style={{
                width: 20, height: 20, borderRadius: 10,
                borderWidth: ativa ? 6 : 2, borderColor: ativa ? cores.primary : cores.borderStrong,
              }} />
            </Pressable>
          );
        })}
      </View>

      <ResumoCotacao valores={cotacao} />

      {erro && (
        <Cartao estilo={{
          gap: espaco(1), borderWidth: 0,
          backgroundColor: tingir(semConexao ? '#d97706' : cores.danger, cores.surface, 0.14),
        }}>
          <Texto
            variante="rotulo"
            style={{ color: semConexao ? (cores.escuro ? '#fbbf24' : '#a86412') : cores.danger }}
            accessibilityLiveRegion="assertive"
          >
            {erro.message}
          </Texto>
          {semConexao && (
            <Texto variante="legenda">
              Não sabemos se o pagamento chegou. Pode tentar de novo: você não será cobrado
              duas vezes.
            </Texto>
          )}
          {cotacaoVelha && (
            <Botao variante="secundario" aoPressionar={() => { finalizar.reset(); void refetch(); }}>
              Ver valores atualizados
            </Botao>
          )}
        </Cartao>
      )}

      <Botao
        aoPressionar={confirmar}
        carregando={finalizar.isPending}
        desabilitado={(vazio && !semConexao) || !carteiraId || cotacaoVelha || (isFetching && !semConexao)}
      >
        {semConexao ? 'Tentar pagar de novo' : 'Pagar'}
      </Botao>
      {vazio && !semConexao && <Texto variante="legenda">O carrinho está vazio.</Texto>}

      <Texto variante="legenda" selectable>Demonstração · chave desta tentativa: {finalizar.chaveAtual}</Texto>
      <PainelCenarios />
    </ScrollView>
  );
}
