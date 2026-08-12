const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "processadas");
const LONG_EDGE = 2048;
const TARGET_RATIO = 1365 / 2048; // padrão das fotos profissionais

const jobs = [
  {
    src: "20260705_131119.jpg.jpeg",
    out: "buffet-moranga-01.jpg",
    rotate: 2.4,
    // Moranga como herói; corta chão e parede
    crop: { left: 200, top: 380, width: 2550, height: 3400 },
  },
  {
    src: "20260705_131130.jpg.jpeg",
    out: "buffet-salada-01.jpg",
    rotate: -0.5,
    // Sem extensão, sem prato inferior, foco na salada
    crop: { left: 300, top: 1050, width: 2460, height: 2780 },
  },
  {
    src: "20260705_131132.jpg.jpeg",
    out: "buffet-salpicao-01.jpg",
    rotate: 1.0,
    // Salpicão centralizado; menos bagunça nas bordas
    crop: { left: 280, top: 780, width: 2480, height: 3000 },
  },
  {
    src: "20260705_131135.jpg.jpeg",
    out: "buffet-moranga-02.jpg",
    rotate: 1.8,
    // Remove chão; composição do conjunto
    crop: { left: 40, top: 360, width: 2620, height: 3400 },
  },
  {
    src: "20260705_131139.jpg.jpeg",
    out: "buffet-gratinado-01.jpg",
    rotate: 1.2,
    // Gratinado como herói; corta panela e parede alta
    crop: { left: 420, top: 980, width: 2300, height: 2900 },
  },
  {
    src: "20260705_131156.jpg.jpeg",
    out: "buffet-massa-01.jpg",
    rotate: 0.6,
    // Massa central; reduz pilha de pratos e talheres
    crop: { left: 480, top: 620, width: 2200, height: 2860 },
  },
];

function fitRatio(left, top, width, height, maxW, maxH) {
  let l = left,
    t = top,
    w = width,
    h = height;
  const ratio = w / h;
  if (ratio > TARGET_RATIO + 0.01) {
    const newW = Math.round(h * TARGET_RATIO);
    l += Math.floor((w - newW) / 2);
    w = newW;
  } else if (ratio < TARGET_RATIO - 0.01) {
    const newH = Math.round(w / TARGET_RATIO);
    t += Math.floor((h - newH) / 2);
    h = newH;
  }
  l = Math.max(0, Math.min(l, maxW - 8));
  t = Math.max(0, Math.min(t, maxH - 8));
  w = Math.min(w, maxW - l);
  h = Math.min(h, maxH - t);
  return { left: l, top: t, width: w, height: h };
}

async function makeVignette(width, height) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="v" cx="50%" cy="40%" r="78%">
          <stop offset="45%" stop-color="#fff6e8" stop-opacity="0"/>
          <stop offset="100%" stop-color="#2a180c" stop-opacity="0.42"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#v)"/>
    </svg>`;
  return Buffer.from(svg);
}

async function processOne(job) {
  const input = path.join(__dirname, job.src);

  // Orienta EXIF + endireita
  let base = sharp(input).rotate();
  if (job.rotate) {
    base = base.rotate(job.rotate, { background: "#1a120c" });
  }

  const { data, info } = await base
    .toColourspace("srgb")
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const crop = fitRatio(
    job.crop.left,
    job.crop.top,
    job.crop.width,
    job.crop.height,
    info.width,
    info.height
  );

  // Recorte
  const croppedBuf = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .extract(crop)
    .jpeg({ quality: 98 })
    .toBuffer();

  // Grade: quente/âmbar estilo casamento, contraste, menos azul frio
  const graded = await sharp(croppedBuf)
    .median(3) // reduz ruído de celular
    .linear(1.14, -12) // contraste
    .modulate({ brightness: 1.03, saturation: 1.18, hue: -4 })
    .gamma(1.08)
    .recomb([
      [1.06, 0.035, 0.0],
      [0.015, 1.01, 0.0],
      [0.0, 0.0, 0.9],
    ])
    // recupera um pouco de highlight estourado
    .linear([1, 1, 1], [0, 0, 0])
    .sharpen({ sigma: 1.0, m1: 0.7, m2: 0.35 })
    .jpeg({ quality: 96 })
    .toBuffer();

  const meta = await sharp(graded).metadata();
  const vignette = await makeVignette(meta.width, meta.height);

  const withLook = await sharp(graded)
    .composite([{ input: vignette, blend: "multiply" }])
    .jpeg({ quality: 95 })
    .toBuffer();

  const m2 = await sharp(withLook).metadata();
  const scale =
    m2.width >= m2.height ? LONG_EDGE / m2.width : LONG_EDGE / m2.height;

  await sharp(withLook)
    .resize(Math.round(m2.width * scale), Math.round(m2.height * scale), {
      kernel: sharp.kernel.lanczos3,
    })
    .sharpen({ sigma: 0.55, m1: 0.45, m2: 0.25 })
    .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(path.join(OUT_DIR, job.out));

  const outMeta = await sharp(path.join(OUT_DIR, job.out)).metadata();
  console.log(
    `OK  ${job.out}  ${outMeta.width}x${outMeta.height}  ${(
      fs.statSync(path.join(OUT_DIR, job.out)).size / 1024
    ).toFixed(0)}KB`
  );
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const job of jobs) {
    try {
      await processOne(job);
    } catch (err) {
      console.error(`FAIL ${job.src}:`, err.stack || err.message);
    }
  }
})();
