from django.db import models
from comunas.models import Comuna
import math


class Eleccion(models.Model):
    VUELTA_CHOICES = [(1, "Primera vuelta"), (2, "Segunda vuelta")]
    nombre = models.CharField(max_length=100)
    vuelta = models.IntegerField(choices=VUELTA_CHOICES)
    fecha = models.DateField()
    descripcion = models.TextField(blank=True)

    class Meta:
        ordering = ["fecha", "vuelta"]
        verbose_name = "Elección"
        verbose_name_plural = "Elecciones"

    def __str__(self):
        return f"{self.nombre} — Vuelta {self.vuelta}"


class Candidato(models.Model):
    nombre = models.CharField(max_length=100)
    sigla = models.CharField(max_length=10)
    color_hex = models.CharField(max_length=7, help_text="Color para visualización, ej: #E24B4A")
    descripcion = models.TextField(blank=True)
    activo_segunda_vuelta = models.BooleanField(default=False)

    class Meta:
        ordering = ["sigla"]
        verbose_name = "Candidato"
        verbose_name_plural = "Candidatos"

    def __str__(self):
        return f"{self.sigla} — {self.nombre}"


class ResultadoComuna(models.Model):
    comuna = models.ForeignKey(Comuna, on_delete=models.PROTECT, related_name="resultados")
    eleccion = models.ForeignKey(Eleccion, on_delete=models.PROTECT, related_name="resultados")
    candidato = models.ForeignKey(Candidato, on_delete=models.PROTECT, related_name="resultados")
    votos = models.IntegerField()
    porcentaje = models.FloatField()

    class Meta:
        unique_together = ["comuna", "eleccion", "candidato"]
        ordering = ["eleccion", "comuna", "-votos"]
        verbose_name = "Resultado por comuna"
        verbose_name_plural = "Resultados por comuna"

    def __str__(self):
        return f"{self.comuna} | {self.eleccion} | {self.candidato.sigla}: {self.votos}"


class EntropiaComuna(models.Model):
    comuna = models.ForeignKey(Comuna, on_delete=models.PROTECT, related_name="entropias")
    eleccion = models.ForeignKey(Eleccion, on_delete=models.PROTECT, related_name="entropias")
    entropia_shannon = models.FloatField(help_text="H = -Σ p_i · log2(p_i)")
    magnitud_quake = models.FloatField(help_text="log10 del cambio absoluto de votos respecto a elección anterior", null=True, blank=True)

    class Meta:
        unique_together = ["comuna", "eleccion"]
        ordering = ["-entropia_shannon"]
        verbose_name = "Entropía comunal"
        verbose_name_plural = "Entropías comunales"

    def __str__(self):
        return f"{self.comuna} | {self.eleccion} | H={self.entropia_shannon:.3f}"


class FlujoTransicion(models.Model):
    comuna = models.ForeignKey(Comuna, on_delete=models.PROTECT, related_name="flujos")
    candidato_origen = models.ForeignKey(Candidato, on_delete=models.PROTECT, related_name="flujos_origen")
    candidato_destino = models.ForeignKey(Candidato, on_delete=models.PROTECT, related_name="flujos_destino")
    probabilidad_media = models.FloatField(help_text="Media posterior del modelo bayesiano")
    probabilidad_ic_low = models.FloatField(help_text="Límite inferior intervalo credibilidad 94%")
    probabilidad_ic_high = models.FloatField(help_text="Límite superior intervalo credibilidad 94%")

    class Meta:
        unique_together = ["comuna", "candidato_origen", "candidato_destino"]
        ordering = ["comuna", "candidato_origen", "-probabilidad_media"]
        verbose_name = "Flujo de transición"
        verbose_name_plural = "Flujos de transición"

    def __str__(self):
        return f"{self.comuna} | {self.candidato_origen.sigla} → {self.candidato_destino.sigla}: {self.probabilidad_media:.2f}"