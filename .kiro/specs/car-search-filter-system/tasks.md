# Implementation Plan

- [ ] 1. Set up testing infrastructure
  - Install and configure fast-check for property-based testing
  - Install and configure Vitest and React Testing Library
  - Create test utilities and helpers for generating random test data
  - _Requirements: All testing requirements_

- [x] 2. Implement FilterSidebar component core functionality


  - Create FilterSidebar component with modal overlay and centered layout
  - Implement filter state management for all filter fields
  - Add form inputs for all filter options (make, model, price, year, mileage, gearbox, body type, etc.)
  - Implement handleChange method to update filter state
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [ ]* 2.1 Write property test for filter state management
  - **Property 2: Filter state management**
  - **Validates: Requirements 2.2, 2.5**


- [ ] 2.2 Implement URL parameter loading in FilterSidebar
  - Add useEffect to load filter values from URL parameters when modal opens
  - Parse searchParams and populate filter state
  - _Requirements: 1.5_

- [ ]* 2.3 Write property test for URL parameter preservation
  - **Property 1: URL parameter preservation**
  - **Validates: Requirements 1.5**


- [ ] 2.3 Implement Clear All functionality
  - Add handleClearAll method to reset all filters to defaults
  - Wire up "Clear all" button to handleClearAll
  - _Requirements: 3.2_

- [ ]* 2.4 Write property test for clear all functionality
  - **Property 4: Clear all resets state**

  - **Validates: Requirements 3.2**

- [ ] 2.5 Implement Search Cars navigation
  - Add handleApply method to serialize filters to URL parameters
  - Navigate to /car-search with channel=cars and filter parameters
  - Only include non-empty filter values in URL
  - _Requirements: 3.3, 3.4, 3.5_

- [x]* 2.6 Write property test for URL construction


  - **Property 5: URL construction from filters**
  - **Validates: Requirements 3.3, 3.4**

- [ ] 2.7 Add price range validation
  - Validate minimum price is positive number
  - Validate maximum price is greater than or equal to minimum price
  - Display validation errors inline
  - _Requirements: 2.3, 2.4_

- [x]* 2.8 Write property test for price validation

  - **Property 3: Price validation**
  - **Validates: Requirements 2.3, 2.4**

- [ ] 2.9 Implement modal open/close behavior
  - Add backdrop click handler to close modal
  - Add close button click handler
  - Add Escape key handler to close modal
  - Implement focus trap within modal
  - _Requirements: 1.4_

- [ ]* 2.10 Write unit tests for FilterSidebar component
  - Test modal open/close behavior
  - Test backdrop click closes modal
  - Test close button closes modal
  - Test Escape key closes modal
  - _Requirements: 1.4_


- [ ] 3. Implement CarSearchPage component
  - Create CarSearchPage component with container layout
  - Add search header with results count and "More options" button
  - Implement state management for cars, loading, error, isFilterOpen, totalCount
  - _Requirements: 4.1, 6.1, 10.5_

- [ ] 3.1 Implement URL parameter parsing and API fetching
  - Add useEffect to parse URL parameters on mount and when searchParams change
  - Build API request URL from search parameters
  - Fetch cars from /api/vehicles/search endpoint
  - Handle loading, success, and error states
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 8.1, 8.2, 8.3, 8.4_


- [ ]* 3.2 Write property test for URL parsing and API request
  - **Property 6: URL parsing and API request**
  - **Validates: Requirements 4.2, 4.3, 8.1, 8.2, 8.3, 8.4**

- [ ]* 3.3 Write property test for URL change triggers refetch
  - **Property 10: URL change triggers refetch**
  - **Validates: Requirements 6.3, 6.4**

- [ ] 3.4 Implement results grid display
  - Create results grid layout with responsive columns
  - Render car cards with image, make, model, year, price, mileage, location

  - Add formatPrice utility function
  - Add formatMileage utility function
  - Handle missing images with placeholder
  - _Requirements: 5.3_

- [ ]* 3.5 Write property test for results display
  - **Property 7: Results display**
  - **Validates: Requirements 5.3**


- [ ] 3.6 Implement loading state
  - Display LoadingSpinner component while fetching
  - Disable "More options" button during loading
  - Prevent duplicate API requests
  - _Requirements: 9.1, 9.2, 9.5_

- [ ]* 3.7 Write property test for loading state management
  - **Property 11: Loading state management**
  - **Validates: Requirements 9.1, 9.2, 9.5**


- [ ] 3.8 Implement error handling
  - Display error message when API request fails
  - Hide loading spinner on error

  - Provide user-friendly error messages
  - _Requirements: 5.5, 9.4_

- [ ]* 3.9 Write property test for error handling
  - **Property 8: Error handling**
  - **Validates: Requirements 5.5, 9.4**

