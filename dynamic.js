(function () {
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- GSAP + ScrollTrigger ----------
  if (window.gsap && window.ScrollTrigger && !reduced) {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero h1", { y: 40, opacity: 0, duration: 1 })
      .from(".hero .lede", { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
      .from(".countdown .unit", { y: 20, opacity: 0, stagger: 0.1, duration: 0.6 }, "-=0.5")
      .from(".cta-row .btn", { y: 20, opacity: 0, stagger: 0.1, duration: 0.6 }, "-=0.4")
      .from(".hero-aside", { x: 30, opacity: 0, duration: 0.8 }, "-=0.6");

    document.querySelectorAll("section").forEach((sec) => {
      const targets = sec.querySelectorAll("h2, .section-sub");
      if (!targets.length) return;
      gsap.from(targets, {
        scrollTrigger: { trigger: sec, start: "top 82%" },
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
      });
    });
  }

  // ---------- Three.js hero petals ----------
  const heroCanvas = document.getElementById("hero3d");
  if (heroCanvas && window.THREE && !reduced) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    function resizeThree() {
      const w = heroCanvas.clientWidth || heroCanvas.parentElement.clientWidth;
      const h = heroCanvas.clientHeight || heroCanvas.parentElement.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    resizeThree();
    window.addEventListener("resize", resizeThree);

    // petal texture
    const texCanvas = document.createElement("canvas");
    texCanvas.width = 64;
    texCanvas.height = 64;
    const tctx = texCanvas.getContext("2d");
    const grad = tctx.createRadialGradient(32, 28, 2, 32, 32, 28);
    grad.addColorStop(0, "rgba(227,59,106,0.95)");
    grad.addColorStop(1, "rgba(227,59,106,0.0)");
    tctx.fillStyle = grad;
    tctx.beginPath();
    tctx.ellipse(32, 32, 16, 28, 0, 0, Math.PI * 2);
    tctx.fill();
    const petalTex = new THREE.CanvasTexture(texCanvas);

    const petals = [];
    for (let i = 0; i < 24; i++) {
      const mat = new THREE.SpriteMaterial({ map: petalTex, transparent: true, opacity: 0.32, depthWrite: false });
      const sp = new THREE.Sprite(mat);
      sp.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 8);
      const s = 0.5 + Math.random() * 0.9;
      sp.scale.set(s, s, 1);
      scene.add(sp);
      petals.push({ sp, speed: 0.003 + Math.random() * 0.005, drift: Math.random() * Math.PI * 2 });
    }

    const ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambient);

    let rafId = null;
    function loop() {
      rafId = requestAnimationFrame(loop);
      petals.forEach((o) => {
        o.sp.position.y += o.speed;
        o.sp.position.x += Math.sin(o.drift) * 0.0025;
        o.drift += 0.012;
        if (o.sp.position.y > 5.5) {
          o.sp.position.y = -5.5;
          o.sp.position.x = (Math.random() - 0.5) * 14;
        }
      });
      renderer.render(scene, camera);
    }
    loop();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!rafId) {
        loop();
      }
    });
  }

  // ---------- tsParticles (program section) ----------
  const particlesEl = document.getElementById("particles-program");
  if (particlesEl && window.tsParticles && !reduced) {
    tsParticles.load("particles-program", {
      fullScreen: { enable: false },
      fpsLimit: 45,
      particles: {
        number: { value: 28, density: { enable: true, area: 800 } },
        color: { value: ["#cc785c", "#5db8a6", "#e8a55a", "#8e8b82"] },
        shape: { type: "circle" },
        opacity: { value: { min: 0.15, max: 0.45 } },
        size: { value: { min: 1, max: 3 } },
        move: { enable: true, speed: 0.5, direction: "top", outModes: "out" },
      },
      background: { color: "transparent" },
      detectRetina: true,
    });
  }

  // ---------- Canvas 2D petals (tickets section) ----------
  const petalsCanvas = document.getElementById("petals-canvas");
  if (petalsCanvas && !reduced) {
    const ctx = petalsCanvas.getContext("2d");
    let petals = [];
    function resizePetals() {
      petalsCanvas.width = petalsCanvas.clientWidth;
      petalsCanvas.height = petalsCanvas.clientHeight;
      petals = [];
      for (let i = 0; i < 20; i++) {
        petals.push({
          x: Math.random() * petalsCanvas.width,
          y: Math.random() * petalsCanvas.height,
          r: 4 + Math.random() * 6,
          speed: 0.3 + Math.random() * 0.7,
          angle: Math.random() * Math.PI * 2,
          rot: (Math.random() - 0.5) * 0.02,
          alpha: 0.12 + Math.random() * 0.18,
        });
      }
    }
    resizePetals();
    window.addEventListener("resize", resizePetals);

    let petalsRaf = null;
    function drawPetals() {
      ctx.clearRect(0, 0, petalsCanvas.width, petalsCanvas.height);
      petals.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = "#cc785c";
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 1.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        p.y -= p.speed;
        p.angle += p.rot;
        if (p.y < -20) {
          p.y = petalsCanvas.height + 20;
          p.x = Math.random() * petalsCanvas.width;
        }
      });
      petalsRaf = requestAnimationFrame(drawPetals);
    }
    drawPetals();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (petalsRaf) cancelAnimationFrame(petalsRaf);
        petalsRaf = null;
      } else if (!petalsRaf) {
        drawPetals();
      }
    });
  }

  // ---------- Lottie (footer flower) ----------
  const lottieEl = document.getElementById("lottie-flower");
  if (lottieEl && window.lottie && !reduced) {
    const animData = {
      v: "5.7.4",
      fr: 30,
      ip: 0,
      op: 60,
      w: 48,
      h: 48,
      nm: "bloom",
      ddd: 0,
      assets: [],
      layers: [
        {
          ddd: 0,
          ind: 1,
          ty: 4,
          nm: "petal",
          sr: 1,
          ks: {
            o: { a: 0, k: 100 },
            r: { a: 0, k: 0 },
            p: { a: 0, k: [24, 24, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: {
              a: 1,
              k: [
                { i: { x: [0.833, 0.833], y: [0.833, 0.833] }, o: { x: [0.167, 0.167], y: [0.167, 0.167] }, t: 0, s: [90, 90, 100] },
                { t: 30, s: [135, 135, 100] },
                { t: 60, s: [90, 90, 100] },
              ],
            },
          },
          ao: 0,
          shapes: [
            {
              ty: "gr",
              it: [
                { d: 1, ty: "el", s: { a: 0, k: [22, 22] }, p: { a: 0, k: [0, 0] } },
                { ty: "fl", c: { a: 0, k: [0.8, 0.47, 0.36, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0, nm: "Fill", hd: false },
              ],
              nm: "Ellipse",
              np: 2,
              cix: 2,
              bm: 0,
              ix: 1,
              mn: "ADBE Vector Group",
              hd: false,
            },
          ],
          ip: 0,
          op: 60,
          st: 0,
          bm: 0,
        },
      ],
    };
    lottie.loadAnimation({
      container: lottieEl,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: animData,
    });
  }
})();
