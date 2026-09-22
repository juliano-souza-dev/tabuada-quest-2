# Issue #127 — auditoria e redução de assets

## Resultado

- Baseline exato do diretório : **118363725 bytes**.
- Tamanho de  após remoção de órfãos + otimização WebP: **59413229 bytes**.
- Economia absoluta no bundle web: **58950496 bytes**.
- Economia percentual no bundle web: **49.80%**.
- Arquivos órfãos/dead removidos antes da conversão: **30**.
- PNGs ativos convertidos para WebP nesta etapa: **23**.
- Bytes dos PNGs convertidos: **29903627**.
- Bytes dos WebPs resultantes: **5862238**.
- Economia apenas na conversão: **24041389 bytes**.

## Regras de validação aplicadas

- somente assets comprovadamente sem consumidor foram removidos;
- Região 1 antiga (ilhas 6–10) foi removida porque o layout vigente declara apenas as ilhas 1–5;
- três mapas estáticos declarados, mas sem consumidor, foram removidos da configuração e do bundle;
- cada PNG ativo convertido mantém as mesmas dimensões;
- alpha/transparência é validado pixel a pixel;
- a diferença RGB visível é ponderada pelo alpha e precisa ficar em até 5 níveis por canal;
- pixels 100% transparentes não contam na diferença visual porque seu RGB não é renderizado;
- a conversão tenta q=92, 96, 98 e 100 e usa WebP lossless como fallback;
- o PNG original só é removido quando o WebP validado também é menor;
- todas as referências convertidas são atualizadas no mesmo lote;
-  passa por validação de sintaxe antes do build.

## Observação

O APK anterior foi reportado na issue #127 como superior a 120 MB. O tamanho exato do artefato anterior não está disponível dentro deste job, por isso o relatório preserva o baseline exato de  e registra abaixo o tamanho exato do novo APK gerado.

## APK de validação

- APK anterior: **>120 MB** (baseline reportado na issue #127; o artefato anterior exato não está preservado neste job).
- APK debug após a limpeza: **67226389 bytes (64.11 MiB)**.
- Build Android: **sucesso**.
- Testes web: **sucesso**.
