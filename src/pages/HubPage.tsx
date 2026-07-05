import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { pinIcon } from '../components/MapPicker'
import { formatDate, formatTime } from '../lib/format'
import { useHub } from './hub/useHub'
import PeopleTab from './hub/PeopleTab'
import GearTab from './hub/GearTab'

const TABS = ['Overview', 'People', 'Gear'] as const
type Tab = (typeof TABS)[number]

export default function HubPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const hub = useHub(id!)
  const [tab, setTab] = useState<Tab>('Overview')

  if (hub.loading) return <p className="text-bark text-center py-16">Loading…</p>
  if (hub.gone || !hub.hike) {
    return (
      <div className="text-center py-16 text-bark">
        <p>This hike is gone.</p>
        <button className="btn-secondary mt-4" onClick={() => navigate('/')}>Back to Explore</button>
      </div>
    )
  }
  const { hike, participants } = hub

  return (
    <div className="p-5">
      <button className="text-pine-600 font-semibold text-sm mb-2" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="text-2xl font-extrabold text-pine-700">{hike.name}</h1>
      <p className="text-bark text-sm mb-4">📍 {hike.location_name}</p>

      <div className="flex rounded-xl bg-sand p-1 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold ${tab === t ? 'bg-white text-pine-700 shadow-sm' : 'text-bark/70'}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl overflow-hidden border border-sand relative z-0">
            <MapContainer center={[hike.lat, hike.lng]} zoom={12} style={{ height: 180 }} attributionControl={false}>
              <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[hike.lat, hike.lng]} icon={pinIcon} />
            </MapContainer>
          </div>
          <div className="card p-4 flex flex-col gap-2 text-sm">
            <p>🗓️ <span className="font-semibold">{formatDate(hike.date)}</span> at {formatTime(hike.time)}</p>
            <p>👥 {participants.length}/{hike.capacity} joined</p>
            <p>⛺ Hosted by <span className="font-semibold">{hike.host.display_name}</span></p>
          </div>
          {hike.description && (
            <div className="card p-4">
              <p className="text-sm whitespace-pre-wrap">{hike.description}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'People' && <PeopleTab hub={hub} />}
      {tab === 'Gear' && <GearTab hub={hub} />}
    </div>
  )
}
