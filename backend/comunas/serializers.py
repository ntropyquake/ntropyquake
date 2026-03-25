from rest_framework import serializers
from .models import Region, Provincia, Comuna


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ["id", "codigo", "nombre", "macrozona"]


class ProvinciaSerializer(serializers.ModelSerializer):
    region_nombre = serializers.CharField(source="region.nombre", read_only=True)

    class Meta:
        model = Provincia
        fields = ["id", "codigo", "nombre", "region", "region_nombre"]


class ComunaSerializer(serializers.ModelSerializer):
    provincia_nombre = serializers.CharField(source="provincia.nombre", read_only=True)
    region_nombre = serializers.CharField(source="provincia.region.nombre", read_only=True)
    region_codigo = serializers.CharField(source="provincia.region.codigo", read_only=True)
    macrozona = serializers.CharField(source="provincia.region.macrozona", read_only=True)

    class Meta:
        model = Comuna
        fields = [
            "id", "cut", "nombre",
            "provincia", "provincia_nombre",
            "region_nombre", "region_codigo", "macrozona",
            "poblacion", "padron_electoral", "ruralidad_pct",
            "latitud", "longitud", "geojson",
        ]