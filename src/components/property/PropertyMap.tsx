'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Gold diamond marker matching the page aesthetic
const goldIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 14px; height: 14px;
      background: #C9A96E;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 0 0 4px rgba(201,169,110,0.2), 0 0 16px rgba(201,169,110,0.4);
    "></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 14],
})

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

interface PropertyMapProps {
  lat: number
  lng: number
  zoom?: number
}

export default function PropertyMap({ lat, lng, zoom = 15 }: PropertyMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      attributionControl={false}
    >
      {/* CartoDB Dark Matter — free, no API key, dark luxury aesthetic */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      <Marker position={[lat, lng]} icon={goldIcon} />
      <ScrollZoomToggle />
    </MapContainer>
  )
}
