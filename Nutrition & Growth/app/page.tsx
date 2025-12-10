'use client'

import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Type definitions for our data structures
interface MealCoverageData {
  State: string
  District: string
  Meal_Coverage_Percent: number
}

interface NutritionData {
  State: string
  District: string
  Stunting_Rate_Percent: number
  Underweight_Rate_Percent: number
}

interface MergedDistrictData {
  district: string
  mealCoverage: number
  stuntingRate: number
  underweightRate: number
}

interface StateData {
  state: string
  districts: MergedDistrictData[]
  avgMealCoverage: number
  avgStuntingRate: number
  avgUnderweightRate: number
}

export default function Dashboard() {
  const [statesData, setStatesData] = useState<StateData[]>([])
  const [selectedState, setSelectedState] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Load and parse CSV data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load meal coverage data
      const mealResponse = await fetch('/data/midday_meal_coverage.csv')
      const mealCsvText = await mealResponse.text()
      
      // Load nutrition data
      const nutritionResponse = await fetch('/data/child_nutrition_nfhs5.csv')
      const nutritionCsvText = await nutritionResponse.text()

      // Parse CSV files using PapaParse
      const mealData = Papa.parse<MealCoverageData>(mealCsvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      }).data

      const nutritionData = Papa.parse<NutritionData>(nutritionCsvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      }).data

      // Merge data by state and district
      const mergedData = mergeDataByState(mealData, nutritionData)
      setStatesData(mergedData)
      
      // Set default selected state to first available state
      if (mergedData.length > 0) {
        setSelectedState(mergedData[0].state)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  // Function to merge meal coverage and nutrition data by state and district
  const mergeDataByState = (mealData: MealCoverageData[], nutritionData: NutritionData[]): StateData[] => {
    const stateMap = new Map<string, MergedDistrictData[]>()

    // Group meal data by state
    mealData.forEach(meal => {
      if (!stateMap.has(meal.State)) {
        stateMap.set(meal.State, [])
      }
      
      // Find corresponding nutrition data for this district
      const nutritionMatch = nutritionData.find(
        nutrition => nutrition.State === meal.State && nutrition.District === meal.District
      )

      if (nutritionMatch) {
        stateMap.get(meal.State)!.push({
          district: meal.District,
          mealCoverage: meal.Meal_Coverage_Percent,
          stuntingRate: nutritionMatch.Stunting_Rate_Percent,
          underweightRate: nutritionMatch.Underweight_Rate_Percent
        })
      }
    })

    // Convert to StateData array with calculated averages
    return Array.from(stateMap.entries()).map(([state, districts]) => {
      const avgMealCoverage = districts.reduce((sum, d) => sum + d.mealCoverage, 0) / districts.length
      const avgStuntingRate = districts.reduce((sum, d) => sum + d.stuntingRate, 0) / districts.length
      const avgUnderweightRate = districts.reduce((sum, d) => sum + d.underweightRate, 0) / districts.length

      return {
        state,
        districts,
        avgMealCoverage: Math.round(avgMealCoverage * 10) / 10,
        avgStuntingRate: Math.round(avgStuntingRate * 10) / 10,
        avgUnderweightRate: Math.round(avgUnderweightRate * 10) / 10
      }
    })
  }

  // Get data for currently selected state
  const selectedStateData = statesData.find(s => s.state === selectedState)

  // Prepare chart data - showing state averages
  const chartData = selectedStateData ? [
    {
      name: 'Meal Coverage',
      value: selectedStateData.avgMealCoverage,
      fill: '#10B981'
    },
    {
      name: 'Stunting Rate',
      value: selectedStateData.avgStuntingRate,
      fill: '#EF4444'
    }
  ] : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dashboard data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Banner */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Nutrition & Growth – India Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Analyzing school meal coverage and child nutrition outcomes across Indian districts
          </p>
        </div>

        {/* State Selection Dropdown */}
        <div className="mb-8">
          <label htmlFor="state-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select State:
          </label>
          <select
            id="state-select"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statesData.map(state => (
              <option key={state.state} value={state.state}>
                {state.state}
              </option>
            ))}
          </select>
        </div>

        {selectedStateData && (
          <>
            {/* Bar Chart */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {selectedState} - Average Indicators
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Value']} />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Text */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
              <p className="text-lg text-blue-800">
                In {selectedState}, the average meal coverage is{' '}
                <span className="font-semibold">{selectedStateData.avgMealCoverage}%</span> and average stunting rate is{' '}
                <span className="font-semibold">{selectedStateData.avgStuntingRate}%</span>.
              </p>
            </div>

            {/* District-wise Data Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  District-wise Data for {selectedState}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        District Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Meal Coverage (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stunting Rate (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Underweight Rate (%)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedStateData.districts.map((district, index) => (
                      <tr key={district.district} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {district.district}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {district.mealCoverage}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {district.stuntingRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {district.underweightRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}