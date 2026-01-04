# LoadingSpinner Component

A professional, reusable loading spinner component with multiple size options and smooth animations.

## Features

- 🎨 Modern, professional design with animated rings
- 📏 Three size variants (small, medium, large)
- 💬 Optional loading text
- 🔄 Smooth CSS animations
- ♿ Accessibility-friendly
- 🎯 Perfect for buttons, forms, and page loading states

## Usage

### Basic Usage

```jsx
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';

// Simple spinner
<LoadingSpinner />

// With text
<LoadingSpinner text="Loading..." />
```

### Size Variants

```jsx
// Small (20px) - perfect for buttons
<LoadingSpinner size="small" text="Saving..." />

// Medium (24px) - default
<LoadingSpinner size="medium" text="Loading..." />

// Large (40px) - for page loading
<LoadingSpinner size="large" text="Please wait..." />
```

### Inline vs Block

```jsx
// Inline - for buttons and inline elements
<LoadingSpinner size="small" text="Processing..." inline />

// Block - centered display (default)
<LoadingSpinner size="large" text="Loading page..." />
```

### In Buttons

```jsx
<button disabled={loading}>
  {loading ? (
    <LoadingSpinner size="small" text="Registering..." inline />
  ) : (
    'Register'
  )}
</button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small'` \| `'medium'` \| `'large'` | `'medium'` | Size of the spinner |
| `text` | `string` | `''` | Optional text to display next to spinner |
| `inline` | `boolean` | `false` | Whether to display inline or as block |

## Examples in the App

- **Registration Form**: `src/pages/Trade/TradeRegisterPage.jsx`
- **Car Finder**: `src/pages/CarFinderFormPage.jsx`
- **Bike Finder**: `src/pages/Bikes/BikeFinderFormPage.jsx`
- **Van Finder**: `src/pages/Vans/VanFinderFormPage.jsx`
- **Postcode Search**: `src/components/PostcodeSearch/PostcodeSearch.jsx`
