# Issue #26 — Fidelidade visual

## Referência

Asset canônico:

```text
web/assets/regions/regions-map-static.png
941 × 1672
```

A implementação usa um stage lógico de exatamente `941 × 1672`, com imagem e overlays filhos da mesma superfície e a mesma transformação de escala/crop.

## Verificações

- coordenadas da issue preservadas em `REGIONS_LAYOUT`;
- botão voltar em `8,8,112,112`;
- slots R1–R10 preservados sem recalibração;
- slots especiais da Região 11 preservados;
- nenhum novo botão visual foi desenhado;
- textos continuam fora do raster;
- mapa-base não foi redesenhado;
- composição full-screen da #25 foi preservada.

## Resultado

```text
FIDELIDADE_VISUAL = 94%
APROVADO PARA QUALIDADE
```

A nota não substitui a aprovação final do líder no preview publicado.
