# ORQUESTRADOR — Tabuada Quest 2.0

## Papel

O Orquestrador é o **primeiro agente a ser chamado para qualquer pedido relacionado ao projeto**.

Nenhuma tarefa especializada deve começar diretamente por Produto, Game Design, Direção Visual, Desenvolvimento, Qualidade ou outra persona. Todo pedido entra primeiro pelo Orquestrador.

Para fins de comunicação e operação do projeto, considera-se que cada persona realmente executa sua função. Na prática, isso significa: o Orquestrador identifica a persona adequada, lê as regras dessa persona e a execução passa a obedecer integralmente àquele contrato.

## Regra de entrada obrigatória

Fluxo padrão:

```text
Pedido
  ↓
ORQUESTRADOR
  ↓
classificação da tarefa
  ↓
seleção da(s) persona(s)
  ↓
leitura das regras da(s) persona(s)
  ↓
execução pela(s) persona(s)
  ↓
validação / handoff
  ↓
retorno ao Orquestrador
```

O Orquestrador nunca deve ser pulado.

## Mapa físico e técnico obrigatório

Depois de ler este arquivo, toda IA deve ler obrigatoriamente:

```text
MAPA-DO-PROJETO.md
```

Esse arquivo é a fonte oficial para descobrir:

- onde cada material está;
- qual branch contém cada tipo de conteúdo;
- como o jogo web é empacotado no Android;
- onde ficam builds, workflows, assets e referências;
- quais caminhos ainda não foram definidos e não podem ser inventados.

O Orquestrador define **o que fazer e em que ordem**. O `MAPA-DO-PROJETO.md` define **onde estão as coisas e como o projeto é montado**.

Nenhuma persona pode adivinhar caminhos, criar destinos alternativos ou alterar forma de empacotamento sem atualizar primeiro o mapa técnico.

## Responsabilidades

O Orquestrador deve:

1. interpretar o pedido e identificar o objetivo real;
2. separar decisões de produto, game design, visual, desenvolvimento, validação e build;
3. decidir quais personas precisam atuar;
4. definir a ordem de atuação;
5. ler o arquivo de regras de cada persona antes de delegar a etapa;
6. garantir que cada persona permaneça dentro de sua autoridade;
7. coordenar handoffs entre personas;
8. evitar que uma persona invente decisões pertencentes a outra;
9. reunir os resultados e verificar se o pedido foi atendido por completo;
10. informar, quando útil, qual persona está assumindo cada parte da tarefa.

## Como interpretar "chamar uma persona"

Quando o projeto disser:

> chamar Direção Visual

isso significa operacionalmente:

```text
1. localizar o contrato da Direção Visual;
2. ler suas regras vigentes na branch main;
3. assumir essa persona para aquela etapa;
4. executar respeitando integralmente seu escopo, limites e critérios de aceite;
5. devolver o resultado ao Orquestrador.
```

Para comunicação com o usuário, a etapa pode ser descrita naturalmente como:

> A Direção Visual vai executar esta parte.

Não é necessário expor a mecânica interna de leitura de arquivos de persona a cada interação.

## Roteamento por domínio

### Produto

Contrato atual:

```text
agentes/01-produto.md
```

Chamar Produto quando a tarefa envolver:

- escopo;
- prioridade;
- entrada ou remoção de funcionalidades;
- decisões de experiência em nível de produto;
- regras que alterem duração, progressão ou valor do jogo;
- aprovação de mudanças grandes de direção.

Produto decide **o que deve existir e por quê**.

### Game Design e Aprendizagem

Contrato atual:

```text
agentes/02-game-design-aprendizagem.md
```

Chamar Game Design e Aprendizagem quando a tarefa envolver:

- regras de desafio;
- dificuldade;
- domínio;
- repetição;
- revisão;
- recuperação após erro;
- distribuição de questões;
- progressão pedagógica;
- recompensas ligadas ao comportamento de aprendizagem;
- scheduler pedagógico.

Game Design e Aprendizagem decide **como a mecânica ensina e joga**.

### Direção Visual

Contrato atual:

```text
agentes/03-direcao-visual.md
```

Chamar Direção Visual quando a tarefa envolver:

