import random
import math
from django.core.management.base import BaseCommand
from comunas.models import Comuna
from elecciones.models import Eleccion, Candidato, ResultadoComuna, EntropiaComuna

# Porcentajes nacionales reales primera vuelta 2025
PCT_NACIONAL = {
    'JARA':    0.2684,
    'KAST':    0.2395,
    'PARISI':  0.1966,
    'KAISER':  0.1393,
    'MATTHEI': 0.1250,
    'MAYNE':   0.0126,
    'MEO':     0.0120,
    'ARTES':   0.0067,
}

# Segunda vuelta nacional real: Kast 58%, Jara 42%
PCT_SEGUNDA = {
    'KAST': 0.58,
    'JARA': 0.42,
}

# Sesgo por macrozona para primera vuelta
# (delta sobre porcentaje nacional, se normaliza después)
SESGO_ZONA = {
    'norte_grande': {
        'JARA': -0.04, 'KAST': +0.03, 'PARISI': +0.04,
        'KAISER': +0.01, 'MATTHEI': -0.01, 'MAYNE': -0.01,
        'MEO': -0.01, 'ARTES': -0.01,
    },
    'norte_chico': {
        'JARA': -0.03, 'KAST': +0.04, 'PARISI': +0.02,
        'KAISER': +0.00, 'MATTHEI': +0.01, 'MAYNE': +0.00,
        'MEO': -0.02, 'ARTES': -0.02,
    },
    'central': {
        'JARA': -0.02, 'KAST': +0.03, 'PARISI': +0.01,
        'KAISER': +0.02, 'MATTHEI': -0.01, 'MAYNE': +0.00,
        'MEO': -0.01, 'ARTES': -0.01,
    },
    'metropolitana': {
        'JARA': -0.01, 'KAST': -0.01, 'PARISI': -0.02,
        'KAISER': +0.05, 'MATTHEI': +0.01, 'MAYNE': +0.00,
        'MEO': +0.01, 'ARTES': +0.00,
    },
    'sur': {
        'JARA': +0.05, 'KAST': -0.02, 'PARISI': +0.02,
        'KAISER': -0.02, 'MATTHEI': -0.01, 'MAYNE': +0.00,
        'MEO': +0.01, 'ARTES': -0.01,
    },
    'austral': {
        'JARA': +0.03, 'KAST': +0.02, 'PARISI': -0.02,
        'KAISER': -0.01, 'MATTHEI': +0.01, 'MAYNE': +0.01,
        'MEO': -0.01, 'ARTES': -0.01,
    },
}

# Segunda vuelta: sesgo por macrozona sobre porcentaje nacional
SESGO_ZONA_2V = {
    'norte_grande':  {'KAST': +0.03, 'JARA': -0.03},
    'norte_chico':   {'KAST': +0.04, 'JARA': -0.04},
    'central':       {'KAST': +0.04, 'JARA': -0.04},
    'metropolitana': {'KAST': +0.02, 'JARA': -0.02},
    'sur':           {'KAST': -0.03, 'JARA': +0.03},
    'austral':       {'KAST': +0.01, 'JARA': -0.01},
}


def calcular_entropia_shannon(porcentajes):
    h = 0.0
    for p in porcentajes:
        if p > 0:
            h -= p * math.log2(p)
    return round(h, 6)


