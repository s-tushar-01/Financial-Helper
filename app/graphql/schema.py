import graphene
from ..services.analytics_service import get_summary
from .types import Analytics

class Query(graphene.ObjectType):
    analytics = graphene.Field(Analytics)

    def resolve_analytics(root, info):
        current_user = info.context.get("current_user")
        db = info.context.get("db")
        if not current_user or not db:
            raise Exception("Authentication required")
        if current_user.role not in ["analyst", "admin"]:
            raise Exception("Insufficient permissions")
        summary = get_summary(db, current_user.id)
        return summary

schema = graphene.Schema(query=Query)
