import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AnnualReportData } from "@/lib/annual-report";

const BURGUNDY = { r: 51, g: 24, b: 28 };
const GOLD = { r: 196, g: 163, b: 90 };
const LEATHER = { r: 107, g: 80, b: 60 };
const TEXT = { r: 26, g: 16, b: 8 };

const MARGIN = 20;
const FOOTER_Y_OFFSET = 12;

function setBurgundy(doc: jsPDF) {
  doc.setTextColor(BURGUNDY.r, BURGUNDY.g, BURGUNDY.b);
}

function setLeather(doc: jsPDF) {
  doc.setTextColor(LEATHER.r, LEATHER.g, LEATHER.b);
}

function setBodyText(doc: jsPDF) {
  doc.setTextColor(TEXT.r, TEXT.g, TEXT.b);
}

function drawGoldRule(doc: jsPDF, y: number, width = 70) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const x = (pageWidth - width) / 2;
  doc.setDrawColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setLineWidth(0.4);
  doc.line(x, y, x + width, y);
}

function drawFooter(doc: jsPDF, pageNumber: number, generatedAt: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const y = pageHeight - FOOTER_Y_OFFSET;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setLeather(doc);
  doc.text("Fretwell & Co — Property Compliance Management", MARGIN, y);
  doc.text(`Page ${pageNumber}`, pageWidth / 2, y, { align: "center" });
  doc.text(generatedAt, pageWidth - MARGIN, y, { align: "right" });
}

function addFootersToAllPages(doc: jsPDF, generatedAt: string) {
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    drawFooter(doc, page, generatedAt);
  }
}

function drawCoverPage(doc: jsPDF, data: AnnualReportData) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  let y = 58;

  doc.setFont("times", "normal");
  doc.setFontSize(28);
  setBurgundy(doc);
  doc.text("Fretwell & Co", centerX, y, { align: "center" });

  y += 28;
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.text("Annual Compliance Report", centerX, y, { align: "center" });

  y += 14;
  drawGoldRule(doc, y, 90);

  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  setBodyText(doc);
  doc.text(`Prepared for: ${data.preparedFor}`, centerX, y, {
    align: "center",
  });

  y += 10;
  doc.text(`Report Period: ${data.reportYear}`, centerX, y, { align: "center" });

  y += 10;
  doc.text(`Generated: ${data.generatedAt}`, centerX, y, { align: "center" });
}

function drawExecutiveSummary(doc: jsPDF, data: AnnualReportData) {
  doc.addPage();
  let y = MARGIN + 4;

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  setBurgundy(doc);
  doc.text("Executive Summary", MARGIN, y);

  y += 8;
  doc.setDrawColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, MARGIN + 48, y);

  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  setBodyText(doc);

  const summaryLines = [
    `Total properties managed: ${data.summary.totalProperties}`,
    `Overall compliance: ${data.summary.compliancePercentage}%`,
    `Compliant properties: ${data.summary.compliant}`,
    `Properties requiring attention: ${data.summary.requiringAttention}`,
    `Overdue properties: ${data.summary.overdue}`,
  ];

  for (const line of summaryLines) {
    doc.text(line, MARGIN, y);
    y += 8;
  }

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Compliance Status", "Properties"]],
    body: [
      ["Compliant", String(data.summary.compliant)],
      ["Expiring Soon", String(data.summary.requiringAttention)],
      ["Overdue", String(data.summary.overdue)],
      ["Total", String(data.summary.totalProperties)],
    ],
    margin: { left: MARGIN, right: MARGIN },
    styles: {
      font: "helvetica",
      fontSize: 10,
      textColor: [TEXT.r, TEXT.g, TEXT.b],
      lineColor: [LEATHER.r, LEATHER.g, LEATHER.b],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [BURGUNDY.r, BURGUNDY.g, BURGUNDY.b],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [253, 251, 247],
    },
    tableLineColor: [LEATHER.r, LEATHER.g, LEATHER.b],
    tableLineWidth: 0.2,
  });
}

function drawPropertySections(doc: jsPDF, data: AnnualReportData) {
  for (const property of data.properties) {
    doc.addPage();
    let y = MARGIN + 4;

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    setBurgundy(doc);
    const addressLines = doc.splitTextToSize(
      property.address,
      doc.internal.pageSize.getWidth() - MARGIN * 2
    );
    doc.text(addressLines, MARGIN, y);
    y += addressLines.length * 8 + 4;

    doc.setDrawColor(GOLD.r, GOLD.g, GOLD.b);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, MARGIN + 40, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [["Certificate", "Issue Date", "Expiry Date", "Status", "Contractor"]],
      body: property.certificates.map((certificate) => [
        certificate.type,
        certificate.issueDate,
        certificate.expiryDate,
        certificate.status,
        certificate.contractor ?? "—",
      ]),
      margin: { left: MARGIN, right: MARGIN },
      styles: {
        font: "helvetica",
        fontSize: 9,
        textColor: [TEXT.r, TEXT.g, TEXT.b],
        lineColor: [LEATHER.r, LEATHER.g, LEATHER.b],
        lineWidth: 0.2,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [BURGUNDY.r, BURGUNDY.g, BURGUNDY.b],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 42 },
        4: { cellWidth: 38 },
      },
      alternateRowStyles: {
        fillColor: [253, 251, 247],
      },
      tableLineColor: [LEATHER.r, LEATHER.g, LEATHER.b],
      tableLineWidth: 0.2,
    });

    const tableEndY =
      (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY ?? y + 20;

    if (property.notes?.trim()) {
      let notesY = tableEndY + 14;
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      setBurgundy(doc);
      doc.text("Property Notes", MARGIN, notesY);
      notesY += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      setBodyText(doc);
      const noteLines = doc.splitTextToSize(
        property.notes.trim(),
        doc.internal.pageSize.getWidth() - MARGIN * 2
      );
      doc.text(noteLines, MARGIN, notesY);
    }
  }
}

export function generateAnnualReportPdf(data: AnnualReportData): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  drawCoverPage(doc, data);
  drawExecutiveSummary(doc, data);
  drawPropertySections(doc, data);
  addFootersToAllPages(doc, data.generatedAt);

  doc.save(`Fretwell-Co-Compliance-Report-${data.reportYear}.pdf`);
}
