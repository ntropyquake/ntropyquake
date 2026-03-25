import csv
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from comunas.models import Region, Provincia, Comuna

MACROZONA_POR_REGION = {
    1:  "norte_grande",
    2:  "norte_grande",
    15: "norte_grande",
    3:  "norte_chico",
    4:  "norte_chico",
    5:  "central",
    6:  "central",
    7:  "central",
    13: "metropolitana",
    8:  "sur",
    16: "sur",
    9:  "sur",
    14: "sur",
    10: "sur",
    11: "austral",
    12: "austral",
}

PROVINCIA_POR_CUT = {
    "01101": ("011", "Iquique"),
    "01107": ("011", "Iquique"),
    "01401": ("014", "Tamarugal"),
    "01402": ("014", "Tamarugal"),
    "01403": ("014", "Tamarugal"),
    "01404": ("014", "Tamarugal"),
    "01405": ("014", "Tamarugal"),
    "02101": ("021", "Antofagasta"),
    "02102": ("021", "Antofagasta"),
    "02103": ("021", "Antofagasta"),
    "02104": ("021", "Antofagasta"),
    "02201": ("022", "El Loa"),
    "02202": ("022", "El Loa"),
    "02203": ("022", "El Loa"),
    "02301": ("023", "Tocopilla"),
    "02302": ("023", "Tocopilla"),
    "03101": ("031", "Copiapó"),
    "03102": ("031", "Copiapó"),
    "03103": ("031", "Copiapó"),
    "03201": ("032", "Chañaral"),
    "03202": ("032", "Chañaral"),
    "03301": ("033", "Huasco"),
    "03302": ("033", "Huasco"),
    "03303": ("033", "Huasco"),
    "03304": ("033", "Huasco"),
    "04101": ("041", "Elqui"),
    "04102": ("041", "Elqui"),
    "04103": ("041", "Elqui"),
    "04104": ("041", "Elqui"),
    "04201": ("042", "Choapa"),
    "04202": ("042", "Choapa"),
    "04203": ("042", "Choapa"),
    "04204": ("042", "Choapa"),
    "04301": ("043", "Limarí"),
    "04302": ("043", "Limarí"),
    "04303": ("043", "Limarí"),
    "04304": ("043", "Limarí"),
    "04305": ("043", "Limarí"),
    "15101": ("151", "Arica"),
    "15102": ("151", "Arica"),
    "15201": ("152", "Parinacota"),
    "15202": ("152", "Parinacota"),
}

CENTROIDE_POR_CUT = {
    "01101": (-20.2133, -70.1503),
    "01107": (-20.2673, -70.1039),
    "02101": (-23.6509, -70.3975),
    "02201": (-22.4558, -68.9183),
    "13101": (-33.4372, -70.6506),
    "13401": (-33.5184, -70.7769),
    "08101": (-36.8201, -73.0444),
    "08108": (-36.7702, -73.1197),
    "08109": (-36.8261, -73.0568),
    "08110": (-36.8671, -73.0444),
    "08112": (-36.8997, -73.1347),
}


class Command(BaseCommand):
    help = "Carga las 345 comunas reales desde el CSV generado con datos INE/SERVEL"

    def handle(self, *args, **kwargs):
        csv_path = os.path.join(settings.BASE_DIR, "data", "comunas_padron.csv")

        if not os.path.exists(csv_path):
            self.stderr.write(f"No se encuentra el archivo: {csv_path}")
            return

        self.stdout.write("Iniciando carga de comunas...")

        regiones_creadas = 0
        provincias_creadas = 0
        comunas_creadas = 0
        comunas_actualizadas = 0

        with open(csv_path, encoding="utf-8") as f:
            reader = csv.DictReader(f)

            for row in reader:
                cut = row["cut"].zfill(5)
                nombre_comuna = row["comuna"].title()
                nombre_region = row["region"].title()
                cod_reg = int(row["cod_reg"])
                padron = int(row["padron_2025"])
                macrozona = MACROZONA_POR_REGION.get(cod_reg, "central")

                # Región
                region, creada = Region.objects.get_or_create(
                    codigo=str(cod_reg).zfill(2),
                    defaults={
                        "nombre": nombre_region,
                        "macrozona": macrozona,
                    }
                )
                if creada:
                    regiones_creadas += 1

                # Provincia
                if cut in PROVINCIA_POR_CUT:
                    cod_prov, nombre_prov = PROVINCIA_POR_CUT[cut]
                else:
                    cod_prov = cut[:3]
                    nombre_prov = f"Provincia {cod_prov}"

                provincia, creada = Provincia.objects.get_or_create(
                    codigo=cod_prov,
                    defaults={
                        "nombre": nombre_prov,
                        "region": region,
                    }
                )
                if creada:
                    provincias_creadas += 1

                # Coordenadas
                lat, lon = CENTROIDE_POR_CUT.get(cut, (0.0, 0.0))

                # Comuna
                comuna, creada = Comuna.objects.update_or_create(
                    cut=cut,
                    defaults={
                        "nombre": nombre_comuna,
                        "provincia": provincia,
                        "poblacion": padron,
                        "padron_electoral": padron,
                        "ruralidad_pct": 0.0,
                        "latitud": lat,
                        "longitud": lon,
                        "geojson": None,
                    }
                )
                if creada:
                    comunas_creadas += 1
                else:
                    comunas_actualizadas += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nCarga completada:"
            f"\n  Regiones creadas:   {regiones_creadas}"
            f"\n  Provincias creadas: {provincias_creadas}"
            f"\n  Comunas creadas:    {comunas_creadas}"
            f"\n  Comunas actualizadas: {comunas_actualizadas}"
        ))