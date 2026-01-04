import jsPDF from 'jspdf';

export const generateVehicleHistoryPDF = (vehicleData, registration) => {
  console.log('PDF Generator received:', { vehicleData, registration });
  
  // Ensure we have valid data
  if (!vehicleData) {
    console.error('No vehicle data provided to PDF generator');
    throw new Error('Vehicle data is required to generate PDF');
  }
  
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
  
  // Extract values with proper fallbacks
  const make = vehicleData.make || 'N/A';
  const model = vehicleData.model || 'N/A';
  const year = vehicleData.year ? String(vehicleData.year) : 'N/A';
  const colour = vehicleData.colour || vehicleData.color || 'N/A';
  const fuelType = vehicleData.fuelType || vehicleData.fuel || 'N/A';
  const engineSize = vehicleData.engineSize || vehicleData.engineCapacity || 'N/A';
  
  console.log('Extracted values:', { make, model, year, colour, fuelType, engineSize });
  
  const details = [
    ['Make:', make],
    ['Model:', model],
    ['Year:', year],
    ['Colour:', colour],
    ['Fuel Type:', fuelType],
    ['Engine Size:', engineSize]
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
  const stolen = vehicleData.stolen === true;
  const theftStatus = stolen ? 'ALERT' : 'CLEAR';
  const theftColor = stolen ? [231, 76, 60] : [46, 204, 113];
  doc.setFont('helvetica', 'bold');
  doc.text('Theft Check:', 20, yPos);
  doc.setTextColor(...theftColor);
  doc.text(theftStatus, 70, yPos);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(stolen ? 'Vehicle reported stolen' : 'No theft records found', 100, yPos);
  yPos += 10;

  // Write-off Check
  const writeOff = vehicleData.writeOff === true;
  const writeOffStatus = writeOff ? 'ALERT' : 'CLEAR';
  const writeOffColor = writeOff ? [231, 76, 60] : [46, 204, 113];
  doc.setFont('helvetica', 'bold');
  doc.text('Insurance Write-off:', 20, yPos);
  doc.setTextColor(...writeOffColor);
  doc.text(writeOffStatus, 70, yPos);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(writeOff ? 'Insurance write-off recorded' : 'No write-off records', 100, yPos);
  yPos += 10;

  // Finance Check
  const outstandingFinance = vehicleData.outstandingFinance === true;
  const financeStatus = outstandingFinance ? 'ALERT' : 'CLEAR';
  const financeColor = outstandingFinance ? [231, 76, 60] : [46, 204, 113];
  doc.setFont('helvetica', 'bold');
  doc.text('Outstanding Finance:', 20, yPos);
  doc.setTextColor(...financeColor);
  doc.text(financeStatus, 70, yPos);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(outstandingFinance ? 'Outstanding finance detected' : 'No outstanding finance', 100, yPos);
  yPos += 15;

  // Additional Information Section
  const hasMileage = vehicleData.mileage !== undefined && vehicleData.mileage !== null;
  const hasPreviousOwners = vehicleData.previousOwners !== undefined && vehicleData.previousOwners !== null;
  const hasServiceHistory = vehicleData.serviceHistory !== undefined && vehicleData.serviceHistory !== null && vehicleData.serviceHistory !== '';
  
  if (hasMileage || hasPreviousOwners || hasServiceHistory) {
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 5, pageWidth - 30, 10, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Information', 20, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    if (hasMileage) {
      doc.setFont('helvetica', 'bold');
      doc.text('Mileage:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${Number(vehicleData.mileage).toLocaleString()} miles`, 70, yPos);
      yPos += 8;
    }

    if (hasPreviousOwners) {
      doc.setFont('helvetica', 'bold');
      doc.text('Previous Owners:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(String(vehicleData.previousOwners), 70, yPos);
      yPos += 8;
    }

    if (hasServiceHistory) {
      doc.setFont('helvetica', 'bold');
      doc.text('Service History:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(String(vehicleData.serviceHistory), 70, yPos);
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
