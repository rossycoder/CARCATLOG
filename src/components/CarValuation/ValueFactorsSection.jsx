import './ValueFactorsSection.css';

function ValueFactorsSection() {
  return (
    <section className="value-factors-section">
      <div className="value-factors-container">
        {/* Top Section with Car Image */}
        <div className="factors-hero">
          <div className="factors-content">
            <h2 className="factors-title">We know what your car is really worth</h2>
            <p className="factors-description">
              With CarCatALog, you can get an independent valuation that is only driven by data. 
              Your valuation considers numerous factors such as your vehicle's age, mileage, spec 
              and optional extras, to give you the most up to date valuation we possibly can.
            </p>
            <p className="factors-description">
              It's completely free and within seconds we will give you a live valuation of what 
              your car is worth. So whether it's your first car, or the one that was built for 
              family adventures, we know what your car is really worth.
            </p>
          </div>
          <div className="factors-image-wrapper">
            <div className="car-specs">
              <div className="spec-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                <span>Make</span>
              </div>
              <div className="spec-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                <span>Model</span>
              </div>
              <div className="spec-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
                <span>Mileage</span>
              </div>
              <div className="spec-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Age</span>
              </div>
              <div className="spec-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                <span>Optional extras</span>
              </div>
              <div className="spec-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span>Fuel type</span>
              </div>
            </div>
            <div className="factors-image">
              <img 
                src="https://www.CarCatALog.co.uk/valuations/images/static/ford-s-max.png" 
                alt="Blue Ford S-Max" 
                onError={(e) => {
                  e.target.src = '/images/dummy/family-car.jpg';
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section with Factor Cards */}
        <div className="factors-bottom">
          <div className="factors-cards">
            <div className="factor-card">
              <div className="factor-card-image">
                <img 
                  src="https://www.CarCatALog.co.uk/valuations/images/static/ford-s-max.png" 
                  alt="Red car" 
                  onError={(e) => {
                    e.target.src = '/images/dummy/family-car.jpg';
                  }}
                />
              </div>
              <h3 className="factor-card-title">Things that can increase a car's value</h3>
              <ul className="factor-list">
                <li className="factor-list-item">
                  <span className="factor-icon">+</span>
                  <span>Modifications</span>
                </li>
                <li className="factor-list-item">
                  <span className="factor-icon">+</span>
                  <span>Full service history</span>
                </li>
                <li className="factor-list-item">
                  <span className="factor-icon">+</span>
                  <span>Desirable colour</span>
                </li>
                <li className="factor-list-item">
                  <span className="factor-icon">+</span>
                  <span>No damage</span>
                </li>
              </ul>
            </div>

            <div className="factor-card">
              <div className="factor-card-image">
                <img 
                  src="https://www.CarCatALog.co.uk/valuations/images/static/ford-s-max.png" 
                  alt="Blue car" 
                  onError={(e) => {
                    e.target.src = '/images/dummy/family-car.jpg';
                  }}
                />
              </div>
              <h3 className="factor-card-title">Things that can decrease a car's value</h3>
              <ul className="factor-list">
                <li className="factor-list-item">
                  <span className="factor-icon">+</span>
                  <span>Significant wear and tear</span>
                </li>
                <li className="factor-list-item">
                  <span className="factor-icon">+</span>
                  <span>Parts not working</span>
                </li>
                <li className="factor-list-item">
                  <span className="factor-icon">+</span>
                  <span>Lots of previous owners</span>
                </li>
                <li className="factor-list-item">
                  <span className="factor-icon">+</span>
                  <span>Gaps in service history and/or no MOT</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueFactorsSection;
