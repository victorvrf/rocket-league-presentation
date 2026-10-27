# Como adicionar vídeos de gameplay

A apresentação já está preparada para receber vídeos. **Nenhum vídeo foi incluído de propósito.**
Sem vídeos, ela funciona exatamente como está (nada de caixa vazia ou erro). Quando você colocar um vídeo, ele aparece sozinho.

## Como vai funcionar na hora de apresentar

1. O slide aparece com a animação explicando a mecânica (como hoje).
2. Quando você quiser mostrar o gameplay real, aperte a **seta direita (→)**. Um replay grande abre por cima do slide, **mudo** e em loop.
3. Se o slide tiver mais de um vídeo, aperte **→** de novo para o próximo clipe.
4. Aperte **→** no último clipe para fechar o replay e ir para o próximo slide.
5. **←** ou **Esc** fecha o replay e continua no mesmo slide.

Detalhes:
- Quando o slide tem vídeo, aparece um pequeno aviso verde no canto de cima, à direita: `▶ 2 REPLAYS`. Sem vídeo, o aviso não aparece.
- O vídeo para sozinho quando você fecha o replay ou muda de slide. Nada avança sozinho quando o vídeo termina.
- Clicar no vídeo pausa e continua.
- Os slides continuam sendo 8. O contador e a barra de progresso não mudam.

## 1) Qual pasta abrir

A pasta `assets/videos/`, dentro da pasta do projeto (`rl-mechanics`).

## 2) Quais nomes usar e para qual mecânica

Todos são **opcionais**: coloque só os que você tiver. Use exatamente estes nomes, tudo em minúsculas:

| Slide | Arquivo | Mecânica |
|---|---|---|
| 3 – Movement | `half-flip.mp4` | Half-Flip |
| 3 – Movement | `wave-dash.mp4` | Wave Dash |
| 3 – Movement | `speed-flip.mp4` | Speed Flip |
| 4 – Ball Control | `air-dribble.mp4` | Air Dribble |
| 4 – Ball Control | `ceiling-shot.mp4` | Ceiling Shot |
| 5 – Power & Contact | `wall-pinch.mp4` | Wall Pinch |
| 5 – Power & Contact | `ground-pinch.mp4` | Ground Pinch |
| 6 – Advanced | `flip-reset.mp4` | Flip Reset |
| 6 – Advanced | `musty-flick.mp4` | Musty Flick |

Dica: os que mais ajudam a plateia são Speed Flip, Air Dribble, Ceiling Shot, Flip Reset e Musty Flick, porque são os mais difíceis de entender só pelo desenho. Escolha um clipe que **mostre claramente** a mecânica; se o clipe for de outra coisa, é melhor não colocar.

## 3) Formato recomendado

- **Arquivo:** `.mp4` (vídeo H.264). É o que o Chrome e o Edge tocam sem problema.
- **Proporção:** 16:9 (horizontal). Tamanho ideal: 1920×1080 ou 1280×720.
- **Duração:** 5 a 15 segundos. Clipes curtos prendem mais e deixam a apresentação dentro do tempo.
- **Som:** não precisa. O vídeo toca sempre mudo.
- **Peso:** de preferência menos de 20 MB por clipe.
- Se o seu gravador salva em HEVC/H.265 e o vídeo não aparece, converta para H.264 (veja "Se o vídeo não aparece").

## 4) Preciso mudar algo no código?

**Não**, se você usar os nomes da tabela. É só:

1. Escolher o vídeo.
2. Renomear para o nome da tabela (por exemplo `speed-flip.mp4`).
3. Colocar na pasta `assets/videos/`.
4. Abrir a apresentação e testar.

## 5) Como testar

1. Abra um terminal **dentro da pasta `rl-mechanics`** e rode: `python3 -m http.server 8080`
2. Abra `http://localhost:8080` no Chrome ou Edge.
3. Vá até o slide do vídeo. Deve aparecer `▶ 1 REPLAY` no canto de cima.
4. Aperte **→**. O replay abre e o vídeo toca.
5. Aperte **←** para fechar. Ao recarregar a página, aperte **Ctrl+F5** para garantir que ele leia os arquivos novos.

Importante: abrir o `index.html` com duplo clique **não** carrega os vídeos. Use sempre o servidor acima (é o mesmo jeito de abrir a apresentação).

## 6) Quero usar outro nome, cortar o começo ou deixar em câmera lenta

Isso é feito no arquivo **`videos-config.js`** (na pasta principal do projeto). Abra com o Bloco de Notas e procure a linha do clipe. Exemplo:

```js
{ slide: 3, file: 'speed-flip.mp4',   title: 'Speed flip',   note: 'Diagonal flip, quick cancel, straight to the ball.' },
```

- **Usar outro nome de arquivo:** mude só o texto depois de `file:`. Exemplo: `file: 'meu-speedflip.mp4'`.
- **Começar o clipe no segundo 3,5:** adicione `start: 3.5`:
  `{ slide: 3, file: 'speed-flip.mp4', title: 'Speed flip', note: '...', start: 3.5 },`
- **Câmera lenta:** adicione `speed: 0.5`:
  `{ slide: 3, file: 'speed-flip.mp4', title: 'Speed flip', note: '...', speed: 0.5 },`
- **Mudar a frase embaixo do vídeo:** edite o texto de `note:` (fica entre aspas simples; mantenha a vírgula no final da linha).
- **Tirar um clipe:** apague o arquivo da pasta (ou a linha inteira).

Não mexa em `script.js` nem em `replay.js`.

## 7) Trocar um clipe ou resolver problemas

**Trocar:** coloque o novo arquivo na pasta com o **mesmo nome** e substitua o antigo. Depois, Ctrl+F5.

**Se o vídeo não aparece (sem o aviso `▶ REPLAY`):**
1. O nome está exato? Tudo minúsculo, com hífen, terminando em `.mp4`. No Windows, confira se não ficou `speed-flip.mp4.mp4` (ative "mostrar extensões de arquivo").
2. O arquivo está mesmo em `assets/videos/`?
3. Você abriu pelo servidor (`http://localhost:8080`) e não pelo duplo clique?
4. Apertou Ctrl+F5?
5. Se ainda não aparecer, abra `videos-config.js` e mude `detect: 'folder'` para `detect: 'try'`, depois Ctrl+F5. (Pode aparecer um aviso 404 no console para os clipes que você não colocou; isso é normal e não atrapalha.)

**Se o aviso `▶ REPLAY` aparece mas o vídeo não abre ou desaparece:** o formato provavelmente não é compatível (comum com HEVC/H.265). O replay se fecha sozinho, sem erro. Converta para H.264. Se você tiver o `ffmpeg` instalado:

```
ffmpeg -i original.mp4 -c:v libx264 -pix_fmt yuv420p -an -vf scale=1920:-2 speed-flip.mp4
```

(`-an` remove o som; `scale=1920:-2` ajusta a largura.)

## Resumo dos arquivos

| Arquivo | Para que serve | Você edita? |
|---|---|---|
| `assets/videos/` | onde ficam seus clipes | **Sim** (copiar vídeos) |
| `videos-config.js` | lista de clipes, nomes, frases | Só se quiser mudar nomes/frases |
| `replay.js` | faz o replay funcionar | Não |
| `style.css`, `index.html`, `script.js` | design e slides | Não |
