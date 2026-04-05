TITLE: Build a Python-Based Finance Backend System (With RBAC, GraphQL, and Debounced Search)

---

PROJECT OVERVIEW:

Build a backend system for a finance tracking application that allows users to manage financial records (income and expenses), view summaries, and access analytics.

The system should demonstrate clean architecture, proper API design, role-based access control, and efficient data handling.

---

TECH STACK REQUIREMENTS:

* Backend Framework: FastAPI
* Database: PostgreSQL (preferred, e.g., Supabase) or SQLite
* ORM: SQLAlchemy
* Authentication: JWT-based (simple implementation)
* API Types:

  * REST APIs (primary)
  * GraphQL (only for analytics)

---

CORE FEATURES:

1. FINANCIAL RECORDS MANAGEMENT

Implement full CRUD functionality for financial transactions.

Each transaction must include:

* id (auto-generated)
* user_id (foreign key)
* amount (float)
* type (income or expense)
* category (string or foreign key)
* date (datetime)
* notes (optional text)

APIs required:

* POST /transactions → create transaction
* GET /transactions → list transactions
* PUT /transactions/{id} → update transaction
* DELETE /transactions/{id} → delete transaction

---

2. FILTERING & SEARCH

Support filtering of transactions using query parameters:

* date range
* category
* type (income/expense)

Implement search functionality:

* Search should work on notes and category fields
* Use case-insensitive matching

Debounced Search Requirement:

* Backend must support search query parameter (?search=...)
* Optimize query performance using indexing
* Assume frontend will debounce requests (~300ms delay)

---

3. ANALYTICS & SUMMARY

Provide endpoints (or GraphQL resolvers) for:

* Total income
* Total expenses
* Current balance (income - expenses)
* Category-wise breakdown
* Monthly totals
* Recent activity (latest transactions)

REST Example:

* GET /analytics/summary

GraphQL Requirement:

* Implement GraphQL endpoint for analytics queries only
* Allow nested queries for category breakdown and summaries

---

4. USER & ROLE MANAGEMENT (RBAC)

Define roles:

* Viewer:

  * Can view transactions and summaries
  * No modification access

* Analyst:

  * Can view transactions
  * Can apply filters and access analytics
  * Cannot create/update/delete

* Admin:

  * Full access
  * Can create, update, delete transactions
  * Can manage users

Database:

* users table must include role field

Authorization:

* Implement middleware/dependency to enforce role-based access
* Restrict endpoints based on role

---

5. AUTHENTICATION

* Implement simple JWT-based authentication:

  * Login endpoint returns token
  * Token includes user_id and role
* Secure endpoints using token verification

Note:

* Keep authentication simple (no OAuth or complex flows)

---

6. DATABASE DESIGN

Tables required:

* users
* transactions
* categories (optional but recommended)

Relationships:

* One user → many transactions

Indexes:

* user_id
* date
* searchable fields (notes/category)

---

7. VALIDATION & ERROR HANDLING

* Validate all inputs (amount > 0, valid type, etc.)

* Return proper HTTP status codes:

  * 400 → invalid input
  * 401 → unauthorized
  * 403 → forbidden
  * 404 → not found

* Handle edge cases:

  * Invalid transaction ID
  * Unauthorized access
  * Missing fields

---

8. CODE STRUCTURE REQUIREMENTS

Organize project using clean architecture:

app/

* models/        (SQLAlchemy models)
* schemas/       (Pydantic schemas)
* routes/        (API endpoints)
* services/      (business logic)
* core/          (auth, config)
* db/            (database setup)

Follow:

* Separation of concerns
* Reusable logic
* Clear naming conventions

---

9. GRAPHQL REQUIREMENTS

* Add a GraphQL endpoint (e.g., /graphql)
* Use it only for analytics queries
* Do not replace REST APIs with GraphQL

Example query:
{
analytics {
totalIncome
totalExpenses
balance
categoryBreakdown {
category
amount
}
}
}

---

10. OPTIONAL FEATURES (ONLY IF TIME PERMITS)

* Pagination for transactions
* API documentation (Swagger via FastAPI)
* Seed data
* CSV/JSON export

---

11. NON-REQUIREMENTS (DO NOT IMPLEMENT)

* No microservices architecture
* No Redis caching
* No complex authentication systems
* No AI features
* Keep system simple and clean

---

12. EXPECTED OUTPUT

* Fully working FastAPI backend
* Proper database schema
* REST APIs + GraphQL endpoint
* Role-based access control implemented
* Clean and readable codebase
* Ready-to-run project

---

13. BUILD ORDER

14. Setup project and database

15. Create models and schema

16. Implement authentication

17. Build CRUD APIs

18. Add filtering and search

19. Implement debounced search support

20. Add analytics logic

21. Implement RBAC

22. Add GraphQL for analytics

23. Add validation and error handling

---
