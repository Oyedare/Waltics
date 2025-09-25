export async function downloadElementAsPng(
  element: HTMLElement,
  filename: string = "export.png",
  options?: {
    watermarkText?: string;
    watermarkImageUrl?: string;
    watermarkOpacity?: number;
  }
) {
  console.log(`Starting download for: ${filename}`);
  console.log(
    `Element dimensions: ${element.getBoundingClientRect().width}x${
      element.getBoundingClientRect().height
    }`
  );

  const svgChild = (element.querySelector &&
    element.querySelector("svg")) as SVGSVGElement | null;
  if (svgChild) {
    console.log("Found SVG child, using SVG export method");
    try {
      await exportSvgElementToPng(
        svgChild,
        filename,
        options?.watermarkText ?? "SUIHUB AFRICA",
        options?.watermarkImageUrl ?? "/suihub-logo.jpg",
        options?.watermarkOpacity ?? 0.12
      );
      return;
    } catch (error) {
      console.warn(
        "SVG export failed, falling back to foreignObject approach:",
        error
      );
      // fall back to foreignObject approach
    }
  } else {
    console.log("No SVG child found, using foreignObject approach");
  }

  const rect = element.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);
  const watermarkText = options?.watermarkText ?? "SUIHUB AFRICA";
  const watermarkImageUrl = options?.watermarkImageUrl ?? "/suihub-logo.jpg";
  const watermarkOpacity = options?.watermarkOpacity ?? 0.12;

  console.log(
    `Using foreignObject approach with dimensions: ${width}x${height}`
  );

  // Clone the node to avoid layout shifts
  const clone = element.cloneNode(true) as HTMLElement;
  // Ensure background matches current theme
  const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
  clone.style.background = bg;
  clone.style.width = width + "px";
  clone.style.height = height + "px";

  // Wrap clone in a container to render via foreignObject
  const xmlns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttribute("xmlns", xmlns);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const foreign = document.createElementNS(xmlns, "foreignObject");
  foreign.setAttribute("x", "0");
  foreign.setAttribute("y", "0");
  foreign.setAttribute("width", String(width));
  foreign.setAttribute("height", String(height));

  // Container for clone with proper XML namespace
  const container = document.createElement("div");
  container.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  container.style.width = width + "px";
  container.style.height = height + "px";
  container.style.background = bg;
  container.appendChild(clone);
  foreign.appendChild(container);
  svg.appendChild(foreign);

  // Serialize SVG
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  // Draw to canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(url);
    throw new Error("Canvas context not available");
  }

  const bgImg = new Image();
  bgImg.crossOrigin = "anonymous";
  const elImg = new Image();
  elImg.crossOrigin = "anonymous";

  // Prepare promises
  const loadElementImage = new Promise<void>((resolve, reject) => {
    elImg.onload = () => resolve();
    elImg.onerror = reject;
    elImg.src = url;
  });

  // Try load watermark image (optional)
  const loadWatermarkImage = new Promise<HTMLImageElement | null>((resolve) => {
    if (!watermarkImageUrl) return resolve(null);
    const wm = new Image();
    wm.crossOrigin = "anonymous";
    wm.onload = () => resolve(wm);
    wm.onerror = () => resolve(null);
    wm.src = watermarkImageUrl;
  });

  await Promise.all([loadElementImage]);
  URL.revokeObjectURL(url);

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const wmImg = await loadWatermarkImage;
  if (wmImg) {
    // Draw watermark centered, behind data, with opacity
    const maxW = Math.floor(width * 0.6);
    const maxH = Math.floor(height * 0.6);
    const scale = Math.min(maxW / wmImg.width, maxH / wmImg.height, 1);
    const w = Math.floor(wmImg.width * scale);
    const h = Math.floor(wmImg.height * scale);
    const x = Math.floor((width - w) / 2);
    const y = Math.floor((height - h) / 2);

    ctx.save();
    ctx.globalAlpha = watermarkOpacity; // subtle
    ctx.drawImage(wmImg, x, y, w, h);
    ctx.restore();
  }

  // Foreground: the rendered element
  ctx.drawImage(elImg, 0, 0);

  // Fallback text watermark (only if no image)
  if (!wmImg) {
    const pad = 12;
    ctx.save();
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = getReadableTextColor(bg);
    ctx.font = `600 12px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"`;
    const text = watermarkText;
    const metrics = ctx.measureText(text);
    const tw = Math.ceil(metrics.width);
    const th = 16;
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = getContrastingOverlay(bg);
    ctx.fillRect(
      width - tw - pad * 2,
      height - th - pad * 1.5,
      tw + pad * 2,
      th + pad * 0.75
    );
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = getReadableTextColor(bg);
    ctx.fillText(text, width - tw - pad * 1.5, height - pad * 0.75);
    ctx.restore();
  }

  // Download
  const a = document.createElement("a");
  a.download = filename;
  try {
    a.href = canvas.toDataURL("image/png");
    a.click();
  } catch (e) {
    console.warn("Canvas tainted, attempting fallback method:", e);
    // If the canvas is tainted (foreignObject + external resources), try exporting any nested SVG directly
    const fallbackSvg = (element.querySelector &&
      element.querySelector("svg")) as SVGSVGElement | null;
    if (fallbackSvg) {
      console.log("Using SVG fallback for:", filename);
      await exportSvgElementToPng(
        fallbackSvg,
        filename,
        watermarkText,
        watermarkImageUrl,
        watermarkOpacity
      );
      return;
    }
    console.error("Download failed, no fallback available:", e);
    throw e;
  }
}

