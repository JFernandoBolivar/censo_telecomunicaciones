from django.db import models


class Estado(models.Model):
    id = models.BigAutoField(primary_key=True)
    estado = models.CharField(max_length=100)
    region_id = models.BigIntegerField(db_column="regionId", null=True, blank=True)

    class Meta:
        managed = False
        db_table = "RAC_estado"

    def __str__(self):
        return self.estado


class Municipio(models.Model):
    id = models.BigAutoField(primary_key=True)
    municipio = models.CharField(max_length=100)
    estado = models.ForeignKey(
        Estado,
        on_delete=models.DO_NOTHING,
        db_column="estadoId",
        related_name="municipios",
    )

    class Meta:
        managed = False
        db_table = "RAC_municipio"

    def __str__(self):
        return self.municipio


class Parroquia(models.Model):
    id = models.BigAutoField(primary_key=True)
    parroquia = models.CharField(max_length=100)
    municipio = models.ForeignKey(
        Municipio,
        on_delete=models.DO_NOTHING,
        db_column="municipioId",
        related_name="parroquias",
    )

    class Meta:
        managed = False
        db_table = "RAC_parroquia"

    def __str__(self):
        return self.parroquia
