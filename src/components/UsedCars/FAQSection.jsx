import React, { useState } from 'react';
import './FAQSection.css';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'When is the best time to buy a used car?',
      answer: 'The best time to buy a used car is typically at the end of the month or quarter when dealers are trying to meet sales targets. Additionally, September and March see new registration plates, which can mean good deals on older models.'
    },
    {
      question: 'Are used cars reliable?',
      answer: 'Yes, used cars can be very reliable, especially if they\'ve been well-maintained. Always check the service history, get a vehicle history check, and consider having a pre-purchase inspection done by a mechanic.'
    },
    {
      question: 'Can I test drive a used car?',
      answer: 'Absolutely! A test drive is essential when buying a used car. It allows you to check the car\'s condition, comfort, and performance. Most dealers and private sellers will be happy to arrange a test drive.'
    },
    {
      question: 'Can a used car be returned?',
      answer: 'If you buy from a dealer, you have consumer rights that may allow you to return the car if it\'s faulty. However, private sales are usually final. Always check the returns policy before purchasing.'
    },
    {
      question: 'What is good mileage for a used car?',
      answer: 'The average UK driver covers about 7,400 miles per year. A car with lower than average mileage for its age is generally considered good. However, very low mileage can also indicate the car hasn\'t been used regularly, which can cause issues.'
    },
    {
      question: 'What is a used car worth?',
      answer: 'A used car\'s value depends on factors like age, mileage, condition, service history, and market demand. Use online valuation tools and compare similar cars for sale to get an accurate estimate.'
    },
    {
      question: 'Are used cars cheaper to insure?',
      answer: 'Generally, yes. Used cars typically have lower insurance premiums than new cars because they have a lower market value. However, insurance costs also depend on the car\'s insurance group, your age, and driving history.'
    },
    {
      question: 'Can I buy a used car online?',
      answer: 'Yes! Many dealers now offer online purchasing with home delivery. You can browse, reserve, arrange finance, and complete the purchase entirely online. Some even offer money-back guarantees if you\'re not satisfied.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section used-cars-section">
      <div className="section-header">
        <h2 className="section-title">Your questions answered</h2>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item ${openIndex === index ? 'open' : ''}`}
          >
            <button 
              className="faq-question"
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
            >
              <span>{faq.question}</span>
              <svg 
                className="faq-icon" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
              </svg>
            </button>
            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
