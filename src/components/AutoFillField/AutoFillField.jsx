import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import './AutoFillField.css';

const AutoFillField = ({
  label,
  value,
  onChange,
  source,
  type = 'text',
  unit = '',
  placeholder = '',
  min,
  max,
  step,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const isAutoFilled = !!source;

  // Update internal state when value prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={`auto-fill-field ${isAutoFilled ? 'auto-filled' : ''}`}>
      <label className="auto-fill-label">
        {label}
        {isAutoFilled && (
          <span className="auto-fill-indicator" title={`Auto-filled from ${source}`}>
            <Info size={14} />
            <span className="auto-fill-tooltip">
              Auto-filled from {source === 'checkcardetails' ? 'CheckCarDetails' : 'DVLA'}
            </span>
          </span>
        )}
      </label>
      <div className="auto-fill-input-wrapper">
        <input
          type={type}
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`auto-fill-input ${isAutoFilled ? 'has-auto-fill' : ''}`}
        />
        {unit && <span className="input-unit">{unit}</span>}
      </div>
    </div>
  );
};

export default AutoFillField;
