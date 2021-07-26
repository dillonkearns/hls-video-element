// Web Components: Extending Native Elements, A working example

import CustomVideoElement from 'custom-video-element';
import Hls from 'hls.js';

class HLSVideoElement extends CustomVideoElement {
  constructor() {
    super();
  }

  get src() {
    // Use the attribute value as the source of truth.
    // No need to store it in two places.
    // This avoids needing a to read the attribute initially and update the src.
    return this.getAttribute('src');
  }

  set src(val) {
    // If being set by attributeChangedCallback,
    // dont' cause an infinite loop
    if (val !== this.src) {
      this.setAttribute('src', val);
    }
  }

  load() {
    if (Hls.isSupported()) {
      let config = Object.assign({
        // Kind of like preload metadata, but causes spinner.
        // autoStartLoad: false,
      }, this.hlsjsConfig);

      var hls = new Hls(config);

      hls.loadSource(this.src);
      hls.attachMedia(this.nativeEl);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      this.nativeEl.src = this.src;
      this.nativeEl.load();
    } else {
      console.error('<hls-video>: HLS is not supported.');
    }
  }

  // play() {
  //   if (this.readyState === 0 && this.networkState < 2) {
  //     this.load();
  //     this.hls.on(Hls.Events.MANIFEST_PARSED,function() {
  //     video.play();
  //
  //     return this.nativeEl.play();
  //   }
  // }

  connectedCallback() {
    this.load();

    // Not preloading might require faking the play() promise
    // so that you can call play(), call load() within that
    // But wait until MANIFEST_PARSED to actually call play()
    // on the nativeEl.
    // if (this.preload === 'auto') {
    //   this.load();
    // }
  }
}

if (!window.customElements.get('hls-video')) {
  window.customElements.define('hls-video', HLSVideoElement);
  window.HLSVideoElement = HLSVideoElement;
}

export default HLSVideoElement;
