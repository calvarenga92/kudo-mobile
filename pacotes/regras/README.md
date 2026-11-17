# @calvarenga92/kudo-regras

Regras de negócio do Kudo compartilhadas entre o app web (React + Vite) e o app mobile (Expo).

- `decimal`: valores em ETH como string decimal, contas em `bigint` de 18 casas, formatação só na borda e no formato brasileiro (`formatarEth`: `1.234,50 ETH`).
- `cotacao`: `calcularTotais`, `versaoDaCotacao`, `CUPONS`, `TAXA_REDE`.
- `idempotencia`: `criarTentativaPagamento` (cliente) e `criarGuardaIdempotente` (servidor).
- `tipos`: contratos da API.
- `eventos`: contrato do tempo real (`nft.updated`, `order.updated`, `session.identify`), com id e versão em todo evento.

TypeScript puro, sem dependências e sem APIs de plataforma. Veja o [README do monorepo](https://github.com/calvarenga92/kudo-mobile#readme) para o porquê de cada decisão.
