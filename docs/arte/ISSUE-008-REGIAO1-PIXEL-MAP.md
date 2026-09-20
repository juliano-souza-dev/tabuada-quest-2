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
| 01 | 0 | 320 | 380 | 380 | 88 | 626 | 204 | 42 | 14 | 334 | 352 | 352 |
| 02 | 561 | 360 | 380 | 380 | 649 | 666 | 204 | 42 | 575 | 374 | 352 | 352 |
| 03 | 270 | 590 | 400 | 400 | 362 | 912 | 216 | 44 | 285 | 605 | 370 | 370 |
| 04 | 0 | 915 | 395 | 395 | 91 | 1233 | 213 | 44 | 15 | 930 | 365 | 365 |
| 05 | 541 | 1240 | 400 | 400 | 633 | 1562 | 216 | 44 | 556 | 1255 | 370 | 370 |

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


## Refino de legibilidade após validação visual

A primeira versão de 5 Ilhas foi considerada correta em composição e rota, porém ainda conservadora em escala.

Decisão do líder:

```text
não preencher todo o oceano
não fazer as Ilhas se encostarem
aumentar imediatamente os assets
usar CSS para elevar o contraste do status
```

Escala vigente:

```text
Ilha 01 = 380 × 380
Ilha 02 = 380 × 380
Ilha 03 = 400 × 400
Ilha 04 = 395 × 395
Ilha 05 = 400 × 400
```

O aumento preserva os centros visuais da composição e mantém respiro entre os elementos.

Status:

- fonte lógica mínima de 28 px;
- caixa mínima de 42 px;
- contorno via `-webkit-text-stroke`;
- sombras em múltiplas camadas;
- leve tratamento de fundo dentro da área da placa;
- cores específicas para locked, completed e resume.

Fonte CSS:

```text
web/css/screens/vertical-slice.css
.region1-island-status
```

A task permanece sujeita à validação visual final do líder.
