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
**Issue ativa:** #4 — Definir arquitetura web, domínio, persistência e estratégia de testes  
**Estado:** DIREÇÃO VISUAL APROVADA 91% / EM QUALIDADE  
**Próxima issue:** #5 — BLOQUEADA até nova aprovação e fechamento formal da #4  
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

### Arquitetura vigente

- `web/` é a fonte web canônica;
- o mesmo `web/` é empacotado no Android WebView;
- wrapper Android em Java permanece apenas como hospedeiro;
- arquitetura modular está documentada em `docs/arquitetura/WEB-V1.md`;
- conteúdo, domínio, persistência, core e telas possuem caminhos separados;
- estado local usa `schemaVersion = 1`;
- testes de domínio/persistência vivem em `tests/web/`;
- a Home da V1 já usa estrutura mobile-first de jogo;
- scheduler pedagógico ainda não foi implementado e pertence às Issues #5/#6;
- release Android final ainda não foi validado.

### Referência

- branch `apoio` existe e contém material legado/referência;
- há conteúdo em `game 2.0/assets-remasterizados`;
- material da `apoio` não entra automaticamente na `main`.

### Documentação oficial relevante

- `docs/decisoes/DEC-001-distribuicao-intercalada-tabuadas.md`
- `docs/decisoes/DEC-002-regioes-ilhas-pets-baus.md`
- `docs/decisoes/DEC-003-matriz-escopo-v1.md`
- `docs/arquitetura/ANDROID-WEBVIEW.md`
- `docs/arquitetura/WEB-V1.md`
- `docs/referencias/V1-DIRECAO-MOBILE.md`
- `docs/validacao/ISSUE-004-arquitetura-mobile.md`

### Estado do pedido atual

O usuário autorizou o início da **versão 1 do jogo** e definiu que a experiência visual/mobile da referência anterior é parte do core, adaptada integralmente ao tema pirata mágico.

Estado atual do gate:

1. Issues #1, #2, #3 e #4 estão concluídas;
2. Issue #5 está liberada;
3. Issue #6 permanece bloqueada até fechamento da #5;
4. Issue #7 permanece bloqueada até fechamento da #6;
5. a primeira implementação jogável completa da M1 culmina na #7.

### Preview web contínuo

A Issue #21 foi concluída.

Resultado:

```text
workflow = .github/workflows/web-preview-pages.yml
fonte publicada = web/
URL = https://juliano-souza-dev.github.io/tabuada-quest-2/
run validado = 35461886529
resultado = success
```

O workflow `static.yml`, criado automaticamente pela configuração do GitHub Pages, foi removido porque publicava a raiz do repositório e causava 404 no endereço principal.

O preview está ativo e publica diretamente a `web/`. A última versão validada corresponde ao core mobile da Issue #4.

### Issue #3 concluída

A Issue #3 foi encerrada após Direção Visual + Qualidade aprovarem o pacote canônico inicial.

Fonte de produção:

```text
web/assets/
├── avatars/
└── ui/
```

Avatares-base disponíveis:

```text
web/assets/avatars/avatar-luna-visual-base.webp
web/assets/avatars/avatar-maya-visual-base.webp
web/assets/avatars/avatar-sofia-visual-base.webp
```

Controle e auditoria:

```text
web/assets/MANIFESTO.md
docs/validacao/ISSUE-003-auditoria-assets.md
```

Preview público da entrega validado:

```text
run_id = 35460817391
resultado = success
URL = https://juliano-souza-dev.github.io/tabuada-quest-2/
```

Dívidas visuais e itens não promovidos permanecem documentados e não criam referências quebradas.

### Direção de experiência da V1

As telas da versão anterior fornecidas pelo usuário são referência de UX/densidade/composição, **não de identidade visual**.

Regra:

- preservar densidade útil, hierarquia, ocupação de viewport e comportamento mobile;
- adaptar tudo à aventura pirata mágica;
- não copiar tema joaninha, castelos, iconografia antiga ou franquias;
- Home, Mapa, Desafio, Perfil e Loja podem possuir composições próprias;
- mobile é a origem do layout; desktop é adaptação;
- evitar transformar o jogo em uma landing page responsiva.

Documento: `docs/referencias/V1-DIRECAO-MOBILE.md`.

### Issue #4 concluída

A Issue #4 foi encerrada após incorporar a arquitetura técnica e a correção visual/mobile como parte obrigatória do core da V1.

Implementado:

- arquitetura modular em `web/js/` e `web/css/`;
- estado persistente versionado;
- persistência local com recuperação segura;
- testes unitários sem DOM;
- Home mobile-first em tela cheia;
- adaptação desktop derivada do mobile;
- modo compacto para aparelhos de baixa altura.

Validações:

```text
Web Unit Tests = 35461810852 → success
Web Preview    = 35461886529 → success
Android Debug  = 35461886489 → success
```

Experience Validator: **APROVADO**  
Qualidade e Build: **APROVADO**

Documento:

```text
docs/validacao/ISSUE-004-arquitetura-mobile.md
```

### Reprovação visual da Issue #4

A aprovação anterior da camada visual foi invalidada por feedback explícito do usuário em 2026-09-19.

Falha de processo identificada:

- Desenvolvimento assumiu decisões de composição visual que pertenciam à Direção Visual;
- Experience Validator aprovou cedo demais;
- a Home publicada foi considerada insatisfatória pelo usuário;
- portanto a Issue #4 foi reaberta.

Ordem obrigatória de correção:

```text
Direção Visual
  ↓
Experience Validator
  ↓
Desenvolvimento
  ↓
Qualidade + Preview
```

A Direção Visual deve definir primeiro:

- composição da Home;
- hierarquia do HUD;
- escala e posição do personagem;
- uso do cenário;
- botão principal;
- atalhos;
- densidade mobile;
- adaptação integral ao tema pirata mágico.

Plano de assets da Home deve ser produzido antes do handoff para Desenvolvimento.

Para cada slot visual obrigatório:

```text
REUTILIZAR / ADAPTAR / CRIAR NOVO
```

Fonte: `docs/arte/ESTRATEGIA-ASSETS-V1.md`.

Desenvolvimento só implementa depois dessa definição.

