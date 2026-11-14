import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { formatarEth } from '@calvarenga92/kudo-regras';
import { ErroApi } from '@/api/cliente';
import {
  consultaCarrinho, useAlterarQuantidade, useAplicarCupom, useRemoverCupom,
} from '@/api/consultas';
import { Botao, Cartao, Carregando, Falha, ImagemNft, Texto, Valor } from '@/ui/base';
import { ResumoCotacao } from '@/ui/ResumoCotacao';
import { TINTAS, espaco, fonte, tingir, useTema } from '@/ui/tema';

export default function Carrinho() {
  const router = useRouter();
  const { cores } = useTema();
  const { data: cotacao, isPending, isError, refetch } = useQuery(consultaCarrinho);
  const alterar = useAlterarQuantidade();
  const aplicar = useAplicarCupom();
  const remover = useRemoverCupom();
  const [codigo, definirCodigo] = useState('');

  if (isPending) return <Carregando />;
  if (isError) return <Falha mensagem="Não foi possível carregar o carrinho." aoTentar={refetch} />;

  if (cotacao.itens.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: espaco(4), padding: espaco(6) }}>
        <View style={{
          width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
          backgroundColor: tingir(cores.primary, cores.surface, 0.18),
        }}>
          <Texto style={{ fontSize: 34, lineHeight: 40, color: cores.primary }}>{'\u25C7'}</Texto>
        </View>
        <Texto variante="titulo">Carrinho vazio</Texto>
        <Texto variante="legenda" style={{ textAlign: 'center', maxWidth: 260 }}>
          Quando você adicionar uma peça, ela aparece aqui com a cotação atualizada.
        </Texto>
        <Botao aoPressionar={() => router.replace('/')}>Ver o mercado</Botao>
      </View>
    );
  }

  const erroItem = alterar.error instanceof ErroApi ? alterar.error : null;
  const erroCupom = aplicar.error instanceof ErroApi ? aplicar.error : null;

  return (
    <ScrollView contentContainerStyle={{ padding: espaco(4), gap: espaco(3) }}>
      {cotacao.itens.map((item) => (
        <Cartao key={item.id} estilo={{
          flexDirection: 'row', gap: espaco(3), padding: espaco(2.5),
          backgroundColor: tingir(TINTAS[item.imagemUrl], cores.surface, 0.12),
        }}>
          <ImagemNft chave={item.imagemUrl} tamanho={76} rotulo={item.titulo} arredondamento={14} />
          <View style={{ flex: 1, gap: espaco(1) }}>
            <Texto variante="rotulo" numberOfLines={1}>{item.titulo}</Texto>
            <Texto variante="legenda">{item.rotuloEdicao} · {formatarEth(item.precoUnitarioEth)} cada</Texto>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: espaco(2) }}>
              <Botao variante="secundario" compacto
                rotuloAcessivel={`Diminuir quantidade de ${item.titulo}`}
                aoPressionar={() => alterar.mutate({ id: item.id, quantidade: item.quantidade - 1 })}>−</Botao>
              <Texto accessibilityLabel={`Quantidade ${item.quantidade}`}>{item.quantidade}</Texto>
              <Botao variante="secundario" compacto
                rotuloAcessivel={`Aumentar quantidade de ${item.titulo}`}
                aoPressionar={() => alterar.mutate({ id: item.id, quantidade: item.quantidade + 1 })}>+</Botao>
              <Valor style={{ marginLeft: 'auto', fontWeight: '700', fontSize: 14 }}>{formatarEth(item.subtotalEth)}</Valor>
            </View>
          </View>
        </Cartao>
      ))}
      {erroItem && <Texto style={{ color: cores.danger }}>{erroItem.message}</Texto>}

      <Cartao estilo={{ gap: espaco(2) }}>
        <Texto variante="rotulo">Cupom</Texto>
        {cotacao.cupom ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Texto style={{ color: cores.success, fontWeight: '700', flexShrink: 1 }}>
              {cotacao.cupom.codigo} · {cotacao.cupom.descricaoDesconto}
            </Texto>
            <Botao variante="secundario" compacto aoPressionar={() => remover.mutate()}>Remover</Botao>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: espaco(2) }}>
            <TextInput
              value={codigo}
              onChangeText={definirCodigo}
              placeholder="KUDO10"
              placeholderTextColor={cores.muted}
              autoCapitalize="characters"
              accessibilityLabel="Código do cupom"
              style={{
                flex: 1, borderWidth: 1, borderColor: cores.borderStrong, borderRadius: 14,
                color: cores.foreground, fontFamily: fonte, paddingHorizontal: espaco(3), minHeight: 48,
                backgroundColor: cores.surface2,
              }}
            />
            <Botao variante="secundario" carregando={aplicar.isPending}
              aoPressionar={() => aplicar.mutate(codigo, { onSuccess: () => definirCodigo('') })}>
              Aplicar
            </Botao>
          </View>
        )}
        {erroCupom && <Texto style={{ color: cores.danger }}>{erroCupom.message}</Texto>}
      </Cartao>

      <ResumoCotacao valores={cotacao} />
      <Botao aoPressionar={() => router.push('/pagamento')}>Continuar para o pagamento</Botao>
    </ScrollView>
  );
}
