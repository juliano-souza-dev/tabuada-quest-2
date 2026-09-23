# Calibração visual dos desafios

As artes de desafio são fundos fixos. A pergunta, as respostas e as hitboxes
são elementos HTML sobrepostos. Por isso, a calibração deve ser validada olhando
a tela renderizada; o centro geométrico da caixa nem sempre coincide com o
centro óptico do texto na placa.

## Roteiro de revisão

1. Abra o app no navegador interno.
2. Acesse `DEV · REGIÕES` na Home.
3. Abra a Região e, depois, cada Ilha individualmente.
4. Para cada tela, confira primeiro a pergunta no painel principal e depois os
   quatro números nas placas de resposta.
5. Depois de cada mudança, recarregue a página e repita o mesmo percurso.

## Onde ajustar

O ponto de manutenção é `web/js/screens/challenge-screen.js`, em
`CHALLENGE_ART_LAYOUTS[regionId][islandId]`.

- `question` e `answers` definem a geometria em percentuais do stage 9:16.
  Altere esses valores quando a placa clicável ou a área da pergunta estiverem
  fora do lugar.
- `questionOffsetY` desloca apenas o texto da pergunta, em pixels. Use-o quando
  a área está correta, mas o texto parece alto ou baixo por causa da fonte.
- `answerOffsetY` desloca apenas os números das respostas, em pixels. O padrão
  global é `6px`, aplicado pela variável `--tabuada-opcao-numero-offset-y`.

Não mova o asset de fundo para corrigir texto. Não ajuste CSS global quando o
problema existir em apenas uma Ilha.

## Exemplo

Na Ilha do Vulcão de CORSÁRIO, a pergunta ficou alta quando recebeu o ajuste
global de `-6px`. O layout da Ilha usa `questionOffsetY: 0` para neutralizar
somente essa exceção, mantendo as demais Ilhas com o deslocamento padrão.

## Validação final

Confirme visualmente as Ilhas em desktop e mobile, verifique que cada número
continua clicável dentro de sua placa e execute:

```powershell
node --test tests/web/*.test.cjs
```
