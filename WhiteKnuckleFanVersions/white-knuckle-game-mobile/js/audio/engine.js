/**
 * WebAudio engine: context, oscillator and noise helpers.
 */
// audio
let AC, mg, wg, wf, NB;
function au() {
  if (!AC) {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    mg = AC.createGain();
    mg.gain.value = 0.4;
    {
      const c = AC.createDynamicsCompressor();
      mg.connect(c);
      c.connect(AC.destination);
    }
    const b = AC.createBuffer(1, AC.sampleRate, AC.sampleRate),
      d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    NB = b;
    const s = AC.createBufferSource();
    s.buffer = b;
    s.loop = true;
    wf = AC.createBiquadFilter();
    wf.type = "lowpass";
    wg = AC.createGain();
    wg.gain.value = 0.03;
    s.connect(wf).connect(wg).connect(mg);
    s.start();
  }
  AC.resume();
}
function tn(f, d, ty, v, f2) {
  const t = AC.currentTime,
    o = AC.createOscillator(),
    g = AC.createGain();
  o.type = ty;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.connect(g).connect(mg);
  o.start(t);
  o.stop(t + d);
}
function nz(d, v, f) {
  const t = AC.currentTime,
    s = AC.createBufferSource(),
    b = AC.createBiquadFilter(),
    g = AC.createGain();
  s.buffer = NB;
  b.type = "bandpass";
  b.frequency.value = f;
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + d);
  s.connect(b).connect(g).connect(mg);
  s.start(t);
  s.stop(t + d);
}
