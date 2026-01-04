import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = '', inline = false }) => {
  const sizeClass = `spinner-${size}`;
  const containerClass = inline ? 'spinner-inline' : 'spinner-block';

  return (
    <div className={`loading-spinner-container ${containerClass}`}>
      <div className={`loading-spinner ${sizeClass}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
