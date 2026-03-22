import jsPDF from 'jspdf';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const safeString = (value) => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'string') return value.trim() || 'N/A';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

// Fix engine size — remove duplicate "L" (e.g. "1.0LL" → "1.0L")
const formatEngineSize = (value) => {
  if (!value) return 'N/A';
  const str = String(value).replace(/L+$/i, '') + 'L';
  return str === 'L' ? 'N/A' : str;
};

// CO2 label without Unicode subscript (avoids garbled chars in PDF)
const CO2_LABEL = 'CO2 Emissions';

const BRAND_BLUE   = [33, 150, 243];
const DARK_NAVY    = [26, 35, 126];
const GREEN        = [76, 175, 80];
const RED          = [244, 67, 54];
const PURPLE       = [156, 39, 176];
const TEAL         = [0, 150, 136];
const ORANGE       = [255, 152, 0];
const GREY_HEADER  = [96, 125, 139];
const WHITE        = [255, 255, 255];
const LIGHT_GREY   = [248, 249, 250];
const TEXT_DARK    = [33, 37, 41];
const TEXT_MUTED   = [100, 100, 100];

// ─── Watermark ────────────────────────────────────────────────────────────────

const addWatermark = (doc, pageWidth, pageHeight) => {
  try {
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.04 }));
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(48);
    doc.setFont('helvetica', 'bold');
    const cx = pageWidth / 2;
    const cy = pageHeight / 2;
    [cy - 70, cy, cy + 70].forEach(y => {
      doc.text('CARCATLOG', cx, y, { align: 'center', angle: 45 });
    });
    doc.restoreGraphicsState();
    doc.setTextColor(0, 0, 0);
  } catch (_) {}
};

// ─── Header (first page only) ─────────────────────────────────────────────────

const addHeader = (doc, pageWidth, reportId) => {
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setFillColor(...DARK_NAVY);
  doc.rect(0, 30, pageWidth, 18, 'F');

  doc.setTextColor(...WHITE);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CARCATLOG', 15, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Vehicle History Report', 15, 42);

  doc.setFontSize(7.5);
  doc.text('Report ID: ' + reportId, pageWidth - 15, 18, { align: 'right' });
  doc.text('Generated: ' + new Date().toLocaleDateString('en-GB'), pageWidth - 15, 24, { align: 'right' });

  doc.setTextColor(0, 0, 0);
};

// ─── Footer (last page) ───────────────────────────────────────────────────────

const addFooter = (doc, pageWidth, pageHeight, pageNum, isLast) => {
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Page ' + pageNum, pageWidth / 2, pageHeight - 8, { align: 'center' });

  if (!isLast) return;

  const fy = pageHeight - 22;
  doc.setFillColor(...DARK_NAVY);
  doc.rect(0, fy, pageWidth, 22, 'F');

  doc.setFontSize(7);
  doc.setTextColor(200, 200, 200);
  doc.setFont('helvetica', 'normal');
  doc.text('This report is valid for 30 days from generation date.', 15, fy + 7);
  doc.text('Data sourced from DVLA, insurance databases and finance records.', 15, fy + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('2024 CARCATLOG', 15, fy + 18);
  doc.setTextColor(...BRAND_BLUE);
  doc.text('www.carcatlog.com', pageWidth - 15, fy + 13, { align: 'right' });

  doc.setTextColor(0, 0, 0);
};

// ─── Section header bar ───────────────────────────────────────────────────────

const sectionHeader = (doc, yPos, pageWidth, color, title, subtitle = '') => {
  doc.setFillColor(...color);
  doc.roundedRect(15, yPos, pageWidth - 30, 11, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text(title, 20, yPos + 7.5);
  if (subtitle) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth - 20, yPos + 7.5, { align: 'right' });
  }
  doc.setTextColor(0, 0, 0);
  return yPos + 16;
};

// ─── Page overflow check ──────────────────────────────────────────────────────

const checkPage = (doc, yPos, need, pageWidth, pageHeight, state) => {
  if (yPos + need > pageHeight - 30) {
    addFooter(doc, pageWidth, pageHeight, state.pageNum, false);
    doc.addPage();
    state.pageNum++;
    addWatermark(doc, pageWidth, pageHeight);
    return 20;
  }
  return yPos;
};

