import { jsPDF } from 'jspdf'; // generador de PDF en el navegador
import autoTable from 'jspdf-autotable'; // dibuja tablas con paginación automática

function sanitizeText(text) {
  if (!text) return '';
  return String(text)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=');
}

// Exporta una tabla a PDF.
// columns: [{ label, getText }]  rows: lista de filas  fileName: nombre sin extensión
export function exportTableToPdf({ title, subtitle, columns, rows, fileName }) {

  // Hoja A4 horizontal, medidas en puntos (pt), para que quepan las columnas anchas.
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  doc.setFontSize(16); // tamaño del título
  doc.text(title, 40, 40); // título a 40 pt del borde izquierdo y 40 pt del superior

  let startY = 60; // posición vertical donde empezará la tabla
  if (subtitle) {
    doc.setFontSize(10); // texto secundario más pequeño
    doc.text(sanitizeText(subtitle), 40, 58);
    startY = 75; // se baja la tabla para no tapar el subtítulo
  }

  autoTable(doc, {
    startY, // dónde empieza la tabla
    head: [columns.map((column) => sanitizeText(column.label))],
    body: rows.map((row) =>
      columns.map((column) => sanitizeText(column.getText(row) ?? ''))
    ),
    margin: { left: 40, right: 40 }, // márgenes laterales
    styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' }, // texto largo salta de línea
    headStyles: { fillColor: [5, 150, 105] }, 
  });

  const totalPages = doc.internal.getNumberOfPages(); // páginas generadas por la tabla
  const pageWidth = doc.internal.pageSize.getWidth(); // ancho de la hoja
  const pageHeight = doc.internal.pageSize.getHeight(); // alto de la hoja
  doc.setFontSize(8); // tamaño del pie de página
  
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page); // se posiciona en la página actual
    doc.text(`Página ${page} de ${totalPages}`, pageWidth - 40, pageHeight - 20, { align: 'right' });
  }

  // Solo letras, números, guion y guion bajo: evita nombres de archivo peligrosos.
  const safeName = String(fileName).replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${safeName}.pdf`); // dispara la descarga en el navegador
}