from django.urls import path
from . import views

app_name = "geography"
urlpatterns = [
    path("direccion/estados/", views.ListEstadosAPIView.as_view(), name="estados"),
    path(
        "direccion/municipios/<int:estadoid>/",
        views.ListMunicipiosAPIView.as_view(),
        name="municipios_por_estado",
    ),
    path(
        "direccion/parroquias/<int:municipioid>/",
        views.ListParroquiasAPIView.as_view(),
        name="parroquias",
    ),
]
