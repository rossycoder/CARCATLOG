import { useEffect, useState } from 'react';
import './UsedCarsPage.css';
import HeroSection from '../components/UsedCarsRedesign/HeroSection';
import FeaturedContent from '../components/UsedCarsRedesign/FeaturedContent';
import StatisticsSection from '../components/UsedCarsRedesign/StatisticsSection';
import ValueProposition from '../components/UsedCarsRedesign/ValueProposition';
import PostcodeSearch from '../components/PostcodeSearch/PostcodeSearch';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import { carService } from '../services/carService';
import {
  heroContent,
  featuredSections,
  statistics,
  benefits
} from '../data/usedCarsRedesignData';

const UsedCarsPage = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [carCount, setCarCount] = useState(statistics.carCount);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Used Cars for Sale | CarCatALog';
    window.scrollTo(0, 0);
    fetchCarCount();
  }, []);

  const fetchCarCount = async () => {
    try {
      setLoading(true);
      const count = await carService.getCarCount();
      setCarCount(count);
      console.log('Real car count from database:', count);
    } catch (err) {
      console.error('Error fetching car count:', err);
      // Keep the default count from statistics if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filters) => {
    console.log('Filters applied:', filters);
    // Handle filter application logic here
  };

  return (
    <div className="used-cars-page-redesign">
      <HeroSection 
        headline={heroContent.headline}
        subheadline={heroContent.subheadline}
        onFilterClick={() => setIsFilterOpen(true)}
      />
      
      <FilterSidebar 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
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
        carCount={carCount}
        label={statistics.label}
        subtitle={statistics.subtitle}
        loading={loading}
      />
      
      <ValueProposition benefits={benefits} />
    </div>
  );
};

export default UsedCarsPage;
