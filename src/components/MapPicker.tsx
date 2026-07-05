import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// divIcon avoids Leaflet's bundler-broken default marker images
export const pinIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:28px;line-height:1;transform:translate(-50%,-100%);width:max-content">📍</div>',
  iconSize: [0, 0],
})

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface Props {
  lat: number | null
  lng: number | null
  onPick: (lat: number, lng: number) => void
}

export default function MapPicker({ lat, lng, onPick }: Props) {
  const hasPin = lat !== null && lng !== null
  return (
    <div className="rounded-2xl overflow-hidden border border-sand relative z-0">
      <MapContainer
        center={hasPin ? [lat, lng] : [46.8, 8.2]}
        zoom={hasPin ? 12 : 4}
        style={{ height: 240 }}
        attributionControl={false}
      >
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler onPick={onPick} />
        {hasPin && <Marker position={[lat, lng]} icon={pinIcon} />}
      </MapContainer>
      <div className="absolute bottom-0 inset-x-0 bg-white/85 text-center text-xs text-bark py-1 z-[1000] pointer-events-none">
        {hasPin ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'Tap the map to drop a pin'}
      </div>
    </div>
  )
}