function getReadableTextColor(bg: string): string {
  // Parse rgb(a)
  const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return "#0a0a0a";
  const r = parseInt(m[1], 10),
    g = parseInt(m[2], 10),
    b = parseInt(m[3], 10);
  // Perceived luminance
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L > 0.6 ? "#0a0a0a" : "#ffffff";
}

function getContrastingOverlay(bg: string): string {
  const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return "#000000";
  const r = parseInt(m[1], 10),
    g = parseInt(m[2], 10),
    b = parseInt(m[3], 10);
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L > 0.6 ? "#000000" : "#ffffff";
}

async function exportSvgElementToPng(
  svgEl: SVGSVGElement,
  filename: string,
  watermarkText: string,
  watermarkImageUrl: string,
  watermarkOpacity: number
) {
  const bbox = svgEl.getBoundingClientRect();
  const width =
    Math.ceil(bbox.width) ||
    parseInt(svgEl.getAttribute("width") || "0", 10) ||
    800;
  const height =
    Math.ceil(bbox.height) ||
    parseInt(svgEl.getAttribute("height") || "0", 10) ||
    400;
  const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";

  const cloned = svgEl.cloneNode(true) as SVGSVGElement;
  cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  cloned.setAttribute("width", String(width));
  cloned.setAttribute("height", String(height));
  cloned.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", "0");
  rect.setAttribute("y", "0");
  rect.setAttribute("width", String(width));
  rect.setAttribute("height", String(height));
  rect.setAttribute("fill", bg);
  cloned.insertBefore(rect, cloned.firstChild);

  // Watermark image centered (if available)
  let usedImage = false;
  if (watermarkImageUrl) {
    const imgEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    imgEl.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      watermarkImageUrl
    );
    imgEl.setAttribute("opacity", String(watermarkOpacity));
    // Size to 60% of canvas, centered
    const maxW = Math.floor(width * 0.6);
    const maxH = Math.floor(height * 0.6);
    // Cannot know intrinsic size here; use max box and let renderer scale
    const x = Math.floor((width - maxW) / 2);
    const y = Math.floor((height - maxH) / 2);
    imgEl.setAttribute("x", String(x));
    imgEl.setAttribute("y", String(y));
    imgEl.setAttribute("width", String(maxW));
    imgEl.setAttribute("height", String(maxH));
    cloned.insertBefore(imgEl, cloned.firstChild?.nextSibling || null);
    usedImage = true;
  }

  if (!usedImage && watermarkText) {
    const textEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    textEl.textContent = watermarkText;
    textEl.setAttribute("font-size", "12");
    textEl.setAttribute("font-weight", "600");
    textEl.setAttribute("fill", getReadableTextColor(bg));
    textEl.setAttribute("opacity", "0.8");
    textEl.setAttribute("x", String(width - 12));
    textEl.setAttribute("y", String(height - 8));
    textEl.setAttribute("text-anchor", "end");
    cloned.appendChild(textEl);
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(cloned);
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = "anonymous";
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve();
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = url;
  });

  const a = document.createElement("a");
  a.download = filename.replace(/\.svg$/i, "").replace(/$/i, ".png");
  a.href = canvas.toDataURL("image/png");
  a.click();
}
