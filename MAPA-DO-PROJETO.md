# MAPA-DO-PROJETO — Tabuada Quest 2.0

## Finalidade

Este arquivo é o **mapa físico e técnico oficial do repositório**.

Ele existe para que qualquer IA ou pessoa que assuma o projeto saiba, sem adivinhação:

- onde está cada tipo de material;
- qual branch contém código atual e qual contém referência;
- onde ficam decisões e contratos;
- onde o jogo web é executado;
- onde está o wrapper Android;
- como o conteúdo web entra no APK;
- como gerar um APK debug;
- onde o APK é produzido;
- onde ficam workflows;
- onde estão assets de referência;
- quais destinos ainda não foram oficialmente definidos.

**Leitura obrigatória:** todo agente/IA deve ler este arquivo logo após `ORQUESTRADOR.md` e antes de alterar o projeto.

---

## Regra absoluta: não adivinhar caminhos

Se um material, artefato, asset, contrato, build ou configuração **não estiver localizado neste mapa**, não inventar um caminho.

Procedimento obrigatório:

1. localizar o recurso real no repositório;
2. confirmar a branch correta;
3. registrar o caminho neste arquivo;
4. somente depois usar, mover, criar ou referenciar esse recurso.

Se o destino ainda não foi definido pelo roadmap, registrar como **PENDENTE DE DEFINIÇÃO** e respeitar a issue responsável.

---

# 1. Branches

## `main`

É a fonte de verdade do Tabuada Quest 2.0.

Contém:

- governança;
- contratos de personas;
- decisões aprovadas;
- arquitetura atual;
- código web do 2.0;
- wrapper Android;
- workflows de build.

Novas decisões e implementação do 2.0 devem acontecer aqui, respeitando o gate de issues.

## `apoio`

É a branch de **referência/legado/material de apoio**.

Pode ser consultada para:

- comparar comportamento antigo;
- consultar assets;
- recuperar referências visuais;
- medir carga pedagógica anterior;
- entender empacotamento ou estrutura legada.

Material da `apoio` **não entra automaticamente na `main`**.

---

# 2. Arquivos obrigatórios da raiz

## `ORQUESTRADOR.md`

Função:

- ponto de entrada obrigatório;
- controla milestones e issues;
- decide quais personas chamar;
- registra o checkpoint vivo;
- informa o próximo passo permitido.

Deve ser lido **primeiro**.

## `MAPA-DO-PROJETO.md`

Este arquivo.

Função:

- dizer onde cada coisa está;
- documentar empacotamento;
- documentar build;
- documentar branches e fontes;
- impedir descoberta por tentativa e erro.

Deve ser lido **imediatamente depois do Orquestrador**.

## `README.md`

Visão geral curta para humanos.

Não substitui o Orquestrador nem este mapa.

---

# 3. Estrutura atual da `main`

```text
/
├── ORQUESTRADOR.md
├── MAPA-DO-PROJETO.md
├── README.md
├── agentes/
├── app/
├── docs/
├── web/
├── .github/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
└── .gitignore
```

---

# 4. Governança e personas

## Contratos de personas

Diretório:

```text
agentes/
```

Contratos formalizados:

```text
agentes/01-produto.md
agentes/02-game-design-aprendizagem.md
agentes/03-direcao-visual.md
agentes/04-desenvolvimento.md
agentes/05-qualidade-build.md
agentes/06-experience-validator.md
```

A Issue #2 formalizou todos os contratos principais do fluxo.

Nenhuma IA deve inventar localização alternativa para personas.

---

# 5. Decisões oficiais

Diretório:

```text
docs/decisoes/
```

Documentos atuais:

```text
docs/decisoes/DEC-001-distribuicao-intercalada-tabuadas.md
docs/decisoes/DEC-002-regioes-ilhas-pets-baus.md
docs/decisoes/DEC-003-matriz-escopo-v1.md
docs/decisoes/DEC-004-scheduler-pedagogico-v1.md
docs/decisoes/DEC-005-jornada-11-regioes-grande-bau-final.md
```

Decisões novas devem seguir a numeração sequencial `DEC-XXX`.

---

# 5.1 Validações formais

Diretório:

```text
docs/validacao/
```

Validações atuais:

