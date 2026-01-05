# Design Document

## Overview

The Car Search Filter System provides users with a comprehensive filtering interface to search for vehicles in the CarCatALog database. The system consists of three main components: a filter modal (FilterSidebar), a search results page (CarSearchPage), and integration points on the HomePage and UsedCarsPage. The design follows AutoTrader's UX patterns with a centered modal approach, URL-based state management, and real-time database queries.

## Architecture

### Component Hierarchy

```
HomePage / UsedCarsPage
  └── FilterSidebar (Modal)
      └── Filter Form
          ├── Sort Options
          ├── Distance Filter
          ├── Make/Model Inputs
          ├── Price Range
          ├── Year Range
          ├── Mileage Range
          ├── Gearbox Select
          ├── Body Type Select
          ├── Additional Filters (Colour, Doors, Seats, Fuel Type, Engine Size)
          └── Action Buttons (Clear All, Search Cars)

CarSearchPage
  ├── Search Header (Count + More Options Button)
  ├── FilterSidebar (Modal)
  ├── Results Grid
  └── Car Cards
```

### Data Flow

1. User opens filter modal from HomePage, UsedCarsPage, or CarSearchPage
2. Filter selections are stored in component state
3. On "Search cars" click, filters are serialized to URL query parameters
4. Navigation occurs to `/car-search?channel=cars&[filters]`
5. CarSearchPage reads URL parameters and constructs API request
6. Backend queries MongoDB Car collection with filter criteria
7. Results are displayed in grid layout
8. User can refine search by reopening modal with pre-populated values

### State Management

- **Local Component State**: Filter selections stored in FilterSidebar component
- **URL State**: Active filters persisted in URL query parameters
- **Server State**: Car data fetched from backend API based on URL parameters

## Components and Interfaces

### FilterSidebar Component

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback to close modal

**State:**
```typescript
interface FilterState {
  sort: string;           // 'relevance' | 'price-low' | 'price-high' | 'year-new' | 'year-old' | 'mileage-low' | 'mileage-high'
  distance: string;       // 'national' | '10' | '25' | '50' | '100' | '200'
  make: string;
  model: string;
  priceFrom: string;
  priceTo: string;
  yearFrom: string;
  yearTo: string;
  mileageFrom: string;
  mileageTo: string;
  gearbox: string;        // '' | 'manual' | 'automatic'
  bodyType: string;       // '' | 'hatchback' | 'saloon' | 'estate' | 'suv' | 'coupe' | 'convertible' | 'mpv'
  colour: string;
  doors: string;
  seats: string;
  fuelType: string;       // '' | 'petrol' | 'diesel' | 'electric' | 'hybrid'
  engineSize: string;
}
```

**Methods:**
- `handleChange(field: string, value: string)` - Updates filter state
- `handleClearAll()` - Resets all filters to default values
- `handleApply()` - Serializes filters to URL and navigates to search page

### CarSearchPage Component

**State:**
```typescript
interface SearchPageState {
  cars: Car[];
  loading: boolean;
  error: string | null;
  isFilterOpen: boolean;
  totalCount: number;
}
```

**Methods:**
- `fetchCars()` - Queries backend API with current URL parameters
- `formatPrice(price: number)` - Formats currency display
- `formatMileage(mileage: number)` - Formats mileage with commas

### Backend API Interface

**Endpoint:** `GET /api/vehicles/search`

**Query Parameters:**
- `make` (optional): string
- `model` (optional): string
- `priceFrom` (optional): number
- `priceTo` (optional): number
- `yearFrom` (optional): number
- `yearTo` (optional): number
- `mileageFrom` (optional): number
- `mileageTo` (optional): number
- `gearbox` (optional): string
- `bodyType` (optional): string
- `colour` (optional): string
- `doors` (optional): number
- `seats` (optional): number
- `fuelType` (optional): string
- `engineSize` (optional): string
- `sort` (optional): string
- `distance` (optional): string

**Response:**
```typescript
interface SearchResponse {
  cars: Car[];
  total: number;
}

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  colour?: string;
  doors?: number;
  seats?: number;
  images?: string[];
  postcode?: string;
  status: string;
}
```

## Data Models

### Car Model (MongoDB)

```javascript
{
  _id: ObjectId,
  make: String,
  model: String,
  year: Number,
  price: Number,
  mileage: Number,
  fuelType: String,
  transmission: String,
  bodyType: String,
  colour: String,
  doors: Number,
  seats: Number,
  engineSize: String,
  images: [String],
  postcode: String,
  latitude: Number,
  longitude: Number,
  status: String,  // 'active' | 'sold' | 'expired'
  createdAt: Date,
  updatedAt: Date
}
```

### URL Parameter Schema

