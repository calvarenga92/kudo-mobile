import { FlatList, Pressable, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { formatarEth } from '@calvarenga92/kurio-regras';
import { consultaNfts } from '@/api/consultas';
import { BlocoTopo, Carregando, Falha, ImagemNft, PrecoPilula, SeletorTema, Texto } from '@/ui/base';
import { TINTAS, espaco, tingir, useTema } from '@/ui/tema';

export default function Catalogo() {
  const router = useRouter();
  const { cores } = useTema();
  const { width } = useWindowDimensions();
  const colunas = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const { data, isPending, isError, refetch } = useQuery(consultaNfts);

  if (isPending) return <Carregando />;
  if (isError) return <Falha mensagem="Não foi possível carregar o catálogo." aoTentar={refetch} />;

  return (
    <FlatList
      key={colunas}
      data={data}
      numColumns={colunas}
      keyExtractor={(nft) => nft.id}
      contentContainerStyle={{ padding: espaco(4), gap: espaco(3) }}
      columnWrapperStyle={{ gap: espaco(3) }}
      ListHeaderComponent={
        <View style={{ gap: espaco(5), paddingBottom: espaco(2) }}>
          <BlocoTopo>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Texto variante="legenda" style={{ color: cores.topoInk, opacity: 0.85, fontWeight: '700', letterSpacing: 1.2 }}>
                MERCADO
              </Texto>
              <SeletorTema />
            </View>
            <Texto variante="destaque" style={{ color: cores.topoInk }}>
              Arte que pulsa, em edição limitada.
            </Texto>
            <Texto style={{ color: cores.topoInk, opacity: 0.9 }}>
              Preço e disponibilidade em tempo real, compra com cotação versionada.
            </Texto>
          </BlocoTopo>
          <Texto variante="titulo">Em alta</Texto>
        </View>
      }
      renderItem={({ item: nft }) => (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${nft.titulo}, a partir de ${formatarEth(nft.precoMinimoEth)}`}
          onPress={() => router.push(`/nft/${nft.id}`)}
          style={({ pressed }) => ({
            flex: 1 / colunas, borderRadius: 22, padding: espaco(1.5),
            backgroundColor: tingir(TINTAS[nft.imagemUrl], cores.surface),
            borderWidth: 1, borderColor: cores.borderSubtle,
            opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <ImagemNft chave={nft.imagemUrl} rotulo={nft.titulo} arredondamento={17} />
          <View style={{ paddingHorizontal: espaco(1.5), paddingTop: espaco(2.5), paddingBottom: espaco(1.5), gap: espaco(1.5) }}>
            <Texto variante="rotulo" numberOfLines={1}>{nft.titulo}</Texto>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: espaco(1) }}>
              <Texto variante="legenda" numberOfLines={1} style={{ flexShrink: 1 }}>{nft.autor}</Texto>
              <PrecoPilula>{formatarEth(nft.precoMinimoEth)}</PrecoPilula>
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}
