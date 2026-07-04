import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'

export default function ProfilePage() {
  const { session, profile, refreshProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')

  if (!session || !profile) return null

  async function saveName() {
    const trimmed = name.trim()
    if (trimmed) {
      await supabase.from('profiles').update({ display_name: trimmed }).eq('id', profile!.id)
      await refreshProfile()
    }
    setEditing(false)
  }

  return (
    <div className="p-5 flex flex-col items-center gap-4 pt-12">
      <Avatar id={profile.id} name={profile.display_name} className="w-24 h-24 text-3xl" />
      {editing ? (
        <div className="flex gap-2 w-full max-w-xs">
          <input className="input flex-1" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoFocus />
          <button className="btn-primary px-4" onClick={saveName}>Save</button>
        </div>
      ) : (
        <button className="text-xl font-bold" onClick={() => { setName(profile.display_name); setEditing(true) }}>
          {profile.display_name} <span className="text-sm text-bark/60 font-normal">✎</span>
        </button>
      )}
      <p className="text-bark text-sm">{session.user.email}</p>
      <button className="btn-secondary mt-8" onClick={() => supabase.auth.signOut()}>
        Log out
      </button>
    </div>
  )
}
