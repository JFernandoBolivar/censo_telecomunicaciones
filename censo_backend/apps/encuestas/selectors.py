from apps.encuestas.models.models_encuestas import Configuracion, PreguntaPersonalizada

def obtener_configuracion_activa():
    """Obtiene la configuración de encuesta más reciente/activa."""
    return Configuracion.objects.order_by("-fecha_creacion").first()

def obtener_preguntas_por_configuracion(configuracion):
    """Devuelve las preguntas asociadas a una configuración, optimizadas para listar."""
    return (
        PreguntaPersonalizada.objects
        .filter(configuracion=configuracion)
        .select_related("tipo_pregunta", "seccion")
        .prefetch_related("opciones", "seleccionables")
        .order_by("seccion__id", "id")
    )

def obtener_preguntas_con_respuestas(configuracion):
    """Devuelve las preguntas asociadas a una configuración, optimizadas para incluir respuestas del usuario."""
    return (
        PreguntaPersonalizada.objects
        .filter(configuracion=configuracion)
        .select_related("tipo_pregunta", "seccion")
        .prefetch_related("opciones", "seleccionables", "usuariopermiso_set")
        .order_by("seccion__id", "id")
    )
