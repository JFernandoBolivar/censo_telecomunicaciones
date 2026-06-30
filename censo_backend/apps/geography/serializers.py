from rest_framework import serializers
from apps.geography.models import Estado, Municipio, Parroquia


class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = ["id", "estado"]


class MunicipioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Municipio
        fields = ["id", "municipio", "estado"]


class ParroquiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parroquia
        fields = ["id", "parroquia", "municipio"]
