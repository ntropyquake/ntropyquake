from rest_framework import serializers
from .models import Eleccion, Candidato, ResultadoComuna, EntropiaComuna, FlujoTransicion


class EleccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Eleccion
        fields = ["id", "nombre", "vuelta", "fecha", "descripcion"]


class CandidatoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidato
        fields = ["id", "nombre", "sigla", "color_hex", "descripcion", "activo_segunda_vuelta"]


class ResultadoComunaSerializer(serializers.ModelSerializer):
    comuna_nombre = serializers.CharField(source="comuna.nombre", read_only=True)
    comuna_cut = serializers.CharField(source="comuna.cut", read_only=True)
    candidato_sigla = serializers.CharField(source="candidato.sigla", read_only=True)
    candidato_color = serializers.CharField(source="candidato.color_hex", read_only=True)
    eleccion_nombre = serializers.CharField(source="eleccion.nombre", read_only=True)

    class Meta:
        model = ResultadoComuna
        fields = [
            "id", "comuna", "comuna_nombre", "comuna_cut",
            "eleccion", "eleccion_nombre",
            "candidato", "candidato_sigla", "candidato_color",
            "votos", "porcentaje",
        ]


class EntropiaComunaSerializer(serializers.ModelSerializer):
    comuna_nombre = serializers.CharField(source="comuna.nombre", read_only=True)
    comuna_cut = serializers.CharField(source="comuna.cut", read_only=True)
    latitud = serializers.FloatField(source="comuna.latitud", read_only=True)
    longitud = serializers.FloatField(source="comuna.longitud", read_only=True)

    class Meta:
        model = EntropiaComuna
        fields = [
            "id", "comuna", "comuna_nombre", "comuna_cut",
            "latitud", "longitud",
            "eleccion", "entropia_shannon", "magnitud_quake",
        ]


class FlujoTransicionSerializer(serializers.ModelSerializer):
    comuna_nombre = serializers.CharField(source="comuna.nombre", read_only=True)
    origen_sigla = serializers.CharField(source="candidato_origen.sigla", read_only=True)
    origen_color = serializers.CharField(source="candidato_origen.color_hex", read_only=True)
    destino_sigla = serializers.CharField(source="candidato_destino.sigla", read_only=True)
    destino_color = serializers.CharField(source="candidato_destino.color_hex", read_only=True)

    class Meta:
        model = FlujoTransicion
        fields = [
            "id", "comuna", "comuna_nombre",
            "candidato_origen", "origen_sigla", "origen_color",
            "candidato_destino", "destino_sigla", "destino_color",
            "probabilidad_media", "probabilidad_ic_low", "probabilidad_ic_high",
        ]