import React, { useEffect } from 'react';
import './UsedCarsPage.css';
import HeroSection from '../components/UsedCarsRedesign/HeroSection';
import FeaturedContent from '../components/UsedCarsRedesign/FeaturedContent';
import StatisticsSection from '../components/UsedCarsRedesign/StatisticsSection';
import PromotionalContent from '../components/UsedCarsRedesign/PromotionalContent';
import ValueProposition from '../components/UsedCarsRedesign/ValueProposition';
import PostcodeSearch from '../components/PostcodeSearch/PostcodeSearch';
import {
  heroContent,
  featuredSections,
  statistics,
  promotionalContent,
  benefits
} from '../data/usedCarsRedesignData';

const UsedCarsPage = () => {
  useEffect(() => {
    document.title = 'Used Cars for Sale | CarCatALog';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="used-cars-page-redesign">
      <HeroSection 
        headline={heroContent.headline}
        subheadline={heroContent.subheadline}
      />
      
    
     {/* Partners Section */}
      <section className="partners-section">
        <div className="container">
          <h2>Please visit our partners for your vehicle essentials</h2>
          <div className="partners-grid">
            <div className="partner-card">
              <div className="partner-image">
                <img src="/images/dummy/1.jpeg" alt="Partner 1" />
              </div>
            </div>
            <div className="partner-card">
              <div className="partner-image">
                <img src="/images/dummy/2.jpeg" alt="Partner 2" />
              </div>
            </div>
            <div className="partner-card">
              <div className="partner-image">
                <img src="/images/dummy/3.jpeg" alt="Partner 3" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <PostcodeSearch />
      
      <FeaturedContent sections={featuredSections} />
      
      <StatisticsSection 
        carCount={statistics.carCount}
        label={statistics.label}
        subtitle={statistics.subtitle}
      />
      
      <PromotionalContent 
        image={promotionalContent.image}
        title={promotionalContent.title}
        subtitle={promotionalContent.subtitle}
        price={promotionalContent.price}
        features={promotionalContent.features}
        cta={promotionalContent.cta}
      />
      
      <ValueProposition benefits={benefits} />
    </div>
  );
};

export default UsedCarsPage;