Query parameters follow this naming convention:
- Range filters: `{field}From` and `{field}To` (e.g., `priceFrom`, `priceTo`)
- Single value filters: `{field}` (e.g., `make`, `bodyType`)
- Special filters: `sort`, `distance`, `channel`

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all testable properties from the prework, several redundancies were identified:

**Redundancies to consolidate:**
- Properties 2.2, 2.5 can be combined into one comprehensive state management property
- Properties 3.3, 3.4 can be combined into one URL construction property
- Properties 4.2, 4.3 can be combined into one URL parsing and API calling property
- Properties 6.2, 6.4 are related to the same round-trip behavior (URL → Modal → URL)
- Properties 8.1, 8.2, 8.3, 8.4 can be combined into one comprehensive API request construction property
- Properties 9.1, 9.2, 9.3, 9.4 can be combined into one loading state management property
- Properties 10.1, 10.2 are testing the same behavior (count display)

After consolidation, we have a focused set of unique properties that provide comprehensive validation coverage.

### Correctness Properties

Property 1: URL parameter preservation
*For any* set of valid URL query parameters, when the filter modal opens, all parameter values should be correctly populated in the corresponding form fields
**Validates: Requirements 1.5**

Property 2: Filter state management
*For any* combination of filter selections (make, model, price, year, mileage, etc.), the component state should maintain all selected values without loss
**Validates: Requirements 2.2, 2.5**

Property 3: Price validation
*For any* minimum and maximum price pair, if both are provided, the maximum price should be greater than or equal to the minimum price
**Validates: Requirements 2.3, 2.4**

Property 4: Clear all resets state
*For any* filter state (regardless of which filters are set), clicking "Clear all" should reset all filters to their default empty values
**Validates: Requirements 3.2**

Property 5: URL construction from filters
*For any* filter state, clicking "Search cars" should navigate to a URL that includes channel=cars and all non-empty filter values as query parameters
**Validates: Requirements 3.3, 3.4**

Property 6: URL parsing and API request
*For any* valid car-search URL with query parameters, the page should parse those parameters and construct an API request with matching filter criteria
**Validates: Requirements 4.2, 4.3, 8.1, 8.2, 8.3, 8.4**

Property 7: Results display
*For any* non-empty array of car results, each car should be rendered with all required fields (image, make, model, year, price, mileage, location)
**Validates: Requirements 5.3**

Property 8: Error handling
*For any* API error or database failure, the system should display an error message and hide the loading spinner
**Validates: Requirements 5.5, 9.4**

Property 9: Filter round-trip consistency
*For any* set of filters applied on the search results page, clicking "More options" should open the modal with those exact filter values pre-populated
**Validates: Requirements 6.2, 6.4**

Property 10: URL change triggers refetch
*For any* change to URL query parameters while on the search results page, the system should fetch new results matching the updated filters
**Validates: Requirements 6.3, 6.4**

Property 11: Loading state management
*For any* API request in progress, the system should display a loading spinner, disable interactive elements, and prevent duplicate requests
**Validates: Requirements 9.1, 9.2, 9.5**

Property 12: Count display and pluralization
*For any* number of car results (including 0), the count should be displayed with correct pluralization (1 car vs N cars)
**Validates: Requirements 10.1, 10.2, 10.4**

## Error Handling

### Client-Side Errors

1. **Invalid Filter Values**
   - Validation occurs before API request
   - Price ranges: Ensure min ≤ max
   - Year ranges: Ensure min ≤ max
   - Numeric inputs: Validate positive numbers
   - Display inline validation messages

2. **Network Errors**
   - Catch fetch failures
   - Display user-friendly error message
   - Provide retry mechanism
   - Log errors to console for debugging

3. **Empty Results**
   - Display "No cars found" message
   - Suggest adjusting filters
   - Provide "Adjust filters" button to reopen modal

### Server-Side Errors

1. **Database Connection Failures**
   - Return 500 status code
   - Include error message in response
   - Client displays generic error message

2. **Invalid Query Parameters**
   - Validate and sanitize all inputs
   - Return 400 status code for invalid parameters
   - Client displays validation error

3. **Query Timeout**
   - Set reasonable timeout limits
   - Return 504 status code
   - Client displays timeout message with retry option

## Testing Strategy

### Unit Testing

The system will use **Vitest** as the testing framework with **React Testing Library** for component testing.

**Unit Test Coverage:**

1. **FilterSidebar Component**
   - Test filter state updates on user input
   - Test "Clear all" button resets state
   - Test "Search cars" button navigation
   - Test modal open/close behavior
   - Test URL parameter loading on mount

2. **CarSearchPage Component**
   - Test URL parameter parsing
   - Test API request construction
   - Test results rendering
   - Test error state display
   - Test loading state display
   - Test empty results display

3. **Utility Functions**
   - Test price formatting
   - Test mileage formatting
   - Test URL parameter serialization
   - Test URL parameter parsing

