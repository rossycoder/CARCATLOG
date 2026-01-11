// Mock data for Used Cars Page Redesign

export const brands = [
  { 
    name: 'Ford', 
    logo: '/images/brands/ford.png',
    alt: 'Ford Logo'
  },
  { 
    name: 'Volkswagen', 
    logo: '/images/brands/vw.png',
    alt: 'Volkswagen Logo'
  },
  { 
    name: 'Audi', 
    logo: '/images/brands/audi.png',
    alt: 'Audi Logo'
  },
  { 
    name: 'Mercedes-Benz', 
    logo: '/images/brands/mercedes.png',
    alt: 'Mercedes-Benz Logo'
  }
];

export const featuredSections = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
    title: 'Find your perfect match',
    description: 'Browse thousands of quality used cars from trusted dealers and private sellers. Our extensive inventory ensures you\'ll find the right vehicle for your needs and budget.',
    imagePosition: 'left'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    title: 'Family-friendly options',
    description: 'Discover spacious and safe vehicles perfect for families. From SUVs to minivans, we have the perfect car to keep your loved ones comfortable and secure.',
    imagePosition: 'right'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    title: 'Quality you can trust',
    description: 'Every vehicle undergoes rigorous inspection to ensure quality and reliability. Buy with confidence knowing your car meets our high standards.',
    imagePosition: 'left'
  }
];

export const benefits = [
  {
    id: 1,
    icon: 'shield',
    title: 'Quality checked',
    description: 'Every car is thoroughly inspected by certified professionals'
  },
  {
    id: 2,
    icon: 'delivery',
    title: 'Home delivery',
    description: 'Get your car delivered right to your doorstep'
  },
  {
    id: 3,
    icon: 'warranty',
    title: 'Warranty included',
    description: 'Peace of mind with comprehensive warranty coverage'
  },
  {
    id: 4,
    icon: 'finance',
    title: 'Flexible financing',
    description: 'Affordable payment plans tailored to your budget'
  },
  {
    id: 5,
    icon: 'support',
    title: '24/7 Support',
    description: 'Expert assistance whenever you need it'
  },
  {
    id: 6,
    icon: 'exchange',
    title: 'Easy exchange',
    description: '7-day return policy for complete satisfaction'
  }
];

export const promotionalContent = {
  id: 1,
  image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
  title: 'Special offer on premium vehicles',
  subtitle: 'Save up to £350 per month',
  price: '£350',
  features: [
    'Low mileage vehicles',
    'Full service history',
    'Comprehensive warranty',
    'Free home delivery'
  ],
  cta: 'View deals'
};

export const trustIndicators = {
  rating: 4.9,
  reviewCount: 12847,
  features: [
    'Trusted by millions',
    'Verified dealers',
    'Secure payments'
  ]
};

export const statistics = {
  carCount: 0,
  
  subtitle: 'Find your perfect car today'
};

export const heroContent = {
  headline: 'Find your perfect car',
  subheadline: 'Search thousands of quality used cars',
  searchPlaceholders: {
    make: 'Make',
    model: 'Model',
    location: 'Location'
  },
  ctaText: 'Search cars'
};