### Próximo passo permitido

Corrigir a camada visual da Issue #4 sob liderança da Direção Visual.

```text
[M1-05] Medir carga pedagógica de referência e fechar o scheduler intercalado
```

A #5 permanece bloqueada até a nova aprovação e fechamento formal da #4.

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
- Issue #21 concluída com preview web funcionando em `https://juliano-souza-dev.github.io/tabuada-quest-2/`.
- Workflow duplicado `static.yml` removido; ele publicava a raiz e provocava 404.
- Workflow canônico de preview: `.github/workflows/web-preview-pages.yml`, publicando somente `web/`.
- Issue #3 retomada após conclusão da #21.
- Pacote completo de assets recuperado do material previamente enviado pelo usuário.
- Avatares-base de Luna, Maya e Sofia promovidos para `web/assets/avatars/`.
- Recorte pirata aprovado promovido para `web/assets/ui/`.
- Preview da integração visual validado no run `35460668998`.
- Issue #3 concluída e fechada após preview final `35460817391` com sucesso.
- Issue #4 liberada pelo gate; Issue #5 e posteriores permanecem bloqueadas.
- Usuário definiu as telas enviadas como direcionamento oficial da V1 para UX/densidade mobile.
- A referência deve ser adaptada integralmente ao tema pirata mágico definido; não copiar a identidade visual antiga.
- Direção registrada em `docs/referencias/V1-DIRECAO-MOBILE.md`.
- Usuário definiu que cada issue visível deve atualizar o preview público para acompanhamento em tempo real.
- Preview obrigatório por issue documentado no Orquestrador.
- Issue #21: workflow `web-preview-pages.yml` criado para publicar diretamente `web/` no GitHub Pages.
- URL esperada do preview: `https://juliano-souza-dev.github.io/tabuada-quest-2/`.
- Primeira publicação falhou no run 35459403891, passo `Configure Pages`.
- Causa confirmada pelo log: o repositório ainda não possui um Pages site habilitado/configurado para GitHub Actions.
- Ação manual necessária uma única vez: Settings → Pages → Build and deployment → Source → GitHub Actions.
- Depois disso, reexecutar o workflow e validar a URL.
- Todos os domínios do fluxo agora possuem autoridade, limites, entregas e handoffs formais.
- Usuário determinou que a correção visual/mobile da referência é parte do core da V1, não polimento.
- Issue #4 incorporou essa regra aos critérios de aceite.
- Home deixou de ser landing page e passou a ocupar o viewport como tela de jogo mobile-first.
- Arquitetura modular formalizada em `docs/arquitetura/WEB-V1.md`.
- Testes web adicionados em `tests/web/` com workflow `.github/workflows/web-unit-tests.yml`.
- QA corrigiu corte potencial em aparelhos com menos de 620 px de altura e adicionou modo compacto abaixo de 640 px.
- Issue #4 concluída com arquitetura modular, core mobile e validação completa.
- Runs finais da #4: testes `35461810852`, preview `35461886529`, Android debug `35461886489`, todos com sucesso.
- Issue #5 chegou a ser liberada após a primeira validação da #4.
- Usuário reprovou visualmente a Home da Issue #4; aprovação anterior invalidada.
- Issue #4 reaberta.
- Issue #5 voltou a ficar bloqueada.
- Direção Visual passa a liderar a correção antes de qualquer nova implementação de composição.
- Usuário definiu `home-pirata-fundo-principal.webp` como fundo padrão inicial da Home.
- O fundo da Home não é fixo: o jogador pode escolher outro cenário aprovado.
- A preferência fica em `state.ui.homeBackgroundId`; estado persistente passa a `schemaVersion = 2` com migração automática de v1.
- A escolha do fundo é puramente visual e não altera progressão, scheduler ou recompensas.
- A moldura de perfil também é selecionável pelo jogador, independentemente do fundo.
- HUD da Home é dinâmico: avatar, nome, nível, XP, moedas e gemas vêm do estado do jogador.
- Estado persistente vigente passa a `schemaVersion = 3`.
- Primeira moldura promovida: `web/assets/frames/profile-frame-pirate-treasure.webp`.
- Catálogo de molduras: `TQ.content.profileFrames`; preferência: `state.player.profileFrameId`.
- Implementação base validada após a decisão de fundo personalizável:
  - Web Unit Tests `35464413886` → success;
  - Web Preview `35464421922` → success;
  - Android Debug `35464421928` → success.
- A Issue #4 permanece aberta porque a UI final de seleção de fundo e a recomposição visual da Home ainda precisam ser concluídas sob liderança da Direção Visual.
- Estratégia de criação/reuso de assets formalizada em `docs/arte/ESTRATEGIA-ASSETS-V1.md`.
- Regra: a composição da tela é definida antes do inventário de assets; cada slot deve ser classificado como REUTILIZAR, ADAPTAR ou CRIAR NOVO.
- Desenvolvimento não pode improvisar asset ausente ou forçar arquivo existente em função inadequada.


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

## Regra obrigatória de preview por issue

Toda issue que alterar comportamento, interface, navegação, feedback, gameplay ou qualquer conteúdo visível da pasta `web/` deve atualizar o preview público antes de ser considerada concluída.

Fluxo obrigatório:

```text
issue ativa
  ↓
implementação na main
  ↓
alteração em web/
  ↓
workflow Web Preview
  ↓
deploy concluído
  ↓
validação visual no endereço público
  ↓
registro no ORQUESTRADOR.md
  ↓
issue pode seguir para encerramento
```

Preview oficial:

```text
https://juliano-souza-dev.github.io/tabuada-quest-2/
```

### Regras

- cada issue visual/funcional deve deixar uma versão observável no preview;
- não considerar uma issue concluída apenas porque o código foi commitado;
- aguardar o workflow `.github/workflows/web-preview-pages.yml`;
- se o deploy falhar, a issue continua ativa;
- Qualidade deve validar a publicação quando a issue exigir QA;
- o Orquestrador deve registrar o run validado ou a confirmação de publicação;
- issues puramente documentais, sem alteração em `web/`, não precisam gerar nova versão visual;
- o preview não substitui validação Android quando a issue também exigir APK/WebView.

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