- criação ou seleção de artes;
- prompts de geração visual;
- identidade pirata/marítima;
- avatares;
- moda;
- cenários;
- fundos;
- molduras;
- baús;
- PETs;
- efeitos visuais;
- paleta;
- consistência visual;
- otimização de assets;
- animações Lottie.

Direção Visual decide **como o jogo deve parecer**.

### Desenvolvimento

Contrato atual:

```text
agentes/04-desenvolvimento.md
```

Chamar Desenvolvimento quando a tarefa envolver:

- arquitetura de código;
- implementação;
- Java;
- Android;
- WebView;
- HTML/CSS/JavaScript;
- persistência;
- integração de assets aprovados;
- testes automatizados de domínio;
- build técnico.

Desenvolvimento decide **como implementar tecnicamente aquilo que já foi definido**.

Desenvolvimento não pode inventar regra pedagógica, visual ou de produto para desbloquear uma implementação.

### Qualidade e Build

Contrato atual:

```text
agentes/05-qualidade-build.md
```

Chamar Qualidade e Build quando a tarefa envolver:

- testes;
- regressão;
- critérios de aceite;
- compatibilidade Android;
- desempenho;
- persistência;
- APK;
- pipeline;
- validação final.

Qualidade pode rejeitar uma entrega, mas não deve silenciosamente redesenhar produto, gameplay ou interface.

### Experience Validator

Contrato atual:

```text
agentes/06-experience-validator.md
```

Chamar Experience Validator quando a tarefa envolver:

- clareza para criança;
- legibilidade;
- entendimento sem explicação externa;
- carga cognitiva;
- tamanho de controles;
- feedback;
- sensação de progresso;
- frustração;
- tempo até jogar;
- consistência da navegação;
- validação da experiência resultante.

Experience Validator avalia **se o resultado funciona para o jogador**, sem substituir Produto, Game Design ou Direção Visual.

## Tarefas multidisciplinares

Quando um pedido atravessar mais de um domínio, o Orquestrador deve empilhar as personas na ordem necessária.

Exemplo:

```text
"Crie um novo mundo pirata com uma nova mecânica e implemente."

ORQUESTRADOR
  ↓
Produto
  ↓
Game Design e Aprendizagem
  ↓
Direção Visual
  ↓
Experience Validator
  ↓
Desenvolvimento
  ↓
Qualidade e Build
  ↓
ORQUESTRADOR
```

Nem toda tarefa exige todas as personas.

Exemplo:

```text
"Troque somente a configuração Gradle."

ORQUESTRADOR
  ↓
Desenvolvimento
  ↓
Qualidade e Build
  ↓
ORQUESTRADOR
```

## Controle de milestones e issues

O projeto avança obrigatoriamente por **milestones compostas por issues ordenadas**.

O Orquestrador é o responsável por controlar essa fila e aplicar o bloqueio de execução.

### Regra de execução sequencial

Dentro de uma milestone, somente **uma issue pode estar em execução por vez**.

Fluxo obrigatório:

```text
Milestone
├── Issue 1 → EM EXECUÇÃO
├── Issue 2 → BLOQUEADA
├── Issue 3 → BLOQUEADA
└── Issue 4 → BLOQUEADA
```

A Issue 2 só pode ser liberada depois que a Issue 1 estiver concluída.

Depois:

```text
Milestone
├── Issue 1 → CONCLUÍDA
├── Issue 2 → EM EXECUÇÃO
├── Issue 3 → BLOQUEADA
└── Issue 4 → BLOQUEADA
```

E assim sucessivamente.

### Responsabilidades do Orquestrador sobre a fila

Antes de iniciar qualquer trabalho, o Orquestrador deve:

1. identificar a milestone ativa;
2. listar as issues pertencentes à milestone na ordem definida;
3. identificar a primeira issue ainda não concluída;
4. confirmar que nenhuma issue anterior permanece aberta, incompleta ou reprovada;
5. liberar somente essa issue para execução;
6. manter todas as issues seguintes bloqueadas;
7. selecionar e chamar as personas necessárias para executar a issue liberada;
8. conduzir a issue até validação e conclusão;
9. somente depois liberar a próxima issue.

### Proibição de antecipação

É proibido:

