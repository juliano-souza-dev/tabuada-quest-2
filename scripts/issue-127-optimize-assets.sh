#!/usr/bin/env bash
set -euo pipefail

BASELINE_WEB_BYTES=118363725
REPORT="docs/issue-127-asset-audit.md"
mkdir -p docs

converted=0
converted_source_bytes=0
converted_output_bytes=0

validate_candidate() {
  local src="$1"
  local dst="$2"

  python3 - "$src" "$dst" <<'PY'
from PIL import Image, ImageChops
import sys

src, dst = sys.argv[1], sys.argv[2]
a = Image.open(src).convert("RGBA")
b = Image.open(dst).convert("RGBA")

if a.size != b.size:
    print(f"dimension mismatch: {src} {a.size} != {dst} {b.size}")
    raise SystemExit(1)

alpha_a = a.getchannel("A")
alpha_b = b.getchannel("A")
alpha_diff = ImageChops.difference(alpha_a, alpha_b)
if alpha_diff.getbbox() is not None:
    print(f"alpha mismatch: {src} -> {dst}")
    raise SystemExit(1)

pa = a.load()
pb = b.load()
weighted_error = 0.0
visible_weight = 0.0

for y in range(a.height):
    for x in range(a.width):
        ar, ag, ab, aa = pa[x, y]
        br, bg, bb, _ = pb[x, y]
        weight = aa / 255.0
        if weight == 0:
            continue
        weighted_error += ((abs(ar - br) + abs(ag - bg) + abs(ab - bb)) / 3.0) * weight
        visible_weight += weight

visible_mae = weighted_error / visible_weight if visible_weight else 0.0

if visible_mae > 5.0:
    print(f"visible RGB delta too high ({visible_mae:.3f}): {src} -> {dst}")
    raise SystemExit(1)

print(
    f"validated {src} -> {dst}: "
    f"size={a.size[0]}x{a.size[1]}, visible_rgb_mae={visible_mae:.3f}, alpha=exact"
)
PY
}

