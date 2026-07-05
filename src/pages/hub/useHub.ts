import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Car, CarRider, Hike, Item, Participant, Profile } from '../../lib/types'

export interface HubData {
  hike: (Hike & { host: Profile }) | null
  participants: (Participant & { profile: Profile })[]
  cars: Car[]
  riders: CarRider[]
  items: (Item & { owner: Profile })[]
  loading: boolean
  gone: boolean // hike was deleted
  reload: () => Promise<void>
}

export function useHub(hikeId: string): HubData {
  const [hike, setHike] = useState<HubData['hike']>(null)
  const [participants, setParticipants] = useState<HubData['participants']>([])
  const [cars, setCars] = useState<Car[]>([])
  const [riders, setRiders] = useState<CarRider[]>([])
  const [items, setItems] = useState<HubData['items']>([])
  const [loading, setLoading] = useState(true)
  const [gone, setGone] = useState(false)

  const reload = useCallback(async () => {
    const [h, p, c, r, i] = await Promise.all([
      supabase.from('hikes').select('*, host:profiles(*)').eq('id', hikeId).maybeSingle(),
      supabase.from('hike_participants').select('*, profile:profiles(*)').eq('hike_id', hikeId).order('joined_at'),
      supabase.from('cars').select('*').eq('hike_id', hikeId),
      supabase.from('car_riders').select('*'),
      supabase.from('items').select('*, owner:profiles(*)').eq('hike_id', hikeId),
    ])
    if (!h.data) {
      setGone(true)
      setLoading(false)
      return
    }
    setHike(h.data)
    setParticipants(p.data ?? [])
    setCars(c.data ?? [])
    // ponytail: car_riders has no hike_id column to filter on server-side; filter client-side
    const carIds = new Set((c.data ?? []).map((x) => x.id))
    setRiders((r.data ?? []).filter((x) => carIds.has(x.car_id)))
    setItems(i.data ?? [])
    setLoading(false)
  }, [hikeId])

  useEffect(() => {
    reload()
    const tables: { table: string; filter?: string }[] = [
      { table: 'hikes', filter: `id=eq.${hikeId}` },
      { table: 'hike_participants', filter: `hike_id=eq.${hikeId}` },
      { table: 'cars', filter: `hike_id=eq.${hikeId}` },
      { table: 'car_riders' }, // no hike_id column — refetch on any change (low traffic)
      { table: 'items', filter: `hike_id=eq.${hikeId}` },
    ]
    let ch = supabase.channel(`hub-${hikeId}`)
    for (const t of tables) {
      ch = ch.on('postgres_changes', { event: '*', schema: 'public', ...t }, () => reload())
    }
    ch.subscribe()
    return () => {
      supabase.removeChannel(ch)
    }
  }, [hikeId, reload])

  return { hike, participants, cars, riders, items, loading, gone, reload }
}