```text
docs/validacao/ISSUE-003-auditoria-assets.md
docs/validacao/ISSUE-004-arquitetura-mobile.md
```

A validação da Issue #4 registra arquitetura, core mobile, testes web, preview e build Android aprovados.

---

# 6. Documentação de arquitetura

Diretório:

```text
docs/arquitetura/
```

Documentos atuais:

```text
docs/arquitetura/ANDROID-WEBVIEW.md
docs/arquitetura/WEB-V1.md
```

`WEB-V1.md` é a fonte oficial para organização modular da aplicação web, contrato de estado/persistência, estratégia de testes e regra mobile-first.

---

# 7. Fonte executável do jogo

A fonte web canônica é:

```text
web/
```

Estrutura atual:

```text
web/
├── index.html
├── assets/
├── css/
│   ├── app.css
│   ├── tokens.css
│   ├── base.css
│   └── screens/
│       └── home.css
└── js/
    ├── app.js
    ├── core/
    │   └── screen-manager.js
    ├── content/
    │   └── game-content.js
    ├── domain/
    │   ├── player-state.js
    │   └── scheduler.js
    ├── persistence/
    │   └── local-storage.js
    └── screens/
        └── home-screen.js
```

Testes unitários ficam fora da pasta publicada:

```text
tests/web/
├── player-state.test.cjs
├── local-storage.test.cjs
├── regions-layout.test.cjs
├── regions-content.test.cjs
└── scheduler.test.cjs
```

## Regra de fonte única

O conteúdo em `web/` é usado:

1. diretamente no navegador durante desenvolvimento;
2. dentro do APK Android.

Não manter uma segunda cópia manual do jogo dentro de `app/src/main/assets/`.

---

# 8. Teste no navegador

Entrada:

```text
web/index.html
```

A aplicação roda diretamente no navegador sem etapa de bundle.

Preview público:

```text
https://juliano-souza-dev.github.io/tabuada-quest-2/
```

A Home da V1 é mobile-first e usa o viewport como tela de jogo. Desktop adapta essa composição em um viewport centralizado.

A aplicação usa scripts clássicos separados por camada, preservando compatibilidade com o carregamento `file:///android_asset/index.html` do WebView.

---

# 9. Wrapper Android

Módulo:

```text
app/
```

## Manifest

```text
app/src/main/AndroidManifest.xml
```

## Activity principal

```text
app/src/main/java/com/tabuadaquest/app/MainActivity.java
```

A Activity é apenas hospedeira da aplicação web.

Não colocar nela:

- scheduler pedagógico;
- progressão;
- economia;
- lógica de PETs;
- regras de baús;
- telas do jogo;
- regras de domínio.

---

# 10. Como o jogo web entra no APK

Configuração:

```text
app/build.gradle.kts
```

O source set Android aponta diretamente para:

```text
../web
```

Regra vigente:

```kotlin
sourceSets {
    getByName("main") {
        assets.srcDirs("../web")
    }
}
```

Portanto, durante o build:

```text
web/
  ↓
Android assets
  ↓
file:///android_asset/index.html
  ↓
WebView
```

A `MainActivity` carrega:

```text
file:///android_asset/index.html
```

**Não copiar manualmente `web/` para outra pasta antes do build.**

---

# 11. Configuração Android atual

Arquivo principal:

```text
app/build.gradle.kts
```

Estado atual:

```text
applicationId = com.tabuadaquest.app
namespace     = com.tabuadaquest.app
minSdk        = 24
targetSdk     = 37
compileSdk    = 37
versionCode   = 1
versionName   = 2.0.0-dev
Java          = 17
```

Plugin Android configurado na raiz:

```text
build.gradle.kts
```

Propriedades Gradle:

```text
gradle.properties
```

Configuração de módulos/repos:

```text
settings.gradle.kts
```

---

# 12. Build Android debug

Workflow oficial:

```text
.github/workflows/android-debug.yml
```

Ambiente configurado pelo workflow:

```text
Java   17
Gradle 9.6.0
```

Comando executado:

```bash
gradle :app:assembleDebug --stacktrace
```

Saída esperada:

```text
app/build/outputs/apk/debug/app-debug.apk
```

