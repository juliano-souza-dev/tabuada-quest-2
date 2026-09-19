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
```

Decisões novas devem seguir a numeração sequencial `DEC-XXX`.

---

# 5.1 Validações formais

Diretório:

```text
docs/validacao/
```

Auditoria atual:

```text
docs/validacao/ISSUE-003-auditoria-assets.md
```

Esse documento registra a auditoria parcial dos assets encontrados na branch `apoio`, budgets, divergências e bloqueios da Issue #3.

---

# 6. Documentação de arquitetura

Diretório:

```text
docs/arquitetura/
```

Documento Android/WebView atual:

```text
docs/arquitetura/ANDROID-WEBVIEW.md
```

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
├── css/
└── js/
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

No estado atual, o bootstrap foi preparado para funcionar diretamente no navegador para smoke tests.

Se no futuro uma funcionalidade exigir servidor HTTP, deve ser adicionado um modo de preview, mas `web/` continua sendo a fonte canônica.

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

O pipeline inicial existe.

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

## Estado de validação

O workflow foi criado em 2026-09-19.

Primeira execução:

```text
run_id = 35459403891
resultado = failure
passo = Configure Pages
```

Causa confirmada no log:

```text
Get Pages site failed.
Repository does not have Pages enabled/configured for GitHub Actions.
```

A configuração de Pages não pode ser alterada pelo conector GitHub disponível nesta sessão. É necessário habilitar uma única vez na interface:

```text
Settings
→ Pages
→ Build and deployment
→ Source
→ GitHub Actions
```

Depois disso, rerodar o workflow `Web Preview`.

Não declarar o preview online antes de uma execução concluída com sucesso.

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

Workflow conhecido:

```text
.github/workflows/android-debug.yml
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

Caminho canônico aprovado na `main`:

```text
web/assets/
```

Arquivos de controle:

```text
web/assets/README.md
web/assets/MANIFESTO.md
```

O `MANIFESTO.md` é a lista oficial de assets promovidos/aprovados. Enquanto um arquivo não estiver fisicamente em `web/assets/` e registrado no manifesto, ele não é asset de produção.

**Estado atual da Issue #3: BLOQUEADA POR INSUMO AUSENTE.**

A auditoria de 2026-09-19 confirmou:

- a `main` não contém arquivos WebP/avatares de produção;
- a `apoio` contém apenas o pacote remasterizado inicial em `game 2.0/assets-remasterizados/`;
- o pacote definitivo renomeado completo não está presente;
- os três avatares-base reais não estão presentes.

Enquanto o pacote definitivo não existir:

- não copiar automaticamente tudo da `apoio`;
- não duplicar o pacote de referência;
- não renomear novamente;
- não criar referências de produção para arquivos ainda não promovidos;
- não substituir avatares-base por aproximações.

Quando o pacote chegar, a Issue #3 deve:

1. validar o pacote definitivo;
2. promover somente os assets aprovados para `web/assets/`;
3. validar nomes, duplicidades, budgets e referências;
4. confirmar os três avatares-base;
5. atualizar este mapa com qualquer subestrutura criada;
6. eliminar dependência de nomes legados.

---

# 17. Avatares-base canônicos

A Direção Visual define os nomes canônicos:

```text
avatar-luna-visual-base.webp
avatar-sofia-visual-base.webp
avatar-maya-visual-base.webp
```

O contrato está em:

```text
agentes/03-direcao-visual.md
```

Destino canônico aprovado:

```text
web/assets/
```

**Estado físico atual:** arquivos-base ainda ausentes. Não presumir que os nomes definidos no contrato significam que os arquivos já existem.

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

## Antes da Issue #4

A arquitetura modular detalhada ainda não foi formalizada.

Portanto:

- não inventar nova organização de domínio;
- não criar pastas profundas de arquitetura por conta própria;
- não introduzir frameworks sem decisão;
- não mover arquivos existentes apenas por preferência.

A Issue #4 será responsável por definir e documentar:

- módulos;
- domínio;
- persistência;
- testes;
- convenções internas de `web/`.

Depois disso, esta seção deve ser atualizada com os caminhos exatos.

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
