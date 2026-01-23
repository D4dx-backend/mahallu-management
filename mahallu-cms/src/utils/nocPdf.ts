import jsPDF from 'jspdf';
import { NOC } from '@/services/registrationService';

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+\n/g, '\n').trim();

const loadLogo = async (): Promise<string | null> => {
  try {
    const response = await fetch('/Logo-512x512.png');
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Failed to load logo for NOC PDF:', err);
    return null;
  }
};

export const downloadNocPdf = async (noc: NOC, filename = 'noc-certificate') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logo = await loadLogo();

  let y = 20;

  // Add logo at the top center
  if (logo) {
    const logoSize = 20;
    const logoX = (pageWidth - logoSize) / 2;
    doc.addImage(logo, 'PNG', logoX, y, logoSize, logoSize);
    y += logoSize + 8;
  }

  // Add title at the top center (including type in the title)
  const nocType = noc.type === 'nikah' ? 'Nikkah' : 'Common';
  const title = `No Objection Certificate - ${nocType}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const titleWidth = doc.getTextWidth(title);
  const titleX = (pageWidth - titleWidth) / 2;
  doc.text(title, titleX, y);
  y += 6;

  // Add a separator line
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;

  // Applicant Information Section
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('Applicant:', 20, y);
  doc.setFont('times', 'normal');
  doc.text(noc.applicantName, 55, y);
  y += 8;

  if (noc.applicantPhone) {
    doc.setFont('times', 'bold');
    doc.text('Phone:', 20, y);
    doc.setFont('times', 'normal');
    doc.text(noc.applicantPhone, 55, y);
    y += 8;
  }

  if (noc.purposeTitle) {
    doc.setFont('times', 'bold');
    doc.text('Purpose Title:', 20, y);
    doc.setFont('times', 'normal');
    doc.text(noc.purposeTitle, 55, y);
    y += 8;
  }

  // Purpose Description Section
  const description = stripHtml(noc.purposeDescription || noc.purpose || '');
  if (description) {
    // Add spacing before description
    y += 2;
    
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    
    // Split text to fit within page width
    const maxWidth = pageWidth - 40;
    const lines = doc.splitTextToSize(description, maxWidth);
    
    // Slightly increased line spacing for readability
    const lineHeight = 6.5;
    
    lines.forEach((line: string) => {
      doc.text(line, 20, y);
      y += lineHeight;
    });
  }

  doc.save(`${filename}.pdf`);
};
