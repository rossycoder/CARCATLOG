import jsPDF from 'jspdf';
import { LOGO_BASE64 } from './logoBase64';

// ─── Safe value helpers ───────────────────────────────────────────────────────
const safeString = (v) => {
  if (v === null || v === undefined) return 'N/A';
  if (typeof v === 'string') return v.trim() || 'N/A';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
};

const formatEngineSize = (v) => {
  if (!v) return 'N/A';
  const s = String(v).replace(/L+$/i, '');
  const n = parseFloat(s);
  if (isNaN(n)) return 'N/A';
  return n.toFixed(1) + 'L';
};

const fmtDate = (d) => {
  if (!d) return 'N/A';
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return String(d); }
};

// ─── Color palette (AutoTrader-inspired) ─────────────────────────────────────
const C = {
  orange:     [255, 90,  0],    // AutoTrader orange
  darkGrey:   [34,  34,  34],
  midGrey:    [85,  85,  85],
  lightGrey:  [240, 240, 240],
  border:     [220, 220, 220],
  white:      [255, 255, 255],
  green:      [0,   153, 68],
  red:        [204, 0,   0],
  amber:      [255, 153, 0],
  blue:       [0,   112, 192],
  rowAlt:     [248, 248, 248],
  tagBg:      [255, 245, 235],
  pass:       [0,   153, 68],
  fail:       [204, 0,   0],
};

// ─── Drawing helpers ──────────────────────────────────────────────────────────
const setFont = (doc, size, style = 'normal', color = C.darkGrey) => {
  doc.setFontSize(size);
  doc.setFont('helvetica', style);
  doc.setTextColor(...color);
};

const divider = (doc, y, PW, color = C.border) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  doc.line(15, y, PW - 15, y);
  return y + 4;
};

const pill = (doc, x, y, w, h, text, bgColor, textColor = C.white) => {
  doc.setFillColor(...bgColor);
  doc.roundedRect(x, y, w, h, h / 2, h / 2, 'F');
  setFont(doc, 7.5, 'bold', textColor);
  doc.text(text, x + w / 2, y + h / 2 + 2.5, { align: 'center' });
};

// ─── Page overflow guard ──────────────────────────────────────────────────────
const guard = (doc, y, need, PH, state, PW, addFooterFn) => {
  if (y + need > PH - 20) {
    addFooterFn(doc, PW, PH, state.page, false);
    doc.addPage();
    state.page++;
    return 20;
  }
  return y;
};

// ─── Header ───────────────────────────────────────────────────────────────────
const drawHeader = (doc, PW, reg, reportId) => {
  // White header background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PW, 24, 'F');

  // Logo is 1024x1024 square - use 20x20mm to keep aspect ratio
  try {
    doc.addImage(LOGO_BASE64, 'JPEG', 10, 2, 20, 20);
  } catch (e) {
    doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69); doc.text('Car', 15, 15);
    const cw = doc.getTextWidth('Car');
    doc.setTextColor(0, 102, 204); doc.text('Cat', 15 + cw, 15);
    const ctw = doc.getTextWidth('Cat');
    doc.setTextColor(255, 152, 0); doc.text('ALog', 15 + cw + ctw, 15);
  }

  // "Vehicle History Report" text next to logo
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.darkGrey);
  doc.text('Vehicle History Report', 34, 11);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('www.carcatalog.co.uk', 34, 17);

  // Report ID and date on right
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Report ID: ' + reportId, PW - 15, 10, { align: 'right' });
  doc.text('Generated: ' + new Date().toLocaleDateString('en-GB'), PW - 15, 17, { align: 'right' });

  // Orange bottom border line
  doc.setDrawColor(...C.orange);
  doc.setLineWidth(1.5);
  doc.line(0, 24, PW, 24);

  // Dark sub-bar
  doc.setFillColor(...C.darkGrey);
  doc.rect(0, 25.5, PW, 7, 'F');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('Powered by CheckCarDetails | Data sourced from DVLA, insurance & finance databases', 15, 30);
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const drawFooter = (doc, PW, PH, pageNum, isLast) => {
  const fy = PH - 12;
  doc.setFillColor(...C.lightGrey);
  doc.rect(0, fy - 2, PW, 14, 'F');

  // Logo image in footer
  try {
    doc.addImage(LOGO_BASE64, 'JPEG', 12, fy - 1, 22, 7);
  } catch (e) {
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69); doc.text('Car', 15, fy + 4);
    const cw = doc.getTextWidth('Car');
    doc.setTextColor(0, 102, 204); doc.text('Cat', 15 + cw, fy + 4);
    const ctw = doc.getTextWidth('Cat');
    doc.setTextColor(255, 152, 0); doc.text('alog', 15 + cw + ctw, fy + 4);
  }

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('www.carcatalog.co.uk  |  This report is valid for 30 days', 38, fy + 4);
  doc.text('Page ' + pageNum, PW - 15, fy + 4, { align: 'right' });
};

