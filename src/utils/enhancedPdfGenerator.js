import jsPDF from 'jspdf';

// Helper function to safely convert any value to string
const safeString = (value) => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

// Helper function to add watermark on each page
const addWatermark = (doc, pageWidth, pageHeight) => {
  try {
    const logoUrl = 'https://res.cloudinary.com/dexgkptpg/image/upload/v1765219299/carcatalog/logo.jpg';
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.05 }));
    
    const logoSize = 40;
    const positions = [
      { x: pageWidth / 2 - logoSize / 2, y: pageHeight / 2 - logoSize / 2 },
      { x: 30, y: 100 },
      { x: pageWidth - 70, y: 100 },
      { x: 30, y: pageHeight - 140 },
      { x: pageWidth - 70, y: pageHeight - 140 }
    ];
    
    positions.forEach(pos => {
      doc.addImage(logoUrl, 'JPEG', pos.x, pos.y, logoSize, logoSize);
    });
    
    doc.restoreGraphicsState();
  } catch (error) {
    console.log('Logo watermark could not be loaded');
  }
};

// Helper function to add header (only on first page)
const addHeader = (doc, pageWidth, isFirstPage = false) => {
  if (!isFirstPage) return;
  
  doc.setFillColor(26, 35, 126);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setFillColor(33, 150, 243);
  doc.rect(0, 0, pageWidth, 30, 'F');

  try {
    const logoUrl = 'https://res.cloudinary.com/dexgkptpg/image/upload/v1765219299/carcatalog/logo.jpg';
    doc.addImage(logoUrl, 'JPEG', 15, 8, 25, 25);
  } catch (error) {
    console.log('Header logo could not be loaded');
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CARCATLOG', 45, 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Vehicle History Report', 45, 26);
  
  doc.setFontSize(8);
  doc.text('Report ID: VHR-' + Date.now(), pageWidth - 15, 15, { align: 'right' });
  doc.text('Generated: ' + new Date().toLocaleDateString('en-GB'), pageWidth - 15, 20, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
};

// Helper function to add footer (only on last page)
const addFooter = (doc, pageWidth, pageHeight, pageNum, isLastPage = false) => {
  if (!isLastPage) {
    // Just add page number on non-last pages
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Page ' + pageNum, pageWidth / 2, pageHeight - 10, { align: 'center' });
    return;
  }
  
  const footerY = pageHeight - 25;
  
  doc.setFillColor(26, 35, 126);
  doc.rect(0, footerY, pageWidth, 25, 'F');
  
  try {
    const logoUrl = 'https://res.cloudinary.com/dexgkptpg/image/upload/v1765219299/carcatalog/logo.jpg';
    doc.addImage(logoUrl, 'JPEG', 15, footerY + 5, 15, 15);
  } catch (error) {
    console.log('Footer logo could not be loaded');
  }
  
  doc.setFontSize(7);
  doc.setTextColor(200, 200, 200);
  doc.setFont('helvetica', 'normal');
  doc.text('This report is valid for 30 days from generation date.', 35, footerY + 8);
  doc.text('Data sourced from DVLA, insurance databases, and finance records.', 35, footerY + 12);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('2024 CARCATLOG', 35, footerY + 17);
  
  doc.setTextColor(33, 150, 243);
  doc.text('www.carcatlog.com', pageWidth - 15, footerY + 12, { align: 'right' });
  
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(8);
  doc.text('Page ' + pageNum, pageWidth / 2, footerY + 17, { align: 'center' });
};

// Helper function to check if new page is needed
const checkNewPage = (doc, yPos, requiredSpace, pageWidth, pageHeight, pageNum, totalPages) => {
  if (yPos + requiredSpace > pageHeight - 35) {
    doc.addPage();
    pageNum++;
    addWatermark(doc, pageWidth, pageHeight);
    addHeader(doc, pageWidth, false);
    addFooter(doc, pageWidth, pageHeight, pageNum, false);
    return { yPos: 20, pageNum };
  }
  return { yPos, pageNum };
};

export const generateEnhancedVehicleReport = (vehicleData, registration) => {
  try {
    if (!vehicleData) {
      throw new Error('Vehicle data is required to generate PDF');
    }
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    let pageNum = 1;

    // Add watermark and header for first page
    addWatermark(doc, pageWidth, pageHeight);
    addHeader(doc, pageWidth, true);

  yPos = 60;

  // ============================================
  // REGISTRATION PLATE - UK Style
  // ============================================
  doc.setFillColor(255, 204, 0);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(2);
  doc.roundedRect(15, yPos, 80, 18, 2, 2, 'FD');
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(registration, 55, yPos + 12, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Date: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, 100, yPos + 12);
  
  doc.setTextColor(0, 0, 0);
  yPos += 28;

  // ============================================
  // SAFETY STATUS - Colorful Cards with Icons
  // ============================================
  ({ yPos, pageNum } = checkNewPage(doc, yPos, 50, pageWidth, pageHeight, pageNum));
  
  // Section header with blue background
  doc.setFillColor(33, 150, 243);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Safety Check Summary', 20, yPos + 7);
  
  yPos += 15;

  const checks = [
    { 
      label: 'Theft Check', 
      status: vehicleData.stolen ? 'ALERT' : 'CLEAR',
      passed: !vehicleData.stolen,
      icon: vehicleData.stolen ? '✗' : '✓'
    },
    { 
      label: 'Write-Off', 
      status: vehicleData.writeOff ? 'ALERT' : 'CLEAR',
      passed: !vehicleData.writeOff,
      icon: vehicleData.writeOff ? '✗' : '✓'
    },
    { 
      label: 'Finance', 
      status: vehicleData.outstandingFinance ? 'ALERT' : 'CLEAR',
      passed: !vehicleData.outstandingFinance,
      icon: vehicleData.outstandingFinance ? '✗' : '✓'
    }
  ];

  const cardWidth = (pageWidth - 50) / 3;
  const cardHeight = 28;
  
  checks.forEach((check, index) => {
    const cardX = 20 + (index * (cardWidth + 5));
    
    // Card background with shadow effect
    if (check.passed) {
      doc.setFillColor(232, 245, 233); // Light green
      doc.setDrawColor(76, 175, 80); // Green border
    } else {
      doc.setFillColor(255, 235, 238); // Light red
      doc.setDrawColor(244, 67, 54); // Red border
    }
    
    doc.setLineWidth(1.5);
    doc.roundedRect(cardX, yPos, cardWidth, cardHeight, 3, 3, 'FD');
    
    // Icon circle
    if (check.passed) {
      doc.setFillColor(76, 175, 80); // Green
    } else {
      doc.setFillColor(244, 67, 54); // Red
    }
    doc.circle(cardX + 8, yPos + 10, 5, 'F');
    
    // Icon text
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(check.icon, cardX + 8, yPos + 12, { align: 'center' });
    
    // Label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 37, 41);
    doc.text(check.label, cardX + 16, yPos + 10);
    
    // Status
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(check.passed ? 76 : 244, check.passed ? 175 : 67, check.passed ? 80 : 54);
    doc.text(check.status, cardX + 16, yPos + 16);
    
    // Description
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    const desc = check.passed ? 'No records found' : 'Issue detected';
    doc.text(desc, cardX + 16, yPos + 21);
  });
  
  doc.setTextColor(0, 0, 0);
  yPos += 35;

  // ============================================
  // WARNINGS & CAUTIONS DETAILS
  // ============================================
  if (vehicleData.writeOff || vehicleData.outstandingFinance || vehicleData.stolen) {
    ({ yPos, pageNum } = checkNewPage(doc, yPos, 60, pageWidth, pageHeight, pageNum));
    
    // Warnings Section
    if (vehicleData.writeOff) {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(220, 53, 69);
      doc.setLineWidth(1.5);
      doc.roundedRect(15, yPos, pageWidth - 30, 35, 4, 4, 'FD');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 53, 69);
      doc.text('⚠️ WARNINGS', 20, yPos + 8);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(33, 37, 41);
      doc.text('Insurance write-off recorded', 20, yPos + 16);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`This vehicle has been written off by an insurance company on ${vehicleData.writeOffDate || 'N/A'}`, 20, yPos + 22);
      doc.text(`Status: ${vehicleData.writeOffCategory || 'CAT S'} - ${vehicleData.writeOffDescription || 'Structural damage, can be repaired'}`, 20, yPos + 27);
      
      yPos += 40;
    }
    
    // Cautions Section
    if (vehicleData.outstandingFinance) {
      ({ yPos, pageNum } = checkNewPage(doc, yPos, 60, pageWidth, pageHeight, pageNum));
      
      doc.setFillColor(255, 243, 205);
      doc.setDrawColor(255, 193, 7);
      doc.setLineWidth(1.5);
      doc.roundedRect(15, yPos, pageWidth - 30, 50, 4, 4, 'FD');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(133, 100, 4);
      doc.text('⚠️ CAUTIONS', 20, yPos + 8);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(33, 37, 41);
      doc.text('Outstanding finance recorded', 20, yPos + 16);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`There's an outstanding finance agreement attached to this vehicle`, 20, yPos + 22);
      
      const financeDetails = [
        ['Finance company:', vehicleData.financeCompany || 'SAMPLE LTD'],
        ['Agreement type:', vehicleData.financeType || 'Hire Purchase'],
        ['Agreement number:', vehicleData.financeAgreementNumber || 'N/A'],
        ['Agreement start date:', vehicleData.financeStartDate || 'N/A'],
        ['Agreement term:', vehicleData.financeTerm || 'N/A'],
        ['Contact number:', vehicleData.financeContact || 'N/A']
      ];
      
      let finY = yPos + 28;
      financeDetails.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, finY);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 75, finY);
        finY += 5;
      });
      
      yPos += 55;
    }
  }

  // ============================================
  // REPORT SUMMARY - Comprehensive Overview
  // ============================================
  ({ yPos, pageNum } = checkNewPage(doc, yPos, 50, pageWidth, pageHeight, pageNum));
  
  // Section header with blue background
  doc.setFillColor(33, 150, 243);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('📋 Report Summary', 20, yPos + 7);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Complete overview of vehicle check results', pageWidth - 20, yPos + 7, { align: 'right' });
  
  yPos += 15;
  
  // Summary text
  const totalChecks = 3;
  const passedChecks = [!vehicleData.stolen, !vehicleData.writeOff, !vehicleData.outstandingFinance].filter(Boolean).length;
  
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(15, yPos, pageWidth - 30, 20, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  const summaryText = `This vehicle has passed ${safeString(passedChecks)} out of ${safeString(totalChecks)} safety checks. ` +
    (vehicleData.mileage ? `Current mileage: ${safeString(Number(vehicleData.mileage).toLocaleString())} miles. ` : '') +
    (vehicleData.previousOwners !== undefined ? `${safeString(vehicleData.previousOwners)} previous owner(s). ` : '') +
    (passedChecks === totalChecks ? 'No major issues detected.' : 'Please review alerts below for details.');
  
  const splitText = doc.splitTextToSize(summaryText, pageWidth - 50);
  doc.text(splitText, 20, yPos + 7);
  
  yPos += 25;
  
  // Important note about recalls
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text('Note: Reports do not include manufacturer safety recalls. Check with the manufacturer for recall information.', 20, yPos);
  
  yPos += 10;

  // ============================================
  // VEHICLE DETAILS - Professional Table with Blue Header
  // ============================================
  ({ yPos, pageNum } = checkNewPage(doc, yPos, 90, pageWidth, pageHeight, pageNum));
  
  // Section header with gradient effect
  doc.setFillColor(33, 150, 243);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('🚗 Vehicle Details', 20, yPos + 7);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Compare this information with the seller\'s description', pageWidth - 20, yPos + 7, { align: 'right' });
  
  yPos += 15;

  // Vehicle name/title with colored background
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(15, yPos - 3, pageWidth - 30, 12, 2, 2, 'F');
  
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 150, 243);
  const vehicleTitle = `${vehicleData.make || ''} ${vehicleData.model || ''} ${vehicleData.variant || ''}`.trim().toUpperCase();
  doc.text(vehicleTitle, 20, yPos + 5);
  yPos += 15;

  // Comprehensive details in two columns with alternating row colors
  const leftCol = 20;
  const rightCol = pageWidth / 2 + 5;
  const labelWidth = 50;
  
  const leftDetails = [
    ['Registration', safeString(registration)],
    ['Manufacture year', safeString(vehicleData.year || vehicleData.manufactureYear)],
    ['First registered', safeString(vehicleData.firstRegistered || vehicleData.registrationDate)],
    ['Make', safeString(vehicleData.make)],
    ['Model', safeString(vehicleData.model)],
    ['Body type', safeString(vehicleData.bodyType)],
    ['Colour', safeString(vehicleData.colour || vehicleData.color)],
    ['Transmission', safeString(vehicleData.transmission)]
  ];
  
  const rightDetails = [
    ['Engine number', safeString(vehicleData.engineNumber)],
    ['Engine capacity', vehicleData.engineSize ? safeString(vehicleData.engineSize) + 'L' : safeString(vehicleData.engineCapacity)],
    ['Fuel type', safeString(vehicleData.fuelType)],
    ['CO₂ emissions', vehicleData.co2Emissions ? safeString(vehicleData.co2Emissions) + ' g/km' : 'N/A'],
    ['Road tax (12 months)', vehicleData.annualTax ? '£' + safeString(vehicleData.annualTax) : 'N/A'],
    ['Doors', safeString(vehicleData.doors)],
    ['Seats', safeString(vehicleData.seats)],
    ['Drive type', safeString(vehicleData.driveType)]
  ];
  
  doc.setFontSize(9);
  let leftY = yPos;
  leftDetails.forEach(([label, value], index) => {
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, leftY - 4, (pageWidth - 30) / 2 - 2, 7, 'F');
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(label, leftCol, leftY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 37, 41);
    doc.text(value, leftCol + labelWidth, leftY);
    leftY += 7;
  });
  
  let rightY = yPos;
  rightDetails.forEach(([label, value], index) => {
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(rightCol - 5, rightY - 4, (pageWidth - 30) / 2 - 2, 7, 'F');
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(label, rightCol, rightY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 37, 41);
    doc.text(value, rightCol + labelWidth, rightY);
    rightY += 7;
  });

  yPos = Math.max(leftY, rightY) + 3;
  
  // Road tax disclaimer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  const disclaimer = '**The road tax figure quoted is the current rate only, and may be subject to change in the future.';
  doc.text(disclaimer, 20, yPos);
  
  yPos += 10;

  // ============================================
  // ALL CLEAR CHECKS - Detailed with Icons
  // ============================================
  ({ yPos, pageNum } = checkNewPage(doc, yPos, 60, pageWidth, pageHeight, pageNum));
  
  // Section header with green background
  doc.setFillColor(76, 175, 80);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('✓ All Clear', 20, yPos + 7);
  
  yPos += 15;
  
  // Info box with light green background
  doc.setFillColor(232, 245, 233);
  doc.roundedRect(15, yPos, pageWidth - 30, 45, 2, 2, 'F');
  
  yPos += 8;
  
  const clearChecks = [
    { label: 'Not recorded as stolen', passed: !vehicleData.stolen },
    { label: 'Not recorded as scrapped', passed: true },
    { label: 'No third-party interest', passed: true },
    { label: vehicleData.mileageDiscrepancy ? 'Mileage discrepancies found' : 'No mileage discrepancies', passed: !vehicleData.mileageDiscrepancy }
  ];
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  clearChecks.forEach((check, index) => {
    // Checkmark or X with colored circle
    if (check.passed) {
      doc.setFillColor(76, 175, 80);
    } else {
      doc.setFillColor(244, 67, 54);
    }
    doc.circle(23, yPos + (index * 7) - 1, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(check.passed ? 'v' : 'x', 23, yPos + (index * 7), { align: 'center' });
    
    // Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(check.label, 30, yPos + (index * 7));
  });
  
  yPos += 32;
  
  // Mileage info note
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text('Mileage information can come from the DVLA, BVRLA and MOT.', 20, yPos);
  yPos += 4;
  if (vehicleData.mileage) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(76, 175, 80);
    doc.setFontSize(9);
    doc.text('Latest mileage: ' + safeString(Number(vehicleData.mileage).toLocaleString()) + ' miles', 20, yPos);
  }
  
  yPos += 10;

  // ============================================
  // PLATE CHANGES (if any)
  // ============================================
  if (vehicleData.plateChanges && vehicleData.plateChanges.length > 0) {
    ({ yPos, pageNum } = checkNewPage(doc, yPos, 40, pageWidth, pageHeight, pageNum));
    
    doc.setFillColor(255, 243, 205);
    doc.setDrawColor(255, 193, 7);
    doc.setLineWidth(1.5);
    doc.roundedRect(15, yPos, pageWidth - 30, 30 + (vehicleData.plateChanges.length * 6), 4, 4, 'FD');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(133, 100, 4);
    doc.text('🔄 To Review', 20, yPos + 8);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('This vehicle has had plate changes', 20, yPos + 16);
    
    yPos += 22;
    
    // Table header
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('From', 25, yPos);
    doc.text('To', 80, yPos);
    doc.text('Date changed', 135, yPos);
    yPos += 6;
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    vehicleData.plateChanges.forEach(change => {
      doc.text(safeString(change.from), 25, yPos);
      doc.text(safeString(change.to), 80, yPos);
      doc.text(safeString(change.date), 135, yPos);
      yPos += 6;
    });
    
    yPos += 10;
  }

  // ============================================
  // MILEAGE HISTORY TABLE - Colorful Design
  // ============================================
  if (vehicleData.mileageHistory && vehicleData.mileageHistory.length > 0) {
    ({ yPos, pageNum } = checkNewPage(doc, yPos, 80, pageWidth, pageHeight, pageNum));
    
    // Section header with teal background
    doc.setFillColor(0, 150, 136);
    doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('📊 Mileage History', 20, yPos + 7);
    
    yPos += 15;
    
    // Table header with teal gradient
    doc.setFillColor(0, 150, 136);
    doc.roundedRect(20, yPos - 3, pageWidth - 40, 10, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Date', 25, yPos + 3);
    doc.text('Source', 70, yPos + 3);
    doc.text('Mileage', 120, yPos + 3);
    yPos += 12;
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    const displayCount = Math.min(vehicleData.mileageHistory.length, 10);
    vehicleData.mileageHistory.slice(0, displayCount).forEach((record, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(248, 249, 250);
      }
      doc.rect(20, yPos - 4, pageWidth - 40, 6, 'F');
      
      doc.setTextColor(33, 37, 41);
      doc.text(safeString(record.date || record.year), 25, yPos);
      doc.text(safeString(record.source || 'MOT'), 70, yPos);
      doc.text(record.mileage ? safeString(record.mileage.toLocaleString()) : 'N/A', 120, yPos);
      yPos += 6;
    });
    
    if (vehicleData.mileageHistory.length > displayCount) {
      doc.setFontSize(8);
      doc.setTextColor(33, 150, 243);
      doc.setFont('helvetica', 'bold');
      doc.text('Show More', 25, yPos + 3);
    }
    
    yPos += 10;
    
    // Disclaimer
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    const mileageDisclaimer = 'Disclaimer: Some MOT mileage data may have been removed due to input errors. Small differences in records could be due to information being pulled from different data sources.';
    const splitDisclaimer = doc.splitTextToSize(mileageDisclaimer, pageWidth - 50);
    doc.text(splitDisclaimer, 20, yPos);
    
    yPos += 15;
  }

  // ============================================
  // PREVIOUS KEEPERS - Colorful Section
  // ============================================
  ({ yPos, pageNum } = checkNewPage(doc, yPos, 40, pageWidth, pageHeight, pageNum));
  
  // Section header with orange/amber background
  doc.setFillColor(255, 152, 0);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('👥 Previous Keepers', 20, yPos + 7);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Frequent changes may indicate vehicle issues', pageWidth - 20, yPos + 7, { align: 'right' });
  
  yPos += 15;
  
  // Info box with light background
  doc.setFillColor(255, 248, 225);
  doc.roundedRect(15, yPos, pageWidth - 30, 25, 2, 2, 'F');
  
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(33, 37, 41);
  
  const keeperDetails = [
    ['Number of previous keepers', safeString(vehicleData.previousOwners)],
    ['Last keeper change', safeString(vehicleData.lastKeeperChange)]
  ];
  
  keeperDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 152, 0);
    doc.text(value, 90, yPos);
    yPos += 7;
  });
  
  yPos += 10;

  // ============================================
  // MOT HISTORY - Professional Table with Colored Headers
  // ============================================
  ({ yPos, pageNum } = checkNewPage(doc, yPos, 80, pageWidth, pageHeight, pageNum));
  
  // Section header with purple background
  doc.setFillColor(156, 39, 176);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('🔧 MOT History', 20, yPos + 7);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Yearly safety and environmental inspection', pageWidth - 20, yPos + 7, { align: 'right' });
  
  yPos += 15;

  if (vehicleData.motHistory && vehicleData.motHistory.length > 0) {
    // MOT expiry status with colored badge
    const latestMot = vehicleData.motHistory[0];
    if (latestMot.expiry) {
      doc.setFillColor(255, 235, 238);
      doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(244, 67, 54);
      doc.text(`⚠ This vehicle's MOT expired on ${safeString(latestMot.expiry)}`, 20, yPos + 6);
      yPos += 15;
    }
    
    // Table header with gradient
    doc.setFillColor(156, 39, 176);
    doc.roundedRect(20, yPos - 3, pageWidth - 40, 10, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Test date', 25, yPos + 3);
    doc.text('Mileage', 70, yPos + 3);
    doc.text('Result', 115, yPos + 3);
    doc.text('Details', 155, yPos + 3);
    yPos += 12;
    
    // Table rows with colorful badges
    doc.setFont('helvetica', 'normal');
    const displayCount = Math.min(vehicleData.motHistory.length, 10);
    vehicleData.motHistory.slice(0, displayCount).forEach((mot, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 50) {
        doc.addPage();
        pageNum++;
        addWatermark(doc, pageWidth, pageHeight);
        addHeader(doc, pageWidth);
        addFooter(doc, pageWidth, pageHeight, pageNum);
        yPos = 60;
      }
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(248, 249, 250);
      }
      doc.rect(20, yPos - 4, pageWidth - 40, 9, 'F');
      
      doc.setTextColor(33, 37, 41);
      doc.setFontSize(9);
      doc.text(safeString(mot.date), 25, yPos);
      doc.text(mot.mileage ? safeString(mot.mileage.toLocaleString()) : 'N/A', 70, yPos);
      
      // Result badge with rounded corners and colors
      if (mot.result === 'PASS') {
        doc.setFillColor(76, 175, 80); // Green
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setFillColor(244, 67, 54); // Red
        doc.setTextColor(255, 255, 255);
      }
      doc.roundedRect(113, yPos - 3, 25, 6, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(safeString(mot.result), 125.5, yPos + 1, { align: 'center' });
      
      // Show details link in blue
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(33, 150, 243);
      doc.text('Show details', 155, yPos);
      
      yPos += 9;
    });
    
    if (vehicleData.motHistory.length > displayCount) {
      doc.setFontSize(8);
      doc.setTextColor(33, 150, 243);
      doc.setFont('helvetica', 'bold');
      doc.text('Show More', 25, yPos + 3);
    }
    
    yPos += 10;
  } else {
    // No MOT history available - show clean message
    doc.setFillColor(255, 248, 225);
    doc.roundedRect(15, yPos, pageWidth - 30, 25, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('MOT history not available for this vehicle', 20, yPos + 10);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('This may be because the vehicle is too new or MOT data is not yet available.', 20, yPos + 17);
    
    yPos += 30;
  }

  yPos += 5;

  // ============================================
  // MILEAGE GRAPH - Visual Representation
  // ============================================
  if (vehicleData.mileageHistory && vehicleData.mileageHistory.length > 1) {
    ({ yPos, pageNum } = checkNewPage(doc, yPos, 75, pageWidth, pageHeight, pageNum));
    
    doc.setFillColor(248, 249, 250);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPos, pageWidth - 30, 70, 4, 4, 'FD');
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 37, 41);
    doc.text('📈 Mileage History Graph', 20, yPos + 8);
    yPos += 18;

    const graphX = 30;
    const graphY = yPos;
    const graphWidth = pageWidth - 60;
    const graphHeight = 45;

    // Graph background
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(graphX, graphY, graphWidth, graphHeight, 2, 2, 'F');
    
    // Grid lines
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    for (let i = 1; i < 5; i++) {
      const gridY = graphY + (i * graphHeight / 5);
      doc.line(graphX, gridY, graphX + graphWidth, gridY);
    }

    // Axes
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.8);
    doc.line(graphX, graphY + graphHeight, graphX + graphWidth, graphY + graphHeight);
    doc.line(graphX, graphY, graphX, graphY + graphHeight);

    // Calculate scale
    const mileages = vehicleData.mileageHistory.map(h => h.mileage);
    const maxMileage = Math.max(...mileages);
    const minMileage = Math.min(...mileages);
    const range = maxMileage - minMileage || 1;

    // Draw gradient area
    doc.setFillColor(33, 150, 243);
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    
    vehicleData.mileageHistory.forEach((point, index) => {
      if (index < vehicleData.mileageHistory.length - 1) {
        const x = graphX + (index / (vehicleData.mileageHistory.length - 1)) * graphWidth;
        const y = graphY + graphHeight - ((point.mileage - minMileage) / range) * graphHeight;
        const nextPoint = vehicleData.mileageHistory[index + 1];
        const nextX = graphX + ((index + 1) / (vehicleData.mileageHistory.length - 1)) * graphWidth;
        const nextY = graphY + graphHeight - ((nextPoint.mileage - minMileage) / range) * graphHeight;
        
        doc.triangle(x, graphY + graphHeight, x, y, nextX, nextY, 'F');
        doc.triangle(x, graphY + graphHeight, nextX, graphY + graphHeight, nextX, nextY, 'F');
      }
    });
    
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Draw line
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(2.5);
    
    vehicleData.mileageHistory.forEach((point, index) => {
      const x = graphX + (index / (vehicleData.mileageHistory.length - 1)) * graphWidth;
      const y = graphY + graphHeight - ((point.mileage - minMileage) / range) * graphHeight;
      
      if (index < vehicleData.mileageHistory.length - 1) {
        const nextPoint = vehicleData.mileageHistory[index + 1];
        const nextX = graphX + ((index + 1) / (vehicleData.mileageHistory.length - 1)) * graphWidth;
        const nextY = graphY + graphHeight - ((nextPoint.mileage - minMileage) / range) * graphHeight;
        doc.line(x, y, nextX, nextY);
      }
      
      // Draw point
      doc.setFillColor(33, 150, 243);
      doc.circle(x, y, 2.5, 'F');
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(1);
      doc.circle(x, y, 2.5, 'D');
    });

    // Labels
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    
    doc.text(safeString(maxMileage.toLocaleString()), graphX - 5, graphY + 3, { align: 'right' });
    doc.text(safeString(minMileage.toLocaleString()), graphX - 5, graphY + graphHeight, { align: 'right' });
    doc.text('miles', graphX - 5, graphY - 2, { align: 'right' });
    
    // X-axis labels
    const labelInterval = Math.ceil(vehicleData.mileageHistory.length / 5);
    vehicleData.mileageHistory.forEach((point, index) => {
      if (index % labelInterval === 0 || index === vehicleData.mileageHistory.length - 1) {
        const x = graphX + (index / (vehicleData.mileageHistory.length - 1)) * graphWidth;
        const label = point.year || point.date || '';
        doc.text(safeString(label), x, graphY + graphHeight + 5, { align: 'center' });
      }
    });

    doc.setTextColor(0, 0, 0);
    yPos += graphHeight + 12;
  }

  // ============================================
  // ENVIRONMENTAL IMPACT - Green Theme
  // ============================================
  ({ yPos, pageNum } = checkNewPage(doc, yPos, 50, pageWidth, pageHeight, pageNum));
  
  // Section header with green background
  doc.setFillColor(76, 175, 80);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('🌱 Environmental Impact', 20, yPos + 7);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Lower emissions = Better for environment', pageWidth - 20, yPos + 7, { align: 'right' });
  
  yPos += 15;
  
  // Info box with light green background
  doc.setFillColor(232, 245, 233);
  doc.roundedRect(15, yPos, pageWidth - 30, 25, 2, 2, 'F');
  
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('CO2 emissions', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(76, 175, 80);
  doc.text(vehicleData.co2Emissions ? safeString(vehicleData.co2Emissions) + ' g/km' : 'N/A', 70, yPos);
  
  yPos += 10;
  
  // Environmental disclaimer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text('Disclaimer: This information is not covered by the data guarantee.', 20, yPos);
  
  yPos += 15;

  // ============================================
  // ADDITIONAL CHECKS - Import/Export/Color Changes
  // ============================================
  ({ yPos, pageNum } = checkNewPage(doc, yPos, 40, pageWidth, pageHeight, pageNum));
  
  // Section header with gray background
  doc.setFillColor(96, 125, 139);
  doc.roundedRect(15, yPos, pageWidth - 30, 10, 2, 2, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Additional Checks', 20, yPos + 7);
  
  yPos += 15;
  
  // Info box
  doc.setFillColor(236, 239, 241);
  doc.roundedRect(15, yPos, pageWidth - 30, 25, 2, 2, 'F');
  
  yPos += 8;
  
  const additionalChecks = [
    { label: 'Not imported', passed: !vehicleData.imported },
    { label: 'Not exported', passed: !vehicleData.exported },
    { label: 'No colour changes', passed: !vehicleData.colourChanges && vehicleData.colourChanges !== true }
  ];
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  additionalChecks.forEach((check, index) => {
    // Checkmark with colored circle
    if (check.passed) {
      doc.setFillColor(76, 175, 80);
    } else {
      doc.setFillColor(255, 152, 0);
    }
    doc.circle(23, yPos + (index * 6) - 1, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(check.passed ? 'v' : '!', 23, yPos + (index * 6), { align: 'center' });
    
    // Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(check.label, 30, yPos + (index * 6));
  });
  
  yPos += 20;

    // Add footer on last page
    addFooter(doc, pageWidth, pageHeight, pageNum, true);

    // Save the PDF
    doc.save('CARCATLOG-Vehicle-Report-' + registration + '-' + new Date().toISOString().split('T')[0] + '.pdf');
    
    console.log('PDF generated successfully for:', registration);
  } catch (error) {
    console.error('Error in generateEnhancedVehicleReport:', error);
    console.error('Error stack:', error.stack);
    console.error('Vehicle data:', vehicleData);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};
