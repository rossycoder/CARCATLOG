import HeroValuationSection from '../components/CarValuation/HeroValuationSection';
import ValueKnowledgeSection from '../components/CarValuation/ValueKnowledgeSection';
import ValueFactorsSection from '../components/CarValuation/ValueFactorsSection';
import FAQSection from '../components/CarValuation/FAQSection';
import NewsletterSection from '../components/CarValuation/NewsletterSection';
import TrustIndicatorsSection from '../components/CarValuation/TrustIndicatorsSection';
import './CarValuationPage.css';

function CarValuationPage() {
  return (
    <div className="car-valuation-page">
      <HeroValuationSection />
      <ValueKnowledgeSection />
      <ValueFactorsSection />
      <FAQSection />
      <NewsletterSection />
      <TrustIndicatorsSection />
    </div>
  );
}

export default CarValuationPage;
