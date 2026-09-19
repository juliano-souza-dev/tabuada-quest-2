# Ambiente Android e execução web

## Objetivo

O Tabuada Quest 2.0 mantém o princípio de empacotamento observado no APK de referência:

```text
Android Activity
    ↓
WebView
    ↓
file:///android_asset/index.html
```

O APK de referência contém uma `MainActivity` baseada em `WebView`, habilita JavaScript e carrega `file:///android_asset/index.html`.

A implementação 2.0 preserva esse modelo de distribuição, mas separa o projeto Android do conteúdo do jogo.

## Fonte única

Todo o conteúdo executável do jogo fica em:

```text
web/
```

O módulo Android aponta `sourceSets.main.assets` diretamente para essa pasta.

Consequências:

- o navegador executa `web/index.html`;
- o Android empacota a mesma pasta como assets;
- não existe uma cópia manual para Android;
- uma correção visual ou de gameplay não precisa ser replicada em duas bases.

## Teste sem instalar APK

Durante o desenvolvimento, a maior parte do jogo deve ser validável no navegador.

O arquivo:

```text
web/index.html
```

foi deliberadamente iniciado sem dependência de servidor ou módulos ES. Portanto pode ser aberto diretamente no navegador para smoke tests rápidos.

Quando funcionalidades exigirem APIs que se comportem de forma diferente em `file://`, deverá ser criado um modo de preview servido por HTTP, mantendo `web/` como fonte.

## Android

Configuração inicial:

- applicationId: `com.tabuadaquest.app`
- linguagem da Activity: Java
- JDK: 17
- Android Gradle Plugin: 9.4.0
- Gradle esperado: 9.6.0
- compileSdk: 37
- targetSdk: 37
- minSdk: 24

A compatibilidade oficial do Android Gradle Plugin 9.4 define Gradle 9.6.0 e JDK 17 como versões mínimas/padrão compatíveis.

## Build sem Gradle local

O workflow:

```text
.github/workflows/android-debug.yml
```

configura Java e Gradle no runner do GitHub e gera o APK debug.

Isso permite obter builds de validação sem depender de um Gradle previamente instalado na máquina de desenvolvimento.

## Limite arquitetural

O Android é a camada de empacotamento.

Regras de jogo, progressão, scheduler pedagógico, economia e telas não devem ser implementadas dentro da `MainActivity`.

A `MainActivity` deve permanecer pequena e responsável somente pelo ciclo de vida e hospedagem da aplicação web.

## Próximos passos

Antes do primeiro fluxo real de gameplay:

1. receber e estabelecer o pacote definitivo de assets renomeados;
2. consolidar os agentes/personas;
3. definir a estrutura modular da aplicação web;
4. implementar o scheduler pedagógico aprovado em DEC-001;
5. adicionar testes automatizados independentes da interface.
