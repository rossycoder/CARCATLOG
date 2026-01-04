import jsPDF from 'jspdf';

export const generateVehicleHistoryPDF = (vehicleData, registration) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Header with branding
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CARCATLOG', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Vehicle History Report', pageWidth / 2, 30, { align: 'center' });

  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPos = 55;

  // Registration and Date
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Registration: ${registration}`, 20, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 20, yPos, { align: 'right' });
  
  yPos += 15;

  // Vehicle Details Section
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Vehicle Details', 20, yPos);
  yPos += 15;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const details = [
    ['Make:', vehicleData?.make || 'N/A'],
    ['Model:', vehicleData?.model || 'N/A'],
    ['Year:', vehicleData?.year || 'N/A'],
    ['Colour:', vehicleData?.colour || 'N/A'],
    ['Fuel Type:', vehicleData?.fuelType || 'N/A'],
    ['Engine Size:', vehicleData?.engineSize || 'N/A']
  ];

  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 70, yPos);
    yPos += 8;
  });

  yPos += 10;

  // History Checks Section
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('History Checks', 20, yPos);
  yPos += 15;

  doc.setFontSize(11);

  // Theft Check
  const theftStatus = vehicleData?.stolen ? 'ALERT' : 'CLEAR';
  const theftColor = vehicleData?.stolen ? [231, 76, 60] : [46, 204, 113];
  doc.setFont('helvetica', 'bold');
  doc.text('Theft Check:', 20, yPos);
  doc.setTextColor(...theftColor);
  doc.text(theftStatus, 70, yPos);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(vehicleData?.stolen ? 'Vehicle reported stolen' : 'No theft records found', 100, yPos);
  yPos += 10;

  // Write-off Check
  const writeOffStatus = vehicleData?.writeOff ? 'ALERT' : 'CLEAR';
  const writeOffColor = vehicleData?.writeOff ? [231, 76, 60] : [46, 204, 113];
  doc.setFont('helvetica', 'bold');
  doc.text('Insurance Write-off:', 20, yPos);
  doc.setTextColor(...writeOffColor);
  doc.text(writeOffStatus, 70, yPos);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(vehicleData?.writeOff ? 'Insurance write-off recorded' : 'No write-off records', 100, yPos);
  yPos += 10;

  // Finance Check
  const financeStatus = vehicleData?.outstandingFinance ? 'ALERT' : 'CLEAR';
  const financeColor = vehicleData?.outstandingFinance ? [231, 76, 60] : [46, 204, 113];
  doc.setFont('helvetica', 'bold');
  doc.text('Outstanding Finance:', 20, yPos);
  doc.setTextColor(...financeColor);
  doc.text(financeStatus, 70, yPos);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(vehicleData?.outstandingFinance ? 'Outstanding finance detected' : 'No outstanding finance', 100, yPos);
  yPos += 15;

  // Additional Information Section
  if (vehicleData?.mileage || vehicleData?.previousOwners || vehicleData?.serviceHistory) {
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Information', 20, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    if (vehicleData?.mileage) {
      doc.setFont('helvetica', 'bold');
      doc.text('Mileage:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${vehicleData.mileage.toLocaleString()} miles`, 70, yPos);
      yPos += 8;
    }

    if (vehicleData?.previousOwners) {
      doc.setFont('helvetica', 'bold');
      doc.text('Previous Owners:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(vehicleData.previousOwners.toString(), 70, yPos);
      yPos += 8;
    }

    if (vehicleData?.serviceHistory) {
      doc.setFont('helvetica', 'bold');
      doc.text('Service History:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(vehicleData.serviceHistory, 70, yPos);
      yPos += 8;
    }
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('This report is valid for 30 days from the date of generation.', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text('© 2024 CARCATLOG. All rights reserved.', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text('www.carcatlog.com', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save the PDF
  doc.save(`Vehicle-History-Report-${registration}-${new Date().toISOString().split('T')[0]}.pdf`);
};
