/**
 * Renderer, scene, camera and viewport (low-res pixelated render target).
 */
const $ = (i) => document.getElementById(i),
  T3 = THREE;
const cv = $("c"),
  rn = new T3.WebGLRenderer({ canvas: cv, antialias: false }),
  sc = new T3.Scene(),
  cam = new T3.PerspectiveCamera(82, 1, 0.1, 90);
sc.add(cam);
sc.fog = new T3.Fog(0, 2.3, 25.5);
function rs() {
  const w = Math.max(160, innerWidth >> 2),
    h = Math.max(90, innerHeight >> 2);
  rn.setSize(w, h, false);
  cam.aspect = w / h;
  cam.updateProjectionMatrix();
}
addEventListener("resize", rs);
rs();
