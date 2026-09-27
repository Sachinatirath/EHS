import { rasterize } from './recordPdf';

/** Generic list → .xlsx export. Each column is { header, width, value(row) }; when a
 * row has a photo the image is embedded as a thumbnail in the last column. */
export async function exportRecordsExcel({ sheetName, color = 'FF1D4ED8', columns, rows, photoKey = 'photo_url', photoHeader = 'Evidence Photo', filename }) {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);

  ws.columns = [
    ...columns.map((c, idx) => ({ header: c.header, key: `c${idx}`, width: c.width || 18 })),
    { header: photoHeader, key: 'photo', width: 22 },
  ];

  const header = ws.getRow(1);
  header.height = 22;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    cell.alignment = { vertical: 'middle' };
  });

  const photoCol = columns.length;
  for (let i = 0; i < rows.length; i += 1) {
    const r = rows[i];
    const values = Object.fromEntries(columns.map((c, idx) => [`c${idx}`, c.value(r) ?? '']));
    const row = ws.addRow({ ...values, photo: r[photoKey] ? '' : 'No photo' });
    row.alignment = { vertical: 'top', wrapText: true };
    if (r[photoKey]) {
      // eslint-disable-next-line no-await-in-loop
      const img = await rasterize(r[photoKey], { format: 'PNG', maxSide: 240 });
      if (img) {
        const id = wb.addImage({ base64: img.data, extension: 'png' });
        const ratio = Math.min(150 / img.w, 90 / img.h);
        row.height = 76;
        ws.addImage(id, {
          tl: { col: photoCol + 0.05, row: i + 1 + 0.08 },
          ext: { width: img.w * ratio, height: img.h * ratio },
        });
      }
    }
  }
  ws.views = [{ state: 'frozen', ySplit: 1 }];

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
