from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/",         admin.site.urls),
    # Auth & Encuestas
    path("api/auth/", include("apps.users.urls")),
    path("api/encuestas/", include("apps.encuestas.urls")),
    # JWT refresh
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    # Geografía (ENVIADA)
    path("api/geography/", include("apps.geography.urls")),
    # Swagger / OpenAPI
    path("api/schema/",    SpectacularAPIView.as_view(),    name="schema"),
    path("api/docs/",      SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]