// ─── Section title ────────────────────────────────────────────────────────────
const sectionTitle = (doc, y, PW, title) => {
  setFont(doc, 10, 'bold', C.darkGrey);
  doc.text(title.toUpperCase(), 15, y);
  doc.setDrawColor(...C.orange);
  doc.setLineWidth(1.5);
  doc.line(15, y + 2, 15 + doc.getTextWidth(title.toUpperCase()), y + 2);
  doc.setLineWidth(0.3);
  doc.setDrawColor(...C.border);
  doc.line(15, y + 2, PW - 15, y + 2);
  return y + 9;
};

// ─── Check badge ──────────────────────────────────────────────────────────────
const checkBadge = (doc, x, y, w, h, pass, label, desc) => {
  const bg   = pass ? [240, 250, 244] : [254, 242, 242];
  const border = pass ? C.green : C.red;

  doc.setFillColor(...bg);
  doc.setDrawColor(...border);
  doc.setLineWidth(0.8);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');

  // Icon circle
  doc.setFillColor(...border);
  doc.circle(x + 9, y + h / 2, 4, 'F');
  // Draw tick or cross using lines instead of unicode
  doc.setDrawColor(...C.white);
  doc.setLineWidth(1.2);
  if (pass) {
    // Tick mark
    doc.line(x + 6.5, y + h / 2, x + 8.5, y + h / 2 + 2.5);
    doc.line(x + 8.5, y + h / 2 + 2.5, x + 11.5, y + h / 2 - 2);
  } else {
    // Cross mark
    doc.line(x + 6.5, y + h / 2 - 2.5, x + 11.5, y + h / 2 + 2.5);
    doc.line(x + 11.5, y + h / 2 - 2.5, x + 6.5, y + h / 2 + 2.5);
  }

  setFont(doc, 8, 'bold', C.darkGrey);
  doc.text(label, x + 17, y + h / 2 - 1);
  setFont(doc, 7, 'normal', pass ? C.green : C.red);
  doc.text(pass ? 'CLEAR' : 'ALERT', x + 17, y + h / 2 + 5);
  setFont(doc, 6.5, 'normal', C.midGrey);
  doc.text(desc, x + 17, y + h / 2 + 10);
};

// ─── Key-value row ─────────────────────────────────────────────────────────────
const kvRow = (doc, x, y, w, label, value, alt = false) => {
  if (alt) { doc.setFillColor(...C.rowAlt); doc.rect(x, y - 3, w, 7, 'F'); }
  setFont(doc, 7.5, 'normal', C.midGrey);
  doc.text(label, x + 3, y + 1);
  setFont(doc, 7.5, 'bold', C.darkGrey);
  doc.text(safeString(value), x + w * 0.5, y + 1);
  return y + 7;
};

