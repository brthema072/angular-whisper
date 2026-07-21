import { ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-whisper',
  imports: [],
  templateUrl: './whisper.html',
  styleUrl: './whisper.sass',
})
export class Whisper implements OnInit, OnDestroy {
  private worker!: Worker;
  private mediaRecorder!: MediaRecorder;
  private audioChunks: Blob[] = [];

  isRecording = signal(false);
  transcription: string = '';
  status: string = 'Aguardando comando...';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(
        new URL('../../../shared/workers/whisper.worker.ts', import.meta.url),
      );

      this.worker.onmessage = ({ data }) => {
        console.log('no component ', data);

        if (data.status === 'loading') {
          this.status = data.message;
        } else if (data.status === 'ready') {
          this.status = 'Transcrição concluída!';
          this.transcription = data.text;
        } else if (data.status === 'error') {
          this.status = 'Erro ao transcrever.';
          console.error(data.error);
        }
        this.cdr.detectChanges(); // Garante a atualização da UI no Angular
      };
    }
  }

  // 1. Inicia a gravação do Microfone
  async startRecording() {
    this.audioChunks = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        this.status = 'Processando áudio capturado...';
        this.cdr.detectChanges();

        const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });
        await this.prepareAndSendAudio(audioBlob);

        // Desliga o microfone (apaga a luzinha de gravação do navegador)
        stream.getTracks().forEach((track) => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.status = 'Gravando... fale agora.';
    } catch (err) {
      this.status = 'Erro ao acessar o microfone.';
      console.error(err);
    }
  }

  // 2. Para a gravação
  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording.set(false);
    }
  }

  // 3. Converte o áudio gravado para Float32Array em 16kHz (Padrão exigido pelo Whisper)
  private async prepareAndSendAudio(audioBlob: Blob) {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();

      // 1. Cria o contexto de áudio
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();

      // 2. Decodifica o áudio do blob de forma segura
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // 3. Define a taxa padrão do Whisper (16000Hz)
      const TARGET_SAMPLE_RATE = 16000;

      // 4. Cria o contexto offline para fazer o resample automático
      const offlineCtx = new OfflineAudioContext(
        1, // Força canal Mono para simplificar o Whisper
        audioBuffer.duration * TARGET_SAMPLE_RATE,
        TARGET_SAMPLE_RATE,
      );

      // 5. Conecta a fonte ao renderizador offline
      const bufferSource = offlineCtx.createBufferSource();
      bufferSource.buffer = audioBuffer;
      bufferSource.connect(offlineCtx.destination);
      bufferSource.start();

      // 6. Aguarda a renderização do áudio convertido
      const renderedBuffer = await offlineCtx.startRendering();
      const channelData = renderedBuffer.getChannelData(0); // Pega o canal mono

      // VALIDAÇÃO CRÍTICA: Verifica se o áudio não foi gerado vazio/mudo
      const hasAudioData = channelData.some((value) => value !== 0);
      if (!hasAudioData) {
        this.status = 'Erro: O áudio capturado está totalmente em silêncio.';
        this.cdr.detectChanges();
        return;
      }

      // 7. Envia o áudio convertido com sucesso para o Worker
      this.worker.postMessage({ audioData: channelData });

      // Fecha o contexto para liberar memória do navegador
      await audioCtx.close();
    } catch (error) {
      this.status = 'Erro ao processar o formato do áudio.';
      console.error('Erro na conversão PCM:', error);
    }
  }

  ngOnDestroy() {
    if (this.worker) this.worker.terminate();
  }
}
