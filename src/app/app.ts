import { Component, signal } from '@angular/core';
import { Whisper } from './components/whisper/whisper';

@Component({
  selector: 'app-root',
  imports: [Whisper],
  templateUrl: './app.html',
  styleUrl: './app.sass',
})
export class App {
  protected readonly title = signal('angular-whisper-wasm');
}
