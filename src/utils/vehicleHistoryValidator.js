/**
 * Vehicle History Data Validation Utilities
 * Detects and handles inconsistencies in vehicle history data
 */

export function validateVehicleHistory(historyData) {
  const issues = [];
  const warnings = [];
  
  if (!historyData) {
    return { isValid: true, issues: [], warnings: [] };
  }

  const writeOffContradiction = detectWriteOffContradiction(historyData);
  if (writeOffContradiction) {
    issues.push(writeOffContradiction);
  }

  const otherIssues = detectOtherContradictions(historyData);
  warnings.push(...otherIssues);

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    hasContradictions: issues.length > 0 || warnings.length > 0
  };
}

function detectWriteOffContradiction(historyData) {
  const checks = historyData.checks || [];
  
  const writeOffChecks = checks.filter(check => 
    check.description && (
      check.description.toLowerCase().includes('category') ||
      check.description.toLowerCase().includes('written off') ||
      check.description.toLowerCase().includes('write-off') ||
      check.description.toLowerCase().includes('writeoff')
    )
  );

  if (writeOffChecks.length < 2) {
    return null;
  }

  const categoryChecks = writeOffChecks.filter(check => 
    check.description.toLowerCase().includes('category')
  );
  
  const neverWrittenOffChecks = writeOffChecks.filter(check => 
    check.description.toLowerCase().includes('never been written off')
  );

  if (categoryChecks.length > 0 && neverWrittenOffChecks.length > 0) {
    const categoryCheck = categoryChecks.find(check => check.status === 'alert' || check.status === 'fail');
    const neverWrittenOffCheck = neverWrittenOffChecks.find(check => check.status === 'pass');
    
    if (categoryCheck && neverWrittenOffCheck) {
      return {
        type: 'WRITE_OFF_CONTRADICTION',
        severity: 'high',
        description: 'Conflicting write-off status detected',
        details: {
          contradiction: `Vehicle shows "${categoryCheck.description}" but also "${neverWrittenOffCheck.description}"`,
          conflictingChecks: [categoryCheck, neverWrittenOffCheck]
        },
        recommendation: 'This data inconsistency should be investigated. Category D/N vehicles are considered written off.'
      };
    }
  }

  return null;
}

function detectOtherContradictions(historyData) {
  const warnings = [];
  const checks = historyData.checks || [];

  const motChecks = checks.filter(check => 
    check.description && check.description.toLowerCase().includes('mot')
  );

  if (motChecks.length > 1) {
    const passedMOT = motChecks.filter(check => check.status === 'pass');
    const failedMOT = motChecks.filter(check => check.status === 'fail');
    
    if (passedMOT.length > 0 && failedMOT.length > 0) {
      warnings.push({
        type: 'MOT_INCONSISTENCY',
        severity: 'medium',
        description: 'Inconsistent MOT status detected',
        details: 'Multiple conflicting MOT status entries found'
      });
    }
  }

  return warnings;
}

export function formatValidationResults(validation) {
  if (!validation.hasContradictions) {
    return null;
  }

  return {
    showWarning: true,
    title: 'Data Quality Notice',
    message: validation.issues.length > 0 
      ? 'Conflicting information detected in vehicle history'
      : 'Potential data inconsistencies detected',
    severity: validation.issues.length > 0 ? 'high' : 'medium',
    details: [...validation.issues, ...validation.warnings]
  };
}
