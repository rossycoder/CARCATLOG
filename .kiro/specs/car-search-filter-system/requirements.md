# Requirements Document

## Introduction

This feature implements a comprehensive car search and filter system for CarCatALog. The system will provide users with an advanced filtering interface that navigates to a dedicated search results page displaying real cars from the database. The filter modal will be accessible from multiple pages (HomePage, UsedCarsPage) and will provide a consistent, AutoTrader-style user experience.

## Glossary

- **Filter Modal**: A centered modal dialog containing all filter options (make, model, price, year, etc.)
- **Car Search Page**: A dedicated page at `/car-search` that displays filtered car results from the database
- **Search Parameters**: URL query parameters that define the active filters (e.g., make, model, minPrice, maxPrice)
- **Database Cars**: Real vehicle listings stored in the MongoDB database via the Car model
- **Clear All Button**: A button that resets all filter selections to their default state
- **Search Button**: A button that applies the selected filters and navigates to the search results page

## Requirements

### Requirement 1

**User Story:** As a user, I want to access an advanced filter modal from the homepage and used cars page, so that I can search for cars with specific criteria.

#### Acceptance Criteria

1. WHEN a user clicks "More options" on the HomePage THEN the system SHALL display the filter modal in the center of the screen
2. WHEN a user clicks "More options" on the UsedCarsPage THEN the system SHALL display the same filter modal
3. WHEN the filter modal is displayed THEN the system SHALL show a backdrop overlay with blur effect
4. WHEN a user clicks the backdrop or close button THEN the system SHALL close the filter modal
5. WHEN the filter modal opens THEN the system SHALL preserve any existing filter values from URL parameters

### Requirement 2

**User Story:** As a user, I want to select multiple filter criteria in the modal, so that I can narrow down my car search.

#### Acceptance Criteria

1. WHEN the filter modal is open THEN the system SHALL display filter options for make, model, price range, year range, mileage, fuel type, transmission, and body type
2. WHEN a user selects a make THEN the system SHALL update the make filter state
3. WHEN a user enters a minimum price THEN the system SHALL validate it as a positive number
4. WHEN a user enters a maximum price THEN the system SHALL validate it as greater than or equal to the minimum price
5. WHEN a user selects multiple filters THEN the system SHALL maintain all selected values in the component state

### Requirement 3

**User Story:** As a user, I want to see "Clear all" and "Search cars" buttons at the bottom of the filter modal, so that I can easily reset filters or apply them.

#### Acceptance Criteria

1. WHEN the filter modal is displayed THEN the system SHALL show "Clear all" and "Search cars" buttons in the footer section
2. WHEN a user clicks "Clear all" THEN the system SHALL reset all filter selections to their default empty state
3. WHEN a user clicks "Search cars" THEN the system SHALL navigate to `/car-search` with the selected filters as URL parameters
4. WHEN navigating to the search page THEN the system SHALL include the channel parameter set to "cars"
5. WHEN no filters are selected and user clicks "Search cars" THEN the system SHALL navigate to `/car-search?channel=cars` showing all available cars

### Requirement 4

**User Story:** As a user, I want to view a dedicated car search results page, so that I can browse cars matching my filter criteria.

#### Acceptance Criteria

1. WHEN a user navigates to `/car-search` THEN the system SHALL display a car search results page
2. WHEN the page loads THEN the system SHALL parse filter parameters from the URL query string
3. WHEN filter parameters exist THEN the system SHALL fetch cars from the database matching those criteria
4. WHEN no filter parameters exist THEN the system SHALL fetch all active cars from the database
5. WHEN the database query completes THEN the system SHALL display the matching cars in a grid layout

### Requirement 5

**User Story:** As a user, I want to see real car data from the database on the search results page, so that I can view actual available vehicles.

#### Acceptance Criteria

1. WHEN the search results page loads THEN the system SHALL query the Car model in MongoDB
2. WHEN applying filters THEN the system SHALL construct a MongoDB query matching the filter criteria
3. WHEN cars are found THEN the system SHALL display each car with its image, make, model, year, price, mileage, and location
4. WHEN no cars match the filters THEN the system SHALL display a "No cars found" message
5. WHEN the database query fails THEN the system SHALL display an error message to the user

### Requirement 6

**User Story:** As a user, I want to refine my search from the results page, so that I can adjust my filters without starting over.

#### Acceptance Criteria

1. WHEN on the car search results page THEN the system SHALL display a "More options" button
2. WHEN a user clicks "More options" on the results page THEN the system SHALL open the filter modal with current filter values pre-populated
3. WHEN a user modifies filters and clicks "Search cars" THEN the system SHALL update the URL parameters and reload results
4. WHEN the URL parameters change THEN the system SHALL fetch new results matching the updated filters
5. WHEN a user clicks "Clear all" from the results page THEN the system SHALL navigate to `/car-search?channel=cars` showing all cars

### Requirement 7

**User Story:** As a user, I want the filter modal to have a clean, modern UI similar to AutoTrader, so that I have an intuitive filtering experience.

#### Acceptance Criteria

1. WHEN the filter modal is displayed THEN the system SHALL show a centered modal with rounded corners and shadow
2. WHEN displaying filter sections THEN the system SHALL organize them with clear labels and spacing
3. WHEN showing the sort dropdown THEN the system SHALL position it at the top of the modal
4. WHEN displaying input fields THEN the system SHALL use consistent styling with borders and focus states
5. WHEN on mobile devices THEN the system SHALL adjust the modal width to 95% with appropriate padding

### Requirement 8

**User Story:** As a developer, I want the filter system to construct proper API requests, so that the backend can efficiently query the database.

#### Acceptance Criteria

1. WHEN building the API request THEN the system SHALL include all non-empty filter parameters
2. WHEN a price range is selected THEN the system SHALL send minPrice and maxPrice parameters
3. WHEN a year range is selected THEN the system SHALL send minYear and maxYear parameters
4. WHEN make or model is selected THEN the system SHALL send those as exact match parameters
5. WHEN the API responds THEN the system SHALL handle both success and error cases appropriately

### Requirement 9

**User Story:** As a user, I want to see a loading state while cars are being fetched, so that I know the system is working.

#### Acceptance Criteria

1. WHEN the search results page is loading data THEN the system SHALL display a loading spinner
2. WHEN the API request is in progress THEN the system SHALL disable the search button
3. WHEN results are returned THEN the system SHALL hide the loading spinner and show the cars
4. WHEN an error occurs THEN the system SHALL hide the loading spinner and show an error message
5. WHEN the page is loading THEN the system SHALL prevent duplicate API requests

### Requirement 10

**User Story:** As a user, I want the car search page to display the count of results, so that I know how many cars match my criteria.

#### Acceptance Criteria

1. WHEN cars are loaded THEN the system SHALL display the total count of matching cars
2. WHEN filters are applied THEN the system SHALL update the count to reflect filtered results
3. WHEN no cars are found THEN the system SHALL display "0 cars found"
4. WHEN displaying the count THEN the system SHALL format it with proper pluralization
5. WHEN the count is displayed THEN the system SHALL position it prominently near the top of the results
