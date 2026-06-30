from collections import OrderedDict

from django.http import HttpResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse

from apps.encuestas import selectors
from apps.encuestas.services import encuesta_service
from apps.encuestas.services.excel_service import generar_excel_respuestas
from apps.encuestas.serializers import (
    PreguntaPersonalizadaSerializer,
    PreguntaConRespuestaSerializer,
    EncuestaSubmitSerializer,
)
from apps.encuestas.serializers.serializers_encuestas import UsuarioRespuestaSerializer


class ListarPreguntasEncuestaAPIView(APIView):
    """
    Lista las preguntas de la encuesta activa.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["encuestas"],
        summary="Listar preguntas de la encuesta activa",
        description="Devuelve todas las preguntas de la configuración de encuesta más reciente, agrupadas por sección.",
        responses={
            200: OpenApiResponse(description="Lista de preguntas agrupadas por sección."),
            404: OpenApiResponse(description="No hay configuración de encuesta activa."),
        },
    )
    def get(self, request):
        config = selectors.obtener_configuracion_activa()
        if not config:
            return Response(
                {"message": "No hay configuración de encuesta activa.", "data": []},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Usar selector
        preguntas = selectors.obtener_preguntas_por_configuracion(config)

        # Usar servicio
        agrupadas = encuesta_service.agrupar_preguntas_por_seccion(preguntas)

        # Serialización
        serializer = PreguntaPersonalizadaSerializer(preguntas, many=True)

        data_agrupada = OrderedDict()
        for nombre_seccion, preguntas_seccion in agrupadas.items():
            data_agrupada[nombre_seccion] = PreguntaPersonalizadaSerializer(
                preguntas_seccion, many=True
            ).data

        return Response(
            {
                "message": "Preguntas obtenidas correctamente.",
                "data": serializer.data,
                "agrupado_por_seccion": data_agrupada,
            },
            status=status.HTTP_200_OK,
        )


class RegistrarRespuestasAPIView(APIView):
    """
    Registrar respuestas de la encuesta.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["encuestas"],
        summary="Registrar respuestas de la encuesta",
        description="Envía las respuestas del usuario autenticado para una o varias preguntas.",
        request=EncuestaSubmitSerializer,
        responses={
            200: OpenApiResponse(description="Respuestas registradas exitosamente."),
            400: OpenApiResponse(description="Error de validación en los datos enviados."),
        },
    )
    def post(self, request):
        serializer = EncuestaSubmitSerializer(data=request.data, context={"user": request.user})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(
            {"message": "Respuestas registradas exitosamente.", "data": None},
            status=status.HTTP_200_OK,
        )


class ConsultarRespuestasUsuarioAPIView(APIView):
    """
    Consultar respuestas del usuario.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["encuestas"],
        summary="Consultar respuestas del usuario",
        description="Devuelve las preguntas de la encuesta activa con las respuestas del usuario autenticado.",
        responses={
            200: OpenApiResponse(description="Preguntas con respuestas del usuario."),
            404: OpenApiResponse(description="No hay configuración de encuesta activa."),
        },
    )
    def get(self, request):
        config = selectors.obtener_configuracion_activa()
        if not config:
            return Response(
                {"message": "No hay configuración de encuesta activa.", "data": []},
                status=status.HTTP_404_NOT_FOUND,
            )

        preguntas = selectors.obtener_preguntas_con_respuestas(config)

        usuario_data = UsuarioRespuestaSerializer(request.user).data
        serializer = PreguntaConRespuestaSerializer(
            preguntas, many=True, context={"user": request.user}
        )

        return Response(
            {
                "message": "Respuestas del usuario obtenidas correctamente.",
                "usuario": usuario_data,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class ExportarRespuestasExcelAPIView(APIView):
    """
    Exportar respuestas a Excel.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["encuestas"],
        summary="Exportar respuestas a Excel",
        description="Genera y descarga un archivo Excel con todas las respuestas de la encuesta activa.",
        responses={
            200: OpenApiResponse(description="Archivo Excel con las respuestas."),
            404: OpenApiResponse(description="No hay configuración de encuesta activa."),
        },
    )
    def get(self, request):
        config = selectors.obtener_configuracion_activa()
        if not config:
            return Response(
                {"message": "No hay configuración de encuesta activa."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Aquí podríamos omitir el custom renderer porque retornamos un HttpResponse puro (archivo)
        try:
            excel_file = generar_excel_respuestas(config)
        except Exception as e:
            return Response(
                {"message": f"Error al generar Excel: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        response = HttpResponse(
            excel_file.read(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = 'attachment; filename="respuestas_encuesta.xlsx"'
        return response
