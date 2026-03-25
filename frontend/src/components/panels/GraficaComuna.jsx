import { useEffect, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import $ from 'jquery'

const COLORES = {
  JARA:    '#E24B4A',
  KAST:    '#1A56DB',
  PARISI:  '#F59E0B',
  KAISER:  '#8B5CF6',
  MATTHEI: '#0EA5E9',
  MAYNE:   '#94A3B8',
  MEO:     '#10B981',
  ARTES:   '#EC4899',
}

export default function GraficaComuna({ resultados, vuelta }) {
  const containerRef = useRef(null)
  const prevKeyRef   = useRef(null)

  // jQuery slideDown cuando aparecen nuevos datos — efecto más fluido que CSS height
  useEffect(() => {
    if (!resultados?.length || !containerRef.current) return
    const key = resultados.map(r => r.candidato_sigla).join()
    if (prevKeyRef.current === key) return
    prevKeyRef.current = key
    $(containerRef.current).hide().slideDown(360)
  }, [resultados])

  if (!resultados?.length) return null

  // Ordenar ascendente para que el mayor quede arriba en el eje Y (invertido)
  const sorted = [...resultados].sort((a, b) => a.porcentaje - b.porcentaje)
  const maxPct = Math.max(...sorted.map(r => r.porcentaje))
  const axisMax = Math.min(100, Math.ceil(maxPct / 5) * 5 + 5)

  const option = {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 650,
    animationEasing: 'cubicOut',
    grid: { top: 2, bottom: 2, left: 0, right: 44, containLabel: true },
    xAxis: {
      type: 'value',
      max: axisMax,
      show: false,
      splitLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: sorted.map(r => r.candidato_sigla),
      axisLabel: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 9,
        fontFamily: 'sans-serif',
      },
      axisTick:  { show: false },
      axisLine:  { show: false },
      splitLine: { show: false },
    },
    series: [{
      type: 'bar',
      data: sorted.map(r => ({
        value: parseFloat(r.porcentaje.toFixed(1)),
        itemStyle: {
          color: COLORES[r.candidato_sigla] || '#555',
          borderRadius: [0, 3, 3, 0],
          opacity: 0.82,
        },
      })),
      label: {
        show: true,
        position: 'right',
        color: 'rgba(255,255,255,0.6)',
        fontSize: 9,
        fontFamily: 'sans-serif',
        formatter: '{c}%',
      },
      barMaxWidth: 11,
      emphasis: {
        itemStyle: {
          opacity: 1,
          shadowBlur: 8,
          shadowColor: 'rgba(255,255,255,0.18)',
        },
      },
    }],
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: 'white', fontSize: 11, fontFamily: 'sans-serif' },
      formatter: params => {
        const r = sorted[params.dataIndex]
        const col = COLORES[r.candidato_sigla] || '#888'
        return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${col};margin-right:5px"></span>`
          + `<b>${r.candidato_sigla}</b>  ${params.value}%`
          + (r.votos ? `<br><span style="color:rgba(255,255,255,0.4);font-size:10px">${r.votos.toLocaleString('es-CL')} votos</span>` : '')
      },
    },
  }

  return (
    <div
      ref={containerRef}
      style={{
        marginTop: '0.4px',
        paddingTop: '2px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{
        fontSize: '9px', letterSpacing: '1.8px',
        color: 'rgba(255,255,255,0.2)', marginBottom: '4px',
        fontFamily: 'sans-serif',
      }}>
      </div>
      <ReactECharts
        option={option}
        style={{ height: `${sorted.length * 22 + 10}px`, width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  )
}
