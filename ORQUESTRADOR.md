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

**Última atualização:** 2026-09-19  
**Milestone ativa:** M1 — Fundação e Núcleo Jogável  
**Issue ativa:** #21 — Disponibilizar preview web contínuo da main  
**Estado:** AGUARDANDO HABILITAÇÃO/VALIDAÇÃO DO PAGES  
**Issue pausada:** #3 — bloqueada por assets definitivos ausentes  
**Próxima issue do roadmap:** #4 — BLOQUEADA; #3 deve ser retomada antes  
**Branch de trabalho:** `main`  
**Branch de referência:** `apoio`

### Personas e contratos

- Orquestrador: `ORQUESTRADOR.md`
- Produto: `agentes/01-produto.md`
- Game Design e Aprendizagem: `agentes/02-game-design-aprendizagem.md`
- Direção Visual: `agentes/03-direcao-visual.md`
- Desenvolvimento: `agentes/04-desenvolvimento.md`
- Qualidade e Build: `agentes/05-qualidade-build.md`
- Experience Validator: `agentes/06-experience-validator.md`

### Decisões oficiais vigentes

- identidade do jogo: aventura pirata mágica infantil;
- Portais foram substituídos por **Regiões**;
- Mundos foram substituídos por **Ilhas**;
- estrutura atual: 10 Regiões × 10 Ilhas = 100 Ilhas, até nova decisão de Produto;
- Ilhas não representam uma única tabuada;
- scheduler pedagógico intercalado definido conceitualmente na DEC-001;
- campanha possui 30 PETs a serem salvos;
- campanha possui 30 baús;
- cada baú pode conter um ou mais tesouros;
- existem 5 mapas especiais, cada um com 4 fragmentos;
- distribuição de mapas: R1 fecha mapa 1; R2-R3 mapa 2; R4-R5 mapa 3; R6-R7 mapa 4; R8-R10 mapa 5;
- ao fechar 4/4 fragmentos, progressão normal é temporariamente bloqueada;
- mapa completo abre missão especial obrigatória de tabuada mista com fundo temático;
- conclusão da missão concede 1.000 diamantes uma única vez;
- os 5 mapas permitem 5.000 diamantes por esse sistema;
- Diamantes são moeda especial persistente para futura Loja Especial;
- PETs, baús e diamantes são sistemas distintos, salvo decisão posterior.

### Direção Visual vigente

- contrato visual e de otimização está em `agentes/03-direcao-visual.md`;
- avatares canônicos:
  - `avatar-luna-visual-base.webp`
  - `avatar-sofia-visual-base.webp`
  - `avatar-maya-visual-base.webp`
- novas modas devem preservar aparência e alterar apenas roupa/acessórios aprovados;
- assets devem seguir contratos WebP/Lottie definidos pela Direção Visual.

### Arquitetura já preparada

- `web/` é a fonte web canônica;
- o mesmo `web/` é empacotado no Android WebView;
- wrapper Android em Java já existe;
- build Android inicial foi preparado, mas o APK final ainda não foi validado como release;
- gameplay do 2.0 ainda não foi iniciado.

### Referência

- branch `apoio` existe e contém material legado/referência;
- há conteúdo em `game 2.0/assets-remasterizados`;
- material da `apoio` não entra automaticamente na `main`.

### Documentação oficial relevante

- `docs/decisoes/DEC-001-distribuicao-intercalada-tabuadas.md`
- `docs/decisoes/DEC-002-regioes-ilhas-pets-baus.md`
- `docs/arquitetura/ANDROID-WEBVIEW.md`

### Estado do pedido atual

O usuário autorizou o início da **versão 1 do jogo**.

A Issue #1 foi concluída e fechada com a matriz de escopo consolidada em `DEC-003`.

Pelo gate vigente:

1. a Issue #2 está liberada e em execução;
2. a Issue #3 permanece bloqueada até o fechamento formal da #2;
3. somente depois a fila avança para #3, #4, #5, #6 e #7;
4. a primeira implementação jogável completa da M1 culmina na #7.

### Reordenação temporária para preview

O usuário solicitou acompanhar visualmente as modificações durante o desenvolvimento.

Por prioridade explícita:

```text
#3 → PAUSADA / continua aberta / bloqueada por assets
#21 → EM EXECUÇÃO / infraestrutura de preview
#4 → BLOQUEADA
```

A #21 não altera gameplay, scheduler, assets canônicos ou escopo funcional. Ao concluir, o Orquestrador deve retomar a #3. A #21 não autoriza liberar a #4.

### Bloqueio atual da Issue #3

Auditoria concluída em 2026-09-19:

- a branch `apoio` foi inspecionada integralmente;
- pacote encontrado: `game 2.0/assets-remasterizados/`;
- esse pacote contém somente home/ícones/prompts remasterizados iniciais;
- `avatar-luna-visual-base.webp` não foi encontrado;
- `avatar-sofia-visual-base.webp` não foi encontrado;
- `avatar-maya-visual-base.webp` não foi encontrado;
- a `main` não contém WebPs/avatares de produção;
- o pacote definitivo renomeado necessário para encerrar #3 ainda não está no repositório.

O destino canônico já foi definido como:

```text
web/assets/
```

e documentado em:

```text
web/assets/README.md
```

### Próximo passo permitido