### Implementação visual atual da Issue #4 — 2026-09-19

Home V1 recomposta conforme composição aprovada pelo usuário.

Implementado:

- HUD dinâmico com avatar, nome, nível, XP, moedas e gemas;
- avatar pirata dinâmico por personagem;
- fundo selecionável com 3 opções promovidas;
- moldura de perfil selecionável com 2 opções;
- botão JOGAR dominante;
- área central de hero/portal;
- FUNDO e MODA;
- progresso do próximo baú;
- navegação: Regiões, Recompensa Diária, Loja, Colecionáveis e Baús;
- cards PETS e BAÚ DE ITENS;
- persistência imediata das personalizações;
- layout compacto para telas de menor altura.

Validação técnica:

```text
Web Unit Tests = 35465842720 → success
Web Preview    = 35465846821 → success
Android Debug  = 35465846781 → success
```

A Issue #4 permanece aberta aguardando validação visual explícita do usuário no preview público.

A #5 continua bloqueada.

## Protocolo obrigatório de entrega visual

Este protocolo se aplica a qualquer issue com composição visual, tela, assets ou UX visual.

### Fluxo oficial

```text
ORQUESTRADOR
  ↓ entrega assets aprovados/gerados + composição aprovada + requisitos + caminhos
DESENVOLVIMENTO
  ↓ implementa de forma fidedigna
  ↓ devolve IMPLEMENTAÇÃO CONCLUÍDA
ORQUESTRADOR
  ↓
DIREÇÃO VISUAL
  ↓ compara implementação x esperado e registra FIDELIDADE_VISUAL = N%
```

### Gate da Direção Visual

```text
N < 75%
→ REPROVADO
→ volta via Orquestrador para Desenvolvimento
→ Qualidade e Experience Validator NÃO são chamados

N >= 75%
→ APROVADO PARA VALIDAÇÃO
→ Orquestrador encaminha para Qualidade
→ depois Experience Validator
```

O mínimo de 75% é gate de continuidade, não aprovação final.

Direção Visual compara no mínimo composição, hierarquia, proporções, escala, posicionamento, assets, cenário, personagem, HUD, CTA, navegação, profundidade, paleta e acabamento.

### Após o gate visual

```text
Direção Visual >= 75%
→ Qualidade e Build
→ Orquestrador
→ Experience Validator
→ Orquestrador
→ LÍDER DE EQUIPE (usuário)
```

Sem aprovação explícita do líder de equipe:

- a issue não é fechada;
- a próxima issue não é liberada;
- o estado permanece AGUARDANDO APROVAÇÃO DO LÍDER.

### Regra de retorno

Qualquer reprovação volta sempre por:

```text
persona → Orquestrador → responsável pela correção
```

Autoridades:

- Orquestrador: handoffs e gates;
- Desenvolvimento: implementação;
- Direção Visual: fidelidade visual;
- Qualidade: integridade técnica/build;
- Experience Validator: experiência infantil;
- Líder de equipe: aprovação global final.

### Estado da Issue #4 sob este protocolo

A implementação visual publicada anteriormente não conta como aprovada.

Novo ciclo obrigatório:

```text
Orquestrador
→ Desenvolvimento
→ Orquestrador
→ Direção Visual [>=75%]
→ Qualidade
→ Experience Validator
→ Orquestrador
→ Líder de equipe
```

Até o ciclo terminar, #4 permanece aberta e #5 permanece bloqueada.
### Ramo de reprovação visual

Quando a Direção Visual medir `FIDELIDADE_VISUAL < 75%`:

```text
Direção Visual
→ devolve ao Orquestrador uma lista objetiva do que falta
→ identifica quais gaps são de implementação e quais são de asset
→ cria/gera os assets faltantes necessários
   limite máximo: 10 assets por rodada
→ entrega o pacote ao Orquestrador
→ Orquestrador entrega pacote + correções ao Desenvolvimento
→ Desenvolvimento reimplementa
→ Desenvolvimento devolve IMPLEMENTAÇÃO CONCLUÍDA ao Orquestrador
→ Orquestrador envia novamente à Direção Visual
→ repete até FIDELIDADE_VISUAL >= 75%
```

Se a reprovação não exigir novo asset, Direção Visual deve declarar explicitamente `ASSETS_NOVOS = 0` e listar apenas as correções de implementação.

Não gerar assets por excesso: cada rodada pode criar de 0 a 10 peças, somente as necessárias para superar os gaps apontados.

Qualidade e Experience Validator permanecem fora do ciclo enquanto a fidelidade estiver abaixo de 75%.

### Rodada visual premium — 91%

Fluxo concluído até aqui:

```text
Orquestrador
→ Desenvolvimento
→ IMPLEMENTAÇÃO CONCLUÍDA
→ Orquestrador
→ Direção Visual
→ FIDELIDADE_VISUAL = 91%
→ APROVADO PARA QUALIDADE
```

Mudanças principais:

- overlay premium real promovido para `web/assets/ui/home-art-overlay.webp`;
- arte premium deixou de ser imitada em CSS;
- fundo, avatar e moldura seguem como slots dinâmicos;
- HUD mantém nome, nível, XP, moedas e gemas dinâmicos;
- personagem alinhado à geometria da referência;
- viewport desktop preserva 941/1672;
- Direção Visual registrou 91% em `docs/validacao/ISSUE-004-fidelidade-visual.md`.

Qualidade está validando a mesma entrega web do commit `3e02ebdfa703a4bb248404863da0cb3ea1b202c5`.

Issue #5 continua bloqueada.


### Preview atualizado para teste do líder — 2026-09-19

Overlay substituído manualmente pelo líder e confirmado na `main`.

```text
web/assets/ui/home-art-overlay.webp
size = 579660 bytes
sha  = ab9a3e0a8e37c44b3fd1ad34120dbecc9ed0358f
```

Cache-bust aplicado em `web/js/content/game-content.js`.

```text
commit      = 631005809acfada3465c0b56b50cdc88676c5f0c
Web Preview = 35471595734 → success
```

Página de teste liberada para validação do líder.


### Correção do fundo padrão da Home — 2026-09-19

