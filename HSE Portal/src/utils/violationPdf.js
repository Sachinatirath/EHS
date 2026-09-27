// Builds the downloadable PDF for a Safety Violation: every submitted field,
// the review trail, and the evidence photo + signature. jsPDF is loaded on
// demand so it only costs bytes when someone actually downloads a report.

const RED = [185, 28, 28];
const SLATE = [15, 23, 42];
const MUTED = [100, 116, 139];
const LINE = [226, 232, 240];

const STATUS_LABELS = {
  open: 'Open',
  under_review: 'Reassigned to Agent',
  closed: 'Closed',
  rejected: 'Rejected',
};

const dt = (iso) => (iso ? new Date(iso).toLocaleString() : '');
const d = (iso) => (iso ? new Date(iso).toLocaleDateString() : '');

// jsPDF can't embed SVG (or every browser-specific type), so redraw any image
// onto a canvas and hand it a PNG/JPEG plus its natural size.
export function rasterize(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || 640;
      const h = img.naturalHeight || 420;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve({ data: canvas.toDataURL('image/jpeg', 0.92), format: 'JPEG', w, h });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function downloadViolationPdf(v, hodName) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 0;

  const drawHeader = () => {
    doc.setFillColor(...RED);
    doc.rect(0, 0, pageW, 26, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SAFETY VIOLATION NOTICE', margin, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.text(`${v.violation_no}   |   ${STATUS_LABELS[v.status] || v.status}`, margin, 20);
    y = 36;
  };

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
    doc.setTextColor(...RED);
    doc.text(title.toUpperCase(), margin, y);
    doc.setDrawColor(...RED);
    doc.setLineWidth(0.4);
    doc.line(margin, y + 1.6, pageW - margin, y + 1.6);
    y += 8;
  };

  const row = (label, value, bold = false) => {
    if (value === null || value === undefined || value === '') return;
    doc.setFontSize(10);
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

  const paragraph = (label, text) => {
    if (!text) return;
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(String(text), contentW);
    ensure(8 + lines.length * 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SLATE);
    doc.text(label, margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 3;
  };

  const image = async (label, src, maxW, maxH, sectionTitle) => {
    const img = await rasterize(src);
    if (!img) return;
    const ratio = Math.min(maxW / img.w, maxH / img.h);
    const w = img.w * ratio;
    const h = img.h * ratio;
    // Keep the section heading on the same page as its image.
    ensure(h + 12 + (sectionTitle ? 14 : 0));
    if (sectionTitle) section(sectionTitle);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...SLATE);
    doc.text(label, margin, y);
    y += 3;
    doc.setDrawColor(...LINE);
    doc.rect(margin - 0.5, y - 0.5, w + 1, h + 1);
    doc.addImage(img.data, img.format, margin, y, w, h);
    y += h + 8;
  };

  drawHeader();

  section('Violation details');
  row('Violation No', v.violation_no);
  row('Status', STATUS_LABELS[v.status] || v.status);
  row('Filed on', dt(v.created_at));
  row('Violation date', d(v.violation_date));
  row('Reported by', v.agent ? `${v.agent.name} (${v.agent.employee_id})` : '');
  row('Department', v.department);
  row('Assigned HOD', hodName);
  row('Company / Contractor', v.company);
  row('Supervisor', v.supervisor);
  row('Employee', v.employee_name ? `${v.employee_name}${v.employee_code ? ` (${v.employee_code})` : ''}` : '');
  row('Job title', v.job_title);
  row('Violation type', v.violation_type);
  row('Offence', v.offence);
  row('Corrective actions', v.corrective_actions?.join(', '));
  y += 3;

  if (v.description || v.explanation) {
    section('Description');
    paragraph('Violation description', v.description);
    paragraph('Employee explanation', v.explanation);
  }

  section('Progress');
  row('Submitted by agent', dt(v.created_at));
  row(v.status === 'rejected' ? 'Rejected by HOD' : 'Reviewed by HOD', v.status === 'open' ? 'Waiting for HOD review' : dt(v.reviewed_at));
  if (v.status !== 'open') row('HOD remarks', v.resolution_note, true);
  if (v.status === 'closed') {
    row('Closed by agent', dt(v.closed_at));
    row('Closure note', v.closure_note, true);
  } else if (v.status === 'under_review') {
    row('Closure', 'Waiting for agent to close');
  }
  y += 3;

  if (v.photo_url) {
    await image('Photo attached by agent', v.photo_url, contentW, 110, 'Evidence');
  }
  if (v.employee_signature_data) {
    const colW = contentW / 2 - 4;
    const employeeSig = await rasterize(v.employee_signature_data);
    ensure(58);
    section('Signatures');
    const top = y;
    const draw = (img, label, name, x) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...SLATE);
      doc.text(label, x, top);
      if (img) {
        const ratio = Math.min(colW / img.w, 34 / img.h);
        const w = img.w * ratio;
        const h = img.h * ratio;
        doc.setDrawColor(...LINE);
        doc.rect(x - 0.5, top + 2.5, colW + 1, 36);
        doc.addImage(img.data, img.format, x + (colW - w) / 2, top + 3.5 + (34 - h) / 2, w, h);
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...MUTED);
        doc.text('Not signed', x, top + 10);
      }
      if (name) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...SLATE);
        doc.text(name, x, top + 44);
      }
    };
    draw(employeeSig, 'Employee signature', v.employee_name, margin);
    y = top + 50;
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

  doc.save(`${v.violation_no}.pdf`);
}
