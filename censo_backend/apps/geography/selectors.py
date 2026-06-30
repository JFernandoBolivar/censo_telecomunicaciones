from .models import Estado, Municipio, Parroquia

def obtener_todos_los_estados():
    """Devuelve todos los estados desde la base de datos ENVIAR."""
    return Estado.objects.using("enviar_db").all().order_by("estado")

def obtener_municipios_por_estado(estado_id):
    """Devuelve los municipios asociados a un estado dado."""
    return Municipio.objects.using("enviar_db").filter(estado_id=estado_id).order_by("municipio")

def obtener_parroquias_por_municipio(municipio_id):
    """Devuelve las parroquias asociadas a un municipio dado."""
    return Parroquia.objects.using("enviar_db").filter(municipio_id=municipio_id).order_by("parroquia")
