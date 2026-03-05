import React, { useState } from 'react';
import './Accordion.css';
import { FaChevronDown } from 'react-icons/fa';

const AccordionItem = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
      <button className="accordion-header" onClick={onToggle}>
        <span>{title}</span>
        <FaChevronDown className={`accordion-icon ${isOpen ? 'rotate' : ''}`} />
      </button>
      <div className={`accordion-content ${isOpen ? 'show' : ''}`}>
        <div className="accordion-body">
          {children}
        </div>
      </div>
    </div>
  );
};

const Accordion = ({ items, allowMultiple = false }) => {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenItems(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenItems(prev =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  return (
    <div className="accordion">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          isOpen={openItems.includes(index)}
          onToggle={() => toggleItem(index)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;
