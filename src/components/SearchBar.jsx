import { useState, useEffect } from 'react';
import './SearchBar.css';
import { carService } from '../services/carService';

const SearchBar = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    postcode: '',
    make: '',
    model: '',
  });
  const [carCount, setCarCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch total car count on component mount
  useEffect(() => {
    const fetchCarCount = async () => {
      try {
        setLoading(true);
        const count = await carService.getCarCount();
        setCarCount(count);
      } catch (error) {
        console.error('Error fetching car count:', error);
        setCarCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCarCount();
  }, []);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-inputs">
        <input
          type="text"
          name="postcode"
          placeholder="Postcode"
          value={filters.postcode}
          onChange={handleChange}
          className="search-input"
        />
        <input
          type="text"
          name="make"
          placeholder="Make"
          value={filters.make}
          onChange={handleChange}
          className="search-input"
        />
        <input
          type="text"
          name="model"
          placeholder="Model"
          value={filters.model}
          onChange={handleChange}
          className="search-input"
        />
        <button type="submit" className="search-btn">
          🔍 Search {loading ? '...' : carCount} cars
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
