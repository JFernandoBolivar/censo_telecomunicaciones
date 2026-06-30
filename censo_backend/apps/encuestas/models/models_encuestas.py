from django.db import models
from django.conf import settings


class Configuracion(models.Model):
    fecha_estimada = models.DateField(null=True, blank=True)
    fecha_inicio = models.DateField()
    obligatorio = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    user_creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        db_column="id_user_creator"
    )

    class Meta:
        db_table = "configuracion"


class Seccion(models.Model):
    seccion = models.CharField(max_length=200)

    class Meta:
        db_table = "seccion"


class TipoPregunta(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    es_texto = models.BooleanField(default=False)

    class Meta:
        db_table = "tipo_pregunta"


class PreguntaPersonalizada(models.Model):
    titulo = models.CharField(max_length=500)
    tipo_pregunta = models.ForeignKey(
        TipoPregunta, on_delete=models.PROTECT, db_column="id_tipo_pregunta"
    )
    configuracion = models.ForeignKey(
        Configuracion, on_delete=models.CASCADE, db_column="id_configuracion"
    )
    seccion = models.ForeignKey(
        Seccion, on_delete=models.PROTECT, db_column="id_seccion"
    )
    es_obligatorio = models.BooleanField(default=False)
    validacion = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = "preguntas_personalizadas"


class Seleccionable(models.Model):
    pregunta = models.ForeignKey(
        PreguntaPersonalizada, on_delete=models.CASCADE, db_column="id_pregunta", related_name="seleccionables"
    )
    elemento = models.CharField(max_length=255)

    class Meta:
        db_table = "seleccionable"


class PreguntaOpciones(models.Model):
    pregunta = models.ForeignKey(
        PreguntaPersonalizada, on_delete=models.CASCADE, db_column="id_pregunta", related_name="opciones"
    )
    opcion = models.CharField(max_length=255)

    class Meta:
        db_table = "pregunta_opciones"


class UsuarioPermiso(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column="user_id"
    )
    pregunta_personalizada = models.ForeignKey(
        PreguntaPersonalizada, on_delete=models.CASCADE, db_column="id_pregunta_personalizada"
    )

    class Meta:
        db_table = "usuario_permiso"


class RespuestaEncuesta(models.Model):
    usuario_permiso = models.ForeignKey(
        UsuarioPermiso, on_delete=models.CASCADE, db_column="id_user_permission"
    )
    respuesta = models.TextField()
    fecha_respuesta = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "respuesta_encuesta"


class RespuestaOpciones(models.Model):
    usuario_permiso = models.ForeignKey(
        UsuarioPermiso, on_delete=models.CASCADE, db_column="id_user_permission"
    )
    pregunta_opciones = models.ForeignKey(
        PreguntaOpciones, on_delete=models.PROTECT, db_column="id_pregunta_opciones"
    )
    fecha_respuesta = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "respuesta_opciones"
