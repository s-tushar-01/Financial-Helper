import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrency } from '../contexts/CurrencyContext'
import SummaryCards from '../components/SummaryCards'
import ChartsSection from '../components/ChartsSection'
import { analyticsAPI, transactionAPI, categoryAPI } from '../services/api'
import { decodeToken } from '../utils/token'

const Dashboard = () => {
  const [summary, setSummary] = useState(null)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [dailyData, setDailyData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [categoriesMap, setCategoriesMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  // Date range filter
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const { formatCurrency } = useCurrency()
  const navigate = useNavigate()

  // Helper: aggregate transactions into daily income/expense
  const aggregateByDate = (transactions) => {
    const map = {}
    transactions.forEach(tx => {
      const date = tx.date.split('T')[0] // Extract YYYY-MM-DD
      if (!map[date]) {
        map[date] = { date, income: 0, expense: 0 }
      }
      if (tx.type === 'income') {
        map[date].income += tx.amount
      } else if (tx.type === 'expense') {
        map[date].expense += tx.amount
      }
    })
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
  }

  // Helper: fetch all transactions with pagination (limit=8)
  const fetchAllTransactions = async (params) => {
    // First page
    const firstRes = await transactionAPI.getAll({ ...params, skip: 0, limit: 8 })
    const total = firstRes.data.total
    const allItems = [...firstRes.data.items]
    const totalPages = Math.ceil(total / 8)
    // Fetch remaining pages in parallel
    const promises = []
    for (let page = 2; page <= totalPages; page++) {
      const skip = (page - 1) * 8
      promises.push(transactionAPI.getAll({ ...params, skip, limit: 8 }))
    }
    if (promises.length > 0) {
      const results = await Promise.all(promises)
      results.forEach(res => {
        allItems.push(...res.data.items)
      })
    }
    return allItems
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Decode token to get user role
      const token = localStorage.getItem('token')
      const role = token ? decodeToken(token)?.role : null
      setUserRole(role)

      // Fetch categories for mapping (all roles)
      const catRes = await categoryAPI.getAll()
      const cats = catRes.data
      const catMap = {}
      cats.forEach(cat => { catMap[cat.id] = cat.name })
      setCategoriesMap(catMap)

      // For admin/analyst: fetch summary and daily chart data
      if (role === 'admin' || role === 'analyst') {
        try {
          // Summary for totals and category breakdown (with date filter)
          const summaryParams = {}
          if (startDate) summaryParams.start_date = `${startDate}T00:00:00`
          if (endDate) summaryParams.end_date = `${endDate}T23:59:59`
          const summaryRes = await analyticsAPI.getSummary(summaryParams)
          const summaryData = summaryRes.data
          setSummary(summaryData)
          setCategoryData(summaryData.category_breakdown || [])

          // Daily chart data: fetch all transactions within date range and aggregate
          const dailyTxParams = { sort_by: 'date', order: 'asc' }
          if (startDate) dailyTxParams.start_date = `${startDate}T00:00:00`
          if (endDate) dailyTxParams.end_date = `${endDate}T23:59:59`
          const allTx = await fetchAllTransactions(dailyTxParams)
          const dailyAggregated = aggregateByDate(allTx)
          setDailyData(dailyAggregated)
        } catch (summaryError) {
          console.error('Failed to fetch admin/analyst data:', summaryError)
          setSummary(null)
          setDailyData([])
          setCategoryData([])
        }
      } else {
        // Viewer roles
        setSummary(null)
        setDailyData([])
        setCategoryData([])
      }

      // Fetch recent transactions (all roles) - last 5, newest first, no date filter
      const transRes = await transactionAPI.getAll({ limit: 5, sort_by: 'date', order: 'desc' })
      setRecentTransactions(transRes.data.items)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      if (error.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  // Trigger fetch on mount and when date filters change
  useEffect(() => {
    fetchDashboardData()
  }, [startDate, endDate])

  // Function to render recent transactions table (to reuse)
  const renderRecentTransactions = () => (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <button
          onClick={() => navigate('/transactions')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View all →
        </button>
      </div>
      {recentTransactions && recentTransactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tx.category_id && categoriesMap[tx.category_id] ? categoriesMap[tx.category_id] : 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      tx.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                    tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">No recent transactions</div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Dashboard
          {userRole && (
            <span className="ml-3 px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
              {userRole}
            </span>
          )}
        </h1>
        {/* Date Range Filter */}
        <div className="flex items-center space-x-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      <SummaryCards summary={summary} />

      {(userRole === 'admin' || userRole === 'analyst') ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ChartsSection
              chartData={dailyData}
              categoryData={categoryData}
              xAxisLabel="date"
            />
          </div>
          <div>
            {renderRecentTransactions()}
          </div>
        </div>
      ) : (
        <div>
          {renderRecentTransactions()}
        </div>
      )}
    </div>
  )
}

export default Dashboard
