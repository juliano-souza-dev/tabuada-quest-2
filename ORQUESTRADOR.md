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

## Controle de issues por dependência

O projeto não executa issues simplesmente por número, data de criação ou posição em uma milestone.

A ordem operacional é determinada por **dependências reais**.

### Modelo obrigatório

Para toda issue nova ou existente, o Orquestrador deve conseguir registrar:

```text
DEPENDE_DE   = nenhuma | #N, #M
DESBLOQUEIA  = nenhuma | #X, #Y
PRIORIDADE   = definida pelo líder/roadmap
```

### Regra do desbloqueador

Quando uma issue necessária para outra ainda não estiver concluída:

```text
#A DEPENDE_DE #B

#B incompleta
→ foco técnico em #B
→ #A não entra em execução
```

O Orquestrador deve informar claramente ao líder:

```text
issue desejada = #A
bloqueador      = #B
motivo          = contrato/asset/estado/API/dado ainda inexistente
ação            = concluir #B primeiro
```

### Dependência não é prioridade

Uma issue pode ser prioritária e ainda assim estar bloqueada.

Uma issue também pode ser independente da atual.

Portanto:

```text
ordem numérica != dependência
ordem de criação != dependência
milestone != dependência
```

Se duas issues forem independentes, o Orquestrador respeita a prioridade definida pelo líder e evita trocar de foco sem necessidade.

### Novos pedidos do líder

Cada pedido de atualização continua criando uma issue própria antes da execução.

A nova issue deve nascer com análise explícita:

```text
DEPENDE_DE  = ?
DESBLOQUEIA = ?
MILESTONE   = nenhuma, salvo solicitação explícita do líder
```

Se houver dependência não satisfeita:

```text
criar issue
→ registrar dependência
→ NÃO implementar ainda
→ focar no desbloqueador
```

Se não houver dependência:

```text
criar issue
→ executar conforme prioridade/foco vigente
```

### Proibição de antecipação dependente

É proibido:

- implementar uma issue antes do contrato que ela consome existir;
- criar UI final apoiada em estado ainda indefinido;
- implementar persistência final antes do modelo de dados necessário estar estável;
- gerar integração de asset que ainda não foi aprovado;
- iniciar release/regressão final enquanto os pré-requisitos ainda mudam;
- mascarar dependência com mocks permanentes ou valores inventados.

Protótipos temporários só são permitidos quando explicitamente solicitados e não contam como conclusão da issue dependente.

### Quando uma dependência é considerada satisfeita

Uma dependência só deixa de bloquear quando o artefato necessário está realmente disponível e validado.

Pode ser:

- contrato de produto aprovado;
- regra de domínio implementada;
- API/estrutura disponível;
- asset aprovado;
- schema/persistência estabilizados;
- teste ou build exigido passando;
- issue predecessora concluída, quando a dependência exige sua entrega completa.

### Mudança de prioridade

O líder pode alterar prioridade a qualquer momento.

Se a nova prioridade estiver bloqueada:

```text
Orquestrador
→ informa o bloqueador
→ move o foco para a issue que desbloqueia
→ retorna à issue prioritária assim que a dependência for satisfeita
```

### Regra de milestone

Milestones são agrupamentos de planejamento e **não definem automaticamente a ordem de execução**.

Além disso, conforme regra vigente:

```text
nova issue
→ milestone = nenhuma
```

A associação a uma milestone só ocorre por solicitação explícita do líder.

### Princípio do gate

> O trabalho deve acontecer na issue que torna o próximo trabalho possível, não necessariamente na issue de menor número ou criada primeiro.


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

## Issue de roadmap em foco: #8

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

### Foco atual do roadmap

O foco principal continua sendo concluir a #8. Novos pedidos do líder continuam gerando issues próprias e podem ser executados quando não estiverem bloqueados por dependência.

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

## Mapa atual de dependências

A fila deixa de ser tratada como uma sequência cega por número.

### Núcleo M2

```text
#8  Regiões e Ilhas
DEPENDE_DE  = fundação M1 concluída
DESBLOQUEIA = #10 (hooks de recompensa), #13 (PETs nas Ilhas), #15/#16 (superfícies visuais/navegação)

#9  Domínio, revisão e progressão de aprendizagem
DEPENDE_DE  = #6 scheduler pedagógico concluído
DESBLOQUEIA = #10 (contrato estável de resultado/progressão), #14 (histórico de aprendizagem)

#10 Economia, XP, níveis e recompensas
DEPENDE_DE  = #8 + #9
MOTIVO      = consome eventos de conclusão/recompensa e resultados/progressão estáveis
DESBLOQUEIA = #11, #13, #14

#11 Inventário, loja, coleção e baús
DEPENDE_DE  = #10
MOTIVO      = precisa de economia, ledger de recompensas e regras de ganho/gasto
DESBLOQUEIA = #12

#12 Moda / Provador
DEPENDE_DE  = #11 para o sistema completo
MOTIVO      = precisa do catálogo/estado de itens possuídos/equipados
OBSERVAÇÃO  = a UX de prévia é conhecida, mas a conclusão integral depende do inventário

#13 Campanha de PETs
DEPENDE_DE  = #8 + #10
MOTIVO      = precisa dos pontos de recompensa das Ilhas e da persistência/regras de recompensa

#14 Recompensas diárias, histórico e auxiliares
DEPENDE_DE  = #9 + #10
MOTIVO      = histórico consome sessões/aprendizagem; recompensas consomem economia/ledger
```

