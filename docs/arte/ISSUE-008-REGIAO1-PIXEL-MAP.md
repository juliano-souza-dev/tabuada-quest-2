# Issue #8 — Região 1 — mapa pixel-perfect

## Base canônica

```text
stage = 941 × 1672 px
background = web/assets/regions/region-1/background.png
```

O fundo usa rota serpenteada. As Ilhas não seguem duas colunas rígidas.

## Regra de composição

```text
background
+
asset PNG da Ilha
+
status textual dinâmico
+
hitbox
```

A recompensa visual não é desenhada pela UI. Ela já pertence ao PNG da Ilha.

## Coordenadas canônicas

| Ilha | Asset x | Asset y | W | H | Status x | Status y | Status W | Status H | Hitbox x | Hitbox y | Hitbox W | Hitbox H |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 01 | 234 | 288 | 224 | 214 | 277 | 457 | 139 | 26 | 242 | 294 | 208 | 202 |
| 02 | 518 | 391 | 224 | 214 | 561 | 560 | 139 | 26 | 526 | 397 | 208 | 202 |
| 03 | 213 | 538 | 224 | 214 | 256 | 707 | 139 | 26 | 221 | 544 | 208 | 202 |
| 04 | 519 | 678 | 226 | 216 | 562 | 849 | 140 | 26 | 527 | 684 | 210 | 204 |
| 05 | 175 | 780 | 236 | 220 | 220 | 954 | 146 | 26 | 183 | 786 | 220 | 208 |
| 06 | 523 | 899 | 236 | 220 | 568 | 1073 | 146 | 26 | 531 | 905 | 220 | 208 |
| 07 | 193 | 1038 | 224 | 214 | 236 | 1207 | 139 | 26 | 201 | 1044 | 208 | 202 |
| 08 | 546 | 1158 | 232 | 218 | 590 | 1330 | 144 | 26 | 554 | 1164 | 216 | 206 |
| 09 | 220 | 1269 | 224 | 214 | 263 | 1438 | 139 | 26 | 228 | 1275 | 208 | 202 |
| 10 | 524 | 1401 | 238 | 222 | 569 | 1576 | 148 | 27 | 532 | 1407 | 222 | 210 |

Botão de retorno:

```text
x=58
y=18
w=150
h=150
```

## Status

Estados visuais:

```text
locked    → BLOQUEADA
available → DESBLOQUEADA
active    → CONTINUAR
completed → CONCLUÍDA ✓
```

O texto é o único dado visual dinâmico em cima de cada asset de Ilha.

Tipografia canônica:

```text
font-weight = 900
letter-spacing = .5px
text-transform = uppercase
padding-x = 10px
text-shadow = 0 1px 2px rgba(0,0,0,.55)
```

Tamanho base por Ilha:

```text
01–04 = 22 px
05–06 = 23 px
07    = 22 px
08    = 23 px
09    = 22 px
10    = 23 px
```

## Responsividade

Toda composição permanece no stage lógico de `941 × 1672`.

`computeRegion1StageGeometry(...)` aplica uma única escala uniforme ao stage inteiro. As coordenadas não são recalculadas individualmente em CSS responsivo.

Consequência:

```text
asset + status + hitbox
→ sempre preservam o mesmo registro relativo
```

## Fonte executável

```text
web/js/screens/islands-screen.js
REGION_1_LAYOUT
```

Teste de regressão:

```text
tests/web/region-1-map-layout.test.cjs
```
