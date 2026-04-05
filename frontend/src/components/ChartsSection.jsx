import React from 'react'
import { useCurrency } from '../contexts/CurrencyContext'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const ChartsSection = ({ chartData, categoryData, xAxisLabel = 'month' }) => {
  const { formatCurrency } = useCurrency()
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const incomeData = payload.find(p => p.dataKey === 'income')
      const expenseData = payload.find(p => p.dataKey === 'expense')
      const income = incomeData?.value || 0
      const expense = expenseData?.value || 0
      const net = income - expense
      const netColor = net >= 0 ? '#10B981' : '#EF4444'

      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-lg min-w-[160px]">
          <p className="text-sm font-bold text-gray-900 border-b pb-2 mb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                Income
              </span>
              <span className="text-sm font-semibold text-green-600">
                {formatCurrency(income)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                Expense
              </span>
              <span className="text-sm font-semibold text-red-600">
                {formatCurrency(expense)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-800">Net</span>
              <span className="text-sm font-bold" style={{ color: netColor }}>
                {net >= 0 ? '+' : ''}{formatCurrency(net)}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-semibold">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].payload.fill }}>
            {formatCurrency(payload[0].value)} ({payload[0].payload.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  // Prepare chart data with separate income/expense series
  const processedChartData = chartData?.map((item) => ({
    ...item,
    income: item.income || 0,
    expense: item.expense || 0,
  })) || []

  // Prepare category data with percentages and consistent structure
  const totalCategoryExpenses = categoryData?.reduce((sum, cat) => sum + cat.amount, 0) || 0
  const processedCategoryData = categoryData?.map((cat, index) => ({
    name: cat.category,
    value: cat.amount,
    fill: COLORS[index % COLORS.length],
    percentage: totalCategoryExpenses > 0 ? ((cat.amount / totalCategoryExpenses) * 100).toFixed(1) : 0,
  })) || []

  return (
    <div className="grid grid-cols-1 gap-6 mb-6">
      {/* Line Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">
          {xAxisLabel === 'month' ? 'Monthly Expense Trend' : 'Daily Expense Trend'}
        </h3>
        {processedChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={xAxisLabel}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tickFormatter={(value) => formatCurrency(value).replace(/\.00$/, '')} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={2}
                name="Income"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#EF4444"
                strokeWidth={2}
                name="Expense"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* Category Pie Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
        {processedCategoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={processedCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={5} // Creates gap between slices
              >
                {processedCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No category data available
          </div>
        )}
        {/* Legend */}
        {processedCategoryData.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {processedCategoryData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-gray-700">
                  {item.name}: {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChartsSection
