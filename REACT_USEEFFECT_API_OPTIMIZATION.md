# React useEffect API Call Optimization

## Problem

React mein useEffect se duplicate API calls ho sakti hain in situations:

1. **React StrictMode** - Development mein components 2 baar mount hote hain
2. **Dependency Array Issues** - Wrong dependencies se unnecessary re-renders
3. **Multiple useEffect Hooks** - Same data ko multiple jagah fetch karna
4. **Component Re-mounting** - Navigation se component unmount/remount
5. **State Updates** - State change se useEffect trigger hona

## Current Status

### ✅ Already Fixed:
1. **StrictMode Disabled** (`src/main.jsx`)
   ```jsx
   // StrictMode temporarily disabled to prevent double-mounting issues
   // <React.StrictMode>
     <HelmetProvider>
       <App />
     </HelmetProvider>
   // </React.StrictMode>
   ```

2. **Backend Cache System** - 4 API limit per vehicle
3. **Cache-busting Headers** - Fresh data on detail pages

### ⚠️ Potential Issues Found:

## 1. SearchResultsPage.jsx

**Issue**: useEffect with `[location]` dependency
```jsx
useEffect(() => {
  // Triggers on every location change
  performSearch(postcode, radius, filterParams);
}, [location]);
```

**Problem**: 
- Har URL change par API call
- Filter changes se bhi trigger hota hai
- Multiple searches for same data

**Solution**: Add abort controller and cleanup

```jsx
useEffect(() => {
  const abortController = new AbortController();
  
  const fetchData = async () => {
    try {
      // Pass abort signal to fetch
      const response = await fetch(url, {
        signal: abortController.signal,
        headers: { /* ... */ }
      });
      // ... rest of code
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request cancelled');
        return;
      }
      // Handle other errors
    }
  };
  
  fetchData();
  
  // Cleanup function
  return () => {
    abortController.abort();
  };
}, [location]);
```

## 2. CarDetailPage.jsx & BikeDetailPage.jsx

**Current Code**:
```jsx
useEffect(() => {
  fetchCarDetails();
}, [id]);
```

**Issue**: 
- No cleanup
- No loading state check
- Multiple calls if id changes rapidly

**Optimized Solution**:
```jsx
useEffect(() => {
  let isMounted = true;
  const abortController = new AbortController();
  
  const fetchCarDetails = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(url, {
        signal: abortController.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) throw new Error('Car not found');
      
      const data = await response.json();
      
      // Only update state if component is still mounted
      if (isMounted) {
        setCar(data.data);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted');
        return;
      }
      if (isMounted) {
        setError(err.message);
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };
  
  fetchCarDetails();
  
  // Cleanup function
  return () => {
    isMounted = false;
    abortController.abort();
  };
}, [id]);
```

## 3. VehicleHistorySection.jsx & MOTHistorySection.jsx

**Current Code**:
```jsx
useEffect(() => {
  if (vrm) {
    loadMOTHistory();
  }
}, [vrm]);
```

**Issue**:
- Har baar vrm change par API call
- No caching check
- No abort controller

**Optimized Solution**:
```jsx
useEffect(() => {
  if (!vrm) return;
  
  let isMounted = true;
  const abortController = new AbortController();
  
  const loadMOTHistory = async () => {
    // Check if data already loaded
    if (motHistory && motHistory.length > 0) {
      console.log('MOT history already loaded, skipping API call');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(url, {
        signal: abortController.signal
      });
      
      const data = await response.json();
      
      if (isMounted) {
        setMotHistory(data.motHistory);
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      if (isMounted) {
        setError(error.message);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };
  
  loadMOTHistory();
  
  return () => {
    isMounted = false;
    abortController.abort();
  };
}, [vrm]); // Only re-run if vrm changes
```

## 4. CarAdvertisingPricesPage.jsx

**Current Code**: Multiple useEffect hooks
```jsx
useEffect(() => {
  if (advertId && !advertData && !vehicleData) {
    fetchAdvertData();
  }
}, [advertId, advertData, vehicleData]);

useEffect(() => {
  if (vehicleValuation) {
    // Auto-select price range
  }
}, [vehicleValuation]);

useEffect(() => {
  if (advertData) {
    // Auto-detect seller type
  }
}, [advertData]);
```

**Issue**:
- Multiple useEffect hooks watching same data
- Potential race conditions
- Unnecessary re-renders

