from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .db import init_db, get_db
from .routes import auth, categories, transactions, analytics, users
from .graphql.schema import schema as graphql_schema
from .core.auth import require_roles
from .models import User

# ✅ FIRST create app
app = FastAPI()

# ✅ THEN CORS
origins = [
    "http://localhost:5173",
    "https://financial-helper-nine.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # testing ke liye ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Startup
@app.on_event("startup")
def on_startup():
    init_db()

# ✅ Routes
@app.get("/")
def read_root():
    return {"message": "Financial Helper API", "docs": "/docs"}

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(transactions.router)
app.include_router(analytics.router)
app.include_router(users.router)

# ✅ GraphQL
@app.post("/graphql")
async def graphql_endpoint(
    request: Request,
    current_user: User = Depends(require_roles(["analyst", "admin"])),
    db=Depends(get_db),
):
    data = await request.json()
    query = data.get("query")
    variables = data.get("variables")

    result = graphql_schema.execute(
        query,
        variables=variables,
        context={"current_user": current_user, "db": db}
    )

    if result.errors:
        return JSONResponse(
            {"errors": [str(err) for err in result.errors]},
            status_code=400
        )

    return {"data": result.data}