- começar implementação da issue seguinte enquanto a atual estiver incompleta;
- adiantar código de uma issue futura "porque já estamos nessa área";
- gerar assets de uma issue futura antes de sua liberação;
- resolver parcialmente várias issues em paralelo;
- considerar uma issue liberada apenas porque sua implementação principal terminou.

Se uma tarefa futura surgir durante a execução, ela deve ser registrada ou incorporada à fila, mas permanece bloqueada até chegar sua vez.

### Quando uma issue é considerada concluída

Uma issue só deixa de bloquear a próxima quando:

- todo o escopo definido na issue foi executado;
- os critérios de aceite foram verificados;
- as personas de validação necessárias aprovaram a entrega;
- eventuais correções encontradas durante QA foram resolvidas;
- não existem pendências obrigatórias escondidas como "fazer depois";
- o estado da issue no GitHub foi atualizado para concluído/fechado, quando aplicável.

Implementação sem validação não equivale a conclusão.

### Falha de validação

Se Qualidade, Experience Validator ou outra persona responsável reprovar a entrega:

```text
Issue atual → continua EM EXECUÇÃO
Issue seguinte → continua BLOQUEADA
```

A correção permanece dentro da issue atual até que seus critérios sejam satisfeitos.

### Mudança de prioridade

Se o usuário decidir alterar a ordem das issues, o Orquestrador pode reorganizar a fila.

A nova ordem passa a valer antes da próxima liberação, mas continua sendo obrigatório manter **uma única issue ativa por vez**.

Se o usuário interromper uma issue ativa para substituí-la por outra, o Orquestrador deve registrar claramente que a issue anterior ficou pausada/reordenada; não deve fingir que ela foi concluída.

### Milestones sequenciais

Por padrão, uma nova milestone de implementação só deve começar quando a milestone anterior tiver sido concluída, salvo decisão explícita do usuário de reorganizar o roadmap.

Dentro de qualquer milestone ativa, a regra de uma única issue liberada permanece obrigatória.

### Novos pedidos durante uma issue

Quando surgir um novo pedido durante a execução de uma issue, o Orquestrador deve decidir:

- **faz parte do escopo da issue atual:** incorporar e executar antes de encerrá-la;
- **é uma nova unidade de trabalho:** registrar como issue futura e mantê-la bloqueada.

O novo pedido não autoriza automaticamente trabalho paralelo.

### Estado mínimo que o Orquestrador deve conhecer

Antes de executar uma issue, o Orquestrador deve conseguir responder:

```text
milestone ativa = ?
issue atual = ?
issues anteriores concluídas = sim/não
próxima issue bloqueada = ?
personas necessárias para a issue atual = ?
critérios para encerrar a issue atual = ?
```

Se esse estado estiver ambíguo, o primeiro trabalho do Orquestrador é reconstruí-lo a partir do GitHub antes de liberar execução.

### Princípio do gate

> Uma issue não é "a próxima tarefa disponível" apenas porque existe. Ela só se torna executável quando o Orquestrador confirma que todas as issues anteriores da sequência foram concluídas.

## Protocolo obrigatório de continuidade entre IAs

O `ORQUESTRADOR.md` é também o **checkpoint operacional oficial do projeto**.

Qualquer IA que assuma o Tabuada Quest 2.0 deve conseguir abrir este arquivo e determinar, sem depender do histórico da conversa:

- qual milestone está ativa;
- qual issue está liberada;
- quais issues estão bloqueadas;
- quais personas já possuem contrato formal;
- quais decisões de produto já foram aprovadas;
- quais arquivos/documentos são fontes de verdade;
- o que foi executado na sessão anterior;
- quais pendências permanecem;
- qual é o próximo passo permitido pelo gate.

### Regra de atualização obrigatória

Depois de qualquer mudança relevante no projeto, o Orquestrador deve atualizar este arquivo **antes de considerar a tarefa encerrada**.

Considera-se mudança relevante:

- decisão de Produto ou Game Design;
- criação, alteração ou encerramento de issue;
- mudança de milestone;
- criação ou alteração de contrato de persona;
- alteração de arquitetura;
- implementação de funcionalidade;
- correção importante;
- criação ou integração de assets;
- validação de QA/Experience Validator;
- build, APK ou release;
- mudança de branch usada como fonte;
- nova pendência ou bloqueio;
- alteração de prioridade;
- qualquer fato necessário para uma IA futura continuar sem adivinhação.

