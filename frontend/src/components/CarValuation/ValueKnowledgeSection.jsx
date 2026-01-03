import './ValueKnowledgeSection.css';

function ValueKnowledgeSection() {
  return (
    <section className="value-knowledge-section">
      <div className="value-knowledge-container">
        <h2 className="section-title">Join the millions who value their car with CarCatALog.</h2>
        
        <div className="knowledge-grid">
          <div className="knowledge-item">
            <div className="knowledge-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" fill="#f0f4ff" />
                <path d="M24 22h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H24a2 2 0 0 1-2-2V24a2 2 0 0 1 2-2z" stroke="#e63946" strokeWidth="2" fill="none"/>
                <path d="M28 28h8M28 32h8M28 36h4" stroke="#e63946" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="38" cy="38" r="3" fill="#e63946"/>
                <path d="M38 35v6M35 38h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="knowledge-text">
              We look at millions of vehicles to get you an accurate valuation.
            </p>
          </div>

          <div className="knowledge-item">
            <div className="knowledge-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" fill="#f0f4ff" />
                <path d="M32 24l4 8h8l-6 6 2 8-8-4-8 4 2-8-6-6h8z" fill="none" stroke="#e63946" strokeWidth="2"/>
                <circle cx="32" cy="28" r="2" fill="#e63946"/>
                <path d="M28 32h8" stroke="#e63946" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="knowledge-text">
              With CarCatALog, you can get an independent valuation that is only driven by data.
            </p>
          </div>

          <div className="knowledge-item">
            <div className="knowledge-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" fill="#f0f4ff" />
                <circle cx="32" cy="32" r="12" fill="none" stroke="#e63946" strokeWidth="2"/>
                <path d="M32 26v6l4 4" stroke="#e63946" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="44" cy="32" r="2" fill="#e63946"/>
                <circle cx="20" cy="32" r="2" fill="#e63946"/>
              </svg>
            </div>
            <p className="knowledge-text">
              Did we mention it's completely free and ready in seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueKnowledgeSection;
