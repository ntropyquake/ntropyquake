from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EjecucionModeloViewSet, ParametroModeloViewSet

router = DefaultRouter()
router.register("ejecuciones", EjecucionModeloViewSet)
router.register("parametros", ParametroModeloViewSet)

urlpatterns = [
    path("", include(router.urls)),
]