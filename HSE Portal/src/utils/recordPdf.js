// Generic single-record PDF: a coloured header, label/value sections,
// paragraphs and images (evidence photo, signature). jsPDF is loaded on demand.

const SLATE = [15, 23, 42];
const MUTED = [100, 116, 139];
const LINE = [226, 232, 240];

// jsPDF can't embed SVG (or every browser-specific type), so redraw any image
// onto a canvas and hand it a JPEG plus its natural size.
export function rasterize(src, { format = 'JPEG', maxSide } = {}) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth || 640;
      let h = img.naturalHeight || 420;
      if (maxSide && Math.max(w, h) > maxSide) {
        const k = maxSide / Math.max(w, h);
        w = Math.round(w * k);
        h = Math.round(h * k);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const mime = format === 'PNG' ? 'image/png' : 'image/jpeg';
      resolve({ data: canvas.toDataURL(mime, 0.92), format, w, h });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * config: { title, subtitle, color: [r,g,b], filename,
 *   sections: [{ title, rows: [[label, value]], paragraphs: [[label, text]],
 *                image: { label, src, maxW, maxH } }] }
 * Sections with an image keep their heading on the same page as the image.
 */
export async function downloadRecordPdf(config) {
  const { jsPDF } = await import('jspdf');
  const color = config.color || [29, 78, 216];
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 36;

  doc.setFillColor(...color);
  doc.rect(0, 0, pageW, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(config.title, margin, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(config.subtitle || '', margin, 20);

  const ensure = (needed) => {
    if (y + needed > pageH - 18) {
      doc.addPage();
      y = margin;
    }
  };

  const heading = (title) => {
    ensure(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...color);
    doc.text(title.toUpperCase(), margin, y);
    doc.setDrawColor(...color);
    doc.setLineWidth(0.4);
    doc.line(margin, y + 1.6, pageW - margin, y + 1.6);
    y += 8;
  };

  const row = (label, value, bold = false) => {
    if (value === null || value === undefined || value === '') return;
    doc.setFontSize(10);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(String(value), contentW - 52);
    ensure(lines.length * 5 + 3);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SLATE);
    doc.text(label, margin, y);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...SLATE);
    doc.text(lines, margin + 52, y);
    y += lines.length * 5 + 1.5;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(margin, y - 2.4, pageW - margin, y - 2.4);
  };

  const paragraph = (label, text, bold = false) => {
    if (!text) return;
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(String(text), contentW);
    ensure(8 + lines.length * 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SLATE);
    doc.text(label, margin, y);
    y += 5;
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...SLATE);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 3;
  };

  for (const s of config.sections) {
    const hasBody = s.rows?.some(([, v]) => v) || s.paragraphs?.some(([, v]) => v) || s.image?.src;
    if (!hasBody) continue;
    if (s.image?.src && !s.rows?.length && !s.paragraphs?.length) {
      const img = await rasterize(s.image.src);
      if (img) {
        const ratio = Math.min((s.image.maxW || contentW) / img.w, (s.image.maxH || 110) / img.h);
        const w = img.w * ratio;
        const h = img.h * ratio;
        ensure(h + 26);
        heading(s.title);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...SLATE);
        doc.text(s.image.label, margin, y);
        y += 3;
        doc.setDrawColor(...LINE);
        doc.rect(margin - 0.5, y - 0.5, w + 1, h + 1);
        doc.addImage(img.data, img.format, margin, y, w, h);
        y += h + 8;
      }
      continue;
    }
    heading(s.title);
    (s.rows || []).forEach(([l, v, b]) => row(l, v, b));
    (s.paragraphs || []).forEach(([l, v, b]) => paragraph(l, v, b));
    y += 3;
  }

  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(`Generated ${new Date().toLocaleString()}`, margin, pageH - 8);
    doc.text(`Page ${i} of ${pages}`, pageW - margin, pageH - 8, { align: 'right' });
  }

  doc.save(config.filename);
}
