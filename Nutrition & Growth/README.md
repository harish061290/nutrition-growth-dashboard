# Nutrition & Growth – India Dashboard

A React/Next.js dashboard that visualizes the relationship between school meal coverage and child nutrition outcomes across Indian districts.

## Features

- **State Selection**: Dropdown to select different Indian states
- **Interactive Charts**: Bar charts comparing meal coverage vs stunting rates
- **District Data Table**: Detailed district-wise breakdown of all indicators
- **Summary Statistics**: Automated calculation of state-level averages
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
nutrition-growth-india-dashboard/
├── app/
│   ├── globals.css          # Global styles with Tailwind CSS
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main dashboard component
├── public/
│   └── data/
│       ├── midday_meal_coverage.csv     # Sample meal coverage data
│       └── child_nutrition_nfhs5.csv    # Sample NFHS-5 nutrition data
├── package.json             # Dependencies and scripts
├── next.config.js           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── postcss.config.js        # PostCSS configuration
```

## Data Sources

The dashboard currently uses two sample CSV files:

1. **Midday Meal Coverage** (`public/data/midday_meal_coverage.csv`)
   - Contains state, district, and meal coverage percentage data
   - Sample data for Maharashtra, Tamil Nadu, Uttar Pradesh, and Bihar

2. **Child Nutrition Indicators** (`public/data/child_nutrition_nfhs5.csv`)
   - Contains NFHS-5 stunting and underweight rates by district
   - Matches districts from the meal coverage data

## How to Run Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:3000`

## Key Components

### Data Loading & Processing
- Uses `papaparse` library to parse CSV files
- Merges data by state and district names
- Calculates state-level averages automatically

### Visualization
- `recharts` library for responsive bar charts
- Tailwind CSS for styling and responsive layout
- Interactive state selection dropdown

### Data Structure
The app processes and merges data into this structure:
```typescript
interface StateData {
  state: string
  districts: MergedDistrictData[]
  avgMealCoverage: number
  avgStuntingRate: number
  avgUnderweightRate: number
}
```

## Replacing Sample Data with Live APIs

To connect to live data from data.gov.in:

1. **Replace CSV Loading**: Modify the `loadData()` function in `app/page.tsx`
2. **API Integration**: Replace fetch calls to CSV files with API endpoints
3. **Data Transformation**: Ensure API response data matches the expected interface structure
4. **Error Handling**: Add proper error handling for API failures

Example API integration:
```typescript
// Replace this:
const mealResponse = await fetch('/data/midday_meal_coverage.csv')

// With this:
const mealResponse = await fetch('https://api.data.gov.in/resource/your-endpoint')
const mealData = await mealResponse.json()
```

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety and better development experience
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: React charting library
- **PapaParse**: CSV parsing library

## Future Enhancements

- Add more states and districts
- Include additional nutrition indicators
- Add trend analysis over time
- Implement data filtering and search
- Add export functionality for charts and tables