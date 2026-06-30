"""
Django settings for el Sistema de Encuestas de Infraestructura y VGT.

CONATEL — Configuración principal.
"""

import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Cargar variables de entorno desde el archivo .env ubicado en la raíz del backend
load_dotenv(BASE_DIR / ".env")

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-censo-encuestas-dev-key-change-in-production-!@#$%",
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DJANGO_DEBUG", "True").lower() in ("true", "1", "yes")

ALLOWED_HOSTS: list[str] = os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",")


# ---------------------------------------------------------------------------
# Application definition
# ---------------------------------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "drf_spectacular",
    "corsheaders",
    # Local apps
    "apps.users",
    "apps.encuestas",
    "apps.geography",
]

AUTH_USER_MODEL = "users.Usuario"

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# ---------------------------------------------------------------------------
# Databases
# ---------------------------------------------------------------------------

DATABASES = {
    # Base de datos principal del sistema de encuestas (lectura/escritura)
    "default": {
        "ENGINE":   "django.db.backends.postgresql",
        "NAME":     os.environ.get("CENSO_DB_NAME",     "censo2"),
        "USER":     os.environ.get("CENSO_DB_USER",     "postgres"),
        "PASSWORD": os.environ.get("CENSO_DB_PASSWORD", "postgres"),
        "HOST":     os.environ.get("CENSO_DB_HOST",     "localhost"),
        "PORT":     os.environ.get("CENSO_DB_PORT",     "5432"),
    },
    # Base de datos ENVIADA — Externa (SOLO LECTURA para geografía)
    "enviar_db": {
        "ENGINE":   "django.db.backends.postgresql",
        "NAME":     os.environ.get("ENVIADA_DB_NAME",     "ENVIADA"),
        "USER":     os.environ.get("ENVIADA_DB_USER",     "postgres"),
        "PASSWORD": os.environ.get("ENVIADA_DB_PASSWORD", "postgres"),
        "HOST":     os.environ.get("ENVIADA_DB_HOST",     "localhost"),
        "PORT":     os.environ.get("ENVIADA_DB_PORT",     "5432"),
    },
}

DATABASE_ROUTERS = ["config.db_routers.EnviadaDatabaseRouter"]


# ---------------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ---------------------------------------------------------------------------
# Internationalization
# ---------------------------------------------------------------------------

LANGUAGE_CODE = "es-ve"
TIME_ZONE = "America/Caracas"
USE_I18N = True
USE_TZ = True


# ---------------------------------------------------------------------------
# Static files (CSS, JavaScript, Images)
# ---------------------------------------------------------------------------

STATIC_URL = "static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# ---------------------------------------------------------------------------
# Default primary key field type
# ---------------------------------------------------------------------------

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

CORS_ALLOW_ALL_ORIGINS = True


# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "apps.core.renderers.CustomJSONRenderer",
    ],
    "EXCEPTION_HANDLER": "apps.core.exceptions.custom_exception_handler",
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}


# ---------------------------------------------------------------------------
# SimpleJWT — Configuración de tokens
# ---------------------------------------------------------------------------

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME":  timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES":      ("Bearer",),
    "USER_ID_FIELD":          "id",
    "USER_ID_CLAIM":          "user_id",
    "ROTATE_REFRESH_TOKENS":  True,
    "BLACKLIST_AFTER_ROTATION": True,
}


# ---------------------------------------------------------------------------
# drf-spectacular — Configuración de Swagger / OpenAPI
# ---------------------------------------------------------------------------

SPECTACULAR_SETTINGS = {
    "TITLE": "Encuestas de Infraestructura y VGT — API",
    "DESCRIPTION": "CONATEL — Sistema de Sondeo sobre Despliegue de Infraestructura y Vías Generales de Telecomunicaciones. Documentación de la API REST.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SERVE_PERMISSIONS": ["rest_framework.permissions.AllowAny"],
    # Soporte para autenticación JWT en Swagger UI
    "SECURITY": [{"BearerAuth": []}],
    "COMPONENTS": {
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
            }
        }
    },
}