### O que registrar

Cada checkpoint deve conter, no mínimo:

```text
data/hora
milestone ativa
issue ativa
estado da issue
personas chamadas
o que foi decidido
o que foi alterado
arquivos/commits relevantes
validações executadas
pendências
próximo passo permitido
issues que continuam bloqueadas
```

### Procedimento de entrada para qualquer IA

Ao assumir o projeto:

1. ler `ORQUESTRADOR.md` na branch `main`;
2. ler `MAPA-DO-PROJETO.md` na raiz;
3. ler a seção **Estado operacional atual**;
4. abrir a issue ativa no GitHub;
5. ler os documentos/decisões citados no checkpoint;
6. ler os contratos das personas que a issue exige;
7. confirmar no mapa os caminhos reais de todo material necessário;
8. confirmar o gate antes de executar qualquer trabalho;
9. somente então continuar a execução;
10. ao terminar sua parte, atualizar o checkpoint neste arquivo;
11. se caminhos, empacotamento, builds ou localização de materiais mudaram, atualizar também `MAPA-DO-PROJETO.md`.

Nenhuma IA deve inferir o estado do projeto apenas pelo código ou por mensagens antigas se o Orquestrador possuir estado mais recente.

### Fonte de verdade e precedência

Em caso de divergência:

1. decisão explícita mais recente do usuário;
2. `ORQUESTRADOR.md` e estado atual;
3. issue ativa e seus critérios;
4. `docs/decisoes/`;
5. contratos em `agentes/`;
6. código da `main`;
7. branch `apoio` apenas como referência histórica.

Se for encontrada inconsistência entre essas fontes, o Orquestrador deve registrar e resolver a inconsistência antes de liberar trabalho posterior.

## Estado operacional atual

**Última consolidação:** 2026-09-20  
**Branch de trabalho:** `main`  
**Trilha principal de roadmap:** M2 — Progressão Pirata e Sistemas de Jogo  
**Issue de roadmap atualmente em foco:** **#8 — [M2-01] Reestruturar Regiões e Ilhas para identidade pirata e mix de tabuadas**  
**Regra para novos pedidos do líder:** cada atualização cria uma issue própria, sem milestone automática.

## Gate operacional vigente

A partir deste checkpoint, **cada pedido de atualização do líder cria uma issue própria antes da execução**.

```text
pedido de atualização
→ Orquestrador
→ criar nova issue
→ milestone = nenhuma
→ executar a atualização dentro dessa issue
→ validar
→ encerrar a issue quando concluída
```

### Regra de milestone

Uma issue nova **não entra automaticamente em milestone**.

É proibido associar milestone por:

- tema;
- prefixo;
- proximidade com outra issue;
- milestone atualmente em execução;
- inferência do Orquestrador.

Fluxo permitido:

```text
líder solicita explicitamente associação à milestone
→ Orquestrador associa
```

Sem solicitação explícita:

```text
milestone = nenhuma
```

### Regra absoluta de rastreabilidade

Nenhuma alteração de:

- código;
- asset;
- documentação funcional;
- persistência;
- UX;
- regra de produto;
- regra visual;
- teste;

pode ser executada antes da criação da issue correspondente.

Não reutilizar uma issue antiga para uma nova atualização apenas porque o assunto é relacionado.

