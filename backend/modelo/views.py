from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import EjecucionModelo, ParametroModelo
from .serializers import EjecucionModeloSerializer, ParametroModeloSerializer


class EjecucionModeloViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EjecucionModelo.objects.all()
    serializer_class = EjecucionModeloSerializer
    permission_classes = [IsAuthenticated]


class ParametroModeloViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ParametroModelo.objects.select_related("ejecucion").all()
    serializer_class = ParametroModeloSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["ejecucion"]