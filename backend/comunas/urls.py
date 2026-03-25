from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegionViewSet, ProvinciaViewSet, ComunaViewSet

router = DefaultRouter()
router.register("regiones", RegionViewSet, basename="region")
router.register("provincias", ProvinciaViewSet, basename="provincia")
router.register("comunas", ComunaViewSet, basename="comuna")

urlpatterns = [
    path("", include(router.urls)),
]