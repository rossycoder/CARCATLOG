import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsedCarsPage.css';
import HeroSection from '../components/UsedCarsRedesign/HeroSection';
import FeaturedContent from '../components/UsedCarsRedesign/FeaturedContent';
import StatisticsSection from '../components/UsedCarsRedesign/StatisticsSection';
import ValueProposition from '../components/UsedCarsRedesign/ValueProposition';
import PostcodeSearch from '../components/PostcodeSearch/PostcodeSearch';
import { carService } from '../services/carService';
import {
  heroContent,
  featuredSections,
  statistics,
  benefits
} from '../data/usedCarsRedesignData';

const UsedCarsPage = () => {
  const navigate = useNavigate();
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

  const handleFilterClick = () => {
    // Navigate to search results page
    navigate('/search-results');
  };

  return (
    <div className="used-cars-page-redesign">
      <HeroSection 
        headline={heroContent.headline}
        subheadline={heroContent.subheadline}
        onFilterClick={handleFilterClick}
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
