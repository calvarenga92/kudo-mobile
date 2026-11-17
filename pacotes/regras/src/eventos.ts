import type { Eth, StatusPedido } from './tipos';

/**
 * Eventos em tempo real (Socket.IO). Todo evento carrega identidade, recurso afetado
 * e versão: o cliente descarta a entrega repetida pelo id e a atrasada pela versão,
 * porque a rede não garante ordem.
 */
export interface EventoBase {
  eventoId: string;
  versao: number;
  emitidoEm: string;
}

/** Público: o estoque ou o preço de uma peça mudou. */
export interface NftAtualizado extends EventoBase {
  nftId: string;
  edicoes: Array<{ id: string; precoEth: Eth; disponivel: number }>;
}

/** Privado: vai só para a conta dona do pedido. */
export interface PedidoAtualizado extends EventoBase {
  pedidoId: string;
  status: StatusPedido;
  referenciaTransacao: string | null;
  motivoRecusa: string | null;
}

export interface EventosServidor {
  'nft.updated': (evento: NftAtualizado) => void;
  'order.updated': (evento: PedidoAtualizado) => void;
}

/**
 * O servidor decide a sala pelo token, não pelo id enviado: o id sozinho não abre
 * os eventos privados de uma conta. Sem token o socket fica como visitante.
 */
export interface Identificacao {
  usuarioId: string | null;
  token?: string | null;
}

export interface EventosCliente {
  'session.identify': (dados: Identificacao) => void;
}
