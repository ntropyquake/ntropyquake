from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EleccionViewSet, CandidatoViewSet, ResultadoComunaViewSet, EntropiaComunaViewSet, FlujoTransicionViewSet

router = DefaultRouter()
router.register("elecciones", EleccionViewSet)
router.register("candidatos", CandidatoViewSet)
router.register("resultados", ResultadoComunaViewSet)
router.register("entropia", EntropiaComunaViewSet)
router.register("flujos", FlujoTransicionViewSet)

urlpatterns = [
    path("", include(router.urls)),
]