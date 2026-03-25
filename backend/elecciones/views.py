from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Eleccion, Candidato, ResultadoComuna, EntropiaComuna, FlujoTransicion
from .serializers import (
    EleccionSerializer, CandidatoSerializer, ResultadoComunaSerializer,
    EntropiaComunaSerializer, FlujoTransicionSerializer
)


class EleccionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Eleccion.objects.all()
    serializer_class = EleccionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["vuelta"]


class CandidatoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Candidato.objects.all()
    serializer_class = CandidatoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["activo_segunda_vuelta"]


class ResultadoComunaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ResultadoComuna.objects.select_related("comuna", "eleccion", "candidato").all()
    serializer_class = ResultadoComunaSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["eleccion", "candidato", "comuna"]
    ordering_fields = ["votos", "porcentaje"]


class EntropiaComunaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EntropiaComuna.objects.select_related("comuna", "eleccion").all()
    serializer_class = EntropiaComunaSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["eleccion", "comuna__provincia__region"]
    ordering_fields = ["entropia_shannon", "magnitud_quake"]


class FlujoTransicionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FlujoTransicion.objects.select_related(
        "comuna", "candidato_origen", "candidato_destino"
    ).all()
    serializer_class = FlujoTransicionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["candidato_origen", "candidato_destino", "comuna"]
    ordering_fields = ["probabilidad_media"]