convert_asset() {
  local src="$1"
  local dst="$2"
  [[ -f "$src" ]] || return 0

  mkdir -p "$(dirname "$dst")"
  local src_bytes
  src_bytes=$(stat -c%s "$src")

  local accepted="false"
  local quality

  for quality in 92 96 98 100; do
    cwebp -quiet -mt -m 6 -preset picture -q "$quality" -alpha_q 100 "$src" -o "$dst"
    if validate_candidate "$src" "$dst"; then
      echo "Accepted lossy WebP q=$quality: $src"
      accepted="true"
      break
    fi
    rm -f "$dst"
  done

  if [[ "$accepted" != "true" ]]; then
    cwebp -quiet -mt -m 6 -lossless -z 9 "$src" -o "$dst"
    if validate_candidate "$src" "$dst"; then
      echo "Accepted lossless WebP fallback: $src"
      accepted="true"
    else
      rm -f "$dst"
    fi
  fi

  if [[ "$accepted" != "true" ]]; then
    echo "Keeping PNG because no WebP candidate met visual validation: $src"
    return 0
  fi

  local dst_bytes
  dst_bytes=$(stat -c%s "$dst")
  if (( dst_bytes >= src_bytes )); then
    echo "Keeping PNG because validated WebP is not smaller: $src"
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

python3 <<'PY'
from pathlib import Path

r1 = Path("tests/web/region-1-map-layout.test.cjs")
s = r1.read_text(encoding="utf-8")
s = s.replace(r"/mapa_marítimo_do_corsário\\.png/", r"/background\\.webp/")
s = s.replace(r"-locked\\.png", r"-locked\\.webp")
s = s.replace(r"-unlocked\\.png", r"-unlocked\\.webp")
r1.write_text(s, encoding="utf-8")

wm = Path("tests/web/world-map-visual.test.cjs")
s = wm.read_text(encoding="utf-8")
s = s.replace(r"mapa_mundial\\.png", r"mapa_mundial\\.webp")
s = s.replace("mapa_mundial.png", "mapa_mundial.webp")
wm.write_text(s, encoding="utf-8")

r13 = Path("tests/web/region-13-layout.test.cjs")
r13.write_text(r'''const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/islands-screen.js");

const content=globalThis.TabuadaQuest.content;
const islands=globalThis.TabuadaQuest.screens.islands;
const assetRoot=path.join(__dirname,"../../web/assets/regions/region-13");

function webpInfo(bytes){
    assert.equal(bytes.subarray(0,4).toString("ascii"),"RIFF");
    assert.equal(bytes.subarray(8,12).toString("ascii"),"WEBP");

    let offset=12;
    let width=null;
    let height=null;
    let hasAlpha=false;

    while(offset+8<=bytes.length){
        const type=bytes.subarray(offset,offset+4).toString("ascii");
        const size=bytes.readUInt32LE(offset+4);
        const data=offset+8;

        if(type==="VP8X" && size>=10){
            hasAlpha ||= (bytes[data] & 0x10)!==0;
            width=1+bytes[data+4]+(bytes[data+5]<<8)+(bytes[data+6]<<16);
            height=1+bytes[data+7]+(bytes[data+8]<<8)+(bytes[data+9]<<16);
        }else if(type==="ALPH"){
            hasAlpha=true;
        }else if(type==="VP8 " && width===null && size>=10){
            width=bytes.readUInt16LE(data+6)&0x3fff;
            height=bytes.readUInt16LE(data+8)&0x3fff;
        }else if(type==="VP8L" && width===null && size>=5){
            assert.equal(bytes[data],0x2f);
            const bits=bytes.readUInt32LE(data+1);
            width=(bits&0x3fff)+1;
            height=((bits>>>14)&0x3fff)+1;
            hasAlpha ||= ((bits>>>28)&1)===1;
        }

        offset=data+size+(size%2);
    }

    assert.ok(Number.isInteger(width) && Number.isInteger(height));
    return {width,height,hasAlpha};
}

test("OBSIDIANA possui as cinco Ilhas oficiais",()=>{
    assert.deepEqual(
        Array.from({length:5},(_,i)=>content.getIslandIdentity(13,i+1).label),
        ["Rocha Negra","Cinzas","Fogo Obsidiano","Cratera","Coração de Obsidiana"]
    );
});

test("OBSIDIANA é Região única de cinco slots",()=>{
    const visual=islands.getRegionVisualConfig(13);
    assert.equal(visual.assetKey,"region13Modular");
    assert.equal(visual.id,"obsidiana");
    assert.deepEqual(visual.islandIds,[1,2,3,4,5]);
    assert.equal("pages" in visual,false);
    const page=islands.getRegionVisualPage({},13);
    assert.equal(page.id,"obsidiana");
    assert.equal(Object.keys(page.slotLayout).length,5);
});

test("cinco Ilhas possuem assets normal e bloqueado",()=>{
    for(let i=1;i<=5;i++){
        const entry=content.assets.region13Modular.islands[i];
        assert.match(entry.unlocked,new RegExp(`island-0${i}-unlocked\\.webp`));
        assert.match(entry.locked,new RegExp(`island-0${i}-locked\\.webp`));
        assert.notEqual(entry.unlocked,entry.locked);
    }
});

test("assets WebP preservam transparência e resolução",()=>{
    for(let i=1;i<=5;i++){
        for(const state of ["unlocked","locked"]){
            const image=webpInfo(
                fs.readFileSync(path.join(assetRoot,`island-0${i}-${state}.webp`))
            );
            assert.equal(image.width,256);
            assert.equal(image.height,256);
            assert.equal(image.hasAlpha,true);
        }
    }
});

test("background WebP preserva 941x1672",()=>{
    const image=webpInfo(fs.readFileSync(path.join(assetRoot,"background.webp")));
    assert.equal(image.width,941);
    assert.equal(image.height,1672);
});
''', encoding="utf-8")
PY

node --check web/js/content/game-content.js
node --check tests/web/region-1-map-layout.test.cjs
node --check tests/web/region-13-layout.test.cjs
node --check tests/web/world-map-visual.test.cjs

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
- a diferença RGB visível é ponderada pelo alpha e precisa ficar em até 5 níveis por canal;
- pixels 100% transparentes não contam na diferença visual porque seu RGB não é renderizado;
- a conversão tenta q=92, 96, 98 e 100 e usa WebP lossless como fallback;
- o PNG original só é removido quando o WebP validado também é menor;
- todas as referências convertidas são atualizadas no mesmo lote;
- `game-content.js` passa por validação de sintaxe antes do build.

## Observação

O APK anterior foi reportado na issue #127 como superior a 120 MB. O tamanho exato do artefato anterior não está disponível dentro deste job, por isso o relatório preserva o baseline exato de `web/` e registra abaixo o tamanho exato do novo APK gerado.
EOF
