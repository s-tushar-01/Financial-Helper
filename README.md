# Finance Backend

A FastAPI-based backend for a finance tracking application with RBAC, GraphQL analytics, and debounced search.

## Features

- CRUD operations for transactions and categories
- JWT authentication (login)
- Role-based access control (Viewer, Analyst, Admin)
- Filtering & search on transactions
- Analytics summary (total income, expenses, balance, category breakdown, monthly totals, recent activity)
- GraphQL endpoint for analytics queries
- Sample seeding script
- Clean architecture: models, schemas, routes, services, core, db

## Tech Stack

- **Backend:** FastAPI
- **Database:** PostgreSQL (recommended via Supabase) or SQLite
- **ORM:** SQLAlchemy 2.0
- **Auth:** JWT (python-jose)
- **GraphQL:** graphene

## Setup

### 1. Install Dependencies

```bash
# Using pip directly
pip install fastapi uvicorn sqlalchemy pydantic python-jose[cryptography] passlib[bcrypt] python-multipart graphene psycopg2-binary

# Or install from pyproject.toml (if using hatch/pip)
pip install -e .
```

### 2. Database Configuration

#### Option A: SQLite (default)

No additional setup required. The app will create a `finance.db` file automatically.

#### Option B: PostgreSQL (Supabase)

1. **Create a Supabase project** at [supabase.com](https://supabase.com) and get your connection string.
2. **Set the `DATABASE_URL` environment variable**:

```bash
export DATABASE_URL="postgresql+psycopg2://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
```

Replace `[YOUR-PASSWORD]` and `[YOUR-PROJECT]` with your Supabase credentials.

Alternatively, you can use any PostgreSQL server.

**Note:** Ensure the `psycopg2-binary` package is installed (included in dependencies).

### 3. Seed the Database (Optional but Recommended)

```bash
python seed.py
```

This creates:
- 3 users (admin, analyst, viewer) with preset passwords
- Sample categories and transactions for the admin user

**Default credentials:**
| Role    | Email                   | Password    |
|---------|-------------------------|-------------|
| Admin   | admin@example.com      | admin123    |
| Analyst | analyst@example.com     | analyst123  |
| Viewer  | viewer@example.com      | viewer123   |

### 4. Run the Application

```bash
python main.py
```

The server starts at `http://0.0.0.0:8000`.

- **API docs (Swagger UI):** http://localhost:8000/docs
- **GraphQL endpoint:** http://localhost:8000/graphql

## API Usage

### Authentication

Obtain an access token by sending a `POST` request to `/auth/login` using form-data:

- `username`: your email
- `password`: your password

Response:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

Use the token in subsequent requests:

```
Authorization: Bearer <access_token>
```

### REST Endpoints

| Endpoint | Methods | Access | Description |
|----------|---------|--------|-------------|
| `/auth/login` | POST | Public | Login |
| `/transactions` | GET | All roles | List transactions (with filters) |
| `/transactions` | POST | Admin only | Create transaction |
| `/transactions/{id}` | GET | All roles | Get transaction details |
| `/transactions/{id}` | PUT | Admin only | Update transaction |
| `/transactions/{id}` | DELETE | Admin only | Delete transaction |
| `/categories` | GET | All roles | List categories |
| `/categories` | POST | Admin only | Create category |
| `/categories/{id}` | GET | All roles | Get category |
| `/categories/{id}` | PUT | Admin only | Update category |
| `/categories/{id}` | DELETE | Admin only | Delete category (if no transactions) |
| `/analytics/summary` | GET | All roles | Full analytics summary |

**Transaction filtering & search** (`GET /transactions`):

- `start_date`: ISO datetime
- `end_date`: ISO datetime
- `category`: category name (string)
- `type`: `income` or `expense`
- `search`: case-insensitive search in notes and category name
- `skip`: pagination offset
- `limit`: items per page (max 1000)

### GraphQL Endpoint

POST queries to `/graphql`. Example:

```graphql
{
  analytics {
    totalIncome
    totalExpenses
    balance
    categoryBreakdown {
      category
      amount
    }
    monthlyTotals {
      month
      income
      expense
    }
    recentActivity {
      id
      amount
      type
      date
      notes
      category {
        id
        name
      }
    }
  }
}
```

Include the same `Authorization: Bearer <token>` header.

## Roles & Permissions

| Role    | Transactions | Categories | Analytics |
|---------|--------------|------------|-----------|
| Viewer  | Read only    | Read only  | Read only |
| Analyst | Read only    | Read only  | Read only |
| Admin   | Full CRUD    | Full CRUD  | Read only |

All roles are authenticated via JWT. Admin is the only role that can create, update, or delete data.

## Database Schema

- **users**: id, email, username, password_hash, role, created_at
- **categories**: id, name, user_id, created_at
- **transactions**: id, user_id, amount, type, category_id, date, notes, created_at

Indexes:
- `user_id` on transactions and categories
- `date` on transactions
- `notes` on transactions
- `name` on categories

## Project Structure

```
app/
├── core/
│   ├── auth.py        # JWT auth, password hashing, dependencies
│   └── config.py      # App configuration
├── db/
│   ├── __init__.py    # Engine, Base, get_db, init_db
│   └── session.py     # Session exports
├── graphql/
│   ├── schema.py      # GraphQL query definitions
│   └── types.py       # GraphQL object types
├── models/
│   ├── user.py
│   ├── category.py
│   └── transaction.py
├── routes/
│   ├── auth.py
│   ├── categories.py
│   ├── transactions.py
│   └── analytics.py
├── schemas/
│   ├── enums.py
│   ├── user.py
│   ├── category.py
│   ├── transaction.py
│   └── token.py
├── services/
│   ├── category_service.py
│   ├── transaction_service.py
│   └── analytics_service.py
└── main.py             # FastAPI app instance
```

## Notes

- The default configuration uses SQLite for quick development. For production, use PostgreSQL (Supabase) by setting `DATABASE_URL`.
- The search is case-insensitive (`LOWER(notes) LIKE LOWER('%...%')`) and works on both notes and category name.
- The GraphQL endpoint respects the same authentication and RBAC as REST.
- The `seed.py` script can be run multiple times safely (checks for existing users).
- Swagger UI documentation is automatically available at `/docs`.

## Troubleshooting

**Database errors:**
- Ensure the database exists and the connection string is correct.
- For PostgreSQL, verify the password and host/port.
- For Supabase, allow connections from your IP in the Supabase dashboard.

**Authentication errors:**
- Ensure you are sending the `Authorization` header correctly.
- Tokens expire after 30 minutes (configurable). Login again to get a new token.

**Import errors when running:**
- Make sure you are in the project root directory (where `app/` lives) when executing `python main.py`.

## License

This is an educational project. No License.
