import csv
import math
import os
from collections import defaultdict
from django.core.management.base import BaseCommand
from django.conf import settings
from comunas.models import Comuna
from elecciones.models import Eleccion, Candidato, ResultadoComuna, EntropiaComuna


def calcular_entropia(votos_dict, votos_validos):
    h = 0.0
    for v in votos_dict.values():
        p = v / votos_validos
        if p > 0:
            h -= p * math.log2(p)
    return round(h, 6)


def leer_csv_por_comuna(csv_path):
    por_comuna = defaultdict(list)
    with open(csv_path, encoding='utf-8') as f:
        for row in csv.DictReader(f):
            por_comuna[row['cut'].zfill(5)].append(row)
    return por_comuna


class Command(BaseCommand):
    help = 'Carga resultados reales SERVEL 2025 (1ª y 2ª vuelta) para las 346 comunas'

    def handle(self, *args, **kwargs):
        data_dir = os.path.join(settings.BASE_DIR, 'data')
        csv_1v = os.path.join(data_dir, 'servel_1v_real.csv')
        csv_2v = os.path.join(data_dir, 'servel_2v_real.csv')

        for path in [csv_1v, csv_2v]:
            if not os.path.exists(path):
                self.stderr.write(self.style.ERROR(f'No se encuentra: {path}'))
                return

        try:
            eleccion_1v = Eleccion.objects.get(vuelta=1)
            eleccion_2v = Eleccion.objects.get(vuelta=2)
        except Eleccion.DoesNotExist as e:
            self.stderr.write(self.style.ERROR(f'Elección no encontrada: {e}. Ejecuta cargar_elecciones primero.'))
            return

        candidatos = {c.sigla: c for c in Candidato.objects.all()}

        resultados_1v = leer_csv_por_comuna(csv_1v)
        resultados_2v = leer_csv_por_comuna(csv_2v)

        total_resultados = 0
        total_entropias = 0
        comunas_sin_datos = []

        cuts = sorted(set(resultados_1v.keys()) | set(resultados_2v.keys()))
        self.stdout.write(f'Procesando {len(cuts)} comunas...\n')

        for cut in cuts:
            try:
                comuna = Comuna.objects.get(cut=cut)
            except Comuna.DoesNotExist:
                comunas_sin_datos.append(cut)
                continue

            # ── PRIMERA VUELTA ────────────────────────────────────────────
            filas_1v = resultados_1v.get(cut, [])
            votos_1v = {}

            if filas_1v:
                votos_validos_1v = int(filas_1v[0]['votos_validos'])

                for fila in filas_1v:
                    sigla = fila['sigla']
                    if sigla not in candidatos:
                        continue
                    votos = int(fila['votos'])
                    pct = float(fila['porcentaje'])
                    votos_1v[sigla] = votos

                    ResultadoComuna.objects.update_or_create(
                        comuna=comuna,
                        eleccion=eleccion_1v,
                        candidato=candidatos[sigla],
                        defaults={'votos': votos, 'porcentaje': pct},
                    )
                    total_resultados += 1

                if votos_validos_1v > 0 and votos_1v:
                    h1 = calcular_entropia(votos_1v, votos_validos_1v)
                    EntropiaComuna.objects.update_or_create(
                        comuna=comuna,
                        eleccion=eleccion_1v,
                        defaults={'entropia_shannon': h1, 'magnitud_quake': None},
                    )
                    total_entropias += 1

            # ── SEGUNDA VUELTA ────────────────────────────────────────────
            filas_2v = resultados_2v.get(cut, [])
            votos_2v = {}

            if filas_2v:
                votos_validos_2v = int(filas_2v[0]['votos_validos'])

                for fila in filas_2v:
                    sigla = fila['sigla']
                    if sigla not in candidatos:
                        continue
                    votos = int(fila['votos'])
                    pct = float(fila['porcentaje'])
                    votos_2v[sigla] = votos

                    ResultadoComuna.objects.update_or_create(
                        comuna=comuna,
                        eleccion=eleccion_2v,
                        candidato=candidatos[sigla],
                        defaults={'votos': votos, 'porcentaje': pct},
                    )
                    total_resultados += 1

                if votos_validos_2v > 0 and votos_2v:
                    h2 = calcular_entropia(votos_2v, votos_validos_2v)

                    # Magnitud quake: log10 del cambio absoluto de votos de Jara entre vueltas
                    votos_jara_1v = votos_1v.get('JARA', 0)
                    votos_jara_2v = votos_2v.get('JARA', 0)
                    magnitud = round(math.log10(abs(votos_jara_2v - votos_jara_1v) + 1), 4)

                    EntropiaComuna.objects.update_or_create(
                        comuna=comuna,
                        eleccion=eleccion_2v,
                        defaults={'entropia_shannon': h2, 'magnitud_quake': magnitud},
                    )
                    total_entropias += 1

            # Log por comuna
            ganador_1v = max(votos_1v, key=votos_1v.get) if votos_1v else '?'
            ganador_2v = max(votos_2v, key=votos_2v.get) if votos_2v else '?'
            self.stdout.write(
                f'  {comuna.nombre:<28} 1v:{ganador_1v:<7} 2v:{ganador_2v}'
            )

        self.stdout.write(self.style.SUCCESS(
            f'\nListo:'
            f'\n  Resultados cargados: {total_resultados}'
            f'\n  Entropías calculadas: {total_entropias}'
        ))

        if comunas_sin_datos:
            self.stdout.write(self.style.WARNING(
                f'\n  CUTs en CSV sin match en BD ({len(comunas_sin_datos)}): '
                + ', '.join(comunas_sin_datos[:10])
                + ('...' if len(comunas_sin_datos) > 10 else '')
            ))
