# Manifesto de assets canônicos

Este arquivo controla o conjunto visual aprovado para produção em `web/assets/`.

## Status

**Pacote canônico da Home V1 em integração visual na Issue #4.**

Somente assets listados neste manifesto podem ser tratados como produção.

## Avatares-base canônicos

| Personagem | Caminho | Estado |
| --- | --- | --- |
| Luna | `web/assets/avatars/avatar-luna-visual-base.webp` | APROVADO |
| Maya | `web/assets/avatars/avatar-maya-visual-base.webp` | APROVADO |
| Sofia | `web/assets/avatars/avatar-sofia-visual-base.webp` | APROVADO |

## Variações pirata para a Home

| Personagem | Caminho | Estado |
| --- | --- | --- |
| Luna | `web/assets/avatars/avatar-luna-pirata.webp` | PROMOVIDO / USO HOME |
| Maya | `web/assets/avatars/avatar-maya-pirata.webp` | PROMOVIDO / USO HOME |
| Sofia | `web/assets/avatars/avatar-sofia-pirata.webp` | PROMOVIDO / USO HOME |

A identidade-base continua sendo a referência canônica. Moda futura deve preservar rosto, cabelo, idade visual, proporções e identidade.

## Fundos personalizáveis da Home

| ID | Caminho | Estado |
| --- | --- | --- |
| `pirate-main` | `web/assets/ui/home-pirata-fundo-principal.webp` | PADRÃO APROVADO PELO USUÁRIO |
| `pirate-bay` | `web/assets/backgrounds/home-pirate-bay.webp` | PROMOVIDO PARA SELETOR |
| `pirate-port` | `web/assets/backgrounds/home-pirate-port.webp` | PROMOVIDO PARA SELETOR |

A escolha é persistida em `state.ui.homeBackgroundId`.

## Molduras de perfil

| ID | Caminho | Estado |
| --- | --- | --- |
| `pirate-treasure` | `web/assets/frames/profile-frame-pirate-treasure.webp` | PADRÃO |
| `tide-wheel` | `web/assets/frames/profile-frame-tide-wheel.webp` | PROMOVIDO PARA SELETOR |

A escolha é persistida em `state.player.profileFrameId`.

## UI da Home

| Asset | Caminho | Estado |
| --- | --- | --- |
| Base de botão JOGAR | `web/assets/ui/home-pirata-botao-aventura.webp` | APROVADO |
| Ícone de mapa/bússola | `web/assets/ui/icone-mapa-bussola.webp` | APROVADO |
| Ícone de baú | `web/assets/ui/icone-bau-tesouro.webp` | APROVADO |
| Ícone de recompensa | `web/assets/ui/icone-recompensa-magica.webp` | APROVADO |
| Baú náutico | `web/assets/ui/chest-nautical.webp` | PROMOVIDO PARA HOME |
| Baú de itens | `web/assets/ui/chest-items.webp` | PROMOVIDO PARA HOME |
| Axolote Capitão | `web/assets/pets/axolotl-captain.webp` | PROMOVIDO PARA CARD PETS |

## Regras

- avatar, nome, nível, XP, moedas e gemas são dinâmicos;
- nenhum desses dados pode ser rasterizado nos assets;
- fundo e moldura são personalizações independentes;
- novos fundos/molduras só entram após Direção Visual + Qualidade + promoção física;
- não reutilizar assets de franquias ou nomenclatura antiga sem revisão;
- `web/` permanece fonte única para navegador e Android WebView.


## Tela de Regiões — Issue #24

| Asset | Caminho | Estado | Função |
|---|---|---|---|
| Mapa-base aprovado | `web/assets/regions/regions-map-base.webp` | APROVADO / PROMOVIDO | composição fixa da jornada por 11 Regiões |

A arte-base contém somente cenário/composição fixa. Números, nomes, progresso, estados, cadeados, CTAs, HUD, fragmentos e estados da Região 11 são renderizados dinamicamente.
