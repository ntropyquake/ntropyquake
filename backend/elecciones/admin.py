from django.contrib import admin
from .models import Eleccion, Candidato, ResultadoComuna, EntropiaComuna, FlujoTransicion


@admin.register(Eleccion)
class EleccionAdmin(admin.ModelAdmin):
    list_display = ["nombre", "vuelta", "fecha"]
    list_filter = ["vuelta"]


@admin.register(Candidato)
class CandidatoAdmin(admin.ModelAdmin):
    list_display = ["sigla", "nombre", "color_hex", "activo_segunda_vuelta"]


@admin.register(ResultadoComuna)
class ResultadoComunaAdmin(admin.ModelAdmin):
    list_display = ["comuna", "eleccion", "candidato", "votos", "porcentaje"]
    list_filter = ["eleccion", "candidato"]
    search_fields = ["comuna__nombre"]


@admin.register(EntropiaComuna)
class EntropiaComunaAdmin(admin.ModelAdmin):
    list_display = ["comuna", "eleccion", "entropia_shannon", "magnitud_quake"]
    list_filter = ["eleccion"]
    ordering = ["-entropia_shannon"]


@admin.register(FlujoTransicion)
class FlujoTransicionAdmin(admin.ModelAdmin):
    list_display = ["comuna", "candidato_origen", "candidato_destino", "probabilidad_media"]
    list_filter = ["candidato_origen", "candidato_destino"]