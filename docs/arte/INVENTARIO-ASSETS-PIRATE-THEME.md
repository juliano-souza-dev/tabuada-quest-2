# Inventário visual — assets_pirate_theme

**Fonte:** `apoio/game 2.0/assets_pirate_theme/`  
**Data da auditoria:** 2026-09-19  
**Responsável:** Direção Visual  
**Uso:** referência prioritária para reuso/adaptação antes de criar novos assets

## Resumo do catálogo

O próprio `CATALOGO.md` informa:

- 8 visuais de avatar pirata/navegadora;
- fundos de porto, baía, ilha e gruta;
- baús, colecionáveis e molduras;
- PET com Lottie + 16 frames;
- pacote remasterizado da Home;
- 58 WebP, 2 Lottie JSON e 1 SVG;
- aproximadamente 5,46 MB.

## Regra de precedência

Antes de criar qualquer novo asset para a V1:

1. consultar este inventário;
2. verificar compatibilidade semântica;
3. verificar identidade/tema;
4. verificar proporção e função na tela;
5. classificar como `REUTILIZAR`, `ADAPTAR` ou `CRIAR NOVO`.

O acervo não é automaticamente produção. Continua na branch `apoio` até promoção formal.

## Avatares disponíveis

```text
avatares/avatar-luna-navegadora.webp
avatares/avatar-luna-pirata.webp
avatares/avatar-maya-navegadora.webp
avatares/avatar-maya-pirata-aventureira.webp
avatares/avatar-maya-pirata-classica.webp
avatares/avatar-sofia-navegadora.webp
avatares/avatar-sofia-pirata-aventureira.webp
avatares/avatar-sofia-pirata-classica.webp
```

### Estado

**CANDIDATOS A ADAPTAÇÃO/REUSO, NÃO APROVADOS AINDA.**

Cada um deve ser comparado lado a lado com:

```text
web/assets/avatars/avatar-luna-visual-base.webp
web/assets/avatars/avatar-maya-visual-base.webp
web/assets/avatars/avatar-sofia-visual-base.webp
```

Critério: identidade facial e corporal precisa permanecer canônica.

## Fundos disponíveis

```text
fundos/bau-fundo-pirata-harbor.webp
fundos/bau-fundo-pirata-ilha.webp
fundos/bau-fundo-tesouro-cave.webp
fundos/mundo-desafio-03.webp
fundos/tabuada-02-bg-pirata-bay.webp
fundos/tabuada-02-bg-pirata-port.webp
remasterizados/home-pirata-fundo-principal.webp
```

### Home

O candidato principal passa a ser:

```text
remasterizados/home-pirata-fundo-principal.webp
```

Tamanho físico no GitHub:

```text
375658 bytes
```

Auditoria anterior registrou 1080 × 1918.

Decisão atual:

```text
ADAPTAR / VALIDAR
```

Não criar cenário novo antes de testar esse fundo na composição oficial da Home.

A diferença de 2 px em relação ao contrato 1080 × 1920 deve ser tratada como correção técnica/adaptação, não como motivo automático para descartar a direção artística.

### Outros fundos

Os fundos de porto, baía, ilha, gruta e baú devem ser mantidos como candidatos para:

- Ilhas;
- desafios;
- telas de baú;
- colecionáveis;
- missões.

Não usar automaticamente na Home apenas porque possuem tema compatível.

## CTA da Home

```text
home-pirata-botao-aventura.webp
```

SHA idêntico ao arquivo já promovido:

```text
web/assets/ui/home-pirata-botao-aventura.webp
```

Decisão:

```text
REUTILIZAR SOB VALIDAÇÃO DE COMPOSIÇÃO
```

## Ícones remasterizados

Já promovidos na `main`:

```text
icone-bau-tesouro.webp
icone-mapa-bussola.webp
icone-recompensa-magica.webp
```

Decisão:

```text
REUTILIZAR
```

## PET / Companheiros

Disponível:

```text
remasterizados/icone-axolote-capitao.webp
pets/imagens/pet-01-idle-00.webp ... pet-01-idle-07.webp
pets/imagens/pet-01-jump-00.webp ... pet-01-jump-07.webp
pets/lottie/pet-01-idle.json
pets/lottie/pet-01-jump.json
```

### Estado

O acervo elimina a necessidade de criar imediatamente um ícone novo de Companheiros.

Nova decisão:

```text
AUDITAR / ADAPTAR PRIMEIRO
```

Ainda precisa confirmar se o Axolote/PET 01 pertence à lista vigente dos 30 PETs. Enquanto isso, não promover como representação definitiva do sistema.

## Baús e colecionáveis

Disponíveis:

```text
baus/pacote-explorer.webp
baus/pacote-explorer.svg
baus/tabuada-02-chest-nautical.webp

colecionaveis/bau-colecionavel-aventura-map.webp
colecionaveis/bau-colecionavel-numeros-pearl.webp
colecionaveis/bau-colecionavel-sea-estrela-coin.webp
colecionaveis/bau-colecionavel-tesouro-compass.webp
```

São candidatos fortes para telas futuras de:

- baús;
- coleção;
- recompensa.

Não promover nesta Issue #4 se não forem necessários para a Home.

## Molduras

Existem molduras genéricas piratas e uma série `moldura-aventura-XX`.

Alguns nomes sugerem referências reconhecíveis de franquias:

```text
strawhat
three-blades
flame-chef
sky-marksman
mecha-tide
music-crown
navigator-map
```

Estado:

```text
QUARENTENA VISUAL
```

Não reutilizar em produção sem revisão individual da Direção Visual.

As molduras puramente náuticas/tesouro também precisam validação antes de promoção.

## Remasterizados já presentes na main

Hashes confirmam que estes arquivos da `apoio` já foram promovidos de forma idêntica:

```text
home-pirata-banner-aventura.webp
home-pirata-botao-aventura.webp
icone-bau-tesouro.webp
icone-mapa-bussola.webp
icone-recompensa-magica.webp
```

Não duplicar.

## Impacto na Issue #4

A política anterior da Home é corrigida:

### Antes

```text
background-home → CRIAR NOVO
icon-companions → CRIAR NOVO
```

### Agora

```text
background-home
→ ADAPTAR / VALIDAR home-pirata-fundo-principal.webp primeiro

avatar-home
→ AUDITAR variantes pirata/navegadora contra base canônica primeiro

icon-companions
→ AUDITAR Axolote/PET 01 primeiro

cta-play
→ REUTILIZAR SOB VALIDAÇÃO

map/chest/reward
→ REUTILIZAR
```

Novo asset só será criado se o candidato existente reprovar a função visual.
