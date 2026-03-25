from django.core.management.base import BaseCommand
from elecciones.models import Eleccion, Candidato
from datetime import date


CANDIDATOS_PRIMERA_VUELTA = [
    {
        "nombre": "Jeannette Jara Román",
        "sigla": "JARA",
        "color_hex": "#E24B4A",
        "descripcion": "Partido Comunista / Unidad por Chile. Exministra del Trabajo.",
        "activo_segunda_vuelta": True,
        "pct_primera": 26.84,
    },
    {
        "nombre": "José Antonio Kast Rist",
        "sigla": "KAST",
        "color_hex": "#1A56DB",
        "descripcion": "Partido Republicano. Derecha conservadora.",
        "activo_segunda_vuelta": True,
        "pct_primera": 23.95,
    },
    {
        "nombre": "Franco Parisi Fernández",
        "sigla": "PARISI",
        "color_hex": "#F59E0B",
        "descripcion": "Partido de la Gente. Populismo de centro.",
        "activo_segunda_vuelta": False,
        "pct_primera": 19.66,
    },
    {
        "nombre": "Johannes Kaiser Barents",
        "sigla": "KAISER",
        "color_hex": "#8B5CF6",
        "descripcion": "Partido Nacional Libertario. Ultraderecha libertaria.",
        "activo_segunda_vuelta": False,
        "pct_primera": 13.93,
    },
    {
        "nombre": "Evelyn Matthei Fornet",
        "sigla": "MATTHEI",
        "color_hex": "#0EA5E9",
        "descripcion": "UDI / Chile Vamos. Derecha tradicional.",
        "activo_segunda_vuelta": False,
        "pct_primera": 12.50,
    },
    {
        "nombre": "Harold Mayne-Nicholls",
        "sigla": "MAYNE",
        "color_hex": "#6B7280",
        "descripcion": "Independiente.",
        "activo_segunda_vuelta": False,
        "pct_primera": 1.26,
    },
    {
        "nombre": "Marco Enríquez-Ominami",
        "sigla": "MEO",
        "color_hex": "#10B981",
        "descripcion": "Partido Progresista. Izquierda independiente.",
        "activo_segunda_vuelta": False,
        "pct_primera": 1.20,
    },
    {
        "nombre": "Eduardo Artés Brichetti",
        "sigla": "ARTES",
        "color_hex": "#374151",
        "descripcion": "Partido Acción Proletaria. Extrema izquierda.",
        "activo_segunda_vuelta": False,
        "pct_primera": 0.67,
    },
]


class Command(BaseCommand):
    help = "Carga las elecciones presidenciales 2025 y sus candidatos reales"

    def handle(self, *args, **kwargs):
        self.stdout.write("Cargando elecciones y candidatos reales 2025...")

        # Candidatos
        for c in CANDIDATOS_PRIMERA_VUELTA:
            candidato, creado = Candidato.objects.update_or_create(
                sigla=c["sigla"],
                defaults={
                    "nombre": c["nombre"],
                    "color_hex": c["color_hex"],
                    "descripcion": c["descripcion"],
                    "activo_segunda_vuelta": c["activo_segunda_vuelta"],
                }
            )
            estado = "creado" if creado else "actualizado"
            self.stdout.write(f"  {estado}: {candidato.sigla} — {candidato.nombre}")

        # Elección primera vuelta
        ev1, creada = Eleccion.objects.update_or_create(
            vuelta=1,
            defaults={
                "nombre": "Elección Presidencial 2025 — Primera Vuelta",
                "fecha": date(2025, 11, 16),
                "descripcion": (
                    "Primera vuelta presidencial del 16 de noviembre de 2025. "
                    "8 candidatos. Participación: 85,7% del padrón (voto obligatorio). "
                    "Jara y Kast pasan a segunda vuelta."
                ),
            }
        )
        self.stdout.write(f"  {'creada' if creada else 'actualizada'}: {ev1}")

        # Elección segunda vuelta
        ev2, creada = Eleccion.objects.update_or_create(
            vuelta=2,
            defaults={
                "nombre": "Elección Presidencial 2025 — Segunda Vuelta",
                "fecha": date(2025, 12, 14),
                "descripcion": (
                    "Segunda vuelta presidencial del 14 de diciembre de 2025. "
                    "Kast derrotó a Jara con 58% vs 42%. "
                    "7,2 millones de votos para Kast, récord histórico en Chile."
                ),
            }
        )
        self.stdout.write(f"  {'creada' if creada else 'actualizada'}: {ev2}")

        self.stdout.write(self.style.SUCCESS(
            f"\nListo: {Candidato.objects.count()} candidatos, "
            f"{Eleccion.objects.count()} elecciones cargadas."
        ))