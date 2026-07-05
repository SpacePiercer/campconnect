import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Hike } from '../lib/types'
import { todayISO } from '../lib/format'
import { useAuth } from '../context/AuthContext'
import HikeCard from '../components/HikeCard'

type HikeWithCount = Hike & { hike_participants: { count: number }[] }

export default function MyHikesPage() {
  const { session } = useAuth()
  const [hikes, setHikes] = useState<HikeWithCount[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data: myRows } = await supabase
      .from('hike_participants')
      .select('hike_id')
      .eq('user_id', session!.user.id)
    const ids = (myRows ?? []).map((r) => r.hike_id)
    if (ids.length === 0) {
      setHikes([])
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('hikes')
      .select('*, hike_participants(count)')
      .in('id', ids)
      .order('date')
    setHikes((data as HikeWithCount[]) ?? [])
    setLoading(false)
  }, [session])

  useEffect(() => {
    load()
  }, [load])

  const today = todayISO()
  const upcoming = hikes.filter((h) => h.date >= today)
  const past = hikes.filter((h) => h.date < today).reverse()

  const section = (title: string, list: HikeWithCount[]) => (
    <section className="mb-6">
      <h2 className="font-bold text-bark mb-2">{title}</h2>
      {list.length === 0 ? (
        <p className="text-sm text-bark/60">Nothing here yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((h) => (
            <HikeCard
              key={h.id}
              hike={h}
              joinedCount={h.hike_participants[0]?.count ?? 0}
              isJoined
              onChanged={load}
              showHostActions
            />
          ))}
        </div>
      )}
    </section>
  )

  return (
    <div className="p-5">
      <h1 className="text-2xl font-extrabold text-pine-700 mb-4">My hikes</h1>
      {loading ? <p className="text-bark text-center py-10">Loading…</p> : (
        <>
          {section('Upcoming', upcoming)}
          {section('Past', past)}
        </>
      )}
    </div>
  )
}
