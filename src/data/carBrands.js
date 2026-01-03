// Comprehensive list of car brands
export const carBrands = [
  // Premium/Luxury Brands
  { name: 'Audi', logo: '🅰️', category: 'premium' },
  { name: 'BMW', logo: 'Ⓜ️', category: 'premium' },
  { name: 'Mercedes-Benz', logo: '⭐', category: 'premium' },
  { name: 'Volvo', logo: 'V', category: 'premium' },
  { name: 'Lexus', logo: 'L', category: 'premium' },
  { name: 'Porsche', logo: 'P', category: 'premium' },
  { name: 'Jaguar', logo: '🐆', category: 'premium' },
  { name: 'Land Rover', logo: '🏔️', category: 'premium' },
  
  // Popular Brands
  { name: 'Toyota', logo: 'T', category: 'popular' },
  { name: 'Honda', logo: 'H', category: 'popular' },
  { name: 'Ford', logo: 'F', category: 'popular' },
  { name: 'Volkswagen', logo: 'VW', category: 'popular' },
  { name: 'Nissan', logo: 'N', category: 'popular' },
  { name: 'Hyundai', logo: 'H', category: 'popular' },
  { name: 'Kia', logo: 'K', category: 'popular' },
  { name: 'Mazda', logo: 'M', category: 'popular' },
  
  // Electric/Modern
  { name: 'Tesla', logo: '⚡', category: 'electric' },
  { name: 'Polestar', logo: '⭐', category: 'electric' },
  { name: 'Rivian', logo: 'R', category: 'electric' },
  { name: 'Lucid', logo: 'L', category: 'electric' },
  
  // French Brands
  { name: 'Peugeot', logo: '🦁', category: 'french' },
  { name: 'Renault', logo: 'R', category: 'french' },
  { name: 'Citroën', logo: 'C', category: 'french' },
  { name: 'DS', logo: 'DS', category: 'french' },
  
  // Italian Brands
  { name: 'Ferrari', logo: '🐎', category: 'italian' },
  { name: 'Lamborghini', logo: '🐂', category: 'italian' },
  { name: 'Maserati', logo: '🔱', category: 'italian' },
  { name: 'Alfa Romeo', logo: 'AR', category: 'italian' },
  { name: 'Fiat', logo: 'F', category: 'italian' },
  
  // American Brands
  { name: 'Chevrolet', logo: '⚡', category: 'american' },
  { name: 'Dodge', logo: 'D', category: 'american' },
  { name: 'Jeep', logo: '🚙', category: 'american' },
  { name: 'Cadillac', logo: 'C', category: 'american' },
  { name: 'Lincoln', logo: 'L', category: 'american' },
  { name: 'GMC', logo: 'GMC', category: 'american' },
  { name: 'Ram', logo: '🐏', category: 'american' },
  
  // Japanese Brands
  { name: 'Subaru', logo: '⭐', category: 'japanese' },
  { name: 'Mitsubishi', logo: '◆', category: 'japanese' },
  { name: 'Suzuki', logo: 'S', category: 'japanese' },
  { name: 'Infiniti', logo: 'I', category: 'japanese' },
  { name: 'Acura', logo: 'A', category: 'japanese' },
  
  // Korean Brands
  { name: 'Genesis', logo: 'G', category: 'korean' },
  { name: 'SsangYong', logo: 'SY', category: 'korean' },
  
  // Chinese Brands
  { name: 'BYD', logo: 'BYD', category: 'chinese' },
  { name: 'NIO', logo: 'NIO', category: 'chinese' },
  { name: 'Geely', logo: 'G', category: 'chinese' },
  { name: 'MG', logo: 'MG', category: 'chinese' },
  { name: 'Great Wall', logo: 'GW', category: 'chinese' },
  { name: 'Chery', logo: 'C', category: 'chinese' },
  
  // British Brands
  { name: 'Aston Martin', logo: 'AM', category: 'british' },
  { name: 'Bentley', logo: 'B', category: 'british' },
  { name: 'Rolls-Royce', logo: 'RR', category: 'british' },
  { name: 'McLaren', logo: 'M', category: 'british' },
  { name: 'Lotus', logo: 'L', category: 'british' },
  { name: 'Mini', logo: 'MINI', category: 'british' },
  
  // German Brands
  { name: 'Opel', logo: 'O', category: 'german' },
  { name: 'Smart', logo: 'S', category: 'german' },
  
  // Swedish Brands
  { name: 'Saab', logo: 'S', category: 'swedish' },
  { name: 'Koenigsegg', logo: 'K', category: 'swedish' },
  
  // Czech Brands
  { name: 'Skoda', logo: 'Š', category: 'czech' },
  
  // Spanish Brands
  { name: 'SEAT', logo: 'S', category: 'spanish' },
  { name: 'Cupra', logo: 'C', category: 'spanish' },
  
  // Romanian Brands
  { name: 'Dacia', logo: 'D', category: 'romanian' },
  
  // Indian Brands
  { name: 'Tata', logo: 'T', category: 'indian' },
  { name: 'Mahindra', logo: 'M', category: 'indian' },
  
  // Malaysian Brands
  { name: 'Proton', logo: 'P', category: 'malaysian' },
  
  // Additional Popular Models
  { name: 'Buick', logo: 'B', category: 'american' },
  { name: 'Chrysler', logo: 'C', category: 'american' },
  { name: 'Hummer', logo: 'H', category: 'american' },
  { name: 'Pontiac', logo: 'P', category: 'american' },
  { name: 'Saturn', logo: 'S', category: 'american' },
  { name: 'Mercury', logo: 'M', category: 'american' },
  { name: 'Oldsmobile', logo: 'O', category: 'american' },
  { name: 'Plymouth', logo: 'P', category: 'american' },
  { name: 'Isuzu', logo: 'I', category: 'japanese' },
  { name: 'Daihatsu', logo: 'D', category: 'japanese' },
  { name: 'Scion', logo: 'S', category: 'japanese' },
  { name: 'Maybach', logo: 'M', category: 'german' },
  { name: 'Bugatti', logo: 'B', category: 'french' },
  { name: 'Pagani', logo: 'P', category: 'italian' },
  { name: 'Lancia', logo: 'L', category: 'italian' },
  { name: 'Aixam', logo: 'A', category: 'french' },
  { name: 'Alpine', logo: 'A', category: 'french' },
  { name: 'Artega', logo: 'A', category: 'german' },
  { name: 'Byton', logo: 'B', category: 'chinese' },
  { name: 'Caterham', logo: 'C', category: 'british' },
  { name: 'De Tomaso', logo: 'DT', category: 'italian' },
  { name: 'Fisker', logo: 'F', category: 'american' },
  { name: 'Gumpert', logo: 'G', category: 'german' },
  { name: 'Hennessey', logo: 'H', category: 'american' },
  { name: 'Holden', logo: 'H', category: 'australian' },
  { name: 'Karma', logo: 'K', category: 'american' },
  { name: 'Lada', logo: 'L', category: 'russian' },
  { name: 'Lynk & Co', logo: 'L&C', category: 'chinese' },
  { name: 'Morgan', logo: 'M', category: 'british' },
  { name: 'Noble', logo: 'N', category: 'british' },
  { name: 'Panoz', logo: 'P', category: 'american' },
  { name: 'Qoros', logo: 'Q', category: 'chinese' },
  { name: 'Rimac', logo: 'R', category: 'croatian' },
  { name: 'Spyker', logo: 'S', category: 'dutch' },
  { name: 'TVR', logo: 'TVR', category: 'british' },
  { name: 'Vauxhall', logo: 'V', category: 'british' },
  { name: 'Wiesmann', logo: 'W', category: 'german' },
  { name: 'Xpeng', logo: 'X', category: 'chinese' },
  { name: 'Zenvo', logo: 'Z', category: 'danish' },
];

// Get featured brands (first 4)
export const getFeaturedBrands = () => carBrands.slice(0, 4);

// Get all brands
export const getAllBrands = () => carBrands;
