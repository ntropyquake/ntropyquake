from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Region, Provincia, Comuna
from .serializers import RegionSerializer, ProvinciaSerializer, ComunaSerializer


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["nombre", "codigo"]


class ProvinciaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Provincia.objects.select_related("region").all()
    serializer_class = ProvinciaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["region"]
    search_fields = ["nombre", "codigo"]


class ComunaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Comuna.objects.select_related("provincia__region").all()
    serializer_class = ComunaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["provincia", "provincia__region"]
    search_fields = ["nombre", "cut"]
    ordering_fields = ["nombre", "padron_electoral", "ruralidad_pct"]

    @action(detail=False, methods=["get"], url_path="cut/(?P<cut>[0-9]+)")
    def por_cut(self, request, cut=None):
        try:
            comuna = Comuna.objects.select_related("provincia__region").get(cut=cut)
            serializer = self.get_serializer(comuna)
            return Response(serializer.data)
        except Comuna.DoesNotExist:
            return Response({"error": "Comuna no encontrada"}, status=404)
        
    @action(detail=False, methods=["get"], url_path="mapa-cuts")
    def mapa_cuts(self, request):
        from rest_framework.response import Response
        comunas = Comuna.objects.values("id", "cut", "nombre")
        return Response({c["cut"]: {"id": c["id"], "nombre": c["nombre"]} for c in comunas})