# Write-Off Category C Display Fix

## Problem
Car with Category C write-off status was not showing the warning badge on the car detail page. The badge was only configured to show for categories A, B, S, N, D but not C.

## Root Cause
In `src/pages/CarDetailPage.jsx` (line 341), the write-off warning badge check was missing Category C:

```javascript
// OLD CODE - Missing Category C
['A', 'B', 'S', 'N', 'D'].includes(car.historyCheckId.writeOffCategory.toUpperCase())
```

## Fix Applied
Updated the category check to include Category C:

```javascript
// NEW CODE - Includes Category C
['A', 'B', 'C', 'S', 'N', 'D'].includes(car.historyCheckId.writeOffCategory.toUpperCase())
```

## UK Write-Off Categories Explained

### Old Categories (Pre-2017):
- **Cat A**: Scrap only - Cannot be repaired, must be crushed
- **Cat B**: Break for parts - Body shell must be crushed, parts can be sold
- **Cat C**: Repairable - Repair costs exceed vehicle value (replaced by Cat S)
- **Cat D**: Repairable - Repair costs less than vehicle value (replaced by Cat N)

### New Categories (Post-2017):
- **Cat A**: Scrap only - Cannot be repaired, must be crushed
- **Cat B**: Break for parts - Body shell must be crushed, parts can be sold
- **Cat S**: Structural damage - Can be repaired and put back on road
- **Cat N**: Non-structural damage - Can be repaired and put back on road

## Files Modified
- `src/pages/CarDetailPage.jsx` (line 341)

## Testing
1. Find a car with Category C write-off status
2. View the car detail page
3. Verify the warning badge displays: "⚠️ CAT C"

## Display Format
The warning badge will show:
```
⚠️ CAT C
```

This matches the format for other categories (A, B, S, N, D).

## Note
Category C is an old classification (pre-2017) that has been replaced by Category S in the current system. However, older vehicles may still have Cat C status in their history, so we need to support displaying it.