- [ ] 3.10 Implement empty results state
  - Display "No cars found" message when results array is empty
  - Show "Adjust filters" button to reopen modal
  - _Requirements: 5.4_

- [ ] 3.11 Implement results count display
  - Display total count of matching cars
  - Format count with proper pluralization (1 car vs N cars)
  - Update count when filters change
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ]* 3.12 Write property test for count display and pluralization
  - **Property 12: Count display and pluralization**
  - **Validates: Requirements 10.1, 10.2, 10.4**

- [x] 3.13 Implement filter refinement from results page

  - Wire up "More options" button to open FilterSidebar
  - Pass current URL parameters to FilterSidebar
  - Ensure modal opens with pre-populated values
  - _Requirements: 6.2_

- [ ]* 3.14 Write property test for filter round-trip consistency
  - **Property 9: Filter round-trip consistency**
  - **Validates: Requirements 6.2, 6.4**

- [x] 3.15 Implement auto-open filter modal on first load


  - Add useEffect to detect first load (no filters in URL)
  - Auto-open filter modal after small delay
  - _Requirements: 4.1_

- [ ]* 3.16 Write unit tests for CarSearchPage component
  - Test URL parameter parsing
  - Test API request construction
  - Test results rendering
  - Test error state display
  - Test loading state display
  - Test empty results display
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.4, 5.5, 9.1, 9.4_

- [ ] 4. Integrate FilterSidebar with HomePage and UsedCarsPage
  - Add "More options" button to HomePage
  - Add "More options" button to UsedCarsPage
  - Import and render FilterSidebar component on both pages
  - Wire up button click to open modal
  - _Requirements: 1.1, 1.2_

- [ ]* 4.1 Write unit tests for HomePage and UsedCarsPage integration
  - Test "More options" button exists on HomePage
  - Test "More options" button exists on UsedCarsPage
  - Test clicking button opens FilterSidebar
  - _Requirements: 1.1, 1.2_

- [ ] 5. Implement backend search endpoint
  - Create GET /api/vehicles/search endpoint
  - Parse query parameters (make, model, priceFrom, priceTo, yearFrom, yearTo, etc.)
  - Build MongoDB query from parameters
  - Query Car model with filters
  - Return cars array and total count
  - _Requirements: 5.1, 5.2, 8.5_

- [ ] 5.1 Add input validation and sanitization
  - Validate numeric parameters (price, year, mileage)
  - Sanitize string inputs to prevent NoSQL injection
  - Return 400 status for invalid parameters
  - _Requirements: 8.5_

- [ ] 5.2 Add error handling to search endpoint
  - Catch database errors
  - Return 500 status on database failures
  - Log errors for debugging
  - _Requirements: 5.5, 8.5_

- [ ] 5.3 Optimize database queries
  - Add indexes on frequently queried fields (make, model, year, price, mileage, status)
  - Create compound index on (status, make, model)
  - Only query active cars (status: 'active')
  - Use projection to only fetch required fields
  - _Requirements: 5.1, 5.2_

- [ ]* 5.4 Write unit tests for backend search endpoint
  - Test with no filters (returns all active cars)
  - Test with single filter (make)
  - Test with multiple filters
  - Test with range filters (price, year, mileage)
  - Test with invalid parameters
  - Test with empty results
  - Test error handling
  - _Requirements: 4.4, 5.1, 5.2, 5.4, 8.5_

- [ ] 6. Add styling and responsive design
  - Style FilterSidebar modal with centered layout, rounded corners, shadow
  - Add backdrop overlay with blur effect
  - Style filter sections with labels, inputs, and spacing
  - Implement responsive design for mobile (95% width)
  - Style CarSearchPage with grid layout
  - Style car cards with images and details
  - Add hover effects and transitions
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 6.1 Write unit tests for responsive design
  - Test modal width adjusts on mobile viewport
  - Test sort dropdown positioned at top
  - _Requirements: 7.3, 7.5_

- [ ] 7. Add accessibility features
  - Add ARIA labels to all form inputs
  - Implement keyboard navigation (Tab, Escape)
  - Add focus indicators on interactive elements
  - Announce modal open/close to screen readers
  - Announce results count changes
  - Announce loading and error states
  - Ensure sufficient color contrast (WCAG AA)
  - _Requirements: All accessibility requirements_

- [ ]* 7.1 Write unit tests for accessibility
  - Test ARIA labels present on inputs
  - Test Escape key closes modal
  - Test focus trap within modal
  - Test keyboard navigation
  - _Requirements: All accessibility requirements_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Manual testing and bug fixes
  - Test complete filter flow from HomePage
  - Test complete filter flow from UsedCarsPage
  - Test filter refinement from CarSearchPage
  - Test clear all functionality
  - Test empty results state
  - Test error states
  - Test loading states
  - Test responsive design on mobile
  - Fix any bugs discovered during testing
  - _Requirements: All requirements_

- [ ] 10. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
