import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { consultaCarrinho } from '@/api/consultas';
import { ProvedorTema, espaco, fonte, useTema } from '@/ui/tema';

/** No web a fonte vem do Google Fonts; no app nativo fica a fonte do sistema. */
function useFonteWeb() {
  useEffect(() => {
    if (Platform.OS !== 'web' || document.getElementById('fonte-kurio')) return;
    const link = document.createElement('link');
    link.id = 'fonte-kurio';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap';
    document.head.appendChild(link);
    // A Plus Jakarta Sans troca "0x" por "0×"; nomes como 0xLumen e endereços precisam do x.
    const ajuste = document.createElement('style');
    ajuste.textContent = '* { font-feature-settings: "calt" 0 !important; }';
    document.head.appendChild(ajuste);
  }, []);
}

function AtalhoCarrinho() {
  const router = useRouter();
  const { cores } = useTema();
  const { data } = useQuery(consultaCarrinho);
  const quantidade = data?.itens.reduce((acc, i) => acc + i.quantidade, 0) ?? 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Carrinho, ${quantidade} itens`}
      onPress={() => router.push('/carrinho')}
      hitSlop={12}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: espaco(1.5),
        paddingHorizontal: espaco(3), paddingVertical: espaco(1.5), borderRadius: 999,
        backgroundColor: cores.surface, borderWidth: 1, borderColor: cores.borderSubtle,
      }}
    >
      <Text style={{ color: cores.foreground, fontFamily: fonte, fontWeight: '700', fontSize: 13 }}>Carrinho</Text>
      <View style={{ minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.preco }}>
        <Text style={{ color: cores.precoInk, fontWeight: '800', fontSize: 11 }}>{quantidade}</Text>
      </View>
    </Pressable>
  );
}

function Navegacao() {
  const { cores } = useTema();
  return (
    <>
      <StatusBar style={cores.escuro ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: cores.ink },
          headerShadowVisible: false,
          headerTintColor: cores.foreground,
          headerTitleStyle: { fontFamily: fonte, fontWeight: '800' },
          contentStyle: { backgroundColor: cores.ink },
          headerRight: () => <AtalhoCarrinho />,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Kurio' }} />
        <Stack.Screen name="nft/[id]" options={{ title: 'Detalhe' }} />
        <Stack.Screen name="carrinho" options={{ title: 'Carrinho', headerRight: () => null }} />
        <Stack.Screen name="pagamento" options={{ title: 'Pagamento', headerRight: () => null }} />
        <Stack.Screen name="pedido/[id]" options={{ title: 'Recibo', headerRight: () => null }} />
      </Stack>
    </>
  );
}

export default function Layout() {
  useFonteWeb();
  /** Sem retry automático em mutação: quem decide reenviar o pagamento é o usuário, com a mesma chave. */
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 5_000 }, mutations: { retry: false } },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ProvedorTema>
        <Navegacao />
      </ProvedorTema>
    </QueryClientProvider>
  );
}
