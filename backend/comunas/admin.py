from django.contrib import admin
from .models import Region, Provincia, Comuna


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ["codigo", "nombre", "macrozona"]
    search_fields = ["nombre", "codigo"]
    list_filter = ["macrozona"]


@admin.register(Provincia)
class ProvinciaAdmin(admin.ModelAdmin):
    list_display = ["codigo", "nombre", "region"]
    search_fields = ["nombre", "codigo"]
    list_filter = ["region__macrozona"]


@admin.register(Comuna)
class ComunaAdmin(admin.ModelAdmin):
    list_display = ["cut", "nombre", "provincia", "padron_electoral", "ruralidad_pct"]
    search_fields = ["nombre", "cut"]
    list_filter = ["provincia__region__macrozona"]