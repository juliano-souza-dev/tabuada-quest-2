#!/usr/bin/env bash
set -euo pipefail

BASELINE_WEB_BYTES=118363725
REPORT="docs/issue-127-asset-audit.md"
mkdir -p docs

converted=0
converted_source_bytes=0
converted_output_bytes=0

convert_asset() {
  local src="$1"
  local dst="$2"
  [[ -f "$src" ]] || return 0

  mkdir -p "$(dirname "$dst")"
  local src_bytes
  src_bytes=$(stat -c%s "$src")

  cwebp -quiet -mt -m 6 -preset picture -q 92 -alpha_q 100 "$src" -o "$dst"

  python3 - "$src" "$dst" <<'PY'
from PIL import Image, ImageChops, ImageStat
import sys
src, dst = sys.argv[1], sys.argv[2]
a = Image.open(src).convert("RGBA")
b = Image.open(dst).convert("RGBA")
if a.size != b.size:
    raise SystemExit(f"dimension mismatch: {src} {a.size} != {dst} {b.size}")
alpha_diff = ImageChops.difference(a.getchannel("A"), b.getchannel("A"))
if alpha_diff.getbbox() is not None:
    raise SystemExit(f"alpha mismatch: {src} -> {dst}")
rgb_diff = ImageChops.difference(a.convert("RGB"), b.convert("RGB"))
mae = sum(ImageStat.Stat(rgb_diff).mean) / 3.0
if mae > 5.0:
    raise SystemExit(f"visual delta too high ({mae:.3f}): {src} -> {dst}")
print(f"validated {src} -> {dst}: size={a.size[0]}x{a.size[1]}, rgb_mae={mae:.3f}, alpha=exact")
PY

  local dst_bytes
  dst_bytes=$(stat -c%s "$dst")
  if (( dst_bytes >= src_bytes )); then
    echo "Keeping PNG because WebP is not smaller: $src"
    rm -f "$dst"
    return 0
  fi

  rm "$src"
  converted=$((converted + 1))
  converted_source_bytes=$((converted_source_bytes + src_bytes))
  converted_output_bytes=$((converted_output_bytes + dst_bytes))
}

convert_asset "web/assets/global/mapa_mundial.png" "web/assets/global/mapa_mundial.webp"
convert_asset "web/assets/regions/region-1/mapa_marítimo_do_corsário.png" "web/assets/regions/region-1/background.webp"

for n in 01 02 03 04 05; do
  convert_asset "web/assets/regions/region-1/island-${n}-locked.png" "web/assets/regions/region-1/island-${n}-locked.webp"
  convert_asset "web/assets/regions/region-1/island-${n}-unlocked.png" "web/assets/regions/region-1/island-${n}-unlocked.webp"
done

convert_asset "web/assets/regions/region-13/background.png" "web/assets/regions/region-13/background.webp"
for n in 01 02 03 04 05; do
  convert_asset "web/assets/regions/region-13/island-${n}-locked.png" "web/assets/regions/region-13/island-${n}-locked.webp"
  convert_asset "web/assets/regions/region-13/island-${n}-unlocked.png" "web/assets/regions/region-13/island-${n}-unlocked.webp"
done

python3 <<'PY'
from pathlib import Path
p = Path("web/js/content/game-content.js")
s = p.read_text(encoding="utf-8")
pairs = {
    "./assets/global/mapa_mundial.png": "./assets/global/mapa_mundial.webp",
    "./assets/regions/region-1/mapa_marítimo_do_corsário.png": "./assets/regions/region-1/background.webp",
    "./assets/regions/region-13/background.png": "./assets/regions/region-13/background.webp",
}
for n in range(1, 6):
    nn = f"{n:02d}"
    pairs[f"./assets/regions/region-1/island-{nn}-locked.png"] = f"./assets/regions/region-1/island-{nn}-locked.webp"
    pairs[f"./assets/regions/region-1/island-{nn}-unlocked.png"] = f"./assets/regions/region-1/island-{nn}-unlocked.webp"
    pairs[f"./assets/regions/region-13/island-{nn}-locked.png"] = f"./assets/regions/region-13/island-{nn}-locked.webp"
    pairs[f"./assets/regions/region-13/island-{nn}-unlocked.png"] = f"./assets/regions/region-13/island-{nn}-unlocked.webp"
for old, new in pairs.items():
    repo_path = "web/" + new.removeprefix("./")
    if Path(repo_path).exists():
        s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
PY

node --check web/js/content/game-content.js

after_bytes=$(du -sb web | awk '{print $1}')
saved_bytes=$((BASELINE_WEB_BYTES - after_bytes))
saved_pct=$(awk -v s="$saved_bytes" -v b="$BASELINE_WEB_BYTES" 'BEGIN { printf "%.2f", (s/b)*100 }')
conversion_saved=$((converted_source_bytes - converted_output_bytes))

cat > "$REPORT" <<EOF
# Issue #127 — auditoria e redução de assets

## Resultado

- Baseline exato do diretório `web/`: **$BASELINE_WEB_BYTES bytes**.
- Tamanho de `web/` após remoção de órfãos + otimização WebP: **$after_bytes bytes**.
- Economia absoluta no bundle web: **$saved_bytes bytes**.
- Economia percentual no bundle web: **$saved_pct%**.
- Arquivos órfãos/dead removidos antes da conversão: **30**.
- PNGs ativos convertidos para WebP nesta etapa: **$converted**.
- Bytes dos PNGs convertidos: **$converted_source_bytes**.
- Bytes dos WebPs resultantes: **$converted_output_bytes**.
- Economia apenas na conversão: **$conversion_saved bytes**.

## Regras de validação aplicadas

- somente assets comprovadamente sem consumidor foram removidos;
- Região 1 antiga (ilhas 6–10) foi removida porque o layout vigente declara apenas as ilhas 1–5;
- três mapas estáticos declarados, mas sem consumidor, foram removidos da configuração e do bundle;
- cada PNG ativo convertido mantém as mesmas dimensões;
- alpha/transparência é validado pixel a pixel;
- diferença RGB média precisa ficar em até 5 níveis por canal;
- o PNG original só é removido quando o WebP resultante é menor;
- todas as referências convertidas são atualizadas no mesmo lote;
- `game-content.js` passa por validação de sintaxe antes do build.

## Observação

O APK anterior foi reportado na issue #127 como superior a 120 MB. O tamanho exato do artefato anterior não está disponível dentro deste job, por isso o relatório preserva o baseline exato de `web/` e registra abaixo o tamanho exato do novo APK gerado.
EOF
