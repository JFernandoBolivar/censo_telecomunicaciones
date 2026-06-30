from django.urls import path
from .views import encuesta_views

app_name = "apps.encuestas"
urlpatterns = [
    path("preguntas/", encuesta_views.ListarPreguntasEncuestaAPIView.as_view(), name="listar-preguntas"),
    path("respuestas/", encuesta_views.RegistrarRespuestasAPIView.as_view(), name="registrar-respuestas"),
    path(
        "respuestas/consultar/",
        encuesta_views.ConsultarRespuestasUsuarioAPIView.as_view(),
        name="consultar-respuestas",
    ),
    path(
        "exportar-excel/",
        encuesta_views.ExportarRespuestasExcelAPIView.as_view(),
        name="exportar-excel",
    ),
]