Nome do artefato publicado pelo GitHub Actions:

```text
tabuada-quest-2-debug
```

## Estado de validação

O pipeline debug está funcional.

Último build validado da Issue #4:

```text
run_id = 35461886489
resultado = success
```

**Não assumir que um release final já foi validado.**

Release, assinatura e APK final pertencem às issues posteriores do roadmap.

---

# 12.1 Preview web contínuo

Workflow:

```text
.github/workflows/web-preview-pages.yml
```

Fonte publicada:

```text
web/
```

URL esperada do GitHub Pages:

```text
https://juliano-souza-dev.github.io/tabuada-quest-2/
```

Gatilhos:

- push na `main` que altere `web/**`;
- alteração do próprio workflow;
- execução manual via `workflow_dispatch`.

A publicação usa:

- `actions/checkout@v6`;
- `actions/configure-pages@v5`;
- `actions/upload-pages-artifact@v4`;
- `actions/deploy-pages@v4`.

O preview publica diretamente `web/`. Não existe cópia paralela do app.

## Habilitação inicial

Se o Pages ainda não estiver habilitado no repositório, é necessário fazer uma única vez no GitHub:

```text
Settings
→ Pages
→ Build and deployment
→ Source
→ GitHub Actions
```

Depois disso, o workflow faz as publicações seguintes automaticamente.

## Regra operacional: preview por issue

Para qualquer issue que altere `web/`:

1. commit na `main`;
2. aguardar `.github/workflows/web-preview-pages.yml`;
3. validar o deploy;
4. abrir/confirmar o preview público;
5. registrar o estado no `ORQUESTRADOR.md`;
6. somente então considerar a parte visual/funcional da issue concluída.

Preview oficial:

```text
https://juliano-souza-dev.github.io/tabuada-quest-2/
```

Issues somente documentais não precisam disparar nova publicação.

## Estado de validação

Preview validado em 2026-09-19.

Último run funcional validado da Issue #4:

```text
workflow = .github/workflows/web-preview-pages.yml
run_id = 35461886529
resultado = success
fonte = web/
URL = https://juliano-souza-dev.github.io/tabuada-quest-2/
```

O log de deployment confirmou:

```text
Evaluated environment url:
https://juliano-souza-dev.github.io/tabuada-quest-2/
```

### Workflow duplicado removido

A ativação do Pages pela interface criou automaticamente:

```text
.github/workflows/static.yml
```

Esse workflow publicava:

```text
path: '.'
```

ou seja, a raiz do repositório. Como o `index.html` canônico vive em `web/`, isso provocava 404.

O arquivo foi removido.

O único workflow canônico de preview é:

```text
.github/workflows/web-preview-pages.yml
```

e ele publica diretamente:

```text
web/
```

---

# 12.2 Testes web unitários

Workflow:

```text
.github/workflows/web-unit-tests.yml
```

Runner:

```text
node --test tests/web/*.test.cjs
```

Escopo atual:

- contrato do estado inicial;
- normalização de estado inválido;
- persistência local;
- recuperação de JSON corrompido.

Os testes não dependem de DOM ou navegador.

Última execução validada da Issue #4:

```text
run_id = 35461810852
resultado = success
```

---

# 13. ProGuard / release

Arquivo existente:

```text
app/proguard-rules.pro
```

O build type `release` existe na configuração Android, porém:

- assinatura final ainda não está documentada;
- fluxo final de release ainda não está fechado;
- não armazenar keystore, senha ou segredo no repositório.

A Issue final de release será responsável por formalizar isso.

---

# 14. GitHub Actions

Diretório:

```text
.github/workflows/
```

Workflows conhecidos:

```text
.github/workflows/android-debug.yml
.github/workflows/web-preview-pages.yml
.github/workflows/web-unit-tests.yml
```

Ao criar novos workflows, registrar neste mapa:

- nome;
- finalidade;
- gatilho;
- saída;
- caminho dos artefatos.

---

# 15. Material visual de referência

Na branch `apoio`, existe o pacote:

```text
game 2.0/assets-remasterizados/
```

Arquivos atualmente conhecidos:

