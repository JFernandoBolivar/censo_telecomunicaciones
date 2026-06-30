from django.urls import path
from . import views

app_name = "apps.users"
urlpatterns = [
    path("register/", views.RegisterUsuarioAPIView.as_view(), name="register"),
    path("login/", views.LoginUsuarioAPIView.as_view(), name="login"),
    path("users/", views.ListUsuariosAPIView.as_view(), name="list"),
]
