# Issue #127 — auditoria e redução de assets

## Resultado

- Baseline exato do diretório `web/`: **118.363.725 bytes**.
- Tamanho final de `web/`: **59.413.229 bytes**.
- Economia absoluta no bundle web: **58.950.496 bytes**.
- Redução do bundle web: **49,80%**.
- Assets órfãos/legados removidos: **30**.
- PNGs ativos convertidos para WebP: **23**.
- Peso original desses PNGs: **29.903.627 bytes**.
- Peso dos WebPs resultantes: **5.862.238 bytes**.
- Economia obtida somente pela conversão WebP: **24.041.389 bytes**.

## APK validado

- Baseline informado na issue #127: **mais de 120 MB**.
- APK debug após a limpeza: **67.226.389 bytes (64,11 MiB)**.
- Build Android final sobre os assets já persistidos: **sucesso**.
- Validação de sintaxe JavaScript: **sucesso**.
- Suíte de testes web: **sucesso**.

## O que foi removido

- antigas Ilhas 06–10 da Região 1;
- backgrounds e composições substituídos;
- partes antigas da Home que não possuíam consumidor;
- mapas estáticos antigos sem consumidor;
- cópias PNG substituídas pelos WebPs validados.

## Critérios usados na conversão

- mesmas dimensões do original;
- alpha/transparência preservados pixel a pixel;
- diferença RGB visível ponderada pelo alpha limitada a 5 níveis por canal;
- tentativa progressiva de qualidade WebP;
- fallback WebP lossless quando necessário;
- conversão aceita somente quando o resultado validado também é menor que o PNG;
- referências atualizadas no mesmo lote para evitar links quebrados.

## Validação final

O estado final da branch foi validado novamente **depois** de os WebPs terem sido gravados no repositório. Nesse segundo ciclo não houve conversão temporária: os testes e o APK foram executados diretamente sobre os assets finais que entrarão no merge.