```text
game 2.0/assets-remasterizados/README.md
game 2.0/assets-remasterizados/PROMPTS-GERACAO-IA-PIRATA.md
game 2.0/assets-remasterizados/PROMPTS-PETS-LOTTIE-PIRATAS-MAGICOS.md
game 2.0/assets-remasterizados/home-pirata-fundo-principal.webp
game 2.0/assets-remasterizados/home-pirata-banner-aventura.webp
game 2.0/assets-remasterizados/home-pirata-botao-aventura.webp
game 2.0/assets-remasterizados/icone-mapa-bussola.webp
game 2.0/assets-remasterizados/icone-bau-tesouro.webp
game 2.0/assets-remasterizados/icone-recompensa-magica.webp
game 2.0/assets-remasterizados/icone-axolote-capitao.webp
```

Esses arquivos são **referência/material de apoio** enquanto não forem promovidos formalmente para a `main`.

---

# 16. Assets definitivos do 2.0

Fonte canônica na `main`:

```text
web/assets/
├── README.md
├── MANIFESTO.md
├── avatars/
│   ├── avatar-luna-visual-base.webp
│   ├── avatar-maya-visual-base.webp
│   └── avatar-sofia-visual-base.webp
└── ui/
    ├── home-pirata-banner-aventura.webp
    ├── home-pirata-botao-aventura.webp
    ├── icone-mapa-bussola.webp
    ├── icone-bau-tesouro.webp
    └── icone-recompensa-magica.webp
```

`web/assets/MANIFESTO.md` é a lista oficial de assets aprovados para produção.

### Estado da Issue #3

**CONCLUÍDA em 2026-09-19.**

Preview final validado:

```text
run_id = 35460817391
resultado = success
URL = https://juliano-souza-dev.github.io/tabuada-quest-2/
```

O pacote completo de referência foi recuperado do material previamente enviado pelo usuário, confrontado com o catálogo de renomeação e recortado segundo a direção pirata/marítima vigente.

Foram promovidos apenas assets aprovados. Material legado, fora de tema, com nomenclatura antiga ou que exige nova validação permanece fora da fonte canônica.

Auditoria:

```text
docs/validacao/ISSUE-003-auditoria-assets.md
```

### Dívida visual registrada

- fundo principal remasterizado 1080 × 1918: não promovido porque o contrato exige 1080 × 1920;
- PET Axolote Capitão: não promovido porque pertence à lista substituída;
- assets Portal/Mundo: não promovidos porque a nomenclatura vigente é Região/Ilha;
- variações de moda: só entram após comparação individual com os avatares-base;
- assets reconhecíveis de franquias existentes: não entram no 2.0.

---

# 17. Avatares-base canônicos

Arquivos físicos disponíveis:

```text
web/assets/avatars/avatar-luna-visual-base.webp
web/assets/avatars/avatar-maya-visual-base.webp
web/assets/avatars/avatar-sofia-visual-base.webp
```

Contrato de consistência:

```text
agentes/03-direcao-visual.md
```

As versões canônicas foram derivadas dos respectivos avatares-base do pacote de referência, sem redesenho de personagem. Toda moda futura deve preservar a identidade visual e alterar somente roupa/acessórios explicitamente aprovados.

---

# 18. Regras visuais e prompts

Fonte oficial de regras:

```text
agentes/03-direcao-visual.md
```

Esse arquivo contém:

- direção pirata/mágica;
- contratos WebP;
- limites de tamanho;
- regras Lottie;
- consistência dos avatares-base;
- regras de moda.

Prompts de referência existentes na `apoio`:

```text
game 2.0/assets-remasterizados/PROMPTS-GERACAO-IA-PIRATA.md
game 2.0/assets-remasterizados/PROMPTS-PETS-LOTTIE-PIRATAS-MAGICOS.md
```

As regras vigentes da `main` têm precedência sobre prompts históricos.

---

# 19. Roadmap e issues

O projeto é controlado por milestones e issues do GitHub.

O estado vivo fica em:

```text
ORQUESTRADOR.md
```

A ordem de execução não deve ser deduzida pelo número do arquivo ou pela disposição das pastas.

Sempre ler o checkpoint do Orquestrador e a issue ativa.

---

# 20. Onde colocar código novo

A arquitetura modular foi formalizada na Issue #4.

Fonte:

