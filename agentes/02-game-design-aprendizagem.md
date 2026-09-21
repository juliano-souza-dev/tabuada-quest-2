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

### Regra de quantidade de Rubis

Quando a recompensa principal da Ilha for `ruby`, o valor-base é calculado pelo desempenho da partida:

```text
Rubis-base = max(0, acertos - erros)
```

O multiplicador-base é 1 Rubi por ponto líquido de desempenho.

Os contadores usados são `correctAnswers` e `wrongAnswers` do resultado final da partida. Como esses contadores registram todas as tentativas, tentativas de recovery também participam da conta.

Exemplos:

```text
18 acertos - 2 erros = 16 Rubis
14 acertos - 6 erros = 8 Rubis
4 acertos - 9 erros = 0 Rubis
```

Rubis são concedidos apenas na primeira conclusão da Ilha. Replay continua concedendo XP, mas não repete Rubis.

`ruby` usa, por enquanto, a categoria econômica de gemas já existente. O bônus de Tripulação da categoria gemas é aplicado sobre os Rubis-base e arredondado para baixo.

Baús não são valores numéricos multiplicáveis. Cada Baú referencia um kit de itens próprio. Os kits podem permanecer vazios até a definição do inventário.

### Distribuição canônica das 110 recompensas principais

A distribuição abaixo é obrigatória e também deve ser consultada pela Direção Visual ao gerar o badge/medalhão de cada Ilha.

Totais:

```text
20 fragmentos de Mapas Especiais
30 PETs
30 Baús
30 Rubis
= 110 recompensas principais
```

Legenda:

```text
P = PET | B = Baú | R = Rubi | Mn-x/4 = fragmento x do Mapa Especial n
```

```text
R01 CORSÁRIO        → P | M1-1/4 | B | P | M1-2/4
R02 BIRADES         → B | P      | M1-3/4 | B | M1-4/4
R03 ZONA OURO       → R | P | B | R | P
R04 VALE ESMERALDA  → R | B | R | P | R
R05 ZONA SAFIRA     → P | M2-1/4 | B | P | M2-2/4
R06 TERRAS GÉLIDAS  → B | P      | M2-3/4 | B | M2-4/4
R07 FANTASMAS       → R | B | P | R | B
R08 MARÉ SOMBRIA    → R | P | R | B | R
R09 TEMPESTÁRIA     → P | M3-1/4 | B | P | M3-2/4
R10 MAR DE FERRO    → B | P      | M3-3/4 | B | M3-4/4
R11 ZONA KRAKEN     → R | P | B | R | P
R12 TERRAS DE CINZA → R | B | R | P | R
R13 OBSIDIANA       → P | M4-1/4 | B | P | M4-2/4
R14 ZONA RUBI       → B | P      | M4-3/4 | B | M4-4/4
R15 ESCARLATE       → R | B | P | R | B
R16 ZONA DO DRAGÃO  → R | P | R | B | R
R17 TERRAS DO TITÃ  → R | P | B | R | P
R18 CRISTÁLIA       → R | B | R | P | R
R19 ILHAS CELESTES  → P | M5-1/4 | B | P | M5-2/4
R20 COROA DO MAR    → B | P      | M5-3/4 | B | M5-4/4
R21 ZONA FÊNIX      → R | B | P | R | B
R22 REINO DAS MARÉS → R | P | R | R | B
```

Fragmentos dos Mapas Especiais por índice global:

```text
Mapa 1 → 002, 005, 008, 010
Mapa 2 → 022, 025, 028, 030
Mapa 3 → 042, 045, 048, 050
Mapa 4 → 062, 065, 068, 070
Mapa 5 → 092, 095, 098, 100
```

Os gates permanecem após as Regiões 2, 6, 10, 14 e 20. A missão especial continua reservada e não deve ser implementada até nova decisão.

As posições globais 101–109 também avançam os 9 fragmentos do mapa final por `finalJourney`. Esse avanço é adicional à recompensa principal da Ilha e não cria um segundo medalhão na arte, salvo decisão visual/produto futura.

A posição global 109 concede Rubi como recompensa principal. A posição global 110 concede o **Baú Final**.

### Colecionáveis dentro dos Baús

Os Baús são o canal de obtenção de Colecionáveis.

Regra operacional implantada:

```text
0% de erros       → todos os Colecionáveis disponíveis no Baú
>0% até 20%       → 2 Colecionáveis
>20% de erros     → 1 Colecionável
Baú Final         → todos os Colecionáveis disponíveis, independentemente do desempenho
```

O corte de 20% é um parâmetro inicial de balanceamento armazenado em catálogo e pode ser alterado sem reescrever o domínio.

Cada Baú normal possui 3 itens-base. Quando há fila de redistribuição, no máximo 1 item pendente é acrescentado ao próximo Baú normal. Por isso, um Baú perfeito pode entregar 4 itens quando estiver carregando uma pendência.

Quando Colecionáveis disponíveis em um Baú não são conquistados:

1. eles entram em uma fila de redistribuição;
2. são adicionados a Baús seguintes;
3. continuam sujeitos ao desempenho no novo Baú;
4. se ainda não forem conquistados, voltam para a fila;
5. apenas o Baú Final entrega obrigatoriamente todos os Colecionáveis pendentes.

Isso evita replay obrigatório e também evita entrega automática antecipada.

Bônus da coleção:

```text
50% da coleção  → bônus total de 10% em XP, ouro e Rubi
100% da coleção → bônus total de 25% em XP, ouro e Rubi
```

A curva de progressão entre 0%, 50% e 100% ainda precisa ser definida antes da implementação econômica dos Colecionáveis.

O Baú Final também contém uma quantidade generosa de Rubis. O valor numérico permanece pendente de balanceamento.

Não tratar a antiga distribuição de 10 Ilhas da CORSÁRIO como contrato vigente.

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


## Economia fechada de partidas

```text
XP-base por partida = 20
Ouro-base = max(0, 10 × acertos - 2 × erros)
Rubi de Ilha ruby = max(0, acertos - erros), somente na primeira conclusão
Baú Final = 5.000 Rubis-base
```

O bônus de Colecionáveis usa interpolação linear entre os marcos aprovados:

```text
0% da coleção   → 0%
50% da coleção  → 10%
100% da coleção → 25%
```

Entre 0–50% e 50–100%, o percentual cresce linearmente.

Tripulação e Colecionáveis são calculados separadamente sobre a mesma base e depois somados.


## Missão Especial dos Mapas

Gates:

```text
Mapa 1 → após global 10
Mapa 2 → após global 30
Mapa 3 → após global 50
Mapa 4 → após global 70
Mapa 5 → após global 100
```

Cada missão:

- 20 questões;
- operações aleatórias apenas do conjunto já introduzido até o gate;
- uma única tentativa por questão;
- erro não gera recovery e não repete a operação;
- cada acerto vale 2 Rubis-base;
- XP-base segue a regra global de toda partida: 20 XP;
- Ouro-base segue a regra global: `max(0, 10 × acertos - 2 × erros)`;
- Rubi-base da missão = `acertos × 2`;
- bônus de Tripulação e Colecionáveis são aplicados normalmente em XP, Ouro e Rubi;
- a missão concluída marca o mapa como `mission_completed` e libera o próximo bloco de Regiões.
