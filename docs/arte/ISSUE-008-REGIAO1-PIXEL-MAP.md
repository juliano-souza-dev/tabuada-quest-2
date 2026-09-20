# Issue #8 — CORSÁRIO — mapa técnico de 5 Ilhas

## Base canônica

```text
stage = 941 × 1672 px
background = web/assets/regions/region-1/mapa_marítimo_do_corsário.png
```

A tela atual da CORSÁRIO usa **5 Ilhas visíveis**.

As Ilhas 06–10 continuam preservadas no catálogo e nos assets para a futura reorganização de navegação. Esta task não redefine ainda a arquitetura geral de Regiões nem a didática.

## Composição vigente

```text
background oceânico
+
Ilha 01
+
Ilha 02
+
Ilha 03
+
Ilha 04
+
Ilha 05
+
status textual dinâmico
+
hitboxes
```

Os símbolos de recompensa já fazem parte dos PNGs de Ilha e não são renderizados dinamicamente.

## Coordenadas canônicas

| Ilha | Asset x | Asset y | W | H | Status x | Status y | Status W | Status H | Hitbox x | Hitbox y | Hitbox W | Hitbox H |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 01 | 5 | 340 | 330 | 330 | 80 | 604 | 180 | 36 | 15 | 350 | 310 | 310 |
| 02 | 595 | 380 | 330 | 330 | 670 | 644 | 180 | 36 | 605 | 390 | 310 | 310 |
| 03 | 295 | 615 | 350 | 350 | 375 | 895 | 190 | 38 | 305 | 625 | 330 | 330 |
| 04 | 10 | 940 | 350 | 350 | 90 | 1220 | 190 | 38 | 20 | 950 | 330 | 330 |
| 05 | 560 | 1275 | 350 | 350 | 640 | 1555 | 190 | 38 | 570 | 1285 | 330 | 330 |

Botão de retorno:

```text
x = 58
y = 18
w = 150
h = 150
```

## Ordem visual

```text
01 → topo esquerdo
02 → topo direito
03 → centro
04 → inferior esquerdo
05 → inferior direito
```

Cada asset fica sobre a respectiva marca de água do background.

## Status

```text
locked    → BLOQUEADA
available → DESBLOQUEADA
active    → CONTINUAR
completed → CONCLUÍDA ✓
```

O status é a única informação visual dinâmica sobre o asset da Ilha.

## Responsividade

O stage permanece em `941 × 1672` e recebe uma única transformação uniforme.

```text
asset + status + hitbox
→ preservam o mesmo registro relativo
```

Não criar media queries com reposicionamento individual das Ilhas.

## Fonte executável

```text
web/js/screens/islands-screen.js
REGION_1_LAYOUT.visibleIslandIds
REGION_1_LAYOUT.islands
```

Teste:

```text
tests/web/region-1-map-layout.test.cjs
```

## Decisão substituída

O mapa anterior de 10 Ilhas na mesma tela foi rejeitado visualmente por:

- assets pequenos;
- leitura insuficiente;
- excesso de elementos na composição;
- uso ruim do espaço.

Ele não deve voltar a ser utilizado como referência de posicionamento.