A Issue #3 permanece ativa e bloqueia a #4.

Quando o pacote definitivo estiver disponível:

1. Direção Visual valida identidade e avatares-base;
2. Qualidade valida nomes, duplicidades, budgets e referências;
3. assets aprovados são promovidos para `web/assets/`;
4. `MAPA-DO-PROJETO.md` é atualizado com a subestrutura real;
5. #3 é fechada somente após todos os critérios;
6. só então #4 pode ser liberada.

## Diário operacional

### 2026-09-19 — checkpoint de continuidade

- Orquestrador estabelecido como primeiro agente obrigatório.
- Gate sequencial de milestones/issues estabelecido.
- 20 issues criadas e distribuídas em 3 milestones.
- Issue #1 foi concluída e fechada.
- DEC-001 e DEC-002 criadas/atualizadas.
- Direção Visual formalizada com identidade pirata, contratos de otimização e avatares-base.
- Estrutura Região/Ilha, 30 PETs, 30 baús, 5 mapas e Diamantes registrada.
- Usuário autorizou início da V1.
- Foi adicionada a exigência de que **todo o processo seja documentado no Orquestrador para continuidade por qualquer IA**.
- Issue #2 foi liberada após o fechamento da #1.
- Issue #3 e posteriores permanecem bloqueadas.
- `MAPA-DO-PROJETO.md` criado na raiz como mapa físico/técnico obrigatório.
- Empacotamento Android, caminhos de build, localização de referências e caminhos ainda pendentes foram registrados.
- Toda IA agora deve ler Orquestrador + Mapa do Projeto antes de executar qualquer tarefa.
- Contratos de Produto, Game Design, Desenvolvimento, Qualidade e Experience Validator criados na #2.
- Issue #2 foi concluída e fechada.
- Issue #3 foi liberada; Issue #4 e posteriores permanecem bloqueadas.
- Auditoria da #3 encontrou somente o pacote inicial de referência em `apoio/game 2.0/assets-remasterizados/`.
- O pacote definitivo renomeado e os três avatares-base ainda não estão no repositório.
- Destino canônico de produção definido: `web/assets/`.
- Issue #3 permanece aberta e bloqueada por insumo ausente; #4 não pode iniciar.
- Auditoria técnica parcial da #3 registrada em `docs/validacao/ISSUE-003-auditoria-assets.md`.
- Manifesto canônico criado em `web/assets/MANIFESTO.md`.
- Pacote de referência auditado: banner, botão e 4 ícones cumprem budgets; fundo 1080×1918 cumpre peso, mas diverge 2 px do contrato 1080×1920.
- Nenhum arquivo de referência foi promovido automaticamente para produção.
- Issue #21 criada para servir preview contínuo da `web/` após solicitação explícita do usuário.
- Issue #3 foi pausada temporariamente, não concluída; #4 permanece bloqueada.
- Issue #21: workflow `web-preview-pages.yml` criado para publicar diretamente `web/` no GitHub Pages.
- URL esperada do preview: `https://juliano-souza-dev.github.io/tabuada-quest-2/`.
- Primeira publicação falhou no run 35459403891, passo `Configure Pages`.
- Causa confirmada pelo log: o repositório ainda não possui um Pages site habilitado/configurado para GitHub Actions.
- Ação manual necessária uma única vez: Settings → Pages → Build and deployment → Source → GitHub Actions.
- Depois disso, reexecutar o workflow e validar a URL.
- Todos os domínios do fluxo agora possuem autoridade, limites, entregas e handoffs formais.


## Autoridade e conflitos

Se duas personas entrarem em conflito:

1. o Orquestrador identifica qual domínio está em disputa;
2. a decisão pertence à persona dona daquele domínio;
3. se a decisão alterar escopo ou direção geral do produto, Produto tem a palavra final;
4. decisões já registradas em `docs/decisoes/` têm precedência até serem formalmente substituídas;
5. uma persona não pode sobrescrever silenciosamente uma decisão aprovada de outra área.

## Estado das personas

A fonte de verdade das personas é a branch `main`.

Antes de chamar uma persona, o Orquestrador deve considerar a versão mais recente de seu arquivo de regras.

Se uma persona ainda não possuir contrato formal na `main`, o Orquestrador deve tratar isso como uma lacuna de governança e evitar inventar regras permanentes em nome dela. Pode executar somente aquilo que já estiver claramente decidido pelo projeto e registrar a necessidade de formalização.

## Uso da branch apoio

A branch `apoio` é fonte de referência e material legado.

O Orquestrador pode mandar uma persona consultar a `apoio`, mas:

- decisões novas vivem na `main`;
- código do 2.0 vive na `main`;
- contratos das personas vivem na `main`;
- material da `apoio` não se torna regra do 2.0 automaticamente.

## Regra de encerramento

Antes de considerar um pedido concluído, o Orquestrador deve verificar:

- a persona correta executou cada parte;
- nenhuma regra de persona foi violada;
- decisões existentes foram respeitadas;
- arquivos foram alterados na branch correta;
- critérios de aceite aplicáveis foram verificados;
- pendências ou decisões ainda abertas ficaram explicitamente registradas.

## Princípio central

> O Orquestrador coordena. As personas decidem e executam dentro de seus domínios. Nenhuma persona deve resolver silenciosamente um problema que pertence a outra especialidade.
