import { useState } from 'react';
import './FAQSection.css';

function FAQSection() {
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
      id: 'faq-1',
      question: 'How much is my car worth?'
    },
    {
      id: 'faq-2',
      question: 'How do I value my car?'
    },
    {
      id: 'faq-3',
      question: 'Are CarCatALog car valuations accurate?'
    },
    {
      id: 'faq-4',
      question: 'Why get a car valuation?'
    },
    {
      id: 'faq-5',
      question: 'How does mileage affect a car\'s value?'
    },
    {
      id: 'faq-6',
      question: 'Should I sell my car or part exchange it?'
    }
  ];

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <h2 className="faq-title">Your questions answered</h2>
        
        <div className="faq-list">
          {faqs.map((faq) => (
            <div key={faq.id} className="faq-item">
              <button
                className="faq-question"
                onClick={() => toggleFAQ(faq.id)}
                aria-expanded={expandedId === faq.id}
              >
                <svg
                  className="plus-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>{faq.question}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
