from rest_framework import serializers
from .models import EjecucionModelo, ParametroModelo


class EjecucionModeloSerializer(serializers.ModelSerializer):
    class Meta:
        model = EjecucionModelo
        fields = [
            "id", "fecha_inicio", "fecha_fin", "estado",
            "draws", "tune", "chains", "seed", "log",
        ]


class ParametroModeloSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParametroModelo
        fields = [
            "id", "ejecucion", "nombre",
            "media", "desviacion",
            "ic_low", "ic_high", "r_hat",
        ]