Problema observado no preview: a composição carregava sobre o fundo azul do viewport, sem exibir o cenário padrão.

Correção:

- fundo passou de `background-image` CSS para camada `<img>` real;
- `pirate-main` continua sendo o fundo padrão;
- fallback automático para o fundo padrão em falha de carregamento;
- personalização de fundo permanece intacta.

```text
commit          = c6e16150e01caaa96b7173205d604c9af60d5eb6
Web Unit Tests  = 35471859658 → success
Web Preview     = 35471859639 → success
```

### Correções de alinhamento do HUD da Home — 2026-09-19 19:05 -03:00

**Milestone ativa:** M1 — Fundação e Núcleo Jogável
**Issue ativa:** #4 — correção visual/mobile da Home
**Estado:** IMPLEMENTAÇÃO ATUALIZADA / CORREÇÕES VALIDADAS PELO LÍDER / AGUARDANDO NOVA VALIDAÇÃO FORMAL
**Personas envolvidas:** Orquestrador, Direção Visual, Desenvolvimento e Qualidade e Build.

O líder validou o pacote de correções de alinhamento solicitado para a Home premium. A implementação foi ajustada sem alterar regras pedagógicas, persistência ou o catálogo de assets.

Alterações realizadas:

- removidos os textos duplicados de `JOGAR` e `REGIÕES`, pois a composição aprovada já os fornece no overlay;
- barra de progresso do próximo baú movida para o campo oval reservado abaixo do título;
- contador de PETs movido para o campo oval inferior do card PETS;
- moldura de perfil ampliada para preencher o medalhão do avatar, com recorte priorizando o rosto;
- nome, nível, XP, ouro e diamantes reposicionados nos slots desenhados no HUD superior;
- personagem central reduzido e reposicionado para preservar a leitura do portal e do CTA.

Arquivos alterados:

```text
web/css/screens/home.css
web/js/screens/home-screen.js
```

Validações executadas:

```text
node --test tests/web/*.test.cjs → 9 passed / 0 failed
git diff --check → sem erros de whitespace
```

Decisão do líder: **as alterações deste pacote podem ser consideradas válidas**.

Pendências:

- publicar o commit e aguardar o workflow de preview da web;
- validar a versão publicada no preview oficial;
- registrar o resultado de Qualidade e Build antes de considerar a Issue #4 encerrada.

Próximo passo permitido: commit/push deste pacote de correções e validação do preview da Issue #4. A Issue #5 permanece bloqueada.


### Issue #22 — refino visual da Home

Issue corretiva ativa vinculada à #4:

```text
#22 [M1-04A] Corrigir encaixe visual da Home após integração do overlay
```

Correção aplicada em:

```text
de0941fbd21ce88484235b84dfc53a6990732c86
```

Inclui:

- cache-bust de CSS/JS para impedir mistura de versões;
- remoção efetiva de resíduos visuais antigos;
- HUD recalibrado para o overlay vigente;
- nível sem quebra de linha;
- valores de moeda/gema sem ícones duplicados;
- moldura inicial simples;
- migração do estado para schema v4;
- personagem com maior presença no portal;
- contadores inferiores recalibrados.

```text
Web Unit Tests = 35473624880 → success
Web Preview    = 35473624902 → success
```

Estado: AGUARDANDO VALIDAÇÃO VISUAL DO LÍDER.

A #4 permanece aberta como issue pai.


### Issue #23 — calibração pixel-perfect da Home

Criada a correção objetiva:

```text
#23 [M1-04B] Aplicar offsets pixel-perfect aos conteúdos dinâmicos da Home
```

Vinculação:

```text
#4  → issue raiz
#22 → refino visual pai
#23 → calibração numérica exata
```

Baseline da medição:

```text
viewport = 394 × 699 px
overlay  = 941 × 1672 px
```

Offsets obrigatórios da #23:

```text
avatar decorativo  +15px X /  +2px Y
avatar simples     +12px X /  +9px Y
nome                +2px X / +10px Y
nível               +3px X /  +4px Y
XP                  +1px X /  +9px Y
moedas              +4px X / +11px Y
gemas               +4px X /  +9px Y
próximo baú         -2px X /  +1px Y
PETS                +3px X /  -7px Y
personagem           0px X /   0px Y
fundo                0px X /   0px Y
```

Regra: Desenvolvimento deve aplicar os valores exatamente, aos slots dinâmicos, sem ajustes subjetivos adicionais.

A #23 permanece aberta aguardando implementação e validação visual do líder.


### Issue #23 implementada

A calibração pixel-perfect definida pelo líder foi aplicada exatamente.

```text
commit visual = e7ed45a9891df572d5834d7b314c56ad77ec72b5
commit CI     = 4c8a438579aa387afe125c2edf67a527dc83343e
```

Offsets aplicados aos slots dinâmicos:

```text
avatar decorativo  +15px /  +2px
avatar simples     +12px /  +9px
nome                +2px / +10px
nível               +3px /  +4px
XP                  +1px /  +9px
moedas              +4px / +11px
gemas               +4px /  +9px
próximo baú         -2px /  +1px
PETS                +3px /  -7px
personagem           0px /   0px
fundo                0px /   0px
```

Validações:

```text
Web Preview     35475076822 → success
Web Unit Tests  35475094612 → success
Android Debug   35475076850 → success
```

Estado: AGUARDANDO VALIDAÇÃO VISUAL DO LÍDER.

A #23 permanece aberta até aprovação explícita.


### Issue #23 aprovada e encerrada

O líder de equipe aprovou explicitamente a calibração pixel-perfect da Home.

```text
#23 → APROVADA PELO LÍDER → CLOSED
```

Todos os offsets definidos foram aplicados e validados.

Fluxo retomado:

```text
#23 concluída
→ #22 volta a ser a issue corretiva ativa
→ verificar pendências residuais de refino visual
→ somente depois retornar à #4
```


### Issue #22 aprovada e encerrada

O líder aprovou explicitamente o refino visual da Home.

```text
#22 → APROVADA PELO LÍDER → CLOSED
```

Fluxo retorna para a issue raiz #4 para encerramento formal dos gates restantes antes da liberação da #5.


### Issue #4 — gates finais concluídos