// ─── Main export ──────────────────────────────────────────────────────────────
export const generateEnhancedVehicleReport = (vehicleData, registration) => {
  if (!vehicleData) throw new Error('Vehicle data required');

  const doc   = new jsPDF({ unit: 'mm', format: 'a4' });
  const PW    = doc.internal.pageSize.getWidth();
  const PH    = doc.internal.pageSize.getHeight();
  const state = { page: 1 };
  const rId   = 'VHR-' + Date.now().toString().slice(-8);
  const reg   = registration.toUpperCase();

  let y = 0;
  const g = (need) => { y = guard(doc, y, need, PH, state, PW, drawFooter); };

  // ── Page 1 header ────────────────────────────────────────────────────────
  drawHeader(doc, PW, reg, rId);
  y = 38;

  // ── Registration plate + vehicle name ────────────────────────────────────
  // Yellow plate
  doc.setFillColor(255, 209, 0);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.5);
  doc.roundedRect(15, y, 68, 14, 2, 2, 'FD');
  setFont(doc, 16, 'bold', C.darkGrey);
  doc.text(reg, 49, y + 10, { align: 'center' });

  // Vehicle name
  const vName = [vehicleData.year, vehicleData.make, vehicleData.model, vehicleData.variant]
    .filter(Boolean).join(' ').toUpperCase();
  setFont(doc, 13, 'bold', C.darkGrey);
  doc.text(vName || 'VEHICLE', 90, y + 7);
  setFont(doc, 8, 'normal', C.midGrey);
  doc.text('Report Date: ' + new Date().toLocaleDateString('en-GB') + '  |  ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 90, y + 13);
  y += 22;

  // ── Safety summary bar ────────────────────────────────────────────────────
  const stolen    = !!vehicleData.stolen;
  const writeOff  = !!vehicleData.writeOff;
  const finance   = !!vehicleData.outstandingFinance;
  const allClear  = !stolen && !writeOff && !finance;

  doc.setFillColor(...(allClear ? [240, 250, 244] : [254, 242, 242]));
  doc.roundedRect(15, y, PW - 30, 10, 2, 2, 'F');
  doc.setFillColor(...(allClear ? C.green : C.red));
  doc.roundedRect(15, y, 3, 10, 1, 1, 'F');
  setFont(doc, 9, 'bold', allClear ? C.green : C.red);
  doc.text(allClear ? 'ALL CHECKS PASSED - No issues found' : 'ISSUES DETECTED - Please review below', 22, y + 7);

  const passCount = [!stolen, !writeOff, !finance].filter(Boolean).length;
  setFont(doc, 8, 'normal', C.midGrey);
  doc.text(passCount + ' of 3 checks passed', PW - 18, y + 7, { align: 'right' });
  y += 16;

  // ── Three check cards ─────────────────────────────────────────────────────
  g(28);
  const cw = (PW - 38) / 3;
  checkBadge(doc, 15,        y, cw, 24, !stolen,   'Theft Check',     stolen   ? 'Reported stolen'    : 'No theft records');
  checkBadge(doc, 17 + cw,   y, cw, 24, !writeOff, 'Write-Off',       writeOff ? 'Insurance write-off' : 'No write-off records');
  checkBadge(doc, 19 + cw*2, y, cw, 24, !finance,  'Finance',         finance  ? 'Outstanding finance' : 'No finance detected');
  y += 31;

  // ── REPORT SUMMARY (always shown - AutoTrader style) ─────────────────────
  g(12);
  y = sectionTitle(doc, y, PW, 'Report Summary');

  setFont(doc, 7.5, 'normal', C.darkGrey);
  doc.text('This is a summary of the vehicle check results.', 15, y);
  y += 8;

  // ── WARNINGS section (always shown) ──────────────────────────────────────
  g(12);
  y = sectionTitle(doc, y, PW, 'Warnings');

  if (writeOff || stolen) {
    if (writeOff) {
      g(32);
      doc.setFillColor(...C.red);
      doc.setDrawColor(...C.red);
      doc.setLineWidth(0.3);
      doc.triangle(20, y + 1, 16.5, y + 7.5, 23.5, y + 7.5, 'F');
      doc.setFillColor(...C.white);
      doc.rect(19.4, y + 2.5, 1.2, 3.2, 'F');
      doc.circle(20, y + 6.8, 0.7, 'F');

      setFont(doc, 8.5, 'bold', [0, 80, 200]);
      doc.text('Insurance write-off recorded', 27, y + 6);
      const wotw = doc.getTextWidth('Insurance write-off recorded');
      doc.setDrawColor(0, 80, 200); doc.setLineWidth(0.3);
      doc.line(27, y + 7, 27 + wotw, y + 7);
      y += 12;

      setFont(doc, 7.5, 'normal', C.darkGrey);
      const woDate = vehicleData.writeOffDate ? fmtDate(vehicleData.writeOffDate) : null;
      doc.text('This vehicle has been written off by an insurance company' + (woDate ? ' on ' + woDate : '') + '.', 15, y);
      y += 6;
      if (vehicleData.writeOffCategory && vehicleData.writeOffCategory !== 'N/A' && vehicleData.writeOffCategory !== 'none') {
        doc.text('Status is: CAT ' + vehicleData.writeOffCategory + (vehicleData.writeOffDescription ? ' - ' + vehicleData.writeOffDescription : ''), 15, y);
        y += 6;
      }
      doc.setDrawColor(...C.border); doc.setLineWidth(0.3);
      doc.line(15, y + 2, PW - 15, y + 2);
      y += 8;
    }

    if (stolen) {
      g(20);
      doc.setFillColor(...C.red);
      doc.triangle(20, y + 1, 16.5, y + 7.5, 23.5, y + 7.5, 'F');
      doc.setFillColor(...C.white);
      doc.rect(19.4, y + 2.5, 1.2, 3.2, 'F');
      doc.circle(20, y + 6.8, 0.7, 'F');

      setFont(doc, 8.5, 'bold', [0, 80, 200]);
      doc.text('Stolen vehicle recorded', 27, y + 6);
      const stw = doc.getTextWidth('Stolen vehicle recorded');
      doc.setDrawColor(0, 80, 200); doc.setLineWidth(0.3);
      doc.line(27, y + 7, 27 + stw, y + 7);
      y += 12;

      setFont(doc, 7.5, 'normal', C.darkGrey);
      doc.text('This vehicle has been reported as stolen.', 15, y);
      y += 8;
    }
  } else {
    // No warnings - show clear message
    g(10);
    doc.setFillColor(240, 250, 244);
    doc.setDrawColor(...C.green);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, y, PW - 30, 9, 2, 2, 'FD');
    setFont(doc, 7.5, 'normal', C.green);
    doc.text('No warnings recorded for this vehicle.', 20, y + 6);
    y += 14;
  }

  // ── CAUTIONS section (always shown) ──────────────────────────────────────
  g(12);
  y = sectionTitle(doc, y, PW, 'Cautions');

  if (finance) {

    g(20);
    doc.setFillColor(...C.amber);
    doc.setDrawColor(...C.amber);
    doc.setLineWidth(0.3);
    doc.triangle(20, y + 1, 16.5, y + 7.5, 23.5, y + 7.5, 'F');
    doc.setFillColor(...C.white);
    doc.rect(19.4, y + 2.5, 1.2, 3.2, 'F');
    doc.circle(20, y + 6.8, 0.7, 'F');

    setFont(doc, 8.5, 'bold', [0, 80, 200]);
    doc.text('Outstanding finance recorded', 27, y + 6);
    const fintw = doc.getTextWidth('Outstanding finance recorded');
    doc.setDrawColor(0, 80, 200); doc.setLineWidth(0.3);
    doc.line(27, y + 7, 27 + fintw, y + 7);
    y += 12;

    setFont(doc, 7.5, 'normal', C.darkGrey);
    doc.text("There's an outstanding finance agreement attached to this vehicle.", 15, y);
    y += 8;

    const finRows = [
      ['Finance company',             safeString(vehicleData.financeCompany)],
      ['Agreement type',              safeString(vehicleData.financeType)],
      ['Agreement number',            safeString(vehicleData.financeAgreementNumber)],
      ['Agreement start date',        safeString(vehicleData.financeStartDate)],
      ['Agreement term',              safeString(vehicleData.financeTerm)],
      ['Contact number',              safeString(vehicleData.financeContact)],
      ['Finance vehicle description', safeString(vehicleData.financeVehicleDescription)],
    ].filter(([, v]) => v !== 'N/A');

    finRows.forEach(([label, value], i) => {
      g(8);
      if (i % 2 === 0) { doc.setFillColor(...C.rowAlt); doc.rect(15, y - 2, PW - 30, 7, 'F'); }
      doc.setDrawColor(...C.border); doc.setLineWidth(0.15);
      doc.line(15, y + 5, PW - 15, y + 5);
      setFont(doc, 7.5, 'normal', C.midGrey);
      doc.text(label, 18, y + 3);
      setFont(doc, 7.5, 'normal', C.darkGrey);
      doc.text(value, 100, y + 3);
      y += 7;
    });
    y += 6;
  } else {
    // No cautions - show clear message
    g(10);
    doc.setFillColor(240, 250, 244);
    doc.setDrawColor(...C.green);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, y, PW - 30, 9, 2, 2, 'FD');
    setFont(doc, 7.5, 'normal', C.green);
    doc.text('No cautions recorded for this vehicle.', 20, y + 6);
    y += 14;
  }

  // ── Summary text ──────────────────────────────────────────────────────────
  g(16);
  setFont(doc, 7.5, 'normal', C.midGrey);
  const sumText = 'This vehicle has passed ' + passCount + ' out of 3 safety checks.' +
    (vehicleData.mileage ? '  Current mileage: ' + Number(vehicleData.mileage).toLocaleString() + ' miles.' : '') +
    (vehicleData.previousOwners != null ? '  ' + vehicleData.previousOwners + ' previous keeper(s).' : '') +
    (allClear ? '  No major issues detected.' : '  Please review alerts above.');
  const lines = doc.splitTextToSize(sumText, PW - 30);
  doc.text(lines, 15, y);
  y += lines.length * 4 + 6;

  // ════════════════════════════════════════════════════════════════════════════
  // VEHICLE DETAILS
  // ════════════════════════════════════════════════════════════════════════════
  g(12);
  y = sectionTitle(doc, y, PW, 'Vehicle Details');

  const half = (PW - 33) / 2;
  const leftData = [
    ['Registration',     reg],
    ['Year of manufacture', safeString(vehicleData.year || vehicleData.manufactureYear)],
    ['First registered', fmtDate(vehicleData.firstRegistered || vehicleData.registrationDate)],
    ['Make',             safeString(vehicleData.make)],
    ['Model',            safeString(vehicleData.model)],
    ['Variant',          safeString(vehicleData.variant)],
    ['Body type',        safeString(vehicleData.bodyType)],
    ['Colour',           safeString(vehicleData.colour || vehicleData.color)],
  ];
  const rightData = [
    ['Engine capacity',  formatEngineSize(vehicleData.engineSize || vehicleData.engineCapacity)],
    ['Engine number',    safeString(vehicleData.engineNumber)],
    ['Fuel type',        safeString(vehicleData.fuelType)],
    ['Transmission',     safeString(vehicleData.transmission)],
    ['Doors',            safeString(vehicleData.doors)],
    ['Seats',            safeString(vehicleData.seats)],
    ['Drive type',       safeString(vehicleData.driveType)],
    ['CO2 Emissions',    vehicleData.co2Emissions ? safeString(vehicleData.co2Emissions) + ' g/km' : 'N/A'],
  ];

  g(leftData.length * 7 + 8);
  const startY = y;
  leftData.forEach(([l, v], i) => {
    kvRow(doc, 15, y + i * 7, half, l, v, i % 2 === 0);
  });
  rightData.forEach(([l, v], i) => {
    kvRow(doc, 18 + half, y + i * 7, half, l, v, i % 2 === 0);
  });
  y += leftData.length * 7 + 6;

  // Road tax + insurance
  if (vehicleData.annualTax || vehicleData.insuranceGroup) {
    g(12);
    doc.setFillColor(...C.tagBg);
    doc.roundedRect(15, y, PW - 30, 9, 2, 2, 'F');
    setFont(doc, 7.5, 'normal', C.midGrey);
    if (vehicleData.annualTax) doc.text('Road Tax (12m): £' + safeString(vehicleData.annualTax), 20, y + 6);
    if (vehicleData.insuranceGroup) doc.text('Insurance Group: ' + safeString(vehicleData.insuranceGroup), 90, y + 6);
    setFont(doc, 6.5, 'italic', C.midGrey);
    doc.text('*Road tax is current rate and may change.', PW - 18, y + 6, { align: 'right' });
    y += 14;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ALL CLEAR SECTION
  // ════════════════════════════════════════════════════════════════════════════
  g(14);
  y = sectionTitle(doc, y, PW, 'All Clear Checks');

  const clearChecks = [
    { label: 'Not recorded as stolen',   pass: !vehicleData.stolen },
    { label: 'Not recorded as scrapped', pass: !vehicleData.scrapped },
    { label: 'No third-party interest',  pass: !vehicleData.outstandingFinance },
    { label: 'No mileage discrepancies', pass: !vehicleData.mileageDiscrepancy },
    { label: !vehicleData.imported  ? 'Not imported'      : 'Imported',       pass: !vehicleData.imported },
    { label: !vehicleData.exported  ? 'Not exported'      : 'Exported',       pass: !vehicleData.exported },
    { label: !vehicleData.colourChanges ? 'No colour changes' : 'Colour changes recorded', pass: !vehicleData.colourChanges },
  ];

  g(clearChecks.length * 6 + 4);
  clearChecks.forEach((c, i) => {
    if (i % 2 === 0) { doc.setFillColor(...C.rowAlt); doc.rect(15, y - 2, PW - 30, 7, 'F'); }
    doc.setFillColor(...(c.pass ? C.green : C.red));
    doc.circle(21, y + 1.5, 2.5, 'F');
    // Draw tick or cross using lines
    doc.setDrawColor(...C.white);
    doc.setLineWidth(0.8);
    if (c.pass) {
      doc.line(19.2, y + 1.5, 20.8, y + 3.2);
      doc.line(20.8, y + 3.2, 23.2, y - 0.5);
    } else {
      doc.line(19.2, y - 0.5, 22.8, y + 3.5);
      doc.line(22.8, y - 0.5, 19.2, y + 3.5);
    }
    setFont(doc, 7.5, 'normal', C.darkGrey);
    doc.text(c.label, 27, y + 3.5);
    y += 6;
  });
  y += 6;

  if (vehicleData.mileage) {
    setFont(doc, 8, 'bold', C.green);
    doc.text('Latest recorded mileage: ' + Number(vehicleData.mileage).toLocaleString() + ' miles', 15, y);
    y += 6;
  }
  setFont(doc, 6.5, 'italic', C.midGrey);
  doc.text('Mileage data sourced from DVLA, BVRLA and MOT records.', 15, y);
  y += 8;

  // ════════════════════════════════════════════════════════════════════════════
  // PREVIOUS KEEPERS
  // ════════════════════════════════════════════════════════════════════════════
  g(22);
  y = sectionTitle(doc, y, PW, 'Previous Keepers');

  doc.setFillColor(...C.rowAlt);
  doc.roundedRect(15, y, PW - 30, 16, 2, 2, 'F');
  setFont(doc, 22, 'bold', C.orange);
  doc.text(safeString(vehicleData.previousOwners), 30, y + 13);
  setFont(doc, 7.5, 'normal', C.midGrey);
  doc.text('Number of previous keepers', 42, y + 7);
  if (vehicleData.lastKeeperChange) {
    doc.text('Last keeper change: ' + fmtDate(vehicleData.lastKeeperChange), 42, y + 13);
  }
  setFont(doc, 6.5, 'italic', C.midGrey);
  doc.text('Frequent keeper changes may indicate problems with the vehicle.', PW - 18, y + 13, { align: 'right' });
  y += 22;

  // ════════════════════════════════════════════════════════════════════════════
  // TO REVIEW — Plate Changes
  // ════════════════════════════════════════════════════════════════════════════
  const plateList = vehicleData.plateChanges || vehicleData.plateChangesList || [];
  const plateArr  = Array.isArray(plateList) ? plateList : [];
  if (plateArr.length > 0) {
    g(14);
    y = sectionTitle(doc, y, PW, 'To Review');

    // Info icon + title
    doc.setFillColor(...C.blue);
    doc.circle(22, y + 8, 4, 'F');
    setFont(doc, 8, 'bold', C.white);
    doc.text('i', 22, y + 10, { align: 'center' });
    setFont(doc, 9, 'bold', [0, 80, 200]);
    doc.text('This vehicle has had plate changes', 30, y + 10);
    y += 18;

    // Table header
    doc.setFillColor(...C.lightGrey);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.rect(15, y, PW - 30, 8, 'FD');
    setFont(doc, 7.5, 'bold', C.darkGrey);
    doc.text('From',         22,  y + 5.5);
    doc.text('To',           80,  y + 5.5);
    doc.text('Date changed', 140, y + 5.5);
    y += 9;

    plateArr.slice(0, 10).forEach((p, i) => {
      g(8);
      if (i % 2 === 0) { doc.setFillColor(...C.rowAlt); doc.rect(15, y - 2, PW - 30, 7, 'F'); }
      doc.setDrawColor(...C.border); doc.setLineWidth(0.15);
      doc.line(15, y + 5, PW - 15, y + 5);
      setFont(doc, 7.5, 'bold', C.darkGrey);
      doc.text(safeString(p.from || p.previousVrm || p.Previous || p.previous), 22, y + 3);
      doc.text(safeString(p.to   || p.newVrm     || p.Current  || p.current),  80, y + 3);
      setFont(doc, 7.5, 'normal', C.darkGrey);
      doc.text(fmtDate(p.date || p.dateOfChange || p.Date), 140, y + 3);
      y += 7;
    });
    y += 8;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MILEAGE HISTORY — Graph + Table (matching screenshot style)
  // ════════════════════════════════════════════════════════════════════════════
  if (vehicleData.mileageHistory && vehicleData.mileageHistory.length > 0) {
    const mhData = vehicleData.mileageHistory;
    const mils   = mhData.map(r => r.mileage || 0);
    const maxM   = Math.max(...mils);
    const latestMil = mils[mils.length - 1];

    // Latest mileage badge
    g(10);
    doc.setFillColor(...C.rowAlt);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, y, 85, 8, 2, 2, 'FD');
    setFont(doc, 7.5, 'normal', C.darkGrey);
    doc.text('Latest mileage: ', 19, y + 5.5);
    setFont(doc, 7.5, 'bold', C.darkGrey);
    doc.text(Number(latestMil).toLocaleString() + ' miles', 52, y + 5.5);
    y += 13;

    // Graph (only if 2+ data points)
    if (mhData.length > 1) {
      g(70);
      y = sectionTitle(doc, y, PW, 'Mileage History');

      const yAxisW = 20;
      const gx = 15 + yAxisW;
      const gy = y + 2;
      const gw = PW - 30 - yAxisW;
      const gh = 48;

      // Y-axis scale: round up to nearest 10k
      const yStepVal = Math.ceil(maxM / 5 / 10000) * 10000 || 10000;
      const yMax = yStepVal * 5;

      // Graph background
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.3);
      doc.rect(gx, gy, gw, gh, 'FD');

      // Horizontal grid lines + Y labels
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.2);
      for (let i = 0; i <= 5; i++) {
        const val   = i * yStepVal;
        const lineY = gy + gh - (val / yMax) * gh;
        if (i > 0 && i < 5) doc.line(gx, lineY, gx + gw, lineY);
        setFont(doc, 6, 'normal', C.midGrey);
        const label = val >= 1000 ? Math.round(val / 1000) + 'k' : String(val);
        doc.text(label, gx - 2, lineY + 1.5, { align: 'right' });
      }

      // Dark navy line (like screenshot)
      doc.setDrawColor(26, 35, 100);
      doc.setLineWidth(1.5);
      for (let i = 0; i < mhData.length - 1; i++) {
        const x1 = gx + (i / (mhData.length - 1)) * gw;
        const y1 = gy + gh - ((mhData[i].mileage || 0) / yMax) * gh;
        const x2 = gx + ((i + 1) / (mhData.length - 1)) * gw;
        const y2 = gy + gh - ((mhData[i + 1].mileage || 0) / yMax) * gh;
        doc.line(x1, y1, x2, y2);
      }

      // Dots
      mhData.forEach((pt, i) => {
        const x  = gx + (i / (mhData.length - 1)) * gw;
        const py = gy + gh - ((pt.mileage || 0) / yMax) * gh;
        doc.setFillColor(26, 35, 100); doc.circle(x, py, 1.5, 'F');
        doc.setFillColor(255, 255, 255); doc.circle(x, py, 0.7, 'F');
      });

      // X-axis: first and last date
      setFont(doc, 6, 'normal', C.midGrey);
      doc.text(fmtDate(mhData[0].date), gx, gy + gh + 5);
      doc.text(fmtDate(mhData[mhData.length - 1].date), gx + gw, gy + gh + 5, { align: 'right' });

      // Legend
      doc.setFillColor(26, 35, 100);
      doc.rect(gx, gy + gh + 11, 8, 1.5, 'F');
      setFont(doc, 6.5, 'normal', C.darkGrey);
      doc.text('Mileage', gx + 10, gy + gh + 12.5);

      y += gh + 24;
    }

    // Table
    g(16);
    doc.setFillColor(...C.lightGrey);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.rect(15, y, PW - 30, 8, 'FD');
    setFont(doc, 7.5, 'bold', C.darkGrey);
    doc.text('Date',    22,  y + 5.5);
    doc.text('Source',  85,  y + 5.5);
    doc.text('Mileage', 145, y + 5.5);
    y += 9;

    // Show most recent first
    mhData.slice().reverse().slice(0, 15).forEach((r, i) => {
      g(8);
      if (i % 2 === 0) { doc.setFillColor(...C.rowAlt); doc.rect(15, y - 2, PW - 30, 7, 'F'); }
      doc.setDrawColor(...C.border); doc.setLineWidth(0.15);
      doc.line(15, y + 5, PW - 15, y + 5);
      setFont(doc, 7.5, 'normal', C.darkGrey);
      doc.text(fmtDate(r.date || r.year), 22, y + 3);
      doc.text(safeString(r.source || 'MOT'), 85, y + 3);
      setFont(doc, 7.5, 'bold', C.darkGrey);
      doc.text(r.mileage ? Number(r.mileage).toLocaleString() : 'N/A', 145, y + 3);
      y += 7;
    });

    setFont(doc, 6.5, 'italic', C.midGrey);
    doc.text('Mileage information can come from the DVLA, BVRLA and MOT.', 15, y + 4);
    y += 12;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MOT HISTORY
  // ════════════════════════════════════════════════════════════════════════════
  g(16);
  y = sectionTitle(doc, y, PW, 'MOT History');

  const motList = vehicleData.motHistory || vehicleData.motTests || [];
  if (motList.length > 0) {
    // Header row
    doc.setFillColor(...C.darkGrey);
    doc.roundedRect(15, y, PW - 30, 8, 1, 1, 'F');
    setFont(doc, 7.5, 'bold', C.white);
    doc.text('Test Date',   22,  y + 5.5);
    doc.text('Mileage',     72,  y + 5.5);
    doc.text('Result',      112, y + 5.5);
    doc.text('Advisories',  145, y + 5.5);
    y += 10;

    motList.slice(0, 12).forEach((mot, i) => {
      g(9);
      if (i % 2 === 0) { doc.setFillColor(...C.rowAlt); doc.rect(15, y - 2, PW - 30, 8, 'F'); }

      const testDate    = mot.testDate || mot.date || mot.completedDate;
      const testMileage = mot.odometerValue || mot.mileage;
      const result      = mot.testResult || mot.result || '';
      const pass        = result === 'PASSED' || result === 'PASS';
      const adv         = (mot.advisoryText || []).length + (mot.defects || []).length;

      setFont(doc, 7.5, 'normal', C.darkGrey);
      doc.text(testDate ? new Date(testDate).toLocaleDateString('en-GB') : 'N/A', 22, y + 3);
      doc.text(testMileage ? Number(testMileage).toLocaleString() : 'N/A', 72, y + 3);

      // Result pill
      pill(doc, 110, y - 1, 26, 7, pass ? 'PASS' : 'FAIL', pass ? C.green : C.red);

      setFont(doc, 7.5, 'normal', adv > 0 ? C.amber : C.midGrey);
      doc.text(adv > 0 ? adv + ' item(s)' : 'None', 145, y + 3);
      y += 8;
    });
  } else {
    doc.setFillColor(...C.rowAlt);
    doc.roundedRect(15, y, PW - 30, 14, 2, 2, 'F');
    setFont(doc, 8, 'normal', C.midGrey);
    doc.text('MOT history not available for this vehicle.', 22, y + 6);
    setFont(doc, 7, 'italic', C.midGrey);
    doc.text('This may be because the vehicle is too new, or MOT data is not yet available.', 22, y + 11);
    y += 20;
  }
  y += 6;

  // ════════════════════════════════════════════════════════════════════════════
  // CO2 / ENVIRONMENTAL
  // ════════════════════════════════════════════════════════════════════════════
  const co2 = vehicleData.co2Emissions?.value || vehicleData.co2Emissions;
  if (co2) {
    g(22);
    y = sectionTitle(doc, y, PW, 'Environmental Impact');
    doc.setFillColor(240, 250, 244);
    doc.roundedRect(15, y, PW - 30, 14, 2, 2, 'F');
    setFont(doc, 18, 'bold', C.green);
    doc.text(safeString(co2) + ' g/km', 30, y + 10);
    setFont(doc, 7.5, 'normal', C.midGrey);
    doc.text('CO2 Emissions', 75, y + 7);
    setFont(doc, 6.5, 'italic', C.midGrey);
    doc.text('Lower emissions = Lower road tax. Disclaimer: not covered by data guarantee.', 75, y + 12);
    y += 20;
  }

  // ── Final footer ──────────────────────────────────────────────────────────
  drawFooter(doc, PW, PH, state.page, true);

  doc.save('CARCATLOG-' + reg + '-' + new Date().toISOString().split('T')[0] + '.pdf');
};