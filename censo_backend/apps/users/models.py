from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models


class UsuarioManager(BaseUserManager):
    def create_user(self, email, nombre_empresa, password=None, rif_empresa=None, **extra_fields):
        email = self.normalize_email(email)
        user = self.model(email=email, nombre_empresa=nombre_empresa, rif_empresa=rif_empresa, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nombre_empresa, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        return self.create_user(email, nombre_empresa, password, **extra_fields)


class Usuario(AbstractBaseUser):
    rif_empresa = models.CharField(max_length=20, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True)
    nombre_empresa = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    objects = UsuarioManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nombre_empresa"]

    class Meta:
        db_table = "usuario"
        app_label = "users"

    @property
    def is_superuser(self):
        return self.is_staff

    def __str__(self):
        return f"{self.nombre_empresa} ({self.email})"
