from django.db import models


class Region(models.Model):
    codigo = models.CharField(max_length=4, unique=True)
    nombre = models.CharField(max_length=100)
    macrozona = models.CharField(max_length=50, choices=[
        ("norte_grande", "Norte Grande"),
        ("norte_chico", "Norte Chico"),
        ("central", "Central"),
        ("metropolitana", "Metropolitana"),
        ("sur", "Sur"),
        ("austral", "Austral"),
    ])

    class Meta:
        ordering = ["codigo"]
        verbose_name = "Región"
        verbose_name_plural = "Regiones"

    def __str__(self):
        return self.nombre


class Provincia(models.Model):
    codigo = models.CharField(max_length=4, unique=True)
    nombre = models.CharField(max_length=100)
    region = models.ForeignKey(Region, on_delete=models.PROTECT, related_name="provincias")

    class Meta:
        ordering = ["codigo"]
        verbose_name = "Provincia"
        verbose_name_plural = "Provincias"

    def __str__(self):
        return self.nombre


class Comuna(models.Model):
    cut = models.CharField(max_length=5, unique=True)  # Código Único Territorial INE
    nombre = models.CharField(max_length=100)
    provincia = models.ForeignKey(Provincia, on_delete=models.PROTECT, related_name="comunas")
    poblacion = models.IntegerField()
    padron_electoral = models.IntegerField()
    ruralidad_pct = models.FloatField(help_text="Porcentaje de población rural (0-100)")
    latitud = models.FloatField()
    longitud = models.FloatField()
    geojson = models.JSONField(null=True, blank=True, help_text="Geometría de polígono comunal")

    class Meta:
        ordering = ["cut"]
        verbose_name = "Comuna"
        verbose_name_plural = "Comunas"

    def __str__(self):
        return f"{self.nombre} ({self.cut})"

    @property
    def region(self):
        return self.provincia.region