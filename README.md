# Bit Chubb Days

PWA de treino em HTML, CSS e JavaScript puro. Funciona offline após a primeira visita com o carregamento completo. Sessões, cargas e histórico são salvos no armazenamento local deste navegador.

## Abrir

Na pasta do app, execute `python3 -m http.server 8000` e acesse `http://localhost:8000/` no navegador. Para abrir no celular, hospede estes arquivos em um endereço HTTPS. Abrir `index.html` diretamente como `file://` não ativa o service worker.

## Instalar

Acesse via HTTPS (ou localhost), aguarde a primeira abertura online e use **Instalar app** no Chrome/Edge ou **Compartilhar → Adicionar à Tela de Início** no Safari. A possibilidade de instalação e o tratamento do ícone SVG dependem do navegador; se necessário, converta `icons/icon.svg` também em PNG de 192 e 512 px e acrescente os ícones ao manifest.

Selecione A, B, C ou D. A sessão selecionada fica salva, inclusive séries, cargas, cardio e fim dos descansos. Mudar de treino inicia uma nova sessão para o treino escolhido. Ao finalizar, o histórico registra os valores preenchidos e a sequência avança após o treino concluído. Use exportação/backup do navegador se precisar conservar dados ao limpar o armazenamento: o app não sincroniza entre dispositivos.