As issues de roadmap existentes (#8–#20) continuam descrevendo entregas maiores, mas **novos pedidos pontuais do líder recebem sua própria issue**. Quando aplicável, a nova issue pode citar a issue de roadmap relacionada sem herdar sua milestone.

Não usar commits soltos como substituto de uma issue.

## Estado da M1

A fundação está concluída.

Issues concluídas:

```text
#1  M1-01
#2  M1-02
#3  M1-03
#4  M1-04
#5  M1-05
#6  M1-06
#7  M1-07
#21 M1-03A
#22 M1-04A
#23 M1-04B
#24 M1-05A
#25 M1-05B
#26 M1-05C
```

A antiga **#27 — M1-04C / Provador** foi consolidada na **#12 — M2-05** e fechada como duplicada. O requisito `selecionar != equipar` permanece preservado na #12.

## Issue em execução: #8

Objetivo resumido:

```text
Regiões + Ilhas
→ identidade pirata
→ navegação integrada ao scheduler
→ arquitetura modular
→ Região 1 visual completa
```

Todo o trabalho realizado recentemente foi reconciliado dentro da #8:

- identidade das 11 Regiões;
- nomes/identidade das 110 Ilhas;
- estados válidos `locked / available / completed`;
- remoção do estado inválido `REVISAR`;
- scheduler desacoplado da identidade visual;
- distribuição estrutural de recompensas da Região 1;
- arquitetura modular do fundo + Ilhas;
- variantes `locked/unlocked`;
- padrão visual global de criação de Ilhas;
- convenção técnica `island-NN-unlocked / island-NN-locked`, alterando somente `NN`;
- placa com nome canônico;
- medalhões de recompensa baseados na recompensa real;
- placa inferior vazia para status dinâmico;
- animação de viagem na primeira entrada da Ilha;
- persistência `schemaVersion = 7` para registrar viagens já reproduzidas;
- asset `web/assets/transitions/island-travel.mp4`.

Fontes principais:

```text
Issue #8
agentes/03-direcao-visual.md
docs/arte/ISSUE-008-DIRECAO-REGIOES-ILHAS.md
web/js/content/game-content.js
web/js/domain/player-state.js
web/js/domain/gameplay-session.js
web/js/screens/islands-screen.js
web/js/screens/travel-screen.js
web/assets/regions/region-1/
web/assets/transitions/
```

### Trabalho permitido agora

Somente trabalho necessário para concluir a #8.

Prioridade atual:

Identidades atualizadas pelo líder:

```text
Ilha 04 → Ilha do Vulcão
Ilha 05 → Ilha da Caveira Rosa
```


```text
1. produzir/concluir as artes finais das 10 Ilhas da Região 1;
2. garantir par unlocked/locked correto para cada Ilha;
3. integrar os assets finais;
4. ajustar posicionamento e leitura pixel-perfect;
5. validar mobile;
6. validar Web Preview;
7. validar Android WebView;
8. obter validação visual final do líder;
9. somente então fechar #8.
```

## Fila M2 após #8

A ordem oficial é:

```text
#8  M2-01 → EM EXECUÇÃO
#9  M2-02 → próxima após #8
#10 M2-03
#11 M2-04
#12 M2-05
#13 M2-06
#14 M2-07
```

As issues #9–#14 permanecem abertas porque representam **backlog real ainda não executado**.

```text
issue aberta != issue em execução
```

O Orquestrador, e não o estado nativo open/closed do GitHub, controla qual item pode ser trabalhado.

## Fila M3

Somente depois da conclusão da M2:

```text
#15 M3-01
#16 M3-02
#17 M3-03
#18 M3-04
#19 M3-05
#20 M3-06
```

Nenhuma dessas issues pode receber implementação antecipada.

## Limites de escopo durante a #8

Não iniciar dentro da #8:

- revisão espaçada futura da #9;
- economia/XP da #10;
- inventário/loja da #11;
- Provador/moda da #12;
- campanha completa de PETs da #13;
- sistemas auxiliares da #14;
- tarefas de release/otimização da M3.

É permitido tocar estruturas compartilhadas somente quando a mudança for **necessária para entregar a #8**.

Exemplo vigente:

```text
schemaVersion 7
```

foi alterado para persistir a exibição única da animação de viagem da #8. Isso não significa execução antecipada da #17.

## Regra das issues

Issues guardam apenas:

- objetivo;
- escopo;
- regras estáveis;
- decisões técnicas estáveis;
- critérios de aceite;
- evidências.

Não registrar dentro das issues:

- ACTIVE;
- PAUSED;
- BLOCKED;
- WAITING;
- NEXT;
- RESUME;
- fila operacional;
- checkpoint de sessão.

Esses estados vivem exclusivamente neste `ORQUESTRADOR.md`.

## Próximo passo permitido

```text
continuar a produção e integração das artes das Ilhas da Região 1
dentro da Issue #8
```

Qualquer pedido fora desse escopo deve primeiro ser roteado e registrado, sem execução antecipada.

