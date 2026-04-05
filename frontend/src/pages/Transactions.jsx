import React, { useState, useEffect } from 'react'
import TransactionTable from '../components/TransactionTable'
import TransactionForm from '../components/TransactionForm'
import { transactionAPI, categoryAPI } from '../services/api'
import { decodeToken } from '../utils/token'

const ITEMS_PER_PAGE = 8

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [categoriesMap, setCategoriesMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // Determine user role from token - admin only can add/edit/delete
  const token = localStorage.getItem('token')
  const isAdmin = token ? decodeToken(token)?.role === 'admin' : false
  const userRole = token ? decodeToken(token)?.role : null

  // Comprehensive filters matching backend query parameters
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    min_amount: '',
    max_amount: '',
    start_date: '',
    end_date: '',
    date_preset: '', // maps to 'range' in backend
    month: '',
    year: '',
    high_expense: '',
    is_recurring: '',
    status: '',
    sort_by: 'date',
    order: 'desc'
  })

  // Debounce filters to avoid excessive API calls (especially for search)
  const [debouncedFilters, setDebouncedFilters] = useState(filters)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 300)
    return () => clearTimeout(timer)
  }, [filters])

  // Fetch categories once on mount (for name resolution)
  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll()
      setCategories(response.data)
      const map = {}
      response.data.forEach(cat => { map[cat.id] = cat.name })
      setCategoriesMap(map)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  // Fetch transactions with current debounced filters
  const fetchTransactions = async (queryFilters = debouncedFilters) => {
    try {
      setLoading(true)
      const params = { ...queryFilters }

      // Remove empty string values, but keep booleans and sort/order
      Object.keys(params).forEach(key => {
        const value = params[key]
        if (value === '' || value === null || value === undefined) {
          delete params[key]
        } else if (key === 'min_amount' || key === 'max_amount' || key === 'month' || key === 'year') {
          // Convert numeric fields to numbers
          params[key] = Number(value)
        }
      })

      // Map date_preset to backend's 'range' parameter
      if (params.date_preset) {
        params.range = params.date_preset
        delete params.date_preset
      }

      // Convert high_expense and is_recurring to actual booleans if present
      if (params.high_expense !== undefined) {
        if (params.high_expense === 'true') {
          params.high_expense = true
        } else if (params.high_expense === 'false') {
          params.high_expense = false
        } else {
          delete params.high_expense
        }
      }

      if (params.is_recurring !== undefined) {
        if (params.is_recurring === 'true') {
          params.is_recurring = true
        } else if (params.is_recurring === 'false') {
          params.is_recurring = false
        } else {
          delete params.is_recurring
        }
      }

      // Add pagination parameters
      params.limit = ITEMS_PER_PAGE
      params.skip = (currentPage - 1) * ITEMS_PER_PAGE

      const response = await transactionAPI.getAll(params)
      setTransactions(response.data.items)
      setTotalItems(response.data.total)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch of categories
  useEffect(() => {
    fetchCategories()
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedFilters])

  // Fetch transactions when page or filters change
  useEffect(() => {
    fetchTransactions()
  }, [debouncedFilters, currentPage])

  const handleSubmit = async (data) => {
    try {
      if (editingTransaction) {
        await transactionAPI.update(editingTransaction.id, data)
      } else {
        await transactionAPI.create(data)
      }
      setEditingTransaction(null)
      setShowForm(false)
      fetchTransactions()
    } catch (error) {
      console.error('Failed to save transaction:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return
    }
    try {
      await transactionAPI.delete(id)
      fetchTransactions()
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value, type } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value
    }))
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      search: '',
      min_amount: '',
      max_amount: '',
      start_date: '',
      end_date: '',
      date_preset: '',
      month: '',
      year: '',
      high_expense: '',
      is_recurring: '',
      status: '',
      sort_by: 'date',
      order: 'desc'
    })
  }

  const uniqueCategoryNames = categories ? [...new Set(categories.map(cat => cat.name))].sort((a,b) => a.localeCompare(b)) : [];

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Transactions
          {userRole && (
            <span className="ml-3 px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
              {userRole}
            </span>
          )}
        </h1>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingTransaction(null)
              setShowForm(!showForm)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Transaction'}
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="mb-6">
          <TransactionForm
            onSubmit={handleSubmit}
            initialData={editingTransaction}
            onCancel={() => {
              setEditingTransaction(null)
              setShowForm(false)
            }}
            loading={false}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search notes or category..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Categories</option>
              {uniqueCategoryNames.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Amount
              </label>
              <input
                type="number"
                name="min_amount"
                value={filters.min_amount}
                onChange={handleFilterChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Amount
              </label>
              <input
                type="number"
                name="max_amount"
                value={filters.max_amount}
                onChange={handleFilterChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Date Preset */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Preset
            </label>
            <select
              name="date_preset"
              value={filters.date_preset}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">None</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="last_month">Last Month</option>
            </select>
          </div>

          {/* Month and Year */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                min="1900"
                max="2100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Boolean Filters */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                High Expense
              </label>
              <select
                name="high_expense"
                value={filters.high_expense}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recurring
              </label>
              <select
                name="is_recurring"
                value={filters.is_recurring}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Any</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                name="sort_by"
                value={filters.sort_by}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="created_at">Created At</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <select
                name="order"
                value={filters.order}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <TransactionTable
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        categories={categoriesMap}
        canEdit={isAdmin}
      />
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default Transactions
