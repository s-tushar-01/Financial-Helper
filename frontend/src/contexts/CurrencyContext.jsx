import React, { createContext, useState, useEffect, useContext } from 'react'

const CurrencyContext = createContext()

export const useCurrency = () => useContext(CurrencyContext)

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('selectedCurrency') || 'USD'
  })
  const [rates, setRates] = useState({ USD: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        if (!res.ok) throw new Error('Failed to fetch exchange rates')
        const data = await res.json()
        setRates(data.rates)
      } catch (err) {
        console.error('Error fetching rates:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRates()
  }, [])

  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency)
  }, [selectedCurrency])

  const convert = (amount, toCurrency = selectedCurrency) => {
    const rate = rates[toCurrency] ?? 1
    return amount * rate
  }

  const formatCurrency = (amount, toCurrency = selectedCurrency) => {
    const converted = convert(amount, toCurrency)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: toCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted)
  }

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      setSelectedCurrency,
      rates,
      loading,
      error,
      convert,
      formatCurrency,
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}