```text
docs/arquitetura/WEB-V1.md
```

### Conteúdo estático

```text
web/js/content/
```

### Regras puras de domínio

```text
web/js/domain/
```

Não usar DOM nem localStorage diretamente.

### Persistência

```text
web/js/persistence/
```

### Infraestrutura de navegação/telas

```text
web/js/core/
```

### Telas

```text
web/js/screens/
web/css/screens/
```

Cada tela pode possuir composição própria. Não criar uma malha desktop genérica e depois apenas empilhar no celular.

### Testes de domínio/persistência

```text
tests/web/
```

### CSS compartilhado

```text
web/css/tokens.css
web/css/base.css
```

### Entrada CSS

```text
web/css/app.css
```

Não introduzir bundler/framework sem nova decisão arquitetural.

---

# 21. Onde está a referência antiga

Branch:

```text
apoio
```

Material conhecido de referência do 2.0:

```text
game 2.0/
└── assets-remasterizados/
```

Outras referências devem ser descobertas de forma explícita e, se passarem a ser relevantes para continuidade, adicionadas a este mapa.

---

# 22. Regras para mover/promover material

Ao promover material da `apoio` para `main`:

1. a issue responsável deve estar liberada;
2. a persona responsável deve validar;
3. o destino deve estar definido neste mapa;
4. o material deve ser copiado/adicionado à `main`;
5. a `apoio` continua preservada como referência, salvo decisão explícita;
6. referências de código devem usar apenas o caminho canônico da `main`;
7. este mapa e o checkpoint do Orquestrador devem ser atualizados.

---

# 23. Convenção de documentação

Sempre que uma mudança alterar **onde** algo fica ou **como** algo é produzido, atualizar este arquivo.

Exemplos:

- nova pasta de assets;
- novo diretório de áudio;
- novo arquivo de estado;
- novo workflow;
- novo caminho de APK;
- nova forma de preview;
- nova estrutura de testes;
- nova pasta de domínio;
- nova ferramenta de empacotamento;
- mudança de applicationId;
- mudança de versão Java/Gradle/SDK;
- nova localização de prompts;
- novo processo de release.

Sempre que a mudança alterar **o que está sendo feito ou em qual issue estamos**, atualizar `ORQUESTRADOR.md`.

Resumo:

```text
ORQUESTRADOR.md
= estado, sequência, decisões operacionais e próximo passo

MAPA-DO-PROJETO.md
= localização, estrutura, empacotamento, build e caminhos físicos
```

---

# 24. Checklist obrigatório antes de trabalhar

Toda IA deve confirmar:

- [ ] Li `ORQUESTRADOR.md`.
- [ ] Li `MAPA-DO-PROJETO.md`.
- [ ] Sei qual issue está liberada.
- [ ] Sei qual branch devo alterar.
- [ ] Sei onde fica o material que vou usar.
- [ ] Li o contrato da persona chamada.
- [ ] Não estou inventando caminho ou arquitetura ainda não aprovada.
- [ ] Sei quais documentos precisam ser atualizados ao final.

Se qualquer item estiver indefinido, primeiro corrigir a documentação de continuidade.


# Referências de experiência

Direção mobile oficial da V1:

```text
docs/referencias/V1-DIRECAO-MOBILE.md
```

As imagens usadas para definir essa direção são referência de UX/composição e não assets de produção. Não copiar para `web/assets/`.


# Direção de arte da Home V1

Documento obrigatório da Issue #4:

```text
docs/arte/ISSUE-004-DIRECAO-HOME-V1.md
```

Esse documento define a composição visual da Home e deve ser lido antes de qualquer alteração em:

```text
web/css/screens/home.css
web/js/screens/home-screen.js
```

A versão visual atualmente publicada está **REPROVADA** e não deve ser usada como referência de qualidade.

Ordem obrigatória para correção:

```text
Direção Visual
→ Experience Validator
→ Desenvolvimento
→ Qualidade
→ Preview
```


# Estratégia de assets da V1

Documento oficial:

```text
docs/arte/ESTRATEGIA-ASSETS-V1.md
```

Esse documento define quando um asset deve ser:

- reutilizado;
- adaptado;
- criado do zero.