### Consequência operacional imediata

Existem **duas raízes M2 atualmente executáveis**:

```text
#8 → já está em foco e em andamento
#9 → não depende da conclusão da #8
```

Por prioridade vigente do líder e continuidade do trabalho atual:

```text
FOCO = #8
```

A conclusão da #8 **não é falsamente tratada como requisito da #9**.

Depois, para tornar #10 viável:

```text
concluir #8
+
concluir #9
→ liberar #10
```

A partir de #10 surgem ramos:

```text
#10
├── #11 → #12
├── #13 (também exige #8)
└── #14 (também exige #9)
```

O Orquestrador deve escolher entre ramos independentes pela prioridade definida pelo líder, sem inventar bloqueios.

### Núcleo M3

```text
#15 Dívida visual e feedback audiovisual
DEPENDE_DE  = superfícies funcionais da M2 estabilizadas (#8–#14 conforme aplicável)
DESBLOQUEIA = #16 e #18

#16 Validação completa de experiência infantil
DEPENDE_DE  = M2 funcional + #15
DESBLOQUEIA = #19

#17 Persistência, versionamento e recuperação final
DEPENDE_DE  = modelos de estado da M2 estabilizados (#8–#14)
DESBLOQUEIA = #19

#18 Desempenho, assets e tamanho do pacote
DEPENDE_DE  = features/assets finais + #15
DESBLOQUEIA = #19

#19 Regressão E2E Web + Android
DEPENDE_DE  = #16 + #17 + #18
DESBLOQUEIA = #20

#20 Release candidate Android
DEPENDE_DE  = #19
```

### Caminho crítico conhecido

Sem considerar mudanças futuras de prioridade, o caminho com maior efeito de desbloqueio é:

```text
#8 + #9
→ #10
→ #11
→ #12

e em paralelo após #10:
→ #13
→ #14

M2 estabilizada
→ #15 / #17
→ #16 / #18
→ #19
→ #20
```

Esse diagrama é um checkpoint operacional. Se uma issue nova alterar dependências, o Orquestrador deve recalcular o mapa antes de executar.


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

Foco atual:

```text
continuar a produção e integração das artes das Ilhas da Região 1
relacionadas ao roadmap #8
```

Para qualquer novo pedido:

```text
criar issue própria
→ calcular DEPENDE_DE / DESBLOQUEIA
→ se bloqueada, focar primeiro no desbloqueador
→ se independente, executar conforme prioridade definida pelo líder
```

Nenhuma issue futura é liberada apenas por número, milestone ou ordem de criação.



### Correção visual concluída — Issue #30

Regra consolidada:

```text
unlocked aprovada
→ locked é criada por edição da própria unlocked
→ somente corrente + cadeado + leve sombra
```

Aprovação explícita do líder em 20/09/2026:

```text
Issue #30 concluída.
```

Status:

```text
CLOSED
MILESTONE = nenhuma
```

A #30 não bloqueia mais trabalhos subsequentes.


### Correção concluída — Issue #31

A Ilha 03 havia sido empacotada com fundo preto opaco.

Correção aplicada:

```text
island-03-unlocked.png → alpha real
island-03-locked.png   → alpha real
```

Validação:

```text
alpha range = 0..255
pixel de canto = RGBA(0,0,0,0)
```

O pacote 01–10 foi reconstruído com 20 PNGs e recebeu o nome:

```text
region-1-islands-01-10-fixed.zip
```

Issue #31 concluída sem milestone.


### Issue #8 — task técnica pixel-perfect do novo fundo

Task adicional solicitada explicitamente pelo líder e incorporada à Issue #8.

Base:

```text
stage = 941 × 1672
background = web/assets/regions/region-1/background.png
```

Implementação concluída:

```text
novo REGION_1_LAYOUT serpenteado
10 assetBox específicos
10 statusBox específicos
10 hitboxes específicas
novo hitbox do botão voltar
recompensa visual dinâmica removida
status = único dado visual dinâmico por Ilha
Ilha 10 sincronizada como Ilha Lamen
```

Fonte de verdade do mapeamento:

