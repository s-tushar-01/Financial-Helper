import React from 'react'
import { useCurrency } from '../contexts/CurrencyContext'

const SummaryCards = ({ summary }) => {
  const { formatCurrency } = useCurrency()

  if (!summary) return null

  const cards = [
    {
      title: 'Total Income',
      value: summary.total_income || 0,
      color: 'bg-green-50 border-green-200 text-green-800',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Expenses',
      value: summary.total_expenses || 0,
      color: 'bg-red-50 border-red-200 text-red-800',
      iconColor: 'text-red-600',
    },
    {
      title: 'Balance',
      value: summary.balance || 0,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      iconColor: 'text-blue-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`p-6 rounded-lg border ${card.color}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">{card.title}</p>
              <p className={`text-2xl font-bold mt-1 ${card.value < 0 ? 'text-red-600' : ''}`}>
                {formatCurrency(Math.abs(card.value))}
                {card.value < 0 && <span className="text-sm font-normal ml-1">(negative)</span>}
              </p>
            </div>
            <div className={`text-3xl ${card.iconColor}`}>
              {index === 0 && '📈'}
              {index === 1 && '📉'}
              {index === 2 && '💰'}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SummaryCards
