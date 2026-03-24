'use client'

import { Component, useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { PROPERTY_THEMES, DEFAULT_THEME_KEY, type PropertyThemeKey } from '@/lib/property-template'

// Fix default icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DARK_THEMES = new Set<PropertyThemeKey>(['dark-gold', 'graphite', 'vermillion'])

// Disable scroll zoom when map is not focused — better UX on scroll-through pages
function ScrollZoomToggle() {
  const map = useMap()
  useEffect(() => {
    map.scrollWheelZoom.disable()
    const enable = () => map.scrollWheelZoom.enable()
    const disable = () => map.scrollWheelZoom.disable()
    const el = map.getContainer()
    el.addEventListener('mouseenter', enable)
    el.addEventListener('mouseleave', disable)
    return () => {
      el.removeEventListener('mouseenter', enable)
      el.removeEventListener('mouseleave', disable)
    }
  }, [map])
  return null
}

// Error boundary: catches Leaflet's DOM errors from StrictMode remount cycles
interface BoundaryProps {
  children: React.ReactNode
  mapKey: number
  onError: () => void
}
class MapErrorBoundary extends Component<BoundaryProps, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch() { this.props.onError() }
  componentDidUpdate(prevProps: BoundaryProps) {
    if (prevProps.mapKey !== this.props.mapKey) this.setState({ hasError: false })
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

interface PropertyMapProps {
  lat: number
  lng: number
  zoom?: number
  colorTheme?: PropertyThemeKey
}

export default function PropertyMap({ lat, lng, zoom = 15, colorTheme }: PropertyMapProps) {
  const [mounted, setMounted] = useState(false)
  const [mapKey, setMapKey] = useState(0)

  useEffect(() => setMounted(true), [])

  const theme = colorTheme ?? DEFAULT_THEME_KEY
  const vars = PROPERTY_THEMES[theme]
  const accentColor = vars['--p-accent']
  const isDark = DARK_THEMES.has(theme)

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  // Recreate marker icon when accent color changes (memoized per color)
  const themeIcon = useMemo(
    () =>
      L.divIcon({
        className: '',
        html: `<div style="
          width:14px;height:14px;
          background:${accentColor};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 0 0 4px ${accentColor}33,0 0 16px ${accentColor}66;
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 14],
      }),
    [accentColor],
  )

  if (!mounted) return null

  return (
    <MapErrorBoundary mapKey={mapKey} onError={() => setMapKey((k) => k + 1)}>
      <MapContainer
        key={mapKey}
        center={[lat, lng]}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        {/* key forces tile layer to remount when switching between dark/light */}
        <TileLayer
          key={tileUrl}
          url={tileUrl}
          subdomains="abcd"
          maxZoom={20}
        />
        <Marker position={[lat, lng]} icon={themeIcon} />
        <ScrollZoomToggle />
      </MapContainer>
    </MapErrorBoundary>
  )
}
