from rest_framework import serializers
from django.db import transaction

from apps.encuestas.models.models_encuestas import (
    Configuracion,
    Seccion,
    TipoPregunta,
    PreguntaPersonalizada,
    PreguntaOpciones,
    Seleccionable,
    RespuestaEncuesta,
    RespuestaOpciones,
    UsuarioPermiso,
)


# ---------------------------------------------------------------------------
# Serializadores de lectura
# ---------------------------------------------------------------------------

class UsuarioRespuestaSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    email = serializers.EmailField()
    nombre_empresa = serializers.CharField()
    rif_empresa = serializers.CharField(default="")

class ConfiguracionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Configuracion
        fields = ['id', 'fecha_estimada', 'fecha_inicio', 'obligatorio']


class SeccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seccion
        fields = ['id', 'seccion']


class TipoPreguntaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoPregunta
        fields = ['id', 'nombre']


class PreguntaOpcionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreguntaOpciones
        fields = ['id', 'opcion']


class SeleccionableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seleccionable
        fields = ['id', 'elemento']


class PreguntaPersonalizadaSerializer(serializers.ModelSerializer):
    tipo_pregunta = TipoPreguntaSerializer(read_only=True)
    seccion = SeccionSerializer(read_only=True)
    opciones = PreguntaOpcionesSerializer(many=True, read_only=True)
    seleccionables = SeleccionableSerializer(many=True, read_only=True)

    class Meta:
        model = PreguntaPersonalizada
        fields = [
            'id',
            'titulo',
            'tipo_pregunta',
            'seccion',
            'es_obligatorio',
            'validacion',
            'opciones',
            'seleccionables',
        ]


class PreguntaConRespuestaSerializer(PreguntaPersonalizadaSerializer):
    respuestas_usuario = serializers.SerializerMethodField()

    class Meta(PreguntaPersonalizadaSerializer.Meta):
        fields = PreguntaPersonalizadaSerializer.Meta.fields + ['respuestas_usuario']

    def get_respuestas_usuario(self, obj):
        user = self.context.get('user')
        if not user:
            return None
        permiso = obj.usuariopermiso_set.filter(usuario=user).first()
        if not permiso:
            return None
        textos = list(
            permiso.respuestaencuesta_set.values_list('id', 'respuesta', 'fecha_respuesta')
        )
        opciones_qs = permiso.respuestaopciones_set.select_related('pregunta_opciones')
        opciones_data = [
            {
                'id': o.id,
                'opcion_id': o.pregunta_opciones_id,
                'opcion': o.pregunta_opciones.opcion,
                'fecha_respuesta': o.fecha_respuesta,
            }
            for o in opciones_qs
        ]
        return {
            'textos': [
                {'id': t[0], 'respuesta': t[1], 'fecha_respuesta': t[2]}
                for t in textos
            ],
            'opciones': opciones_data,
        }


# ---------------------------------------------------------------------------
# Serializadores de entrada (submit de respuestas)
# ---------------------------------------------------------------------------

class RespuestaEncuestaItemSerializer(serializers.Serializer):
    pregunta = serializers.IntegerField()
    opcion = serializers.IntegerField(required=False, allow_null=True)
    respuesta = serializers.CharField(required=False, allow_blank=True, default="")


class EncuestaSubmitSerializer(serializers.Serializer):
    respuestas = RespuestaEncuestaItemSerializer(many=True)

    def validate_respuestas(self, value):
        if not value:
            raise serializers.ValidationError("Debe enviar al menos una respuesta.")

        for item in value:
            pregunta_id = item["pregunta"]
            opcion_id = item.get("opcion")

            try:
                pregunta = PreguntaPersonalizada.objects.select_related(
                    "tipo_pregunta"
                ).get(id=pregunta_id)
            except PreguntaPersonalizada.DoesNotExist:
                raise serializers.ValidationError(
                    f"La pregunta con id {pregunta_id} no existe."
                )

            es_texto = pregunta.tipo_pregunta.es_texto

            if not es_texto and not opcion_id:
                raise serializers.ValidationError(
                    f"Debe seleccionar una opción para '{pregunta.titulo}'."
                )
            if opcion_id and not PreguntaOpciones.objects.filter(
                id=opcion_id, pregunta_id=pregunta_id
            ).exists():
                raise serializers.ValidationError(
                    f"La opción {opcion_id} no pertenece a la pregunta '{pregunta.titulo}'."
                )

        return value

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["user"]
        respuestas_data = validated_data["respuestas"]

        for item in respuestas_data:
            pregunta = PreguntaPersonalizada.objects.select_related(
                "tipo_pregunta"
            ).get(id=item["pregunta"])

            permiso, _ = UsuarioPermiso.objects.get_or_create(
                usuario=user,
                pregunta_personalizada=pregunta,
            )

            es_texto = pregunta.tipo_pregunta.es_texto

            if es_texto:
                RespuestaEncuesta.objects.filter(usuario_permiso=permiso).delete()
                RespuestaEncuesta.objects.create(
                    usuario_permiso=permiso,
                    respuesta=item.get("respuesta", ""),
                )
            else:
                RespuestaOpciones.objects.filter(usuario_permiso=permiso).delete()
                RespuestaOpciones.objects.create(
                    usuario_permiso=permiso,
                    pregunta_opciones_id=item["opcion"],
                )

        return validated_data



