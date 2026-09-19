# DEC-003 — Matriz de escopo do Tabuada Quest 2.0 e corte da V1

**Status:** Aprovado para encerramento da Issue #1  
**Data:** 2026-09-19  
**Responsáveis:** Produto + Game Design e Aprendizagem + Direção Visual + Experience Validator

## Objetivo

Separar explicitamente o que pertence ao Tabuada Quest 2.0 do que existe apenas como referência no jogo anterior e definir o primeiro corte jogável da V1.

A branch `apoio` é referência. Nada nela entra automaticamente no produto novo.

## Estados

- **MANTER:** conceito continua no 2.0.
- **REDESENHAR:** conceito continua, mas com nova regra, estrutura ou identidade.
- **V1:** necessário para o primeiro ciclo jogável.
- **M2:** planejado para a segunda milestone.
- **M3:** planejado para acabamento/release.
- **ADIADO:** existe no roadmap, mas não bloqueia a V1.
- **NÃO PORTAR AUTOMATICAMENTE:** legado sem aprovação para entrar no 2.0.

## Matriz de escopo

| Sistema / conceito | Decisão | Destino |
| --- | --- | --- |
| Portais | REDESENHAR | Viram **Regiões** |
| Mundos | REDESENHAR | Viram **Ilhas** |
| Mundo ligado a uma única tabuada | REMOVER | Ilhas usam mix planejado |
| 10 Portais | MANTER estrutura | 10 Regiões |
| 10 Mundos por Portal | MANTER estrutura atual | 10 Ilhas por Região |
| Prática de multiplicação | MANTER | Núcleo do jogo |
| Ordem pedagógica antiga | REDESENHAR | Scheduler intercalado da DEC-001 |
| Recuperação após erro | REDESENHAR | `plannedExposure` separado de `recoveryAttempt` |
| Revisão espaçada | MANTER conceito | Implementação específica posterior |
| Perfis locais | V1 mínimo | Apenas o necessário para o vertical slice |
| Histórico de sessões | ADIADO / M2 | Não bloqueia V1 |
| Moedas antigas | NÃO PORTAR AUTOMATICAMENTE | Economia será redefinida |
| XP e níveis antigos | NÃO PORTAR AUTOMATICAMENTE | Reavaliar em M2 |
| Gemas antigas | NÃO PORTAR AUTOMATICAMENTE | Não equivalem a Diamantes |
| Diamantes | NOVO / MANTER | Moeda especial persistente |
| Loja comum | ADIADO / M2 | Só após economia aprovada |
| Loja Especial | NOVO / ADIADO | Usará Diamantes; especificação futura |
| Inventário | ADIADO / M2 | Após economia e itens aprovados |
| Coleção | REDESENHAR / M2 | PETs e tesouros aprovados |
| PETs | REDESENHAR / M2 | 30 PETs a serem salvos |
| Campanha antiga de PETs | REDESENHAR | Nova narrativa marítima |
| Baús | REDESENHAR / M2 | 30 baús globais |
| Tesouros de baú | REDESENHAR / M2 | Um ou mais tesouros por baú |
| Login diário | MANTER conceito / M2 | Uma fonte de baús |
| Recompensa por etapa | MANTER conceito | Pode conceder baú/recompensa |
| Desbloqueio de Região | MANTER conceito | Pode conceder recompensa |
| 5 mapas especiais | NOVO / MANTER | 4 fragmentos cada |
| Missões de mapa | NOVO / MANTER | Gate obrigatório ao fechar 4/4 |
| Tabuada mista em missão | NOVO / MANTER | Fundo temático + mix pedagógico |
| Recompensa de missão | NOVO / MANTER | 1.000 Diamantes por mapa, uma vez |
| Moda | MANTER / M2 | Preserva avatar-base canônico |
| Assets legados | NÃO PORTAR AUTOMATICAMENTE | Só entram após validação |
| Tema mágico/pirata | MANTER | Identidade oficial do 2.0 |
| Android WebView | MANTER arquitetura | Wrapper Java com `web/` canônico |
| Fonte web única | MANTER | Mesmo conteúdo no browser e Android |

## Corte funcional da V1

A V1 inicial é o primeiro ciclo jogável validável, não o produto final.

Ela deve permitir:

1. abrir o jogo no navegador;
2. iniciar/selecionar um perfil mínimo;
3. entrar na progressão inicial;
4. visualizar Região → Ilha;
5. iniciar uma Ilha liberada;
6. responder desafios gerados pelo scheduler novo;
7. receber feedback de acerto/erro;
8. concluir uma sessão;
9. visualizar resultado simples;
10. persistir o progresso mínimo;
11. carregar a mesma aplicação no Android WebView;
12. validar o fluxo no navegador e em APK debug.

## Fora do corte inicial da V1

Não bloqueiam o primeiro vertical slice:

- loja comum completa;
- Loja Especial;
- economia final;
- inventário completo;
- coleção completa;
- 30 PETs implementados;
- 30 baús implementados;
- login diário completo;
- histórico final;
- campanha inteira de 100 Ilhas;
- release Android final.

Esses itens permanecem no roadmap e não devem ser implementados antecipadamente.

## Progressão já aprovada

- 10 Regiões;
- 10 Ilhas por Região;
- 30 PETs;
- 30 baús;
- 5 mapas especiais;
- 4 fragmentos por mapa;
- missões especiais obrigatórias ao completar mapa;
- 1.000 Diamantes por missão, uma vez;
- 5.000 Diamantes possíveis por esse sistema;
- Loja Especial futura.

## Documentos relacionados

- `docs/decisoes/DEC-001-distribuicao-intercalada-tabuadas.md`
- `docs/decisoes/DEC-002-regioes-ilhas-pets-baus.md`
- `ORQUESTRADOR.md`
- `MAPA-DO-PROJETO.md`
- `agentes/03-direcao-visual.md`

## Critério de encerramento da Issue #1

A Issue #1 pode ser encerrada quando:

- o legado está classificado;
- o tema e a estrutura nova estão documentados;
- o corte da V1 está definido;
- sistemas futuros têm status explícito;
- nada da branch `apoio` é tratado automaticamente como requisito do 2.0.

Esses critérios estão atendidos por esta decisão e pelas DEC-001/DEC-002.
