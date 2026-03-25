from django.contrib import admin
from .models import EjecucionModelo, ParametroModelo


@admin.register(EjecucionModelo)
class EjecucionModeloAdmin(admin.ModelAdmin):
    list_display = ["id", "estado", "fecha_inicio", "fecha_fin", "draws", "chains"]
    list_filter = ["estado"]
    readonly_fields = ["fecha_inicio", "fecha_fin"]


@admin.register(ParametroModelo)
class ParametroModeloAdmin(admin.ModelAdmin):
    list_display = ["nombre", "media", "desviacion", "r_hat", "ejecucion"]
    list_filter = ["ejecucion"]
    ordering = ["nombre"]