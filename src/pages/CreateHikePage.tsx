import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { todayISO } from '../lib/format'
import MapPicker from '../components/MapPicker'

export default function CreateHikePage() {
  const { id } = useParams() // present when editing
  const { session } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [locationName, setLocationName] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [capacity, setCapacity] = useState('10')
  const [carpool, setCarpool] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(!id)

  useEffect(() => {
    if (!id) return
    supabase.from('hikes').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setName(data.name)
        setDescription(data.description)
        setLocationName(data.location_name)
        setLat(data.lat)
        setLng(data.lng)
        setDate(data.date)
        setTime(data.time.slice(0, 5))
        setCapacity(String(data.capacity))
        setCarpool(data.carpool_enabled)
      }
      setLoaded(true)
    })
  }, [id])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (lat === null || lng === null) {
      setError('Drop a pin on the map to set the location.')
      return
    }
    if (date < todayISO()) {
      setError('The date cannot be in the past.')
      return
    }
    setBusy(true)
    const row = {
      name: name.trim(),
      description: description.trim(),
      location_name: locationName.trim(),
      lat,
      lng,
      date,
      time,
      capacity: Number(capacity),
      carpool_enabled: carpool,
    }
    if (id) {
      const { error } = await supabase.from('hikes').update(row).eq('id', id)
      if (error) setError(error.message)
      else navigate(`/hike/${id}`)
    } else {
      const { data, error } = await supabase
        .from('hikes')
        .insert({ ...row, host_id: session!.user.id })
        .select('id')
        .single()
      if (error || !data) setError(error?.message ?? 'Something went wrong')
      else {
        await supabase.rpc('join_hike', { p_hike_id: data.id }) // host joins their own hike
        navigate(`/hike/${data.id}`)
      }
    }
    setBusy(false)
  }

  if (!loaded) return null

  return (
    <div className="p-5">
      <h1 className="text-2xl font-extrabold text-pine-700 mb-4">{id ? 'Edit hike' : 'New hike'}</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input className="input" placeholder="Hike name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
        <textarea
          className="input min-h-24 resize-y"
          placeholder="Description — route, plan, what to expect…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="input"
          placeholder="Location name (e.g. Blue Lake trailhead)"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          required
          maxLength={120}
        />
        <MapPicker lat={lat} lng={lng} onPick={(la, ln) => { setLat(la); setLng(ln) }} />
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm font-semibold text-bark">
            Date
            <input className="input" type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-bark">
            Time
            <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 items-end">
          <label className="flex flex-col gap-1 text-sm font-semibold text-bark">
            Capacity
            <input className="input" type="number" min={1} max={500} value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
          </label>
          <label className="flex items-center gap-3 py-3 px-1 font-semibold text-bark text-sm">
            <input type="checkbox" className="w-5 h-5 accent-pine-600" checked={carpool} onChange={(e) => setCarpool(e.target.checked)} />
            Carpool
          </label>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="btn-primary" disabled={busy}>
          {busy ? '…' : id ? 'Save changes' : 'Create hike'}
        </button>
      </form>
    </div>
  )
}