class Command(BaseCommand):
    help = 'Simula resultados electorales 2025 por comuna con variación geográfica realista'

    def handle(self, *args, **kwargs):
        random.seed(42)

        eleccion_1 = Eleccion.objects.get(vuelta=1)
        eleccion_2 = Eleccion.objects.get(vuelta=2)
        candidatos = {c.sigla: c for c in Candidato.objects.all()}
        comunas = list(Comuna.objects.select_related('provincia__region').all())

        self.stdout.write(f'Simulando resultados para {len(comunas)} comunas...')

        ResultadoComuna.objects.filter(
            eleccion__in=[eleccion_1, eleccion_2]
        ).delete()
        EntropiaComuna.objects.filter(
            eleccion__in=[eleccion_1, eleccion_2]
        ).delete()

        resultados_bulk = []
        entropias_bulk = []

        for comuna in comunas:
            macrozona = comuna.provincia.region.macrozona
            padron = comuna.padron_electoral
            participacion = random.uniform(0.82, 0.89)
            votos_validos = int(padron * participacion)

            # ── PRIMERA VUELTA ──────────────────────────────────────
            sesgo = SESGO_ZONA.get(macrozona, {})
            pcts_ajustados = {}
            for sigla, pct_base in PCT_NACIONAL.items():
                delta_zona = sesgo.get(sigla, 0)
                ruido = random.gauss(0, 0.015)
                pcts_ajustados[sigla] = max(0.001, pct_base + delta_zona + ruido)

            total = sum(pcts_ajustados.values())
            pcts_norm = {k: v / total for k, v in pcts_ajustados.items()}

            votos_1v = {}
            votos_asignados = 0
            siglas = list(pcts_norm.keys())
            for sigla in siglas[:-1]:
                v = int(votos_validos * pcts_norm[sigla])
                votos_1v[sigla] = v
                votos_asignados += v
            votos_1v[siglas[-1]] = votos_validos - votos_asignados

            for sigla, votos in votos_1v.items():
                pct = round(votos / votos_validos * 100, 4)
                resultados_bulk.append(ResultadoComuna(
                    comuna=comuna,
                    eleccion=eleccion_1,
                    candidato=candidatos[sigla],
                    votos=votos,
                    porcentaje=pct,
                ))

            entropia_1v = calcular_entropia_shannon(
                [v / votos_validos for v in votos_1v.values()]
            )
            entropias_bulk.append(EntropiaComuna(
                comuna=comuna,
                eleccion=eleccion_1,
                entropia_shannon=entropia_1v,
                magnitud_quake=None,
            ))

            # ── SEGUNDA VUELTA ──────────────────────────────────────
            sesgo_2v = SESGO_ZONA_2V.get(macrozona, {})
            pcts_2v = {}
            for sigla in ['KAST', 'JARA']:
                delta = sesgo_2v.get(sigla, 0)
                ruido = random.gauss(0, 0.02)
                pcts_2v[sigla] = max(0.01, PCT_SEGUNDA[sigla] + delta + ruido)

            total_2v = sum(pcts_2v.values())
            pcts_2v_norm = {k: v / total_2v for k, v in pcts_2v.items()}

            participacion_2v = random.uniform(0.78, 0.86)
            votos_validos_2v = int(padron * participacion_2v)

            votos_2v = {}
            votos_2v['KAST'] = int(votos_validos_2v * pcts_2v_norm['KAST'])
            votos_2v['JARA'] = votos_validos_2v - votos_2v['KAST']

            for sigla, votos in votos_2v.items():
                pct = round(votos / votos_validos_2v * 100, 4)
                resultados_bulk.append(ResultadoComuna(
                    comuna=comuna,
                    eleccion=eleccion_2,
                    candidato=candidatos[sigla],
                    votos=votos,
                    porcentaje=pct,
                ))

            entropia_2v = calcular_entropia_shannon(
                [v / votos_validos_2v for v in votos_2v.values()]
            )

            # Magnitud quake: cambio entre elecciones
            votos_jara_1v = votos_1v.get('JARA', 0)
            votos_jara_2v = votos_2v.get('JARA', 0)
            delta_votos = abs(votos_jara_2v - votos_jara_1v)
            magnitud = round(math.log10(delta_votos + 1), 4)

            entropias_bulk.append(EntropiaComuna(
                comuna=comuna,
                eleccion=eleccion_2,
                entropia_shannon=entropia_2v,
                magnitud_quake=magnitud,
            ))

        ResultadoComuna.objects.bulk_create(resultados_bulk)
        EntropiaComuna.objects.bulk_create(entropias_bulk)

        self.stdout.write(self.style.SUCCESS(
            f'\nSimulación completada:'
            f'\n  Resultados creados: {len(resultados_bulk)}'
            f'\n  Entropías creadas:  {len(entropias_bulk)}'
        ))