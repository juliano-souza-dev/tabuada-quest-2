# Assets canônicos do Tabuada Quest 2.0

Este diretório é a fonte canônica de assets aprovados para execução na `main`.

## Estrutura atual

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

## Fonte de verdade

A lista de arquivos autorizados para produção vive em:

```text
web/assets/MANIFESTO.md
```

Um arquivo existir no repositório ou na branch `apoio` não o torna automaticamente aprovado.

## Avatares-base

Os arquivos canônicos são:

```text
web/assets/avatars/avatar-luna-visual-base.webp
web/assets/avatars/avatar-maya-visual-base.webp
web/assets/avatars/avatar-sofia-visual-base.webp
```

Toda moda futura deve usar o avatar-base correspondente e preservar rosto, cabelo, tom de pele, proporções, idade visual e identidade. O contrato completo está em:

```text
agentes/03-direcao-visual.md
```

## Material de referência

A branch `apoio` continua sendo referência histórica/visual.

Material nela não deve ser usado diretamente por código novo. Para entrar no jogo, um asset deve ser validado, promovido para `web/assets/` e registrado no `MANIFESTO.md`.

## Auditoria

A validação da Issue #3 está registrada em:

```text
docs/validacao/ISSUE-003-auditoria-assets.md
```

## Regra para novos assets

1. Direção Visual valida identidade e adequação temática.
2. Qualidade valida formato, dimensão, peso, duplicidade e referências.
3. O arquivo é promovido para a subpasta canônica em `web/assets/`.
4. `MANIFESTO.md` é atualizado.
5. Se o asset aparecer na interface, o preview público deve ser validado.
