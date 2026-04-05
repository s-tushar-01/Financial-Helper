from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .db import init_db
from .routes import auth, categories, transactions, analytics, users
from .graphql.schema import schema as graphql_schema
from .core.auth import require_roles
from .db import get_db
from .models import User

app = FastAPI(
    title="Financial Helper",
    debug=settings.DEBUG,
    swagger_ui_parameters={"persistAuthorization": True}
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "https://localhost:3000",
    "https://financial-helper-orcin.vercel.app"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def read_root():
    return {"message": "Financial Helper API", "docs": "/docs"}


app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(transactions.router)
app.include_router(analytics.router)
app.include_router(users.router)


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
        return JSONResponse({"errors": [str(err) for err in result.errors]}, status_code=400)
    return {"data": result.data}
