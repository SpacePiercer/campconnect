import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { friendlyError, type Hike } from '../lib/types'
import { formatDate, formatTime } from '../lib/format'
import { useAuth } from '../context/AuthContext'

interface Props {
  hike: Hike
  joinedCount: number
  isJoined: boolean
  onChanged: () => void
  showHostActions?: boolean
}

export default function HikeCard({ hike, joinedCount, isJoined, onChanged, showHostActions }: Props) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const full = joinedCount >= hike.capacity
  const isHost = session?.user.id === hike.host_id

  async function join() {
    const { error } = await supabase.rpc('join_hike', { p_hike_id: hike.id })
    if (error) alert(friendlyError(error.message))
    onChanged()
  }

  async function leave() {
    const { error } = await supabase.rpc('leave_hike', { p_hike_id: hike.id })
    if (error) alert(friendlyError(error.message))
    onChanged()
  }

  async function remove() {
    if (!confirm(`Delete "${hike.name}"? This removes the whole hub for everyone.`)) return
    const { error } = await supabase.from('hikes').delete().eq('id', hike.id)
    if (error) alert(friendlyError(error.message))
    onChanged()
  }

  return (
    <div className="card p-4">
      <Link to={`/hike/${hike.id}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-bold text-lg leading-tight">{hike.name}</h2>
          {full && <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">FULL</span>}
        </div>
        <p className="text-bark text-sm mt-1">📍 {hike.location_name}</p>
        <p className="text-bark text-sm">
          🗓️ {formatDate(hike.date)} · {formatTime(hike.time)}
        </p>
      </Link>
      <div className="flex items-center justify-between mt-3">
        <span className="text-sm font-semibold text-pine-600">
          {joinedCount}/{hike.capacity} joined
        </span>
        <div className="flex gap-2">
          {showHostActions && isHost && (
            <>
              <button className="btn-secondary py-2 text-sm" onClick={() => navigate(`/edit/${hike.id}`)}>Edit</button>
              <button className="rounded-xl bg-red-50 text-red-600 font-semibold py-2 px-4 text-sm" onClick={remove}>Delete</button>
            </>
          )}
          {isJoined ? (
            !isHost && <button className="btn-secondary py-2 text-sm" onClick={leave}>Leave</button>
          ) : (
            <button className="btn-primary py-2 text-sm" onClick={join} disabled={full}>Join</button>
          )}
        </div>
      </div>
    </div>
  )
}