Após o fechamento aprovado das issues #22 e #23, a entrega final da Home passou pelos gates restantes.

```text
Direção Visual      → aprovado
Qualidade e Build   → aprovado
Experience Validator→ aprovado
Líder de equipe     → aprovado nas correções finais #22/#23
```

Evidências finais:

```text
docs/validacao/ISSUE-004-qualidade-final.md
docs/validacao/ISSUE-004-experience-final.md
Web Preview     35475076822 → success
Web Unit Tests  35475094612 → success
Android Debug   35475076850 → success
```

Resultado:

```text
#4 → CONCLUÍDA
#5 → LIBERADA
```


### Issue #5 — scheduler pedagógico fechado

Produto + Game Design mediram a referência e fecharam a matriz da V1.

```text
X = 200 plannedExposure por tabuada
plannedExposure por operação / Região = 2
plannedExposure por Ilha = 20
plannedExposure total da campanha = 2.000
```

Progressão de interleaving:

```text
R1-R2   K=2
R3-R4   K=3
R5-R6   K=4
R7-R8   K=5
R9-R10  K=10
```

Regra de erro:

```text
erro → correctStreak=0 → recoveryAttempt
recoveryAttempt não altera a cota plannedExposure
```

Documentos:

```text
docs/decisoes/DEC-004-scheduler-pedagogico-v1.md
docs/validacao/ISSUE-005-verificacao-matriz.md
```

Qualidade validou a consistência aritmética da matriz.

Próximo handoff após fechamento da #5:

```text
#6 → Desenvolvimento implementar scheduler + testes de invariantes
```


### Issue #5 encerrada / #6 liberada

```text
#5 → CLOSED / scheduler definido
#6 → ATIVA / implementar scheduler no domínio
```

Fonte de verdade pedagógica da implementação:

```text
docs/decisoes/DEC-004-scheduler-pedagogico-v1.md
```


### Revisão de campanha — 11 Regiões / #6 bloqueada

Produto atualizou a macroestrutura antes da implementação do scheduler.

```text
TOTAL_REGIONS = 11
ISLANDS_PER_REGION = 10
TOTAL_ISLANDS = 110
```

Região 11:

```text
Ilhas 1..9 → 9 fragmentos do Mapa Final
9/9        → libera Ilha 10
Ilha 10    → libera Grande Baú Final
```

Grande Baú Final:

```text
recompensa especial
fora dos 30 baús normais
não é chest 31
```

Consequência de gate:

```text
#5 → REABERTA para recalcular a distribuição pedagógica
#6 → BLOQUEADA / não implementar a DEC-004 antiga
```

Direção Visual também recebeu contrato novo:

- consultar o agente antes de toda geração de arte;
- preservar composição já aprovada;
- separar arte fixa de dados dinâmicos;
- header da tela de Regiões deve reutilizar a linguagem visual da Home com slots vazios.


### Issue #24 — prioridade imediata: Regiões

Criada e ativada por decisão explícita do líder:

```text
#24 [M1-05A] Implementar tela de Regiões, navegação sequencial e arco final da Região 11
```

Estado do fluxo:

```text
#24 → ATIVA AGORA
#5  → PAUSADA temporariamente
#6  → BLOQUEADA
```

Escopo central da #24:

- implementar a tela de Regiões com a composição visual aprovada;
- manter dados dinâmicos fora da arte rasterizada;
- reutilizar a linguagem visual do header da Home;
- suportar 11 Regiões e navegação sequencial;
- implementar o arco da Região 11: 9 fragmentos → Ilha 10 → Grande Baú Final;
- preservar o Grande Baú Final fora do ledger dos 30 baús normais.

Fluxo visual obrigatório:

```text
Orquestrador
→ Direção Visual
→ Desenvolvimento
→ Orquestrador
→ Direção Visual
→ Qualidade
→ Experience Validator
→ Líder
```


### Issue #24 — Desenvolvimento em execução

Direção Visual concluiu o handoff da composição aprovada:

```text
asset fixo = mapa vertical aprovado pelo líder
header     = dinâmico / linguagem da Home
dados      = HTML/CSS/JS
11 Regiões = obrigatório
Região 11  = 9 fragmentos → Ilha 10 → Grande Baú Final
```

Desenvolvimento recebeu autorização para implementar sem redesenhar a arte.


### Issue #24 — pronta para validação do líder

Desenvolvimento concluiu a implementação funcional:

```text
commit = a7c38fdf41a79a8321620caf58b4d5d7cb415523
```

Pipelines da mesma entrega:

```text
Web Unit Tests = 35479435122 → success
Web Preview    = 35479435097 → success
Android Debug  = 35479435099 → success
```

Gates:

```text
Direção Visual       = 82% → APROVADO PARA QUALIDADE
Qualidade e Build    = APROVADO
Experience Validator = APROVADO
Líder de equipe      = PENDENTE
```

Documentos:

```text
docs/validacao/ISSUE-024-fidelidade-visual.md
docs/validacao/ISSUE-024-qualidade.md
docs/validacao/ISSUE-024-experience.md
```

Estado:

```text
#24 → IMPLEMENTAÇÃO CONCLUÍDA / AGUARDANDO VALIDAÇÃO DO LÍDER
#5  → permanece PAUSADA até o fechamento da #24
#6  → permanece BLOQUEADA
```

Preview oficial liberado para o líder:

```text
https://juliano-souza-dev.github.io/tabuada-quest-2/
```

A #24 não será fechada sem aprovação explícita do líder.


## Regra de escopo das decisões — GLOBAL x LOCAL

Toda decisão nova deve ser classificada pelo Orquestrador antes de ser propagada pelo projeto.

```text
GLOBAL
→ vale para o produto inteiro ou para todas as telas/componentes abrangidos explicitamente.

LOCAL
→ vale somente para a tela, fluxo, componente ou contexto citado pelo líder.
```

### Regra de não propagação

Uma decisão local **não altera automaticamente** padrões globais, componentes compartilhados ou outras telas.

Exemplos:

