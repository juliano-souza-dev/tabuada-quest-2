# Transições de navegação

Assets usados para transições visuais da campanha.

## Viagem entre Ilhas

Arquivo canônico esperado:

```text
web/assets/transitions/island-travel.mp4
```

Contrato:

- reproduzir ao entrar em uma Ilha pela primeira vez;
- reproduzir uma única vez por Ilha e por jogador;
- visitas posteriores entram direto no desafio;
- tela cheia, sem controles nativos;
- autoplay + muted + playsinline;
- ao terminar, seguir automaticamente para o desafio;
- se o vídeo não carregar, seguir para o desafio sem marcar a viagem como concluída, permitindo nova tentativa futura;
- codec recomendado: H.264/AVC;
- pixel format: yuv420p;
- áudio não é necessário;
- manter duração próxima de 5 segundos.

O estado persistente responsável por impedir repetição é:

```text
campaign.travelPlayedIslandIds
```
