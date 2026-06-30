from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, extend_schema_view

from apps.geography import selectors
from apps.geography.serializers import (
    EstadoSerializer,
    MunicipioSerializer,
    ParroquiaSerializer,
)

@extend_schema_view(
    get=extend_schema(
        tags=["geography"],
        summary="Listar estados",
        description="Devuelve una lista de todos los estados.",
        responses={200: EstadoSerializer(many=True)}
    )
)
class ListEstadosAPIView(APIView):
    """
    Lista todos los estados del país usando la base de datos ENVIAR.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        estados = selectors.obtener_todos_los_estados()
        serializer = EstadoSerializer(estados, many=True)
        # El CustomRenderer se encargará de envolver en {"status": "success", "message": ..., "data": ...}
        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        tags=["geography"],
        summary="Listar municipios",
        description="Devuelve una lista de municipios para un estado específico.",
        responses={200: MunicipioSerializer(many=True)}
    )
)
class ListMunicipiosAPIView(APIView):
    """
    Lista los municipios asociados a un estado.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, estadoid):
        municipios = selectors.obtener_municipios_por_estado(estadoid)
        serializer = MunicipioSerializer(municipios, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        tags=["geography"],
        summary="Listar parroquias",
        description="Devuelve una lista de parroquias para un municipio específico.",
        responses={200: ParroquiaSerializer(many=True)}
    )
)
class ListParroquiasAPIView(APIView):
    """
    Lista las parroquias asociadas a un municipio.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, municipioid):
        parroquias = selectors.obtener_parroquias_por_municipio(municipioid)
        serializer = ParroquiaSerializer(parroquias, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
