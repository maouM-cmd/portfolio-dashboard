import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export the current dashboard view to PDF
 * @param {string} elementId - ID of the element to capture
 * @param {string} filename - Output filename
 */
export async function exportDashboardToPdf(elementId = 'dashboard-content', filename = 'ポートフォリオレポート.pdf') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('Element not found:', elementId);
        return;
    }

    try {
        // Capture the element as canvas
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 20; // 10mm margin on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add title
        pdf.setFontSize(20);
        pdf.text('Portfolio Analytics Report', 10, 15);
        pdf.setFontSize(10);
        pdf.text(`Generated: ${new Date().toLocaleString('ja-JP')}`, 10, 22);

        // Add the captured image
        let yPosition = 30;
        let remainingHeight = imgHeight;
        let sourceY = 0;

        while (remainingHeight > 0) {
            const availableHeight = pageHeight - yPosition - 10;
            const sliceHeight = Math.min(remainingHeight, availableHeight);
            const sourceHeight = (sliceHeight / imgHeight) * canvas.height;

            // Create a temporary canvas for the slice
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = sourceHeight;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);

            const sliceImgData = tempCanvas.toDataURL('image/png');
            pdf.addImage(sliceImgData, 'PNG', 10, yPosition, imgWidth, sliceHeight);

            remainingHeight -= sliceHeight;
            sourceY += sourceHeight;

            if (remainingHeight > 0) {
                pdf.addPage();
                yPosition = 10;
            }
        }

        pdf.save(filename);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

/**
 * Generate a simple text-based PDF report
 * @param {object} portfolioSummary - Portfolio summary data
 * @param {string} filename - Output filename
 */
export function exportSummaryToPdf(portfolioSummary, filename = 'ポートフォリオサマリー.pdf') {
    const pdf = new jsPDF();

    // Title
    pdf.setFontSize(22);
    pdf.text('Portfolio Report', 20, 20);

    pdf.setFontSize(10);
    pdf.text(`Date: ${new Date().toLocaleString('ja-JP')}`, 20, 30);

    // Summary section
    pdf.setFontSize(14);
    pdf.text('Summary', 20, 45);

    pdf.setFontSize(11);
    pdf.text(`Total Value: $${portfolioSummary.totalValue?.toFixed(2) || 'N/A'}`, 25, 55);
    pdf.text(`Total Cost: $${portfolioSummary.totalCost?.toFixed(2) || 'N/A'}`, 25, 62);
    pdf.text(`Total P&L: $${portfolioSummary.totalPnl?.toFixed(2) || 'N/A'} (${portfolioSummary.totalPnlPercent?.toFixed(2) || 'N/A'}%)`, 25, 69);

    // Holdings section
    pdf.setFontSize(14);
    pdf.text('Holdings', 20, 85);

    let y = 95;
    pdf.setFontSize(10);

    for (const holding of portfolioSummary.holdings || []) {
        if (y > 270) {
            pdf.addPage();
            y = 20;
        }
        pdf.text(`${holding.name} (${holding.symbol})`, 25, y);
        pdf.text(`  Qty: ${holding.quantity} | Price: ${holding.currentPrice?.toFixed(2) || 'N/A'} | P&L: ${holding.pnl?.toFixed(2) || 'N/A'}`, 25, y + 5);
        y += 15;
    }

    pdf.save(filename);
}