```text
docs/arte/ISSUE-008-REGIAO1-PIXEL-MAP.md
web/js/screens/islands-screen.js
tests/web/region-1-map-layout.test.cjs
```

Commits principais:

```text
58838f20 → aplica mapa pixel-perfect
93f6b23b → mantém somente status dinâmico
a22fee58 → sincroniza assets e Ilha Lamen
7e2a01bf → testes do mapa pixel-perfect
09e98ffd → cache HTML
d01a27a5 → cache CSS
6ff11cb7 → documentação técnica
05549bc0 → mapa físico do projeto
```

Validação automática:

```text
Web Unit Tests 35523025620 → success
Android Debug   35523025647 → success
Web Preview     35523025696 → success
```

Dependência resolvida:

```text
novo background + assets 01–10 presentes
→ task pixel-perfect executável
```

Resultado:

```text
DESBLOQUEIA = validação visual do líder sobre a composição real das 10 Ilhas
```

A Issue #8 permanece aberta até a validação visual final e demais critérios de aceite.


### Issue #8 — CORSÁRIO com 5 Ilhas

Reformulação visual aprovada pelo líder para a tela CORSÁRIO.

Decisão:

```text
CORSÁRIO atual = 5 Ilhas visíveis
Ilhas 06–10 = preservadas para futura divisão/navegação
arquitetura geral de Regiões = não alterar agora
didática global = não redistribuir nesta task
```

O antigo mapa de 10 Ilhas na mesma tela foi rejeitado visualmente e deixou de ser fonte de verdade.

Fundo canônico:

```text
web/assets/regions/region-1/mapa_marítimo_do_corsário.png
941 × 1672
```

Implementação atual:

```text
01 Porto da Âncora      → topo esquerdo
02 Enseada do Saque     → topo direito
03 Rochedo da Bandeira  → centro
04 Ilha do Vulcão       → inferior esquerdo
05 Ilha da Caveira Rosa → inferior direito
```

As Ilhas foram ampliadas para melhorar a leitura das placas e posicionadas sobre as cinco marcações de água do fundo.

Fonte técnica:

```text
docs/arte/ISSUE-008-REGIAO1-PIXEL-MAP.md
web/js/screens/islands-screen.js
web/js/content/game-content.js
tests/web/region-1-map-layout.test.cjs
```

Commits principais:

```text
c9cb8e44 → registra mapa_marítimo_do_corsário.png canônico
58fe8297 → renderiza 5 Ilhas maiores na CORSÁRIO
d7b7bb7e → aponta runtime para o novo background
ec6e1d7d → atualiza testes para o layout de 5 Ilhas
a3832f9a → remove arquivo .png.png duplicado
92bad436 → atualiza mapa técnico
f520b0f8 → atualiza MAPA-DO-PROJETO
406eef42 → atualiza cache do frontend
96e9f59a → atualiza README dos assets
```

Validações já concluídas:

```text
Web Unit Tests 35526141301 → success
Android Debug   35526233257 → success
```

Validação ainda necessária:

```text
Web Preview 35526233278 → success
Validação visual do líder → necessária
```

O preview foi publicado com sucesso.

Próximo gate:

```text
Web Preview publicado
→ líder valida tamanho/posição das 5 Ilhas
→ somente depois considerar a task visual aceita
```


### Issue #8 — refino de escala e contraste

Diagnóstico do líder após validar a primeira versão CORSÁRIO 5:

```text
oceano deve continuar respirando
Ilhas podem crescer mais
Ilhas não devem se encostar
status precisa contrastar melhor com a placa
```

Implementação aplicada:

```text
Ilha 01 = 380 × 380
Ilha 02 = 380 × 380
Ilha 03 = 400 × 400
Ilha 04 = 395 × 395
Ilha 05 = 400 × 400
```

Os centros visuais foram preservados aproximadamente e o espaço negativo do oceano continua fazendo parte da composição.

Status:

```text
font-size lógico = 28–29 px
caixa = 42–44 px
text-stroke
sombras em camadas
leve tratamento de fundo
cores específicas para locked / completed / resume
```

Commits:

```text
9c0dc2b7 → amplia Ilhas preservando respiro
5b01de02 → reforça contraste dos status
defa0563 → testes de escala e respiro
3e87972e → testes de contraste CSS
b8e7f555 → cache CSS
e8934b25 → cache frontend
57e06799 → documentação técnica
```

Validação automática final do código publicado:

```text
Web Unit Tests 35527098858 → success
Web Preview    35527098869 → success
Android Debug  35527098870 → success
```

Próximo gate:

```text
líder valida visualmente o novo tamanho e o contraste
→ somente após aprovação considerar o refino aceito
```

A Issue #8 permanece aberta.


### Issue #32 — asset global Mapa mundo — CONCLUÍDA

Pedido do líder:

```text
criar asset global "Mapa mundo"
200 × 200
PNG transparente
posicionar na CORSÁRIO no canto inferior
abaixo da Ilha do Vulcão
```

