import { jsPDF } from 'jspdf';
import { BRAND_NAME, LOGO_PATH } from '@/constants/theme';
import { formatDate } from '@/utils/format';

export interface InvoiceDetails {
  title: string;
  receiptNo?: string;
  payerLabel: string;
  payerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  remarks?: string;
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const fetchLogoDataUrl = async () => {
  try {
    const response = await fetch(LOGO_PATH);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);

const renderInvoicePage = (
  doc: jsPDF,
  details: InvoiceDetails,
  logoDataUrl: string | null,
  isFirstPage: boolean
) => {
  if (!isFirstPage) {
    doc.addPage();
  }

  const marginX = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 14;
  const primaryGreen = [22, 163, 74];

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', marginX, currentY, 18, 18);
  }

  doc.setFontSize(16);
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  const titleText = BRAND_NAME;
  const titleWidth = doc.getTextWidth(titleText);
  doc.text(titleText, (pageWidth - titleWidth) / 2, currentY + 10);

  doc.setFontSize(10);
  doc.setTextColor(82, 82, 91);
  const subtitle = details.title;
  const subtitleWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, (pageWidth - subtitleWidth) / 2, currentY + 16);

  doc.setFontSize(10);
  doc.setTextColor(24, 24, 27);
  const receiptText = `Receipt No: ${details.receiptNo || '-'}`;
  const receiptWidth = doc.getTextWidth(receiptText);
  doc.text(receiptText, pageWidth - marginX - receiptWidth, currentY + 10);

  currentY += 22;
  doc.setDrawColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.setLineWidth(0.6);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 10;
  doc.setFontSize(11);
  doc.setTextColor(24, 24, 27);
  doc.text(`${details.payerLabel}: ${details.payerName}`, marginX, currentY);

  currentY += 8;
  doc.setFontSize(11);
  doc.setTextColor(24, 24, 27);
  const amountText = `Amount: ${formatAmount(details.amount)}`;
  doc.text(amountText, marginX, currentY);
  const dateText = `Date: ${formatDate(details.paymentDate)}`;
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, pageWidth - marginX - dateWidth, currentY);

  currentY += 8;
  doc.setFontSize(11);
  doc.setTextColor(24, 24, 27);
  doc.text(`Payment Method: ${details.paymentMethod || '-'}`, marginX, currentY);

  if (details.remarks) {
    currentY += 8;
    doc.setFontSize(10);
    doc.setTextColor(82, 82, 91);
    doc.text(`Remarks: ${details.remarks}`, marginX, currentY);
  }
};

export const downloadInvoicePdf = async (details: InvoiceDetails) => {
  const doc = new jsPDF();
  const logoDataUrl = await fetchLogoDataUrl();
  renderInvoicePage(doc, details, logoDataUrl, true);
  const filenameSafeReceipt = details.receiptNo ? `-${details.receiptNo}` : '';
  doc.save(`${details.title.toLowerCase().replace(/\s+/g, '-')}${filenameSafeReceipt}.pdf`);
};

export const exportInvoicesToPdf = async (detailsList: InvoiceDetails[], filename: string) => {
  if (detailsList.length === 0) return;
  const doc = new jsPDF();
  const logoDataUrl = await fetchLogoDataUrl();
  detailsList.forEach((details, index) => {
    renderInvoicePage(doc, details, logoDataUrl, index === 0);
  });
  doc.save(`${filename}.pdf`);
};
