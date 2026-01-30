// Structured Data Schemas for SEO

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CarCatlog",
  "url": "https://carcatlog.vercel.app",
  "logo": "https://carcatlog.vercel.app/logo.png",
  "description": "UK's leading platform for buying and selling cars, bikes and vans",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "GB"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "support@carcatlog.com"
  },
  "sameAs": [
    "https://facebook.com/carcatlog",
    "https://twitter.com/carcatlog",
    "https://instagram.com/carcatlog"
  ]
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "CarCatlog",
  "url": "https://carcatlog.vercel.app",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://carcatlog.vercel.app/search-results?query={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export const breadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `https://carcatlog.vercel.app${item.url}`
  }))
});

export const vehicleSchema = (vehicle) => ({
  "@context": "https://schema.org",
  "@type": "Car",
  "name": `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
  "brand": {
    "@type": "Brand",
    "name": vehicle.make
  },
  "model": vehicle.model,
  "vehicleModelDate": vehicle.year,
  "mileageFromOdometer": {
    "@type": "QuantitativeValue",
    "value": vehicle.mileage,
    "unitCode": "SMI"
  },
  "fuelType": vehicle.fuelType,
  "vehicleTransmission": vehicle.transmission,
  "color": vehicle.color,
  "offers": {
    "@type": "Offer",
    "price": vehicle.price,
    "priceCurrency": "GBP",
    "availability": "https://schema.org/InStock",
    "url": `https://carcatlog.vercel.app/cars/${vehicle._id}`
  },
  "image": vehicle.images?.[0] || "",
  "description": vehicle.description
});

export const productSchema = (product) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "image": product.image,
  "description": product.description,
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": "GBP",
    "availability": "https://schema.org/InStock"
  }
});

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "name": "CarCatlog",
  "image": "https://carcatlog.vercel.app/logo.png",
  "url": "https://carcatlog.vercel.app",
  "telephone": "+44-XXX-XXX-XXXX",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "GB"
  },
  "priceRange": "£££",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ]
};

export const faqSchema = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const reviewSchema = (reviews) => ({
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  "ratingValue": reviews.average,
  "reviewCount": reviews.count,
  "bestRating": "5",
  "worstRating": "1"
});
