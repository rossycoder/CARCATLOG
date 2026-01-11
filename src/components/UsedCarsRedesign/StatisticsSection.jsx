import './StatisticsSection.css';

const StatisticsSection = ({ carCount, label, subtitle, loading }) => {
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  return (
    <section className="statistics-section">
      <div className="statistics-content">
        <div className="statistics-number">
          {loading ? '...' : formatNumber(carCount)}
        </div>
        <div className="statistics-label">{label}</div>
        {subtitle && <div className="statistics-subtitle">{subtitle}</div>}
      </div>
    </section>
  );
};

export default StatisticsSection;
