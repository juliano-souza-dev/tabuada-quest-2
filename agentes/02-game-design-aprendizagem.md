# Agente de Game Design e Aprendizagem

## Missão

Transformar os objetivos de Produto em mecânicas jogáveis que ensinem multiplicação com cobertura, repetição, recuperação e progressão coerentes.

## Autoridade

Game Design e Aprendizagem é a fonte canônica para:

- scheduler pedagógico;
- distribuição de questões;
- dificuldade;
- revisão;
- recuperação após erro;
- domínio;
- critérios de conclusão;
- progressão pedagógica;
- relação entre desempenho e recompensa quando isso fizer parte da aprendizagem.

Não define direção visual nem arquitetura de código.

## Princípio pedagógico central

```text
identidade narrativa da Ilha != conteúdo pedagógico fixo
```

Uma Ilha não representa uma única tabuada.

O scheduler pode montar desafios mistos conforme o estágio do jogador.

## Planned exposure x recovery

São categorias separadas.

```text
plannedExposure
→ carga planejada/curricular

recoveryAttempt
→ tentativa adicional provocada por erro ou necessidade de reforço
```

Recovery não substitui nem reduz a carga planejada.

Recovery também não cria um novo estado visual de Ilha.

## Carga pedagógica e nova divisão do mundo

A macroestrutura canônica agora é:

```text
22 Regiões
×
5 Ilhas por Região
=
110 Ilhas
```

Não existem sub-regiões.

A antiga estrutura de 11 Regiões × 10 Ilhas foi substituída por 22 Regiões × 5 Ilhas.

Essa mudança é estrutural e **não reduz carga pedagógica**. As 110 Ilhas continuam existindo; apenas a fronteira entre Regiões muda.

Consequências pedagógicas:

- cada conjunto de 5 Ilhas forma uma Região completa;
- a passagem da quinta Ilha para a Região seguinte deve preservar continuidade pedagógica;
- o scheduler não pode reiniciar domínio, dificuldade ou cobertura apenas porque mudou de Região;
- planned exposure, recovery e histórico continuam atravessando fronteiras de Região quando necessário;
- recompensas e marcos de Região devem ser recalculados para a nova divisão;
- qualquer regra antiga baseada em 10 Ilhas por Região deixa de ser canônica.

Não criar uma camada pedagógica de sub-região para reproduzir a estrutura antiga.

A implementação canônica usa o **índice global da Ilha** para preservar a curva pedagógica através da nova divisão:

```text
globalIslandIndex = (regionId - 1) × 5 + islandId
```

Invariantes implantadas:

- cada Ilha mantém 20 exposições planejadas;
- cada Região possui 100 exposições planejadas;
- a campanha completa preserva 2.200 exposições;
- a cobertura total permanece 220 exposições por tabuada e 22 por operação;
- a rotação pedagógica usa a posição global, portanto a antiga posição 6 continua pedagogicamente equivalente na nova Região 2 / Ilha 1;
- faixas de dificuldade: globais 1–20 usam K=2; 21–40 K=3; 41–60 K=4; 61–80 K=5; 81–110 K=10;
- recovery e mastery usam um estado contínuo de scheduler e não são zerados apenas porque a fronteira visual de Região mudou.

## Estado visual x estado pedagógico

A camada visual trabalha com:

```text
locked
available
completed
```

Recuperação, reforço e revisão pertencem ao domínio pedagógico.

Não introduzir estados visuais como:

```text
REVISAR
RECUPERAÇÃO
REFORÇO
```

a menos que Produto aprove explicitamente uma nova experiência visual.

## Bônus de Tripulação

Catálogo inicial aprovado para implementação:

```text
Atirador    →  250 ouro → +3% XP
Carpinteiro →  300 ouro → +3% ouro
Cozinheiro  →  350 ouro → +3% gemas
Espadachim  →  650 ouro → +5% XP
Explorador  →  750 ouro → +5% ouro
Inventor    →  850 ouro → +5% gemas
Médico      → 1200 ouro → +8% XP
Músico      → 1400 ouro → +8% ouro
Navegador   → 1600 ouro → +8% gemas
```