**Optimized Solution**: Combine related effects
```jsx
useEffect(() => {
  // Only fetch if needed
  if (advertId && !advertData && !vehicleData) {
    fetchAdvertData();
  }
}, [advertId]); // Remove advertData and vehicleData from deps

useEffect(() => {
  // Combine related logic
  if (vehicleValuation) {
    // Auto-select price range
  }
  
  if (advertData) {
    // Auto-detect seller type
  }
}, [vehicleValuation, advertData]); // Combine dependencies
```

## Best Practices

### 1. Always Use Cleanup Functions
```jsx
useEffect(() => {
  const abortController = new AbortController();
  
  // Your async code here
  
  return () => {
    abortController.abort();
  };
}, [dependencies]);
```

### 2. Check if Component is Mounted
```jsx
useEffect(() => {
  let isMounted = true;
  
  const fetchData = async () => {
    const data = await api.getData();
    if (isMounted) {
      setState(data);
    }
  };
  
  fetchData();
  
  return () => {
    isMounted = false;
  };
}, []);
```

### 3. Avoid Unnecessary Dependencies
```jsx
// ❌ Bad - causes infinite loop
useEffect(() => {
  fetchData();
}, [data]); // data changes, triggers effect, changes data again

// ✅ Good - only run once
useEffect(() => {
  fetchData();
}, []); // Empty array = run once on mount
```

### 4. Use useMemo for Expensive Calculations
```jsx
const filteredCars = useMemo(() => {
  return cars.filter(car => car.price < maxPrice);
}, [cars, maxPrice]); // Only recalculate when these change
```

### 5. Use useCallback for Functions
```jsx
const fetchData = useCallback(async () => {
  const data = await api.getData();
  setData(data);
}, []); // Function doesn't change

useEffect(() => {
  fetchData();
}, [fetchData]); // Safe to use as dependency
```

## Implementation Priority

### High Priority (Do First):
1. ✅ Add abort controllers to detail pages (Car, Bike, Van)
2. ✅ Add cleanup to SearchResultsPage
3. ✅ Add isMounted checks to all async useEffects

### Medium Priority:
4. ⏳ Optimize VehicleHistorySection and MOTHistorySection
5. ⏳ Combine multiple useEffects in CarAdvertisingPricesPage
6. ⏳ Add caching checks before API calls

### Low Priority:
7. ⏳ Add useMemo for expensive filters
8. ⏳ Add useCallback for event handlers
9. ⏳ Optimize re-renders with React.memo

## Testing

### How to Test for Duplicate API Calls:

1. **Open Browser DevTools** → Network Tab
2. **Filter by XHR/Fetch**
3. **Navigate to a page**
4. **Count API calls** - should be 1 per unique request
5. **Check for duplicates** - same URL called multiple times

### Expected Results:
- Car Detail Page: 1 API call per car
- Search Results: 1 API call per search
- MOT History: 1 API call per VRM
- Vehicle History: 1 API call per VRM

### Red Flags:
- ❌ Same API called 2+ times immediately
- ❌ API calls on every keystroke
- ❌ API calls when navigating away
- ❌ API calls after component unmounts

## Backend Protection (Already Implemented)

Even if frontend makes duplicate calls, backend protects us:

1. **Vehicle API Limit Service** - Max 4 APIs per vehicle
2. **Cache Service** - Returns cached data if available
3. **Rate Limiter** - Prevents excessive calls
4. **Audit Service** - Logs all API calls

So frontend optimization is for:
- Better user experience (faster loading)
- Reduced network traffic
- Cleaner code
- Better performance

## Summary

### Current State:
- ✅ Backend has strong protection (4 API limit, caching)
- ✅ StrictMode disabled
- ⚠️ Frontend could be optimized for better UX

### Recommended Actions:
1. Add abort controllers to all fetch calls
2. Add isMounted checks to async useEffects
3. Add cleanup functions to all useEffects
4. Combine related useEffects where possible
5. Add caching checks before API calls

### Impact:
- **Before**: Potential 2-3 API calls per page load
- **After**: 1 API call per page load
- **Backend**: Already protected with cache + limits
- **User Experience**: Faster, smoother, more responsive

---

**Date**: March 2, 2026
**Status**: ⏳ OPTIMIZATION RECOMMENDED
**Priority**: MEDIUM (Backend already protected)
