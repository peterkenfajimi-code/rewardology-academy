/**
 * Sequential audio playback via Web Audio API — tighter gaps between TTS chunks
 * than chaining HTMLAudioElement instances.
 */
export class GaplessAudioPlayer {
  private ctx: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private stopped = false;

  async playBlob(blob: Blob): Promise<void> {
    if (this.stopped) return;

    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    const buffer = await this.ctx.decodeAudioData(await blob.arrayBuffer());

    return new Promise((resolve, reject) => {
      if (this.stopped || !this.ctx) {
        resolve();
        return;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      this.source = source;

      source.onended = () => {
        this.source = null;
        resolve();
      };

      try {
        source.start(0);
      } catch (err) {
        reject(err);
      }
    });
  }

  pause() {
    void this.ctx?.suspend();
  }

  resume() {
    void this.ctx?.resume();
  }

  stop() {
    this.stopped = true;
    if (this.source) {
      try {
        this.source.stop();
      } catch {
        /* already stopped */
      }
      this.source.disconnect();
      this.source = null;
    }
    void this.ctx?.close();
    this.ctx = null;
  }

  reset() {
    this.stopped = false;
  }
}