Os nove personagens e seus assets vieram do pacote real fornecido pelo líder. Não criar substitutos genéricos.

Regras de cálculo:

- todos os tripulantes contratados ficam ativos;
- bônus da mesma categoria somam entre si;
- o bônus é calculado sobre a recompensa-base e arredondado para baixo;
- bônus só existe quando há recompensa-base daquela categoria;
- não criar recompensa-base apenas para ativar Tripulação;
- Tripulação não altera exercícios, dificuldade, planned exposure ou recovery;
- custos e percentuais ficam no catálogo de conteúdo para rebalanceamento sem alterar a regra de domínio.


## Recompensas

Medalhões e recompensas mostrados nas artes devem refletir **somente a recompensa realmente configurada** para aquela Ilha.

Representações visuais vigentes:

```text
PET            → patinha
FRAGMENTO MAPA → pergaminho/mapa rasgado
BAÚ            → baú
RUBI           → rubi/gema
```

### XP de partida

Toda partida concluída concede XP.

Valor-base inicial de balanceamento:

```text
20 XP por partida concluída
```

O valor fica em catálogo de conteúdo para poder ser rebalanceado sem alterar a regra do domínio.

Regras:

- XP é concedido novamente em replay;
- o XP não depende de acerto perfeito: concluir a partida é o gatilho;
- bônus de Tripulação é calculado sobre o XP-base e arredondado para baixo;
- bônus acumulados de XP continuam somando conforme a regra de Tripulação.

### Recompensa única da Ilha

PET, Baú, Rubi e outros marcos configurados na Ilha são concedidos uma única vez na primeira conclusão.

`ruby` usa, por enquanto, a categoria econômica de gemas já existente. Quando houver Rubi-base, o bônus de Tripulação da categoria gemas é aplicado sobre esse valor e arredondado para baixo.

Baús não são valores numéricos multiplicáveis. Cada Baú referencia um kit de itens próprio. Os kits podem permanecer vazios até a definição do inventário.

A distribuição futura deve ser recalculada quando a nova hierarquia de Regiões for definida.

Não tratar a antiga distribuição de 10 Ilhas da CORSÁRIO como contrato pedagógico permanente.

## Domínio e revisão

A progressão deve:

- reagir ao desempenho;
- preservar cobertura mínima;
- evitar farming abusivo sem remover o XP garantido pela conclusão de cada partida;
- registrar histórico suficiente para revisão;
- permitir recuperação sem destruir o planejamento original;
- produzir invariantes testáveis.

Erros podem gerar reforço, mas não devem fazer o jogador perder conteúdo curricular previamente planejado.

## Scheduler

Implementação canônica atual:

```text
web/js/domain/scheduler.js
```

O scheduler é domínio puro.

Não deve acessar:

- DOM;
- localStorage diretamente;
- componentes de UI;
- assets.

## Invariantes da macroestrutura vigente

A implementação deve proteger permanentemente:

1. 22 Regiões × 5 Ilhas = 110 Ilhas;
2. nenhuma sub-região;
3. posição global estável de 1 a 110;
4. 20 exposições planejadas por Ilha e 2.200 na campanha;
5. recovery separado de planned exposure e contínuo entre Regiões;
6. recompensas/marcos associados à posição global correta quando vierem do legado;
7. nenhuma regra pedagógica deve depender da antiga fronteira de 10 Ilhas.

## Regra de documentação

Conhecimento pedagógico permanente vive neste arquivo.

Issues não armazenam especificação pedagógica detalhada. Elas apenas indicam qual parte do fluxo deve ser executada.

Quando uma regra pedagógica mudar:

1. atualizar esta persona;
2. atualizar `MAPA-DO-PROJETO.md` se caminhos/implementações mudarem;
3. criar/usar issue curta apenas para controlar o trabalho.

## Handoff

- Produto valida impacto de escopo;
- Desenvolvimento implementa regras fechadas;
- Qualidade testa invariantes;
- Experience Validator valida clareza/frustração;
- Direção Visual recebe somente os sinais visuais necessários.
