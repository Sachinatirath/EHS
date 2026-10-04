// PDF / Excel / print output for the OHC module. jsPDF and ExcelJS are loaded
// on demand so they don't weigh down the first paint.

const BRAND = [31, 78, 158]; // --blue-600
const SLATE = [15, 23, 42];
const MUTED = [100, 116, 139];
const LINE = [226, 232, 240];

export const printPage = () => window.print();

const stamp = () => new Date().toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/**
 * blocks: [{ heading, kv: [[label, value]] } | { heading, columns: [..], rows: [[..]], widths?: [ratios] } | { heading, text }]
 */
export async function downloadPdf({ title, subtitle, filename, blocks, landscape = false }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: landscape ? 'landscape' : 'portrait' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = 0;

  const header = () => {
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, pageW, 24, 'F');
    doc.setFillColor(63, 163, 77);
    doc.rect(0, 24, pageW, 1.2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(title, margin, 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(subtitle || 'SafeNexG OHC — Digital Occupational Health Management', margin, 18);
    doc.text(`Generated ${stamp()}`, pageW - margin, 18, { align: 'right' });
    y = 34;
  };
  const ensure = (h) => {
    if (y + h > pageH - 16) {
      doc.addPage();
      header();
    }
  };
  const heading = (text) => {
    ensure(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...BRAND);
    doc.text(text.toUpperCase(), margin, y);
    doc.setDrawColor(...BRAND);
    doc.setLineWidth(0.35);
    doc.line(margin, y + 1.6, pageW - margin, y + 1.6);
    y += 7.5;
  };

  header();
  for (const b of blocks) {
    if (b.heading) heading(b.heading);
    if (b.kv) {
      const colW = contentW / 2;
      b.kv.forEach(([label, value], i) => {
        const col = i % 2;
        if (col === 0) ensure(10);
        const x = margin + col * colW;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text(String(label).toUpperCase(), x, y);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...SLATE);
        doc.text(doc.splitTextToSize(String(value ?? '—'), colW - 4)[0], x, y + 4.6);
        if (col === 1 || i === b.kv.length - 1) y += 10.5;
      });
      y += 2;
    }
    if (b.text) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...SLATE);
      const lines = doc.splitTextToSize(String(b.text), contentW);
      ensure(lines.length * 5 + 2);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 4;
    }
    if (b.columns) {
      const ratios = b.widths || b.columns.map(() => 1);
      const sum = ratios.reduce((s, r) => s + r, 0);
      const widths = ratios.map((r) => (r / sum) * contentW);
      const drawHead = () => {
        ensure(9);
        doc.setFillColor(241, 245, 252);
        doc.rect(margin, y - 4.6, contentW, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        let x = margin + 2;
        b.columns.forEach((c, i) => { doc.text(String(c).toUpperCase(), x, y); x += widths[i]; });
        y += 6;
      };
      drawHead();
      if (!b.rows.length) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text('No records.', margin + 2, y);
        y += 7;
      }
      b.rows.forEach((row) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.8);
        const cells = row.map((cell, i) => doc.splitTextToSize(String(cell ?? '—'), widths[i] - 3));
        const h = Math.max(...cells.map((c) => c.length)) * 4.2 + 2.2;
        if (y + h > pageH - 16) {
          doc.addPage();
          header();
          drawHead();
        }
        doc.setTextColor(...SLATE);
        let x = margin + 2;
        cells.forEach((c, i) => { doc.text(c, x, y); x += widths[i]; });
        y += h;
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.2);
        doc.line(margin, y - 3.4, pageW - margin, y - 3.4);
      });
      y += 4;
    }
  }

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p += 1) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('SafeNexG OHC • Confidential medical record', margin, pageH - 8);
    doc.text(`Page ${p} of ${pages}`, pageW - margin, pageH - 8, { align: 'right' });
  }
  doc.save(filename);
}

/** sheets: [{ name, columns: [{ header, width }], rows: [[..]] }] */
export async function downloadExcel({ filename, sheets }) {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SafeNexG OHC';
  sheets.forEach((s) => {
    const ws = wb.addWorksheet(s.name.slice(0, 31));
    ws.columns = s.columns.map((c, i) => ({ header: c.header, key: `c${i}`, width: c.width || 18 }));
    const head = ws.getRow(1);
    head.height = 22;
    head.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E9E' } };
      cell.alignment = { vertical: 'middle' };
    });
    s.rows.forEach((r) => {
      const row = ws.addRow(Object.fromEntries(r.map((v, i) => [`c${i}`, v ?? ''])));
      row.alignment = { vertical: 'top', wrapText: true };
    });
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: s.columns.length } };
  });
  const buffer = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
