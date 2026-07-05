import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Hike } from '../lib/types'
import { todayISO } from '../lib/format'
import { useAuth } from '../context/AuthContext'
import HikeCard from '../components/HikeCard'

type HikeWithCount = Hike & { hike_participants: { count: number }[] }

export default function ExplorePage() {
  const { session } = useAuth()
  const [hikes, setHikes] = useState<HikeWithCount[]>([])
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [{ data: hikeRows }, { data: myRows }] = await Promise.all([
      supabase
        .from('hikes')
        .select('*, hike_participants(count)')
        .gte('date', todayISO())
        .order('date')
        .order('time'),
      supabase.from('hike_participants').select('hike_id').eq('user_id', session!.user.id),
    ])
    setHikes((hikeRows as HikeWithCount[]) ?? [])
    setJoinedIds(new Set((myRows ?? []).map((r) => r.hike_id)))
    setLoading(false)
  }, [session])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="p-5">
      <h1 className="text-2xl font-extrabold text-pine-700 mb-4">Explore</h1>
      {loading ? (
        <p className="text-bark text-center py-10">Loading…</p>
      ) : hikes.length === 0 ? (
        <div className="text-center py-16 text-bark">
          <div className="text-4xl mb-2">🌲</div>
          <p>No upcoming hikes yet.</p>
          <p className="text-sm mt-1">Be the first — create one!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {hikes.map((h) => (
            <HikeCard
              key={h.id}
              hike={h}
              joinedCount={h.hike_participants[0]?.count ?? 0}
              isJoined={joinedIds.has(h.id)}
              onChanged={load}
            />
          ))}
        </div>
      )}
    </div>
  )
}
