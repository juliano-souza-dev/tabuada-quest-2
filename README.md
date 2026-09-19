# Tabuada Quest 2.0

Nova base do Tabuada Quest.

## Estado atual

O projeto está em preparação de arquitetura. A implementação do gameplay ainda não começou.

A primeira decisão oficial de produto/game design está em:

```text
docs/decisoes/DEC-001-distribuicao-intercalada-tabuadas.md
```

## Testar no navegador

Abra:

```text
web/index.html
```

Essa pasta é a fonte web canônica do jogo.

## Android

O módulo `app/` é um wrapper Android em Java com WebView.

No build, a própria pasta `web/` é empacotada como `android_asset`, e a Activity carrega:

```text
file:///android_asset/index.html
```

Veja:

```text
docs/arquitetura/ANDROID-WEBVIEW.md
```

## Referência antiga

A referência do jogo antigo deve permanecer isolada da base 2.0. A branch `apoio` será usada para esse material quando estiver disponível.
