import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";

const outDir = "images";
await mkdir(outDir, { recursive: true });

// Apenas fotos do casamento (Sheyla e Pedro). Novas fotos entram depois.
const jobs = [
  {
    src: "Sheyla e Pedro-301.jpg",
    name: "hero",
    width: 1600,
    height: 2000,
    fit: "cover",
  },
  {
    src: "Sheyla e Pedro-304.jpg",
    name: "sobre",
    width: 1200,
    height: 1500,
    fit: "cover",
  },
  {
    src: "Sheyla e Pedro-920.jpg",
    name: "servico-1",
    width: 900,
    height: 1100,
    fit: "cover",
  },
  {
    src: "Sheyla e Pedro-922.jpg",
    name: "servico-2",
    width: 900,
    height: 1100,
    fit: "cover",
  },
  {
    src: "Sheyla e Pedro-925.jpg",
    name: "servico-3",
    width: 900,
    height: 1100,
    fit: "cover",
  },
  {
    src: "Sheyla e Pedro-303.jpg",
    name: "cta",
    width: 1600,
    height: 1000,
    fit: "cover",
  },
];

for (const job of jobs) {
  const webp = path.join(outDir, `${job.name}.webp`);
  const jpg = path.join(outDir, `${job.name}.jpg`);

  await sharp(job.src)
    .rotate()
    .resize(job.width, job.height, { fit: job.fit, position: "centre" })
    .webp({ quality: 78 })
    .toFile(webp);

  await sharp(job.src)
    .rotate()
    .resize(job.width, job.height, { fit: job.fit, position: "centre" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(jpg);

  console.log("ok", job.name);
}
