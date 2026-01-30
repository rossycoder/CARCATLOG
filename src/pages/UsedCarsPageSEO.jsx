// SEO wrapper for UsedCarsPage
import SEOHelmet from '../components/SEO/SEOHelmet';
import { breadcrumbSchema } from '../utils/seoSchemas';

export const UsedCarsPageSEO = () => (
  <SEOHelmet 
    title="Used Cars for Sale UK | Quality Pre-Owned Vehicles | CarCatlog"
    description="Browse thousands of quality used cars for sale across the UK. Find your perfect pre-owned vehicle with detailed history checks, competitive prices, and trusted sellers."
    keywords="used cars UK, second hand cars, pre-owned cars, quality used vehicles, buy used car, certified pre-owned"
    url="/used-cars"
    schema={breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Used Cars', url: '/used-cars' }
    ])}
  />
);

export const NewCarsPageSEO = () => (
  <SEOHelmet 
    title="New Cars for Sale UK | Latest Models & Best Deals | CarCatlog"
    description="Discover the latest new cars for sale in the UK. Compare prices, specifications, and find the best deals on brand new vehicles from trusted dealers."
    keywords="new cars UK, brand new cars, latest car models, new car deals, buy new car"
    url="/new-cars"
    schema={breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'New Cars', url: '/new-cars' }
    ])}
  />
);

export const SellYourCarPageSEO = () => (
  <SEOHelmet 
    title="Sell Your Car Fast | Free Valuation & Easy Listing | CarCatlog"
    description="Sell your car quickly and easily. Get a free instant valuation, create your listing in minutes, and reach thousands of potential buyers across the UK."
    keywords="sell my car, car valuation, sell car online, quick car sale, free car valuation UK"
    url="/sell-your-car"
    schema={breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Sell Your Car', url: '/sell-your-car' }
    ])}
  />
);

export const VehicleCheckPageSEO = () => (
  <SEOHelmet 
    title="Vehicle Check UK | MOT History, Tax & Mileage Check | CarCatlog"
    description="Get a comprehensive vehicle check. View MOT history, tax status, mileage verification, and full vehicle details. Instant results for any UK registration."
    keywords="vehicle check UK, MOT history check, car tax check, mileage verification, vehicle history report, reg check"
    url="/vehicle-check"
    schema={breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Vehicle Check', url: '/vehicle-check' }
    ])}
  />
);

export const ValuationPageSEO = () => (
  <SEOHelmet 
    title="Free Car Valuation UK | Instant Vehicle Value Check | CarCatlog"
    description="Get a free instant car valuation. Find out what your vehicle is worth with our accurate valuation tool. Quick, easy, and completely free."
    keywords="car valuation UK, free car valuation, vehicle value check, how much is my car worth, instant car valuation"
    url="/valuation"
    schema={breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Car Valuation', url: '/valuation' }
    ])}
  />
);

export const BikesPageSEO = () => (
  <SEOHelmet 
    title="Bikes for Sale UK | Motorcycles & Scooters | CarCatlog"
    description="Find your perfect bike. Browse thousands of motorcycles and scooters for sale across the UK. New and used bikes from trusted sellers."
    keywords="bikes for sale UK, motorcycles, scooters, buy bike, used motorcycles, new bikes"
    url="/bikes"
    schema={breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Bikes', url: '/bikes' }
    ])}
  />
);

export const VansPageSEO = () => (
  <SEOHelmet 
    title="Vans for Sale UK | Commercial Vehicles | CarCatlog"
    description="Browse quality vans for sale across the UK. Find the perfect commercial vehicle for your business. New and used vans from trusted dealers."
    keywords="vans for sale UK, commercial vehicles, buy van, used vans, new vans, panel vans"
    url="/vans"
    schema={breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Vans', url: '/vans' }
    ])}
  />
);
