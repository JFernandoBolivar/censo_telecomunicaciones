from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UsuarioSerializer


def generar_tokens_para_usuario(user):
    """
    Genera tokens JWT (access y refresh) para un usuario y devuelve
    un diccionario con los tokens y los datos serializados del usuario.
    """
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UsuarioSerializer(user).data,
    }