- "nesta tela o header não precisa de avatar" = decisão LOCAL daquela tela;
- "remova avatar dos headers do jogo" = decisão GLOBAL;
- "o botão voltar desta tela fica dentro da arte" = decisão LOCAL;
- "todo botão voltar do projeto usa este padrão" = decisão GLOBAL.

Se o usuário mencionar uma tela, componente ou fluxo específico, o padrão é interpretar a decisão como **LOCAL**, salvo quando houver linguagem explícita de abrangência global como "em todas as telas", "no projeto inteiro", "sempre", "padrão global" ou equivalente.

### Conflito entre regra global e exceção local

Uma tela pode possuir exceção própria sem invalidar a regra global.

```text
REGRA GLOBAL
    ↓
aplica por padrão

EXCEÇÃO LOCAL DOCUMENTADA
    ↓
substitui a regra global somente naquele escopo
```

O Orquestrador deve registrar a exceção no artefato mais próximo do contexto (issue, spec da tela ou decisão específica) e impedir que agentes generalizem a exceção para outras partes do produto.

### Gate obrigatório antes de implementar pedido visual/UX

Antes do handoff, registrar mental ou documentalmente:

```text
ESCOPO_DA_DECISAO = GLOBAL | LOCAL
ALVO              = produto inteiro | tela/componente/fluxo específico
REGRA_AFETADA      = qual padrão anterior continua ou é sobrescrito
PROPAGA            = sim | não
```

Na dúvida sobre abrangência, não globalizar silenciosamente.


### Nova issue de composição estática da tela de Regiões

Foi criada uma nova unidade de trabalho para separar a montagem visual estática da integração dinâmica.

```text
issue = #25
título = [M1-05B] Montar tela de Regiões com os dois assets estáticos aprovados
escopo = LOCAL à tela de Regiões
```

Objetivo:

- integrar somente os dois assets aprovados;
- placa/header com seta no topo;
- mapa vertical de Regiões abaixo;
- sem qualquer dado dinâmico nesta etapa.

Estado de fila:

```text
#24 → permanece aberta como issue-pai/correção maior
#25 → criada, aguardando liberação explícita para execução
#5 → permanece pausada
#6 → permanece bloqueada
```

A nova issue não deve implementar progresso, estados, navegação, hitboxes, dados do jogador ou lógica de campanha. O gate visual deve acontecer antes da camada dinâmica.


### Issue #25 — composição estática publicada

A montagem estática da tela de Regiões foi implementada usando somente os dois assets aprovados.

```text
commit = f20fb59e8a4fa521a9d60f497ce21b69fd5dd73e
Web Unit Tests = 35484685734 → success
Web Preview    = 35484685658 → success
preview        = https://juliano-souza-dev.github.io/tabuada-quest-2/
```

Implementação vigente da #25:

- header/placa estático no topo;
- mapa estático abaixo;
- sem dados dinâmicos;
- sem hitboxes;
- sem estados;
- sem navegação interna;
- sem progresso;
- sem HUD do jogador.

Estado:

```text
#25 → AGUARDANDO VALIDAÇÃO VISUAL DO LÍDER
#24 → permanece aberta como issue-pai
#5  → permanece pausada
#6  → permanece bloqueada
```


### Issue #25 — mapa em tela cheia

O líder decidiu remover o header externo e usar somente o asset de Regiões ocupando 100% da tela.

```text
commit          = cddd8104cb7c67fab0966473e6aac56621cf4ef9
Web Unit Tests  = 35485238127 → success
Web Preview     = 35485238133 → success
preview         = https://juliano-souza-dev.github.io/tabuada-quest-2/
```

Nesta etapa:
- não há header externo;
- o mapa ocupa toda a viewport;
- botão voltar embutido no asset é apenas visual;
- dados dinâmicos continuam fora da #25.

Estado: #25 aguardando validação visual do líder.


### Issue #26 — camada dinâmica pixel-perfect de Regiões

Criada para documentar e implementar a camada dinâmica sobre a base estática da #25.

```text
asset canônico = 941 × 1672
botão voltar   = x8 y8 w112 h112
slots R1-R10   = número + título + progresso/estado
R11            = número + título + 0/9 + mapa final + Ilha 10 + Grande Baú
```

Fontes dinâmicas já existentes:

```text
campaign.currentRegionId
campaign.unlockedRegionIds
campaign.completedRegionIds
campaign.regionProgress
campaign.finalJourney
getRegionStatus(...)
```

Fila:

```text
#25 → AGUARDANDO validação visual do líder
#26 → CRIADA / BLOQUEADA até liberação após #25
#24 → permanece issue-pai
#5  → permanece pausada
#6  → permanece bloqueada
```

Regra técnica central: imagem e overlays devem compartilhar o mesmo stage lógico `941 × 1672` e a mesma transformação de escala/crop.


### Issue #26 — implementação publicada

Camada dinâmica pixel-perfect implementada sobre o mapa full-screen aprovado.

```text
commit          = 2b89c666af08c8686700058c67d89b5fab06c6d3
Web Unit Tests  = 35486161939 → success
Web Preview     = 35486161868 → success
Android Debug   = 35486161865 → success
preview         = https://juliano-souza-dev.github.io/tabuada-quest-2/
```

Implementado:

- stage lógico canônico `941 × 1672`;
- escala cover única para arte e overlays;
- hitbox voltar `8,8,112,112`;
- Regiões 1–10: número, título, progresso e estado;
- estados LOCKED / AVAILABLE / IN_PROGRESS / COMPLETED;
- Região 11: `0/9...9/9`, mapa final, Ilha 10 e Grande Baú Final;
- hitboxes transparentes das Regiões;
- teste automatizado `tests/web/regions-layout.test.cjs`.

Gates internos:

```text
Direção Visual       = 94% → APROVADO PARA QUALIDADE
Qualidade e Build    = APROVADO
Experience Validator = APROVADO
Líder de equipe      = PENDENTE
```

Documentos:

```text
docs/validacao/ISSUE-026-fidelidade-visual.md
docs/validacao/ISSUE-026-qualidade.md
docs/validacao/ISSUE-026-experience.md
```

Estado:

```text
#25 → CLOSED
#26 → IMPLEMENTAÇÃO CONCLUÍDA / AGUARDANDO VALIDAÇÃO DO LÍDER
#24 → permanece issue-pai aberta
#5  → permanece pausada
#6  → permanece bloqueada
```


