import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generatePdfFromHtml = async (html) => {
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.width = "794px"; // A4 width
  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "pt", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  document.body.removeChild(container);

  return pdf.output("blob");
};
