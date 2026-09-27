// Builds the downloadable PDF for a Machine Audit: machine details, the
// checklist, observation points with their photos, every in-charge's note,
// photo and signature, and the machine's audit history. jsPDF is loaded on
// demand so it only costs bytes when someone actually downloads a report.
import { rasterize } from './violationPdf';

const INDIGO = [67, 56, 202];
const SLATE = [15, 23, 42];
const MUTED = [100, 116, 139];
const LINE = [226, 232, 240];
const HEAD_FILL = [238, 242, 255];
const CHECK_COLOR = { Yes: [22, 163, 74], No: [220, 38, 38], 'N/A': MUTED };

const STATUS_LABELS = {
  pending_incharge: 'With In-charges',
  ready_to_close: 'Ready to Close',
  closed: 'Closed',
};

const dt = (iso) => (iso ? new Date(iso).toLocaleString() : '');
const d = (iso) => (iso ? new Date(iso).toLocaleDateString() : '');

/**
 * @param audit     the full audit record
 * @param roles     [{ key, label }] — the in-charge sign-off roles, in order
 * @param nameOf    key → in-charge name
 * @param history   every audit of this machine, latest first
 */
export async function downloadMachineAuditPdf(audit, { roles, nameOf, history }) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 0;

  const ensure = (needed) => {
    if (y + needed > pageH - 18) {
      doc.addPage();
      y = margin;
    }
  };

  const section = (title) => {
    ensure(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...INDIGO);
    doc.text(title.toUpperCase(), margin, y);
    doc.setDrawColor(...INDIGO);
    doc.setLineWidth(0.4);
    doc.line(margin, y + 1.6, pageW - margin, y + 1.6);
    y += 8;
  };

  const row = (label, value) => {
    if (value === null || value === undefined || value === '') return;
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(String(value), contentW - 52);
    ensure(lines.length * 5 + 3);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SLATE);
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(lines, margin + 52, y);
    y += lines.length * 5 + 1.5;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(margin, y - 2.4, pageW - margin, y - 2.4);
  };

  // Simple wrapped-text table; `colorOf(rowIdx, colIdx)` may tint a cell's text.
  const table = (headers, widths, rows, colorOf) => {
    const pad = 1.8;
    const lineH = 4.4;
    const drawHead = () => {
      doc.setFillColor(...HEAD_FILL);
      doc.rect(margin, y, contentW, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...SLATE);
      let x = margin;
      headers.forEach((h, i) => { doc.text(h, x + pad, y + 4.8); x += widths[i]; });
      y += 7;
    };
    ensure(16);
    drawHead();
    rows.forEach((cells, r) => {
      doc.setFontSize(9);
      const wrapped = cells.map((c, i) => doc.splitTextToSize(String(c ?? '—'), widths[i] - pad * 2));
      const h = Math.max(...wrapped.map((l) => l.length)) * lineH + pad * 2;
      if (y + h > pageH - 18) {
        doc.addPage();
        y = margin;
        drawHead();
      }
      let x = margin;
      wrapped.forEach((lines, i) => {
        const color = colorOf?.(r, i);
        doc.setFont('helvetica', color ? 'bold' : 'normal');
        doc.setTextColor(...(color || SLATE));
        doc.text(lines, x + pad, y + pad + 3.2);
        x += widths[i];
      });
      y += h;
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageW - margin, y);
    });
    y += 6;
  };

  // Images laid out `cols` per row, each fitted into a box with a label above and a caption below.
  const imageGrid = async (items, cols, boxH) => {
    const gap = 6;
    const colW = (contentW - gap * (cols - 1)) / cols;
    const loaded = await Promise.all(items.map((it) => (it.src ? rasterize(it.src) : null)));
    for (let start = 0; start < items.length; start += cols) {
      ensure(boxH + 18);
      const top = y;
      items.slice(start, start + cols).forEach((it, j) => {
        const img = loaded[start + j];
        const x = margin + j * (colW + gap);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...SLATE);
        doc.text(doc.splitTextToSize(it.label, colW)[0], x, top);
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.3);
        doc.rect(x, top + 2, colW, boxH);
        if (img) {
          const ratio = Math.min((colW - 2) / img.w, (boxH - 2) / img.h);
          const w = img.w * ratio;
          const h = img.h * ratio;
          doc.addImage(img.data, img.format, x + (colW - w) / 2, top + 2 + (boxH - h) / 2, w, h);
        } else {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9);
          doc.setTextColor(...MUTED);
          doc.text(it.empty || 'Not available', x + colW / 2, top + 2 + boxH / 2, { align: 'center' });
        }
        if (it.caption) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(...MUTED);
          doc.text(doc.splitTextToSize(it.caption, colW)[0], x, top + boxH + 6);
        }
      });
      y = top + boxH + 12;
    }
  };

  // Header band
  doc.setFillColor(...INDIGO);
  doc.rect(0, 0, pageW, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ONLINE AUDIT — MACHINE', margin, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(`${audit.audit_no}   |   ${STATUS_LABELS[audit.status] || audit.status}`, margin, 20);
  y = 36;

  section('Machine information');
  row('Audit No', audit.audit_no);
  row('Status', STATUS_LABELS[audit.status] || audit.status);
  row('Machine name', audit.machine_name);
  row('Machine ID', audit.machine_id);
  row('Department', audit.department);
  row('Location', audit.location);
  row('Audit date', d(audit.audit_date));
  row('Safety Officer', `${audit.officer.name} (${audit.officer.employee_id})`);
  row('Submitted on', dt(audit.created_at));
  y += 3;

  section('Safety checklist');
  table(
    ['No', 'Checklist Item', 'Status', 'Remarks'],
    [12, 66, 20, contentW - 98],
    audit.checklist.map((r, i) => [i + 1, r.item, r.status, r.remarks || '—']),
    (r, c) => (c === 2 ? CHECK_COLOR[audit.checklist[r].status] : null),
  );

  section('Overall observation');
  const points = audit.checklist.filter((r) => r.status === 'No');
  doc.setFontSize(10);
  const obsLines = points.length
    ? points.map((p, i) => `${i + 1}. ${p.item} — Not complied.${p.remarks ? ` Remarks: ${p.remarks}` : ''}`)
    : ['No non-compliance — every checklist item is Yes or N/A.'];
  if (audit.notes) obsLines.push('', `Additional notes: ${audit.notes}`);
  obsLines.forEach((line) => {
    const wrapped = line ? doc.splitTextToSize(line, contentW) : [''];
    ensure(wrapped.length * 5 + 1);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 5 + 1;
  });
  y += 4;

  if (points.some((p) => p.photo_url)) {
    section('Observation photos');
    await imageGrid(
      points.map((p, i) => ({ label: `${i + 1}. ${p.item}`, src: p.photo_url, caption: p.remarks })),
      2,
      58,
    );
  }

  section('Sign-off progress');
  table(
    ['Role', 'Name', 'Status', 'Date', 'Note'],
    [36, 32, 22, 30, contentW - 120],
    [
      ['Safety Officer (Submit)', audit.officer.name, 'Submitted', dt(audit.created_at), '—'],
      ...roles.map(({ key, label }) => {
        const s = audit.signoffs[key];
        return [label, nameOf(key), s.status === 'completed' ? 'Completed' : 'Pending', dt(s.completed_at) || '—', s.note || '—'];
      }),
      ['Safety Officer (Close)', audit.officer.name, audit.status === 'closed' ? 'Closed' : 'Pending', dt(audit.closed_at) || '—', audit.closure_note || '—'],
    ],
  );

  const actionPhotos = roles.filter(({ key }) => audit.signoffs[key].photo_url);
  if (actionPhotos.length) {
    section('In-charge action photos');
    await imageGrid(
      actionPhotos.map(({ key, label }) => ({ label, src: audit.signoffs[key].photo_url, caption: nameOf(key) })),
      3,
      40,
    );
  }

  section('Signatures');
  await imageGrid(
    [
      { label: 'Safety Officer', src: audit.officer_signature, caption: audit.officer.name, empty: 'Not signed' },
      ...roles.map(({ key, label }) => ({
        label,
        src: audit.signoffs[key].signature_data,
        caption: nameOf(key),
        empty: audit.signoffs[key].status === 'completed' ? 'Not signed' : 'Pending',
      })),
    ],
    2,
    30,
  );

  if (history?.length) {
    section(`Audit history — ${audit.machine_name}`);
    table(
      ['Date', 'Audit No', 'Safety Officer', 'Non-compliance', 'Status'],
      [24, 34, 34, contentW - 122, 30],
      history.map((h) => {
        const no = h.checklist.filter((r) => r.status === 'No').map((r) => r.item);
        return [d(h.created_at), `${h.audit_no}${h.id === audit.id ? ' (this)' : ''}`, h.officer.name, no.length ? no.join(', ') : 'All OK', STATUS_LABELS[h.status]];
      }),
    );
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

  doc.save(`${audit.audit_no}.pdf`);
}