### Property-Based Testing

The system will use **fast-check** for property-based testing in JavaScript/React.

**Property Test Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with format: `**Feature: car-search-filter-system, Property {number}: {property_text}**`
- Tests should generate random valid inputs to verify properties hold across all cases

**Property Test Coverage:**

1. **Property 1: URL parameter preservation**
   - Generate random URL parameters
   - Open modal and verify all fields populated correctly

2. **Property 2: Filter state management**
   - Generate random filter combinations
   - Verify all values maintained in state

3. **Property 3: Price validation**
   - Generate random price pairs
   - Verify validation logic enforces min ≤ max

4. **Property 4: Clear all resets state**
   - Generate random filter states
   - Click clear all and verify reset to defaults

5. **Property 5: URL construction from filters**
   - Generate random filter states
   - Verify URL contains channel=cars and all non-empty filters

6. **Property 6: URL parsing and API request**
   - Generate random valid URLs
   - Verify API request matches URL parameters

7. **Property 7: Results display**
   - Generate random car result arrays
   - Verify all required fields rendered for each car

8. **Property 8: Error handling**
   - Generate random error responses
   - Verify error message displayed and spinner hidden

9. **Property 9: Filter round-trip consistency**
   - Generate random filter sets
   - Apply filters, reopen modal, verify same values

10. **Property 10: URL change triggers refetch**
    - Generate random URL parameter changes
    - Verify new API request triggered

11. **Property 11: Loading state management**
    - Simulate API requests
    - Verify spinner shown, button disabled, no duplicates

12. **Property 12: Count display and pluralization**
    - Generate random result counts (0 to 10000)
    - Verify correct pluralization in display

### Integration Testing

1. **End-to-End Filter Flow**
   - Open modal from HomePage
   - Select multiple filters
   - Click "Search cars"
   - Verify navigation to correct URL
   - Verify results match filters

2. **Filter Refinement Flow**
   - Navigate to search results
   - Click "More options"
   - Modify filters
   - Verify URL updates
   - Verify results update

3. **Clear Filters Flow**
   - Apply multiple filters
   - Click "Clear all"
   - Verify all filters reset
   - Verify URL shows only channel=cars

### Backend API Testing

1. **Search Endpoint Tests**
   - Test with no filters (returns all active cars)
   - Test with single filter (make)
   - Test with multiple filters
   - Test with range filters (price, year, mileage)
   - Test with invalid parameters
   - Test with empty results
   - Test error handling

## Performance Considerations

1. **Database Indexing**
   - Index frequently queried fields: make, model, year, price, mileage, status
   - Compound index on (status, make, model) for common queries
   - Geospatial index on (latitude, longitude) for distance filtering

2. **Query Optimization**
   - Only query active cars (status: 'active')
   - Limit results to reasonable page size (e.g., 50 cars)
   - Use projection to only fetch required fields
   - Implement pagination for large result sets

3. **Frontend Optimization**
   - Debounce filter input changes
   - Lazy load car images
   - Virtualize results grid for large datasets
   - Cache API responses with React Query or SWR

4. **API Response Time**
   - Target: < 500ms for typical queries
   - Implement query timeout (5 seconds)
   - Monitor slow queries and optimize indexes

## Security Considerations

1. **Input Validation**
   - Sanitize all user inputs before database queries
   - Validate numeric ranges (price, year, mileage)
   - Prevent NoSQL injection attacks
   - Limit string lengths for text inputs

2. **Rate Limiting**
   - Implement rate limiting on search endpoint
   - Prevent abuse and excessive database queries

3. **Data Exposure**
   - Only return public car data
   - Filter out sensitive seller information
   - Ensure status='active' filter always applied

## Accessibility

1. **Keyboard Navigation**
   - Modal can be closed with Escape key
   - All form inputs accessible via Tab
   - Focus trap within modal when open

2. **Screen Readers**
   - Proper ARIA labels on all inputs
   - Announce modal open/close
   - Announce results count changes
   - Announce loading and error states

3. **Visual Accessibility**
   - Sufficient color contrast (WCAG AA)
   - Focus indicators on interactive elements
   - Clear error messages
   - Responsive text sizing

## Future Enhancements

1. **Saved Searches**
   - Allow users to save filter combinations
   - Email alerts for new matching cars

2. **Advanced Filters**
   - Features (parking sensors, navigation, etc.)
   - Seller type (private, dealer)
   - Condition (new, used, nearly new)

3. **Map View**
   - Display results on interactive map
   - Filter by drawing area on map

4. **Comparison Tool**
   - Select multiple cars to compare
   - Side-by-side comparison view

5. **Smart Recommendations**
   - Suggest similar cars
   - "You might also like" section
   - ML-based personalization
