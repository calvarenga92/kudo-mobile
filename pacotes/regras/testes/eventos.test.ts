import { describe, expectTypeOf, it } from 'vitest';
import type { EventosCliente, EventosServidor, NftAtualizado, PedidoAtualizado } from '../src';

describe('contrato de eventos', () => {
  it('cada evento do servidor recebe o payload certo', () => {
    expectTypeOf<Parameters<EventosServidor['nft.updated']>[0]>().toEqualTypeOf<NftAtualizado>();
    expectTypeOf<Parameters<EventosServidor['order.updated']>[0]>().toEqualTypeOf<PedidoAtualizado>();
  });

  it('todo evento carrega id e versão para o cliente descartar duplicata e atraso', () => {
    expectTypeOf<NftAtualizado>().toHaveProperty('eventoId').toEqualTypeOf<string>();
    expectTypeOf<PedidoAtualizado>().toHaveProperty('versao').toEqualTypeOf<number>();
  });

  it('identificação aceita visitante (id nulo) e token opcional', () => {
    expectTypeOf<{ usuarioId: null }>().toMatchTypeOf<Parameters<EventosCliente['session.identify']>[0]>();
  });
});