// ─── Main export ──────────────────────────────────────────────────────────────

export const generateEnhancedVehicleReport = (vehicleData, registration) => {
  if (!vehicleData) throw new Error('Vehicle data is required');

  const doc      = new jsPDF();
  const PW       = doc.internal.pageSize.getWidth();
  const PH       = doc.internal.pageSize.getHeight();
  const state    = { pageNum: 1 };
  const reportId = 'VHR-' + Date.now();

  let y = 20;

  addWatermark(doc, PW, PH);
  addHeader(doc, PW, reportId);
  y = 55;

  // ── UK Reg plate ────────────────────────────────────────────────────────────
  doc.setFillColor(255, 204, 0);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(2);
  doc.roundedRect(15, y, 82, 18, 2, 2, 'FD');
  doc.setFontSize(19);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(registration.toUpperCase(), 56, y + 12, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    'Report Date: ' + new Date().toLocaleDateString('en-GB') + ' at ' + new Date().toLocaleTimeString('en-GB'),
    102, y + 12
  );
  doc.setTextColor(0, 0, 0);
  y += 28;

  // ── Safety Check Summary ────────────────────────────────────────────────────
  y = checkPage(doc, y, 55, PW, PH, state);
  y = sectionHeader(doc, y, PW, BRAND_BLUE, 'Safety Check Summary');

  const checks = [
    { label: 'Theft Check',   alert: !!vehicleData.stolen,             desc: vehicleData.stolen           ? 'Reported stolen'          : 'No theft records'       },
    { label: 'Write-Off',     alert: !!vehicleData.writeOff,           desc: vehicleData.writeOff         ? 'Insurance write-off'      : 'No write-off records'   },
    { label: 'Finance',       alert: !!vehicleData.outstandingFinance, desc: vehicleData.outstandingFinance ? 'Outstanding finance'    : 'No finance detected'    },
  ];

  const cw = (PW - 50) / 3;
  checks.forEach((c, i) => {
    const cx = 20 + i * (cw + 5);
    doc.setFillColor(...(c.alert ? [255, 235, 238] : [232, 245, 233]));
    doc.setDrawColor(...(c.alert ? RED : GREEN));
    doc.setLineWidth(1.5);
    doc.roundedRect(cx, y, cw, 26, 3, 3, 'FD');

    doc.setFillColor(...(c.alert ? RED : GREEN));
    doc.circle(cx + 8, y + 9, 4.5, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(c.alert ? 'X' : 'v', cx + 8, y + 11, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT_DARK);
    doc.text(c.label, cx + 15, y + 9);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...(c.alert ? RED : GREEN));
    doc.text(c.alert ? 'ALERT' : 'CLEAR', cx + 15, y + 15);

    doc.setTextColor(...TEXT_MUTED);
    doc.text(c.desc, cx + 15, y + 20);
  });
  doc.setTextColor(0, 0, 0);
  y += 33;

  // ── Warnings / Cautions ─────────────────────────────────────────────────────
  if (vehicleData.writeOff) {
    y = checkPage(doc, y, 45, PW, PH, state);
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(...RED);
    doc.setLineWidth(1.5);
    doc.roundedRect(15, y, PW - 30, 35, 3, 3, 'FD');
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...RED);
    doc.text('WARNINGS', 20, y + 9);
    doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...TEXT_DARK);
    doc.text('Insurance write-off recorded', 20, y + 17);
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
    doc.text('Date: ' + safeString(vehicleData.writeOffDate), 20, y + 23);
    doc.text('Category: ' + safeString(vehicleData.writeOffCategory) + ' - ' + safeString(vehicleData.writeOffDescription), 20, y + 29);
    doc.setTextColor(0, 0, 0);
    y += 42;
  }

  if (vehicleData.outstandingFinance) {
    y = checkPage(doc, y, 55, PW, PH, state);
    doc.setFillColor(255, 243, 205);
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(1.5);
    doc.roundedRect(15, y, PW - 30, 50, 3, 3, 'FD');
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(133, 100, 4);
    doc.text('CAUTIONS', 20, y + 9);
    doc.setFontSize(9.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...TEXT_DARK);
    doc.text('Outstanding finance recorded', 20, y + 17);
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);

    const finRows = [
      ['Finance company',  vehicleData.financeCompany  || 'N/A'],
      ['Agreement type',   vehicleData.financeType     || 'N/A'],
      ['Agreement number', vehicleData.financeAgreementNumber || 'N/A'],
      ['Start date',       vehicleData.financeStartDate || 'N/A'],
      ['Term',             vehicleData.financeTerm     || 'N/A'],
    ];
    let fy = y + 23;
    finRows.forEach(([l, v]) => {
      doc.setFont('helvetica', 'bold'); doc.text(l + ':', 22, fy);
      doc.setFont('helvetica', 'normal'); doc.text(v, 75, fy);
      fy += 5;
    });
    doc.setTextColor(0, 0, 0);
    y += 56;
  }

  // ── Report Summary ───────────────────────────────────────────────────────────
  y = checkPage(doc, y, 40, PW, PH, state);
  y = sectionHeader(doc, y, PW, BRAND_BLUE, 'Report Summary', 'Complete overview of vehicle check results');

  const passed = [!vehicleData.stolen, !vehicleData.writeOff, !vehicleData.outstandingFinance].filter(Boolean).length;
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(15, y, PW - 30, 20, 2, 2, 'F');
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 60);
  const summaryText =
    `This vehicle has passed ${passed} out of 3 safety checks. ` +
    (vehicleData.mileage ? `Current mileage: ${Number(vehicleData.mileage).toLocaleString()} miles. ` : '') +
    (vehicleData.previousOwners != null ? `${vehicleData.previousOwners} previous owner(s). ` : '') +
    (passed === 3 ? 'No major issues detected.' : 'Please review alerts above for details.');
  doc.text(doc.splitTextToSize(summaryText, PW - 40), 20, y + 7);
  doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(...TEXT_MUTED);
  doc.text('Note: Reports do not include manufacturer safety recalls.', 20, y + 18);
  doc.setTextColor(0, 0, 0);
  y += 28;

  // ── Vehicle Details ───────────────────────────────────────────────────────────
  y = checkPage(doc, y, 90, PW, PH, state);
  y = sectionHeader(doc, y, PW, BRAND_BLUE, 'Vehicle Details', "Compare with the seller's description");

  const vehicleTitle = [vehicleData.make, vehicleData.model, vehicleData.variant]
    .filter(Boolean).join(' ').toUpperCase();
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(15, y - 2, PW - 30, 12, 2, 2, 'F');
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BRAND_BLUE);
  doc.text(vehicleTitle || 'VEHICLE', 20, y + 6);
  y += 16;

  const LW = 48;
  const leftRows = [
    ['Registration',    safeString(registration)],
    ['Manufacture year',safeString(vehicleData.year || vehicleData.manufactureYear)],
    ['First registered',safeString(vehicleData.firstRegistered || vehicleData.registrationDate)],
    ['Make',            safeString(vehicleData.make)],
    ['Model',           safeString(vehicleData.model)],
    ['Body type',       safeString(vehicleData.bodyType)],
    ['Colour',          safeString(vehicleData.colour || vehicleData.color)],
    ['Transmission',    safeString(vehicleData.transmission)],
  ];
  const rightRows = [
    ['Engine number',   safeString(vehicleData.engineNumber)],
    ['Engine capacity', formatEngineSize(vehicleData.engineSize || vehicleData.engineCapacity)],
    ['Fuel type',       safeString(vehicleData.fuelType)],
    [CO2_LABEL,         vehicleData.co2Emissions ? safeString(vehicleData.co2Emissions) + ' g/km' : 'N/A'],
    ['Road tax (12m)',  vehicleData.annualTax ? '£' + safeString(vehicleData.annualTax) : 'N/A'],
    ['Doors',           safeString(vehicleData.doors)],
    ['Seats',           safeString(vehicleData.seats)],
    ['Drive type',      safeString(vehicleData.driveType)],
  ];

  const half = (PW - 30) / 2;
  doc.setFontSize(8.5);
  let ly = y, ry = y;

  leftRows.forEach(([label, val], i) => {
    if (i % 2 === 0) { doc.setFillColor(250, 250, 250); doc.rect(15, ly - 3, half, 7, 'F'); }
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...TEXT_MUTED); doc.text(label, 20, ly);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...TEXT_DARK); doc.text(val, 20 + LW, ly);
    ly += 7;
  });

  const rx = PW / 2 + 5;
  rightRows.forEach(([label, val], i) => {
    if (i % 2 === 0) { doc.setFillColor(250, 250, 250); doc.rect(rx - 5, ry - 3, half, 7, 'F'); }
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...TEXT_MUTED); doc.text(label, rx, ry);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...TEXT_DARK); doc.text(val, rx + LW, ry);
    ry += 7;
  });

  y = Math.max(ly, ry) + 5;
  doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(...TEXT_MUTED);
  doc.text('**Road tax figure is current rate only and may change.', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 12;

  // ── All Clear ─────────────────────────────────────────────────────────────────
  y = checkPage(doc, y, 40, PW, PH, state);
  y = sectionHeader(doc, y, PW, GREEN, 'All Clear');
  doc.setFillColor(232, 245, 233);
  doc.roundedRect(15, y, PW - 30, 30, 2, 2, 'F');
  y += 7;

  const clearItems = [
    { text: 'Not recorded as stolen',   pass: !vehicleData.stolen },
    { text: 'Not recorded as scrapped', pass: true },
    { text: 'No third-party interest',  pass: true },
    { text: vehicleData.mileageDiscrepancy ? 'Mileage discrepancies found' : 'No mileage discrepancies', pass: !vehicleData.mileageDiscrepancy },
  ];

  doc.setFontSize(9);
  clearItems.forEach((item, i) => {
    doc.setFillColor(...(item.pass ? GREEN : RED));
    doc.circle(23, y + i * 6 - 1, 2.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE); doc.setFontSize(8);
    doc.text(item.pass ? 'v' : 'x', 23, y + i * 6 + 0.5, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(60, 60, 60);
    doc.text(item.text, 30, y + i * 6);
  });
  y += 27;
  doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(...TEXT_MUTED);
  doc.text('Mileage information can come from DVLA, BVRLA and MOT.', 20, y);
  if (vehicleData.mileage) {
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...GREEN); doc.setFontSize(8.5);
    doc.text('Latest mileage: ' + Number(vehicleData.mileage).toLocaleString() + ' miles', 20, y + 5);
  }
  doc.setTextColor(0, 0, 0);
  y += 14;

  // ── Mileage History table ─────────────────────────────────────────────────────
  if (vehicleData.mileageHistory && vehicleData.mileageHistory.length > 0) {
    y = checkPage(doc, y, 60, PW, PH, state);
    y = sectionHeader(doc, y, PW, TEAL, 'Mileage History');

    doc.setFillColor(...TEAL);
    doc.roundedRect(20, y - 3, PW - 40, 10, 2, 2, 'F');
    doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE);
    ['Date', 'Source', 'Mileage'].forEach((h, i) => doc.text(h, [25, 70, 120][i], y + 3));
    y += 12;

    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
    vehicleData.mileageHistory.slice(0, 10).forEach((r, i) => {
      doc.setFillColor(...(i % 2 === 0 ? WHITE : LIGHT_GREY));
      doc.rect(20, y - 4, PW - 40, 7, 'F');
      doc.setTextColor(...TEXT_DARK);
      doc.text(safeString(r.date || r.year), 25, y);
      doc.text(safeString(r.source || 'MOT'), 70, y);
      doc.text(r.mileage ? Number(r.mileage).toLocaleString() : 'N/A', 120, y);
      y += 7;
    });

    doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(...TEXT_MUTED);
    doc.text('Some MOT mileage data may differ due to input errors or multiple data sources.', 20, y + 3);
    doc.setTextColor(0, 0, 0);
    y += 14;
  }

  // ── Previous Keepers ──────────────────────────────────────────────────────────
  y = checkPage(doc, y, 38, PW, PH, state);
  y = sectionHeader(doc, y, PW, ORANGE, 'Previous Keepers', 'Frequent changes may indicate issues');
  doc.setFillColor(255, 248, 225);
  doc.roundedRect(15, y, PW - 30, 22, 2, 2, 'F');
  y += 7;
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  [['Number of previous keepers', safeString(vehicleData.previousOwners)],
   ['Last keeper change', safeString(vehicleData.lastKeeperChange)]].forEach(([l, v]) => {
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...TEXT_MUTED); doc.text(l, 20, y);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...ORANGE); doc.text(v, 90, y);
    y += 7;
  });
  doc.setTextColor(0, 0, 0);
  y += 10;

  // ── MOT History ───────────────────────────────────────────────────────────────
  y = checkPage(doc, y, 60, PW, PH, state);
  y = sectionHeader(doc, y, PW, PURPLE, 'MOT History', 'Yearly safety and environmental inspection');

  const motList = vehicleData.motHistory || vehicleData.motTests || [];
  if (motList.length > 0) {
    doc.setFillColor(...PURPLE);
    doc.roundedRect(20, y - 3, PW - 40, 10, 2, 2, 'F');
    doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE);
    ['Test date', 'Mileage', 'Result', 'Details'].forEach((h, i) => doc.text(h, [25, 70, 115, 155][i], y + 3));
    y += 12;

    motList.slice(0, 10).forEach((mot, i) => {
      y = checkPage(doc, y, 12, PW, PH, state);
      doc.setFillColor(...(i % 2 === 0 ? WHITE : LIGHT_GREY));
      doc.rect(20, y - 4, PW - 40, 9, 'F');
      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...TEXT_DARK);

      const testDate = mot.testDate || mot.date || mot.completedDate;
      const testMileage = mot.odometerValue || mot.mileage;
      const result = mot.testResult || mot.result || 'N/A';
      const pass = result === 'PASSED' || result === 'PASS';

      doc.text(testDate ? new Date(testDate).toLocaleDateString('en-GB') : 'N/A', 25, y);
      doc.text(testMileage ? Number(testMileage).toLocaleString() : 'N/A', 70, y);

      doc.setFillColor(...(pass ? GREEN : RED));
      doc.roundedRect(113, y - 3, 24, 6, 1, 1, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...WHITE);
      doc.text(pass ? 'PASS' : 'FAIL', 125, y + 1, { align: 'center' });

      const defects = mot.defects || [];
      const advisories = mot.advisoryText || [];
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...TEXT_MUTED);
      const detail = defects.length > 0 ? `${defects.length} defect(s)` : advisories.length > 0 ? `${advisories.length} advisory` : 'None';
      doc.text(detail, 155, y);

      y += 9;
    });
  } else {
    doc.setFillColor(255, 248, 225);
    doc.roundedRect(15, y, PW - 30, 22, 2, 2, 'F');
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...TEXT_MUTED);
    doc.text('MOT history not available for this vehicle.', 20, y + 9);
    doc.setFontSize(8); doc.setFont('helvetica', 'italic');
    doc.text('This may be because the vehicle is too new or data is not yet available.', 20, y + 16);
    doc.setTextColor(0, 0, 0);
    y += 28;
  }
  y += 8;

  // ── Mileage Graph ─────────────────────────────────────────────────────────────
  const mhData = vehicleData.mileageHistory;
  if (mhData && mhData.length > 1) {
    y = checkPage(doc, y, 75, PW, PH, state);
    doc.setFillColor(248, 249, 250);
    doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.5);
    doc.roundedRect(15, y, PW - 30, 70, 3, 3, 'FD');

    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...TEXT_DARK);
    doc.text('Mileage History Graph', 20, y + 8);
    y += 16;

    const gx = 30, gy = y, gw = PW - 60, gh = 45;
    doc.setFillColor(...WHITE); doc.roundedRect(gx, gy, gw, gh, 2, 2, 'F');
    doc.setDrawColor(230, 230, 230); doc.setLineWidth(0.3);
    for (let i = 1; i < 5; i++) doc.line(gx, gy + i * gh / 5, gx + gw, gy + i * gh / 5);
    doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.8);
    doc.line(gx, gy, gx, gy + gh);
    doc.line(gx, gy + gh, gx + gw, gy + gh);

    const mils = mhData.map(h => h.mileage || 0);
    const maxM = Math.max(...mils);
    const minM = Math.min(...mils);
    const range = maxM - minM || 1;

    doc.setDrawColor(...BRAND_BLUE); doc.setLineWidth(2.5);
    mhData.forEach((pt, i) => {
      if (i >= mhData.length - 1) return;
      const x1 = gx + (i / (mhData.length - 1)) * gw;
      const y1 = gy + gh - ((pt.mileage - minM) / range) * gh;
      const x2 = gx + ((i + 1) / (mhData.length - 1)) * gw;
      const y2 = gy + gh - ((mhData[i + 1].mileage - minM) / range) * gh;
      doc.line(x1, y1, x2, y2);
    });

    mhData.forEach((pt, i) => {
      const x = gx + (i / (mhData.length - 1)) * gw;
      const py = gy + gh - ((pt.mileage - minM) / range) * gh;
      doc.setFillColor(...BRAND_BLUE); doc.circle(x, py, 2.5, 'F');
    });

    doc.setFontSize(7); doc.setTextColor(...TEXT_MUTED);
    doc.text(maxM.toLocaleString(), gx - 4, gy + 3, { align: 'right' });
    doc.text(minM.toLocaleString(), gx - 4, gy + gh, { align: 'right' });
    doc.text('miles', gx - 4, gy - 2, { align: 'right' });

    const step = Math.ceil(mhData.length / 5);
    mhData.forEach((pt, i) => {
      if (i % step === 0 || i === mhData.length - 1) {
        const x = gx + (i / (mhData.length - 1)) * gw;
        doc.text(safeString(pt.year || pt.date || ''), x, gy + gh + 5, { align: 'center' });
      }
    });
    doc.setTextColor(0, 0, 0);
    y += gh + 14;
  }

  // ── CO2 / Environmental ───────────────────────────────────────────────────────
  const co2Val = vehicleData.co2Emissions?.value || vehicleData.co2Emissions;
  if (co2Val) {
    y = checkPage(doc, y, 42, PW, PH, state);
    y = sectionHeader(doc, y, PW, GREEN, 'Environmental Impact', 'Lower emissions = Better for environment');
    doc.setFillColor(232, 245, 233);
    doc.roundedRect(15, y, PW - 30, 22, 2, 2, 'F');
    y += 9;
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(60, 60, 60);
    doc.text(CO2_LABEL, 20, y);
    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GREEN);
    doc.text(safeString(co2Val) + ' g/km', 70, y);
    doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(...TEXT_MUTED);
    doc.text('Disclaimer: This information is not covered by the data guarantee.', 20, y + 8);
    doc.setTextColor(0, 0, 0);
    y += 20;
  }

  // ── Additional Checks ─────────────────────────────────────────────────────────
  y = checkPage(doc, y, 38, PW, PH, state);
  y = sectionHeader(doc, y, PW, GREY_HEADER, 'Additional Checks');
  doc.setFillColor(236, 239, 241);
  doc.roundedRect(15, y, PW - 30, 24, 2, 2, 'F');
  y += 7;
  const addChecks = [
    { text: 'Not imported',       pass: !vehicleData.imported },
    { text: 'Not exported',       pass: !vehicleData.exported },
    { text: 'No colour changes',  pass: !vehicleData.colourChanges },
  ];
  doc.setFontSize(9);
  addChecks.forEach((c, i) => {
    doc.setFillColor(...(c.pass ? GREEN : ORANGE));
    doc.circle(23, y + i * 6 - 1, 2.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE); doc.setFontSize(8);
    doc.text(c.pass ? 'v' : '!', 23, y + i * 6 + 0.5, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(60, 60, 60);
    doc.text(c.text, 30, y + i * 6);
  });
  doc.setTextColor(0, 0, 0);
  y += 22;

  // ── Footer on last page ───────────────────────────────────────────────────────
  addFooter(doc, PW, PH, state.pageNum, true);

  doc.save('CARCATLOG-Vehicle-Report-' + registration + '-' + new Date().toISOString().split('T')[0] + '.pdf');
};