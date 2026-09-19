# Issue #3 — Auditoria e manifesto de entrada de assets

**Data:** 2026-09-19  
**Issue:** #3 — Integrar e validar pacote definitivo de assets renomeados  
**Personas:** Direção Visual + Qualidade e Build  
**Estado:** parcial; pacote definitivo ainda ausente

## Fontes auditadas

Branch:

```text
apoio
```

Pacote:

```text
game 2.0/assets-remasterizados/
```

Regras vigentes usadas para validação:

```text
agentes/03-direcao-visual.md
```

## Contratos aplicáveis

Raster:

- ícone: 512 × 512, até 100 KB;
- botão transparente: até 1280 px de largura, até 160 KB;
- banner: até 1280 × 720, até 220 KB;
- fundo vertical: 1080 × 1920, até 450 KB;
- WebP obrigatório;
- texto não deve ser embutido;
- alpha real apenas quando necessário.

Lottie:

- JSON vetorial;
- até 40 camadas;
- até 2 segundos;
- 24 fps;
- até 80 KB;
- sem base64;
- sem camadas invisíveis;
- sem filtros caros/desfoque.

## Resultado do pacote de referência encontrado

| Asset | Dimensão informada | Peso | Budget | Resultado |
| --- | ---: | ---: | --- | --- |
| `home-pirata-fundo-principal.webp` | 1080 × 1918 | 367 KB | 1080 × 1920 / 450 KB | ⚠️ peso aprovado; dimensão diverge 2 px |
| `home-pirata-banner-aventura.webp` | 1280 × 720 | 163 KB | até 1280 × 720 / 220 KB | ✅ dentro do contrato |
| `home-pirata-botao-aventura.webp` | 1280 × 534 | 130 KB | largura até 1280 / 160 KB | ✅ dentro do contrato |
| `icone-mapa-bussola.webp` | 512 × 512 | 84 KB | 512 × 512 / 100 KB | ✅ dentro do contrato |
| `icone-bau-tesouro.webp` | 512 × 512 | 79 KB | 512 × 512 / 100 KB | ✅ dentro do contrato |
| `icone-recompensa-magica.webp` | 512 × 512 | 86 KB | 512 × 512 / 100 KB | ✅ dentro do contrato |
| `icone-axolote-capitao.webp` | 512 × 512 | 93 KB | 512 × 512 / 100 KB | ✅ dentro do contrato |

## Observação de validação

As dimensões e pesos acima são os dados documentados em:

```text
apoio/game 2.0/assets-remasterizados/README.md
```

O pacote de referência declara os arquivos como WebP e descreve transparência nos elementos aplicáveis.

Essa auditoria **não transforma esses arquivos em assets canônicos**. Eles continuam em `apoio`.

## Direção artística dos prompts de referência

O arquivo:

```text
apoio/game 2.0/assets-remasterizados/PROMPTS-GERACAO-IA-PIRATA.md
```

já contém:

- a direção de aventura pirata mágica infantil;
- o contrato WebP;
- os budgets atuais;
- o contrato Lottie;
- proibição de franquias, texto, marca-d'água, armas realistas e caveiras assustadoras.

Isso está alinhado conceitualmente ao contrato atual da Direção Visual.

A fonte de verdade continua sendo:

```text
agentes/03-direcao-visual.md
```

## Bloqueios atuais

O pacote definitivo renomeado completo ainda não foi encontrado.

Arquivos canônicos obrigatórios ausentes:

```text
avatar-luna-visual-base.webp
avatar-sofia-visual-base.webp
avatar-maya-visual-base.webp
```

Também não existem, na `main`, os demais assets definitivos necessários para concluir a Issue #3.

## Destino canônico de produção

```text
web/assets/
```

Nada deve ser promovido para esse diretório sem passar por Direção Visual + Qualidade.

## Protocolo de entrada do pacote definitivo

Quando o pacote final chegar:

1. inventariar todos os arquivos;
2. conferir nomenclatura canônica;
3. detectar nomes duplicados;
4. detectar conteúdo duplicado, quando possível;
5. validar formato;
6. validar dimensão;
7. validar peso;
8. validar transparência;
9. validar ausência de texto/marca-d'água;
10. validar coerência pirata/marítima;
11. validar os três avatares-base;
12. comparar toda moda com o avatar-base correspondente;
13. separar raster, Lottie e demais categorias;
14. registrar lacunas;
15. promover apenas aprovados para `web/assets/`;
16. atualizar `MAPA-DO-PROJETO.md`;
17. atualizar `ORQUESTRADOR.md`;
18. executar QA final da Issue #3.

## Gate

Enquanto os arquivos definitivos estiverem ausentes:

```text
#3 → ABERTA / BLOQUEADA POR INSUMO
#4 → BLOQUEADA
```

Não iniciar arquitetura da #4 nem integração de assets por aproximação.