### Issue #27 — Provador de Moda

Nova correção de produto/UX identificada na Home.

Problema atual:

```text
Moda → frames → toque em opção → equipa imediatamente
```

Fluxo aprovado:

```text
Moda
→ Provador
→ selecionar
→ pré-visualizar
→ USAR
→ somente então persistir
```

Regra central:

```text
selecionar != equipar
previewItem != equippedItem
```

A prévia é temporária e deve ser descartada ao fechar sem confirmação.

Estado de fila:

```text
#26 → permanece ativa aguardando validação final do líder
#27 → criada como correção independente da Home / Moda
```

A #27 não deve ser misturada com a implementação pixel-perfect das Regiões.


### Issue #26 — nomes das Regiões implementados

A última task de implementação da #26 foi concluída.

```text
1  CORSÁRIO
2  NEBLINAS
3  CAVEIRAS
4  NÁUFRAGO
5  VULCÂNIA
6  RELÍQUIA
7  CORALINA
8  VENTANIA
9  MURALHAS
10 ZONA RUBI
11 FORTALEZA
```

Validação automática garante:

```text
R1-R9   = 8 caracteres
R10-R11 = 9 caracteres
```

Evidências:

```text
commit          = 6ebec4cf14d7eec124b019ec76727e92ee2cea65
Web Unit Tests  = 35486742251 → success
Web Preview     = 35486742240 → success
Android Debug   = 35486742235 → success
```

Estado:

```text
#26 → IMPLEMENTAÇÃO COMPLETA / AGUARDANDO TESTE FINAL DO LÍDER
```

Não fechar até aprovação explícita do líder.


### Issue #26 — aprovada e encerrada

O líder aprovou explicitamente a camada dinâmica pixel-perfect da tela de Regiões e a nomenclatura final.

```text
#26 → APROVADA PELO LÍDER → CLOSED
```

Entrega validada:

- stage canônico 941 × 1672;
- overlays alinhados ao asset;
- botão voltar funcional;
- dados dinâmicos R1-R11;
- Região 11 com arco final;
- nomes finais das Regiões;
- testes web, preview e Android aprovados.

Próximo estado do fluxo:

```text
#24 → retoma como issue-pai para consolidação/fechamento
#27 → permanece aberta como correção independente da Home / Moda
#5  → permanece pausada até decisão do fluxo da #24
#6  → permanece bloqueada
```


### Issue #24 — aprovada e encerrada

A issue-pai da tela de Regiões foi consolidada após as correções #25 e #26.

Regra visual final:

```text
header externo = removido
mapa           = full-screen
voltar         = embutido no asset + hitbox dinâmica
HUD jogador    = não exibido
```

Entrega final:

```text
#25 → CLOSED / base estática aprovada
#26 → CLOSED / camada dinâmica pixel-perfect aprovada
#24 → APROVADA PELO LÍDER → CLOSED
```

Escopo concluído:

- 11 Regiões;
- navegação sequencial;
- estados dinâmicos;
- persistência;
- Região 11 completa;
- Grande Baú Final separado dos 30 baús normais;
- nomes finais das Regiões;
- preview/testes/build aprovados.

Fluxo liberado:

```text
#5 → RETOMAR
#6 → permanece bloqueada até a conclusão/revisão da #5
#27 → continua aberta como correção independente da Home / Moda
```


## Regra global — estado de fluxo pertence ao Orquestrador

Issues descrevem **o trabalho**. O Orquestrador descreve **quando e em que ordem o trabalho acontece**.

### Permitido dentro de uma issue

- objetivo;
- escopo;
- fora de escopo;
- requisitos;
- decisões técnicas e de produto;
- personas responsáveis;
- critérios de aceite;
- evidências de implementação e validação;
- dependências técnicas quando necessárias para compreender o contrato.

### Não registrar dentro de uma issue

```text
ATIVA
PAUSADA
BLOQUEADA
AGUARDANDO LIBERAÇÃO
RETOMAR
PRÓXIMA ISSUE
FILA
NÃO INICIAR AINDA
CONTINUAR DEPOIS
```

Também não registrar em issues decisões transitórias como “a próxima permanece bloqueada” ou “esta issue foi pausada por prioridade de outra”.

Esses estados pertencem exclusivamente a:

```text
ORQUESTRADOR.md
```

O estado nativo do GitHub `open/closed` continua sendo usado normalmente.

### Regra de atualização

Quando prioridade, ordem ou gate mudar:

```text
1. atualizar ORQUESTRADOR.md
2. não adicionar estado transitório ao corpo da issue
3. manter a issue focada no contrato do trabalho
```

Esta regra é GLOBAL para todas as milestones e issues do projeto.


### Issue #5 — matriz de 11 Regiões encerrada

Produto + Game Design recalcularam o scheduler para a campanha definitiva de 11 Regiões.

```text
11 Regiões
110 Ilhas
20 plannedExposure por Ilha
200 por Região
2.200 na campanha
220 por tabuada
22 por operação
```

Interleaving:

```text
R1-R2   K=2
R3-R4   K=3
R5-R6   K=4
R7-R8   K=5
R9-R11  K=10
```

Qualidade validou a matriz sem inconsistências aritméticas.

```text
#5 → CLOSED
#6 → ATIVA
#27 → permanece aberta como correção independente da Home / Moda
```

Fonte de verdade:

```text
docs/decisoes/DEC-004-scheduler-pedagogico-v1.md
docs/validacao/ISSUE-005-verificacao-matriz.md
```


### Issue #6 — scheduler implementado e validado

Desenvolvimento implementou o scheduler pedagógico da campanha de 11 Regiões como domínio puro.

```text
commit = 5b0f072871f3cfa98ecbefe88fb8920295f122ac
```

Invariantes comprovados:

```text
20 plannedExposure / Ilha
200 / Região
2.200 / campanha
220 / tabuada
22 / operação
plannedExposure != recoveryAttempt
```

Pipelines:

```text
Web Unit Tests = 35487813947 → success
Web Preview    = 35487813943 → success
Android Debug  = 35487813973 → success
```

Validação:

