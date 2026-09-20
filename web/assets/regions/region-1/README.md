# Região 1 — CORSÁRIO

Pasta de assets modulares da tela de Ilhas da Região 1.

Estrutura canônica:

```text
background.png

island-01-unlocked.png
island-01-locked.png
island-02-unlocked.png
island-02-locked.png
island-03-unlocked.png
island-03-locked.png
island-04-unlocked.png
island-04-locked.png
island-05-unlocked.png
island-05-locked.png
island-06-unlocked.png
island-06-locked.png
island-07-unlocked.png
island-07-locked.png
island-08-unlocked.png
island-08-locked.png
island-09-unlocked.png
island-09-locked.png
island-10-unlocked.png
island-10-locked.png
```

Regras:

- `background.png` contém apenas a composição fixa da Região;
- cada Ilha possui variante `unlocked` e `locked`;
- a variante `locked` contém o tratamento visual de bloqueio, incluindo sombra + cadeado;
- as Ilhas são posicionadas por CSS sobre o fundo;
- status, recompensa, hitbox e progresso continuam dinâmicos;
- recuperação pedagógica não cria um estado visual de Ilha.

Seleção em runtime:

```text
locked    → island-N-locked.png
available → island-N-unlocked.png
completed → island-N-unlocked.png
```

Se uma variante `locked` estiver ausente, a UI usa temporariamente a variante `unlocked` com fallback visual de bloqueio.


## Composição CORSÁRIO vigente

A tela atual renderiza **5 Ilhas visíveis**:

```text
01 Porto da Âncora
02 Enseada do Saque
03 Rochedo da Bandeira
04 Ilha do Vulcão
05 Ilha da Caveira Rosa
```

Os assets 06–10 permanecem preservados para futura reorganização de navegação.

Fonte do posicionamento:

```text
docs/arte/ISSUE-008-REGIAO1-PIXEL-MAP.md
```