Antes de implementar uma tela visual, consultar este documento junto com a direção de arte específica da tela.

Para a Home da Issue #4, ler na ordem:

```text
docs/arte/ISSUE-004-DIRECAO-HOME-V1.md
docs/arte/ESTRATEGIA-ASSETS-V1.md
```

A composição vem antes da escolha dos arquivos.


## Fundo da Home personalizável

Fundo padrão promovido:

```text
web/assets/ui/home-pirata-fundo-principal.webp
```

ID persistente:

```text
pirate-main
```

Contrato:

```text
state.ui.homeBackgroundId
TQ.content.homeBackgrounds
```

O jogador pode escolher o fundo da Home entre cenários aprovados. A imagem acima é o padrão inicial.

Estado persistente vigente:

```text
schemaVersion = 2
```

Estados v1 migram automaticamente para `pirate-main`.


## Molduras de perfil personalizáveis

Primeira moldura promovida:

```text
web/assets/frames/profile-frame-pirate-treasure.webp
```

ID:

```text
pirate-treasure
```

Contrato:

```text
TQ.content.profileFrames
state.player.profileFrameId
```

Assim como o fundo, a moldura é selecionável pelo jogador.

HUD dinâmico da Home:

```text
state.player.avatarId
state.player.displayName
state.player.profileFrameId
state.progression.level
state.progression.xpCurrent
state.progression.xpRequired
state.wallet.coins
state.wallet.gems
state.ui.homeBackgroundId
```

Estado persistente vigente:

```text
schemaVersion = 3
```


## Home V1 implementada para validação

Arquivos principais:

```text
web/js/screens/home-screen.js
web/css/screens/home.css
web/js/content/game-content.js
web/js/app.js
```

Assets promovidos nesta etapa:

```text
web/assets/avatars/avatar-luna-pirata.webp
web/assets/avatars/avatar-maya-pirata.webp
web/assets/avatars/avatar-sofia-pirata.webp
web/assets/backgrounds/home-pirate-bay.webp
web/assets/backgrounds/home-pirate-port.webp
web/assets/frames/profile-frame-pirate-treasure.webp
web/assets/frames/profile-frame-tide-wheel.webp
web/assets/pets/axolotl-captain.webp
web/assets/ui/chest-nautical.webp
web/assets/ui/chest-items.webp
```

Catálogos:

```text
TQ.content.homeBackgrounds
TQ.content.profileFrames
TQ.content.assets.homeHeroes
```

Última validação:

```text
Web Unit Tests = 35465842720 → success
Web Preview    = 35465846821 → success
Android Debug  = 35465846781 → success
```

Status: aguardando validação visual do usuário.

## Fluxo obrigatório de validação visual

```text
Orquestrador
→ Desenvolvimento
→ Orquestrador
→ Direção Visual
   [FIDELIDADE_VISUAL >= 75%]
→ Qualidade
→ Orquestrador
→ Experience Validator
→ Orquestrador
→ Líder de equipe
```

Sem aprovação explícita do líder de equipe:
- issue permanece aberta;
- próxima issue permanece bloqueada.

Fonte de verdade do protocolo: `ORQUESTRADOR.md`.

## Estado visual da Home — schema v4

A personalização de moldura agora possui estado padrão neutro:

```text
schemaVersion = 4
player.profileFrameId = "simple"
```

Catálogo:

```text
simple            → sem asset decorativo adicional
pirate-treasure   → moldura opcional
tide-wheel        → moldura opcional
```

Cache de frontend:

```text
web/index.html usa versionamento por query string nos CSS/JS da Home
```

Motivo: impedir mistura entre overlay novo e camadas antigas armazenadas pelo navegador.


## Tela de Regiões — direção visual dinâmica

Fonte de regras:

```text
agentes/03-direcao-visual.md
docs/arte/ESTRATEGIA-ASSETS-V1.md
docs/decisoes/DEC-005-jornada-11-regioes-grande-bau-final.md
```

A composição aprovada da tela de Regiões deve separar cenário/slots fixos de dados dinâmicos. O header segue a linguagem visual aprovada da Home e deve ser produzido com slots vazios para os dados do jogador.


# Issue #24 — Tela de Regiões

Implementação física:

```text
web/assets/regions/regions-map-base.webp
web/css/screens/regions.css
web/js/screens/regions-screen.js
web/js/domain/player-state.js   # schema v5 / campanha
tests/web/                      # invariantes de campanha e persistência
docs/arte/ISSUE-024-DIRECAO-REGIOES.md
```

A tela usa 11 Regiões, 10 Ilhas por Região e separa a arte fixa de todos os dados dinâmicos.


## Scheduler pedagógico — Issue #6

Implementação física:

```text
web/js/domain/scheduler.js
tests/web/scheduler.test.cjs
```

Contrato pedagógico:

```text
docs/decisoes/DEC-004-scheduler-pedagogico-v1.md
docs/validacao/ISSUE-005-verificacao-matriz.md
```

O scheduler é domínio puro: não acessa DOM, localStorage ou componentes de tela.


## Vertical slice textual — Issue #7

Implementação temporária de fluxo:

```text
web/js/domain/gameplay-session.js
web/js/screens/islands-screen.js
web/js/screens/challenge-screen.js
web/js/screens/result-screen.js
web/css/screens/vertical-slice.css
```

A UI desta etapa é textual e funcional. Os contratos `data-action`, `data-island-id` e `data-answer` devem permanecer estáveis para posterior substituição por assets e hitboxes mapeados.


## Identidade de Regiões e Ilhas — Issue #8

Contrato de identidade:

```text
docs/arte/ISSUE-008-DIRECAO-REGIOES-ILHAS.md
```

Catálogo executável:

```text
web/js/content/game-content.js
TQ.content.regionIdentities
TQ.content.islandIdentities
TQ.content.getRegionIdentity(...)
TQ.content.getIslandIdentity(...)
```

Estados válidos de Ilha:

```text
locked
available
completed
```

A recuperação pedagógica permanece interna ao scheduler e não cria estado visual de Ilha.

A identidade narrativa/visual não define a tabuada da Ilha. O conteúdo pedagógico continua vindo de `web/js/domain/scheduler.js`.


## Região 1 — mapa visual das Ilhas

Pasta canônica:

```text
web/assets/regions/region-1/
```

Assets:

```text
background.png
island-01-unlocked.png
island-01-locked.png
...
island-10-unlocked.png
island-10-locked.png
```

Implementação:

```text
web/js/screens/islands-screen.js
REGION_1_LAYOUT
docs/arte/ISSUE-008-REGIAO1-PIXEL-MAP.md
```

Stage lógico:

```text
941 × 1672
```

Mapa pixel-perfect vigente:

```text
docs/arte/ISSUE-008-REGIAO1-PIXEL-MAP.md
```

O novo fundo usa percurso serpenteado e coordenadas específicas por Ilha. Não voltar ao layout rígido de duas colunas.

Composição:

```text
background fixo
+
10 Ilhas posicionadas por CSS
+
troca locked/unlocked pelo estado
+
medalhões de recompensa embutidos por Ilha
+
somente status textual + hitbox dinâmicos
```

Seleção:

```text
locked    → variante locked
available → variante unlocked
completed → variante unlocked
```

A composição monolítica anterior não é mais a arquitetura vigente.

As Regiões 2–11 continuam temporariamente na apresentação textual até receberem seus próprios assets.


### Padrão visual dos assets de Ilha

Fonte de verdade:

```text
agentes/03-direcao-visual.md
→ Padrão global obrigatório para criação de Ilhas
```

Cada asset de Ilha inclui:

```text
placa com nome canônico
medalhão(ões) das recompensas reais
placa inferior vazia de status
```

O texto de status permanece na camada HTML/CSS/JS.

As variantes `locked` e `unlocked` devem manter a mesma geometria e registro visual.


## Transição de viagem entre Ilhas

Implementação:

```text
web/js/screens/travel-screen.js
web/assets/transitions/island-travel.mp4
web/assets/transitions/README.md
```

Persistência:

```text
schemaVersion = 7
campaign.travelPlayedIslandIds
```

Fluxo:

```text
primeira entrada na Ilha
→ travel
→ vídeo termina
→ challenge

entrada posterior
→ challenge
```

O vídeo deve ser H.264/AVC + yuv420p para compatibilidade com navegador e Android WebView.