```text
docs/validacao/ISSUE-006-scheduler.md
```

Fluxo:

```text
#6 → CLOSED
#7 → ATIVA
#27 → permanece independente no backlog da Home / Moda
```


### Issue #7 — estratégia textual temporária

Decisão de execução do vertical slice:

```text
agora  → UI textual funcional + Logic completa
depois → assets aprovados + botões/hitboxes mapeados
```

Objetivo: validar o fluxo jogável sem fazer a produção visual bloquear a integração do scheduler, persistência e gameplay.

A Logic deve permanecer independente de coordenadas e assets. Os controles temporários devem usar contratos semânticos estáveis para permitir substituição visual posterior.


### Issue #7 — vertical slice textual publicado

A primeira experiência jogável ponta a ponta foi integrada com UI textual temporária.

```text
Home
→ Regiões
→ Ilhas
→ Desafio
→ Feedback
→ Resultado
→ persistência
```

Pipelines:

```text
Web Unit Tests = 35488302258 → success
Web Preview    = 35488302269 → success
Android Debug  = 35488302274 → success
```

Gates internos:

```text
Qualidade            = APROVADO
Experience Validator = APROVADO para o slice textual
Líder                = PENDENTE
```

A produção de assets não faz parte desta validação temporária. O visual futuro deverá substituir a camada textual preservando os contratos semânticos existentes.


### Issue #7 — distribuição estrutural da Região 1

Game Design fechou a primeira distribuição de marcos da campanha.

```text
I1  → PET 1
I2  → Mapa 1 / fragmento 1
I3  → Baú 1
I4  → PET 2
I5  → Mapa 1 / fragmento 2
I6  → Baú 2
I7  → PET 3
I8  → Mapa 1 / fragmento 3
I9  → Baú 3
I10 → Mapa 1 / fragmento 4 → MAPA 1 COMPLETO
```

Ledger parcial:

```text
Baús distribuídos = 3/30
PETs distribuídos = 3/30
Fragmentos especiais distribuídos = 4/20
```

Validação:

```text
Web Unit Tests = 35504831715 → success
Web Preview    = 35504831701 → success
Android Debug  = 35504831754 → success
```


### Issue #7 — recompensas da Região 1 persistentes

A distribuição estrutural da Região 1 foi integrada ao vertical slice e agora altera estado persistente real.

```text
I1  → PET 1
I2  → Mapa 1 / fragmento 1
I3  → Baú 1
I4  → PET 2
I5  → Mapa 1 / fragmento 2
I6  → Baú 2
I7  → PET 3
I8  → Mapa 1 / fragmento 3
I9  → Baú 3
I10 → Mapa 1 / fragmento 4 → MAP_COMPLETE_MISSION_PENDING
```

Estado atualizado ao concluir Ilhas:

```text
petsRescuedIds
claimedChestIds
specialMaps["1"].fragments
specialMaps["1"].missionStatus
```

O quarto fragmento é aplicado antes do fechamento da Região, portanto a Região 2 não é liberada enquanto a missão especial do Mapa 1 estiver pendente.

Validação final:

```text
Web Unit Tests = 35504932854 → success
Web Preview    = 35504932871 → success
Android Debug  = 35504932870 → success
```


### Issue #7 — aprovada e encerrada

O líder aprovou explicitamente o vertical slice textual.

Entrega validada:

```text
Home
→ Regiões
→ Ilhas
→ Desafio
→ Feedback
→ Resultado
→ persistência
```

Também ficou integrada a distribuição estrutural da Região 1:

```text
I1  → PET 1
I2  → Mapa 1 / fragmento 1
I3  → Baú 1
I4  → PET 2
I5  → Mapa 1 / fragmento 2
I6  → Baú 2
I7  → PET 3
I8  → Mapa 1 / fragmento 3
I9  → Baú 3
I10 → Mapa 1 / fragmento 4 → MAP_COMPLETE_MISSION_PENDING
```

Pipelines finais:

```text
Web Unit Tests = 35504932854 → success
Web Preview    = 35504932871 → success
Android Debug  = 35504932870 → success
```

Fluxo:

```text
#7 → CLOSED
#8 → ATIVA
#27 → permanece aberta como correção independente da Home / Moda
```


### Issue #8 — identidade de Regiões e Ilhas iniciada

Primeiro bloco implementado:

```text
11 identidades de Região
110 nomes de Ilha
challengeIdentity = mixed
estados = AVAILABLE / LOCKED / REVIEW / COMPLETED
```

Regra pedagógica preservada:

```text
identidade narrativa da Ilha
!=
tabuada fixa
```

A UI textual passa a exibir o nome da Ilha e o rótulo `Desafio misto`. O estado `REVISAR` aparece quando a próxima Ilha herda recuperação pedagógica pendente da Região.

Contrato visual/narrativo:

```text
docs/arte/ISSUE-008-DIRECAO-REGIOES-ILHAS.md
```

A produção de assets finais ainda não foi iniciada.


### Issue #8 — mapa visual da Região 1 publicado

A apresentação textual das Ilhas foi substituída, apenas na Região 1, pela arte aprovada pelo líder.

Contrato visual:

```text
FIXO
→ header
→ seta visual
→ CORSÁRIO
→ arte das 10 Ilhas
→ nomes das 10 Ilhas
→ molduras

DINÂMICO
→ status
→ recompensa
→ hitboxes
→ progresso/sessão
```

Asset:

```text
web/assets/regions/region-1-islands-static.webp
```

Pipelines:

```text
Web Unit Tests = 35508225725 → success
Web Preview    = 35508225706 → success
Android Debug  = 35508225781 → success
```

Gate atual:

```text
implementação = concluída
líder = validar mapa interativo no preview
```


### Issue #8 — arquitetura modular das Ilhas

Decisão visual/técnica atual:

```text
1 fundo fixo por Região
+
10 Ilhas independentes
+
2 variantes por Ilha
  - unlocked
  - locked (sombra + cadeado)
+
overlays dinâmicos
```

A arte monolítica deixa de ser a arquitetura final. Ela pode permanecer apenas como referência de composição.

Dinâmico:

```text
status
recompensa
hitbox
progresso
sessão
```
