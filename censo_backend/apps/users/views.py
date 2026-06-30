from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .serializers import RegisterSerializer, LoginSerializer, UsuarioSerializer
from .models import Usuario
from . import services


class RegisterUsuarioAPIView(APIView):
    """
    Registrar un nuevo usuario (empresa)
    Crea una cuenta de usuario con email, nombre_empresa, rif_empresa y contraseña.
    Devuelve tokens JWT (access + refresh) para autenticación inmediata.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["auth"],
        summary="Registrar un nuevo usuario (empresa)",
        description=(
            "Crea una cuenta de usuario con email, nombre_empresa, rif_empresa y contraseña. "
            "Devuelve tokens JWT (access + refresh) para autenticación inmediata."
        ),
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(description="Usuario registrado exitosamente. Incluye tokens JWT."),
            400: OpenApiResponse(description="Error de validación (email duplicado, campos faltantes, etc.)"),
        },
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Delegamos la lógica de tokens al servicio
        user_data_with_tokens = services.generar_tokens_para_usuario(user)

        return Response(
            {"message": "Usuario registrado exitosamente.", "data": user_data_with_tokens},
            status=status.HTTP_201_CREATED,
        )


class LoginUsuarioAPIView(APIView):
    """
    Iniciar sesión
    Autentica al usuario con email y contraseña. Devuelve tokens JWT access + refresh.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["auth"],
        summary="Iniciar sesión",
        description="Autentica al usuario con email y contraseña. Devuelve tokens JWT access + refresh.",
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(description="Inicio de sesión exitoso. Incluye tokens JWT."),
            401: OpenApiResponse(description="Credenciales inválidas o cuenta desactivada."),
        },
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        tokens = serializer.get_tokens()
        
        return Response(
            {"message": "Inicio de sesión correcto.", "data": tokens},
            status=status.HTTP_200_OK,
        )


class ListUsuariosAPIView(APIView):
    """
    Listar todos los usuarios.
    Solo accesible para usuarios administradores (is_staff).
    """
    permission_classes = [IsAdminUser]

    @extend_schema(
        tags=["auth"],
        summary="Listar todos los usuarios",
        description="Devuelve una lista de todos los usuarios registrados. Requiere permisos de administrador.",
        responses={
            200: UsuarioSerializer(many=True),
            401: OpenApiResponse(description="No autenticado."),
            403: OpenApiResponse(description="No tiene permisos de administrador."),
        },
    )
    def get(self, request):
        usuarios = Usuario.objects.all().order_by("-fecha_creacion")
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
