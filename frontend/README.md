# Finance Tracker Frontend

React + Tailwind CSS frontend for the finance tracking backend.

## Features

- **Dashboard**: Summary cards (income, expenses, balance), line chart for monthly trends, pie chart for category breakdown, recent transactions
- **Transactions**: Full CRUD with filtering by type and category
- **Authentication**: JWT login with role-based access control
- **Charts**: Recharts with tooltips and separated pie slices
- **Clean & Minimal**: Tailwind CSS styling

## Tech Stack

- React 18
- Vite (build tool)
- Tailwind CSS
- Axios (API calls)
- Recharts (charts)
- React Router DOM (navigation)

## Prerequisites

- Node.js (v16 or higher)
- Backend server running on `http://localhost:8000` (or set `VITE_API_URL`)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment (optional):
   Copy `.env.example` to `.env` and adjust:
   ```
   VITE_API_URL=http://localhost:8000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## Usage

1. **Login**: Use one of the demo credentials:
   - Admin: `admin@example.com` / `admin123`
   - Analyst: `analyst@example.com` / `analyst123`
   - Viewer: `viewer@example.com` / `viewer123`

2. **Dashboard**: View summary cards, charts, and recent transactions.

3. **Transactions**: 
   - Add new transaction (admin only)
   - Edit / Delete transactions (admin only)
   - Filter by type and category

4. **Charts**:
   - Line chart shows monthly income vs expenses
   - Pie chart shows category-wise expense distribution with separated slices

## Project Structure

```
src/
├── components/
│   ├── SummaryCards.jsx      # Income, Expense, Balance cards
│   ├── TransactionTable.jsx  # Transactions list with actions
│   ├── TransactionForm.jsx   # Add/Edit transaction form
│   └── ChartsSection.jsx     # Line and pie charts
├── pages/
│   ├── Login.jsx             # Login page
│   ├── Dashboard.jsx         # Dashboard overview
│   └── Transactions.jsx      # Transactions management
├── services/
│   └── api.js                # Axios instance and API functions
├── App.jsx                   # Router and layout
└── main.jsx                  # Entry point
```

## Backend API Integration

The frontend expects the following backend endpoints:

- `POST /auth/login` - Authentication
- `GET /transactions` - List transactions (with filters)
- `POST /transactions` - Create transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction
- `GET /categories` - List categories
- `GET /analytics/summary` - Get analytics (monthly totals, category breakdown)

All endpoints (except login) require JWT token in `Authorization: Bearer <token>` header. The token is stored in localStorage and automatically attached by the axios interceptor.

## CORS

The backend is configured with `CORS Middleware` allowing all origins, so the frontend can connect directly without proxy.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.
