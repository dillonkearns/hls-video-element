// Web Components: Extending Native Elements, A working example

import CustomVideoElement from "custom-video-element";
import Hls from "hls.js";
import mux from "mux-embed";

class HLSVideoElement extends CustomVideoElement {
  constructor() {
    super();
    this.muxPlayerInitTime = Date.now();
  }

  get src() {
    // Use the attribute value as the source of truth.
    // No need to store it in two places.
    // This avoids needing a to read the attribute initially and update the src.
    return this.getAttribute("src");
  }

  set src(val) {
    // If being set by attributeChangedCallback,
    // dont' cause an infinite loop
    if (val !== this.src) {
      this.setAttribute("src", val);
    }
  }

  load() {
    if (Hls.isSupported()) {
      var hls = new Hls({
        // Kind of like preload metadata, but causes spinner.
        // autoStartLoad: false,
      });

      hls.loadSource(this.src);
      hls.attachMedia(this.nativeEl);
    } else if (this.nativeEl.canPlayType("application/vnd.apple.mpegurl")) {
      this.nativeEl.src = this.src;
      this.nativeEl.load();
    }
    const muxEnvId = "ri0pg2slbpklmp9velqaurm99";
    mux.monitor(this.nativeEl, {
      debug: false,
      hlsjs: hls,
      Hls: Hls,
      data: {
        env_key: muxEnvId,
        // player_name: "Main Player", // any arbitrary string you want to use to identify this player
        player_init_time: this.muxPlayerInitTime,
        video_id: this.getAttribute("lesson-id"),
        video_title: this.getAttribute("title"),
        video_series: this.getAttribute("series"),
        video_duration: this.getAttribute("duration"), // in milliseconds, ex: 120000
      },
    });
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

if (!window.customElements.get("hls-video")) {
  window.customElements.define("hls-video", HLSVideoElement);
  window.HLSVideoElement = HLSVideoElement;
}

export default HLSVideoElement;
