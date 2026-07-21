# Angular Whisper WASM

Aplicação Angular que captura áudio do microfone e usa o Whisper em um Web Worker para transcrever o conteúdo localmente no navegador.

## Visão geral

Este projeto demonstra uma integração simples entre:

- Angular 21
- Web Audio API
- Web Workers
- Transformers.js
- Whisper para reconhecimento de fala rodando no navegador

A interface permite iniciar a gravação do microfone, processar o áudio e exibir a transcrição resultante.

## Funcionalidades

- Captura áudio diretamente do microfone
- Converte o áudio para o formato esperado pelo modelo Whisper
- Envia o áudio para um Web Worker em segundo plano
- Exibe status de processamento e texto transcrito

## Requisitos

- Node.js 20+
- Navegador moderno com permissão para acessar o microfone
- Suporte a Web Workers
- (Opcional) suporte a WebGPU para melhor desempenho

## Instalação

```bash
npm install
```

## Execução

```bash
npm start
```

Abra o navegador em http://localhost:4200/ para usar a aplicação.

## Estrutura do projeto

- src/app/components/whisper/whisper.ts: componente principal responsável pela gravação e envio do áudio
- src/app/components/whisper/whisper.html: interface da aplicação
- src/shared/workers/whisper.worker.ts: worker que executa o modelo Whisper em background
- public/: arquivos estáticos

## Observações importantes

- A primeira execução pode levar mais tempo porque o modelo Whisper precisa ser carregado e baixado para o cache do navegador.
- O acesso ao microfone precisa ser permitido pelo navegador.
- O fluxo atual foi pensado para execução local no cliente, sem depender de um backend.

## Build

Para gerar a versão de produção:

```bash
npm run build
```
