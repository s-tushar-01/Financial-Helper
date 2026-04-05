import graphene
from datetime import datetime


class CategoryType(graphene.ObjectType):
    id = graphene.Int()
    name = graphene.String()


class TransactionType(graphene.ObjectType):
    id = graphene.Int()
    amount = graphene.Float()
    type = graphene.String()
    date = graphene.DateTime()
    notes = graphene.String()
    category = graphene.Field(CategoryType)


class CategoryBreakdown(graphene.ObjectType):
    category = graphene.String()
    amount = graphene.Float()


class MonthlyTotal(graphene.ObjectType):
    month = graphene.String()
    income = graphene.Float()
    expense = graphene.Float()


class Analytics(graphene.ObjectType):
    total_income = graphene.Float()
    total_expenses = graphene.Float()
    balance = graphene.Float()
    category_breakdown = graphene.List(CategoryBreakdown)
    monthly_totals = graphene.List(MonthlyTotal)
    recent_activity = graphene.List(TransactionType)
