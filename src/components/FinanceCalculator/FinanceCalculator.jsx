import React, { useState, useMemo } from 'react';
import './FinanceCalculator.css';

const FinanceCalculator = ({
  price = 10995,
  apr = 9.9,
  minDepositPercent = 0,
  maxDepositPercent = 50,
}) => {
  const [financeType, setFinanceType] = useState('HP');
  const [depositPercent, setDepositPercent] = useState(10);
  const [term, setTerm] = useState(48);

  const depositAmount = useMemo(() => {
    return (price * depositPercent) / 100;
  }, [price, depositPercent]);

  const loanAmount = price - depositAmount;
  const monthlyRate = apr / 100 / 12;

  // PCP balloon value (40% residual example)
  const balloonValue = financeType === 'PCP' ? price * 0.4 : 0;

  const amountFinanced =
    financeType === 'PCP' ? loanAmount - balloonValue : loanAmount;

  const monthlyPayment =
    (amountFinanced * monthlyRate) /
    (1 - Math.pow(1 + monthlyRate, -term));

  const totalPayable =
    monthlyPayment * term +
    depositAmount +
    (financeType === 'PCP' ? balloonValue : 0);

  const totalInterest = totalPayable - price;

  const format = (num) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <div className="finance-calculator">
      <h3 className="finance-heading">
        Finance calculator <span className="estimate">(estimate)</span>
      </h3>

      {/* HP / PCP Toggle */}
      <div className="finance-toggle-wrap">
        <button
          className={`finance-toggle ${financeType === 'HP' ? 'active' : ''}`}
          onClick={() => setFinanceType('HP')}
        >
          HP
        </button>
        <button
          className={`finance-toggle ${financeType === 'PCP' ? 'active' : ''}`}
          onClick={() => setFinanceType('PCP')}
        >
          PCP
        </button>
      </div>

      {/* Vehicle Price */}
      <div className="finance-row">
        <div>Vehicle price:</div>
        <div className="finance-value">{format(price)}</div>
      </div>
      <div className="slider-container">
        <input
          type="range"
          min={price * 0.8}
          max={price * 1.2}
          step="100"
          value={price}
          disabled
          className="finance-slider disabled"
        />
      </div>

      {/* Deposit */}
      <div className="finance-row">
        <div>
          Deposit: {depositPercent}% ({format(depositAmount)})
        </div>
        <div className="finance-value">{format(depositAmount)}</div>
      </div>
      <div className="slider-container">
        <input
          type="range"
          min={minDepositPercent}
          max={maxDepositPercent}
          value={depositPercent}
          onChange={(e) => setDepositPercent(Number(e.target.value))}
          className="finance-slider"
        />
      </div>

      {/* Term */}
      <div className="finance-row">
        <div>Term: {term} months</div>
        <div className="finance-value">{term} months</div>
      </div>
      <div className="slider-container">
        <input
          type="range"
          min={24}
          max={60}
          step={12}
          value={term}
          onChange={(e) => setTerm(Number(e.target.value))}
          className="finance-slider"
        />
      </div>

      <hr className="finance-divider" />

      {/* Results */}
      <div className="finance-result-box">
        <div className="finance-monthly">
          Estimated monthly:{' '}
          <strong>{format(monthlyPayment)} / month</strong>
        </div>

        <div className="finance-small">
          Amount financed: {format(loanAmount)}
        </div>

        <div className="finance-small">
          Total payable: {format(totalPayable)} · Total interest:{' '}
          {format(totalInterest)}
        </div>

        {financeType === 'PCP' && (
          <div className="finance-small pcp-balloon">
            Optional final payment: {format(balloonValue)}
          </div>
        )}
      </div>

      <p className="finance-disclaimer">
        Representative example. Finance subject to status. Terms and conditions apply.
      </p>
    </div>
  );
};

export default FinanceCalculator;
