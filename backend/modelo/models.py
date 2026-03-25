from django.db import models
from comunas.models import Comuna


class EjecucionModelo(models.Model):
    ESTADO_CHOICES = [
        ("pendiente", "Pendiente"),
        ("corriendo", "Corriendo"),
        ("completado", "Completado"),
        ("error", "Error"),
    ]
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default="pendiente")
    draws = models.IntegerField(default=300)
    tune = models.IntegerField(default=300)
    chains = models.IntegerField(default=2)
    seed = models.IntegerField(default=81850)
    log = models.TextField(blank=True)

    class Meta:
        ordering = ["-fecha_inicio"]
        verbose_name = "Ejecución del modelo"
        verbose_name_plural = "Ejecuciones del modelo"

    def __str__(self):
        return f"Ejecución {self.id} — {self.estado} — {self.fecha_inicio:%Y-%m-%d %H:%M}"


class ParametroModelo(models.Model):
    ejecucion = models.ForeignKey(EjecucionModelo, on_delete=models.CASCADE, related_name="parametros")
    nombre = models.CharField(max_length=100)
    media = models.FloatField()
    desviacion = models.FloatField()
    ic_low = models.FloatField(help_text="Intervalo credibilidad 94% inferior")
    ic_high = models.FloatField(help_text="Intervalo credibilidad 94% superior")
    r_hat = models.FloatField(help_text="Diagnóstico de convergencia — ideal < 1.01")

    class Meta:
        ordering = ["ejecucion", "nombre"]
        verbose_name = "Parámetro del modelo"
        verbose_name_plural = "Parámetros del modelo"

    def __str__(self):
        return f"{self.nombre} | media={self.media:.3f} | r_hat={self.r_hat:.3f}"