Asset:

```text
web/assets/global/mapa-mundo.png
```

Catálogo:

```text
TQ.content.assets.global.worldMap
```

Posicionamento CORSÁRIO:

```text
x=98
y=1405
w=200
h=200
```

A integração não adiciona comportamento de clique. É somente composição visual nesta etapa.

Dependências:

```text
DEPENDE_DE  = asset aprovado + tela CORSÁRIO existente
DESBLOQUEIA = reutilização futura em outras Regiões
MILESTONE   = nenhuma
```

Commits principais:

```text
1de911c4 → sobe PNG global 200×200
5954377d → cadastra asset global
005ef74d → posiciona na CORSÁRIO
108ce230 → estilo visual do asset
f02c3243 → testes do PNG e posicionamento
549bbe17 → cache CSS
c79cace2 → cache frontend
dfd4d415 → documentação física
```

Validação automática:

```text
Web Unit Tests 35528326226 → success
Web Preview    35528326173 → success
Android Debug  35528326081 → success
```

Validação final do líder em 20/09/2026:

```text
clique funcionando
```

Status:

```text
CLOSED
MILESTONE = nenhuma
```


### Issue #33 — padrão global das telas de Região — CONCLUÍDA

Decisão global do líder:

```text
a composição aprovada na CORSÁRIO
→ passa a ser o padrão obrigatório de todas as demais telas de Região
```

Invariantes:

```text
stage = 941 × 1672
5 Ilhas visíveis
mesmas coordenadas
mesmos tamanhos
mesmos statusBox
mesmas hitboxes
mesma geometria das marcações de água
mesma rota
Mapa mundo = x98 y1405 200×200
mesmo tratamento CSS de status
```

Entre Regiões mudam apenas:

```text
background
header/nome
identidade visual das Ilhas
props
medalhões conforme recompensa real
```

Fonte de verdade:

```text
docs/arte/PADRAO-GLOBAL-REGIOES-5-ILHAS.md
```

Direção Visual foi atualizada para consultar esse contrato antes de criar qualquer nova Região.

Dependências:

```text
DEPENDE_DE  = #8 + #32
DESBLOQUEIA = produção visual consistente das próximas Regiões
MILESTONE   = nenhuma
```

Regra de implementação futura:

```text
quando a segunda Região visual for implementada,
promover REGION_1_LAYOUT para configuração compartilhada
sem alterar as coordenadas aprovadas
```

Commits:

```text
2ca33930 → cria padrão global das telas de Região
045c3a0f → atualiza direção da Issue #8
3f95098f → ensina padrão à Direção Visual
fd92e5c7 → atualiza MAPA-DO-PROJETO
```


### Issue #33 — clique global do Mapa mundo — CONCLUÍDA

Última task antes do encerramento solicitado pelo líder.

Contrato implementado:

```text
qualquer tela de Região visual
→ botão Mapa mundo
→ data-action="open-world-map"
→ TQ.core.worldMap.open({ onNavigate })
```

Fonte única:

```text
web/js/core/world-map.js
```

Comportamento provisório:

```text
alert("Mapa mundo ainda está em produção.")
```

Destino futuro já reservado:

```text
world-map
```

Regra:

```text
quando a tela real existir,
alterar somente TQ.core.worldMap.open(...)
não criar handlers por Região
```

Commits:

```text
ef044b50 → cria controlador global
bdbe7395 → liga botão da CORSÁRIO ao controlador
99f3fc8d → feedback visual/touch/focus do botão
d18eba9f → carrega controlador no frontend
98f0bd87 → cache CSS
0ac15b77 → testes do controlador
68eb0a55 → teste do wiring da CORSÁRIO
22f9417c → documentação do padrão global
5a791829 → MAPA-DO-PROJETO
```

Validação automática:

```text
Web Unit Tests 35529237295 → success
Web Preview    35529219339 → success
Android Debug  35529219382 → success
```

Validação final do líder em 20/09/2026:

```text
clique funcionando
```

Status:

```text
CLOSED
MILESTONE = nenhuma
```


## Próximo foco após #32/#33

As duas issues auxiliares do Mapa mundo e da malha global foram concluídas.

Ordem operacional recalculada por dependência:

```text
#8  → próxima issue em foco
#9  → executável em paralelo, mas não assume prioridade enquanto #8 segue aberta
#10 → bloqueada por #8 + #9
```

Próxima issue:

```text
#8 — [M2-01] Reestruturar Regiões e Ilhas para identidade pirata e mix de tabuadas
```

Motivo:

```text
#8 já é a issue de roadmap ativa
#8 ainda possui critérios de aceite pendentes
#8 desbloqueia #10, #13 e parte das validações M3
```

Não avançar para #10 antes de concluir #8 e #9.
