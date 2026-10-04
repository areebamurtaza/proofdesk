// filepath: src/lib/watermark.ts
import sharp from "sharp";

/**
 * Permanently burns an indelible proofing watermark into an image buffer using Sharp.
 * Guarantees that unpaid reviewers inspecting the Network tab, opening the asset URL,
 * or downloading the response only ever receive watermarked pixels.
 *
 * Ensures the actual artwork remains completely visible underneath transparent
 * watermark tiles and a security banner, but makes the image completely unsuitable
 * for production/commercial usage without paying.
 */
export async function burnWatermark(inputBuffer: Buffer): Promise<Buffer> {
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  const origWidth = metadata.width || 1600;
  const origHeight = metadata.height || 1000;

  // 1. Constrain resolution for preview (max 1600px) so raw master resolution is never on the wire
  const maxDim = 1600;
  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (origWidth > maxDim || origHeight > maxDim) {
    if (origWidth >= origHeight) {
      targetWidth = maxDim;
      targetHeight = Math.round((origHeight * maxDim) / origWidth);
    } else {
      targetHeight = maxDim;
      targetWidth = Math.round((origWidth * maxDim) / origHeight);
    }
  }

  // First resize the image buffer to target dimensions
  const resizedBuffer = await image
    .resize(targetWidth, targetHeight, { fit: "inside", withoutEnlargement: true })
    .toBuffer();

  const resizedMeta = await sharp(resizedBuffer).metadata();
  const width = resizedMeta.width || targetWidth;
  const height = resizedMeta.height || targetHeight;

  // 2. Build SVG overlay matching the EXACT dimensions of the resized image
  const diagonal = Math.sqrt(width * width + height * height);
  const stepX = Math.max(260, Math.round(width * 0.22));
  const stepY = Math.max(100, Math.round(height * 0.12));
  const fontSize = Math.max(16, Math.min(28, Math.round(width * 0.018)));
  const bannerHeight = Math.max(38, Math.round(height * 0.055));
  const bannerFontSize = Math.max(12, Math.round(bannerHeight * 0.4));

  let textElements = "";
  for (let y = -diagonal; y < diagonal; y += stepY) {
    for (let x = -diagonal; x < diagonal; x += stepX) {
      textElements += `
        <text x="${x}" y="${y}" fill="rgba(0,0,0,0.45)" stroke="rgba(0,0,0,0.6)" stroke-width="2" font-size="${fontSize}" font-family="monospace" font-weight="900" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
        <text x="${x}" y="${y}" fill="rgba(255,255,255,0.65)" font-size="${fontSize}" font-family="monospace" font-weight="900" text-anchor="middle">PROOFDESK • UNPAID PREVIEW</text>
      `;
    }
  }

  const svgWatermark = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Repeating diagonal tiled watermark -->
      <g transform="translate(${width / 2}, ${height / 2}) rotate(-28)">
        ${textElements}
      </g>
      <!-- Center Security Banner -->
      <rect x="0" y="${height / 2 - bannerHeight / 2}" width="${width}" height="${bannerHeight}" fill="#0B1628" fill-opacity="0.88" stroke="#D7C3A5" stroke-width="1.5" />
      <text x="${width / 2}" y="${height / 2 + bannerFontSize * 0.35}" fill="#D7C3A5" font-size="${bannerFontSize}" font-family="monospace" font-weight="bold" text-anchor="middle" letter-spacing="1.5">
        ESCROW LOCKED • UNPAID DRAFT • UNAUTHORIZED FOR PRODUCTION
      </text>
    </svg>
  `;

  // 3. Composite the watermark overlay onto the resized artwork and output lossy JPEG
  return sharp(resizedBuffer)
    .composite([
      {
        input: Buffer.from(svgWatermark),
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 80 })
    .toBuffer();
}
