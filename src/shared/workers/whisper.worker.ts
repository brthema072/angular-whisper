/// <reference lib="webworker" />

import { pipeline } from '@huggingface/transformers';

let transcriber: any = null;

async function getTranscriber() {
  if (!transcriber) {
    transcriber = await pipeline('automatic-speech-recognition', 'onnx-community/whisper-small', {
      device: 'webgpu', // Tenta usar a placa de vídeo do usuário para ficar super rápido
      dtype: 'fp32', // Mantém a precisão fp32 segura que resolveu o erro anterior
    });
  }
  return transcriber;
}

addEventListener('message', async ({ data }) => {
  const { audioData } = data; // Recebe o Float32Array direto do componente

  try {
    postMessage({ status: 'loading', message: 'Whisper processando áudio localmente...' });

    const pipe = await getTranscriber();

    // O pipeline aceita o Float32Array diretamente aqui
    const output = await pipe(audioData, {
      chunk_length_s: 30,
      stride_length_s: 5,
      language: 'portuguese', // Você pode forçar o idioma aqui ou deixar 'null' para auto-detectar
      task: 'transcribe',
    });

    postMessage({ status: 'ready', text: output.text });
  } catch (error: any) {
    postMessage({ status: 'error', error: error.message });
  }
});
