import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { friendlyError, type Profile } from '../../lib/types'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/Avatar'
import type { HubData } from './useHub'

function WheelBadge() {
  return (
    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-sand flex items-center justify-center text-[11px] shadow-sm">
      🛞
    </span>
  )
}

export function PersonSquare({ profile, isDriver = false }: { profile: Profile; isDriver?: boolean }) {
  return (
    <div className="relative">
      <Avatar id={profile.id} name={profile.display_name} className="w-14 h-14 text-lg" />
      {isDriver && <WheelBadge />}
    </div>
  )
}

export default function PeopleTab({ hub }: { hub: HubData }) {
  const { session } = useAuth()
  const me = session!.user.id
  const { hike, participants, cars, riders, reload } = hub
  const [addingCar, setAddingCar] = useState(false)
  const [seats, setSeats] = useState('4')
  const [busy, setBusy] = useState(false)

  if (!hike) return null

  const profileOf = (uid: string) => participants.find((p) => p.user_id === uid)?.profile
  const isParticipant = participants.some((p) => p.user_id === me)
  const iDrive = cars.some((c) => c.driver_id === me)
  const myCarId = riders.find((r) => r.user_id === me)?.car_id ?? null

  async function rpc(fn: string, args: Record<string, unknown>) {
    setBusy(true)
    const { error } = await supabase.rpc(fn, args)
    if (error) alert(friendlyError(error.message))
    await reload()
    setBusy(false)
  }

  // ---------- carpool OFF: one block with everyone ----------
  if (!hike.carpool_enabled) {
    return (
      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <PersonSquare key={p.user_id} profile={p.profile} />
          ))}
        </div>
        <p className="text-sm font-semibold text-pine-600 mt-3">
          {participants.length}/{hike.capacity}
        </p>
      </div>
    )
  }

  // ---------- carpool ON: car blocks + unassigned ----------
  const assigned = new Set<string>()
  for (const c of cars) assigned.add(c.driver_id)
  for (const r of riders) assigned.add(r.user_id)
  const unassigned = participants.filter((p) => !assigned.has(p.user_id))

  async function addCar() {
    const n = Number(seats)
    if (!n || n < 1) return
    await rpc('add_car', { p_hike_id: hike!.id, p_capacity: n })
    setAddingCar(false)
  }

  async function editCapacity(carId: string, current: number) {
    const v = prompt('Seats in your car (including you):', String(current))
    if (!v) return
    const n = Number(v)
    if (!n || n < 1) return
    setBusy(true)
    const { error } = await supabase.from('cars').update({ capacity: n }).eq('id', carId)
    if (error) alert(friendlyError(error.message))
    await reload()
    setBusy(false)
  }

  async function removeCar(carId: string) {
    if (!confirm('Remove your car? Riders move to Unassigned.')) return
    setBusy(true)
    const { error } = await supabase.from('cars').delete().eq('id', carId)
    if (error) alert(friendlyError(error.message))
    await reload()
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {cars.map((car) => {
        const carRiders = riders.filter((r) => r.car_id === car.id)
        const occupied = 1 + carRiders.length
        const driverProfile = profileOf(car.driver_id)
        const mine = car.driver_id === me
        const amRider = myCarId === car.id
        const canJoin = isParticipant && !iDrive && !amRider && occupied < car.capacity
        return (
          <div key={car.id} className="card p-4">
            <div className="flex flex-wrap gap-2">
              {driverProfile && <PersonSquare profile={driverProfile} isDriver />}
              {carRiders.map((r) => {
                const pr = profileOf(r.user_id)
                return pr ? <PersonSquare key={r.user_id} profile={pr} /> : null
              })}
            </div>
            <div className="flex items-center justify-between mt-3">
              <button
                className="text-sm font-semibold text-pine-600 disabled:opacity-100"
                onClick={() => mine && editCapacity(car.id, car.capacity)}
                disabled={!mine}
              >
                {occupied}/{car.capacity} {mine && <span className="text-bark/50 font-normal">✎</span>}
              </button>
              <div className="flex gap-2">
                {mine && (
                  <button className="rounded-xl bg-red-50 text-red-600 font-semibold py-2 px-4 text-sm" onClick={() => removeCar(car.id)} disabled={busy}>
                    Remove car
                  </button>
                )}
                {amRider && (
                  <button className="btn-secondary py-2 text-sm" onClick={() => rpc('leave_car', { p_car_id: car.id })} disabled={busy}>
                    Leave
                  </button>
                )}
                {canJoin && (
                  <button className="btn-primary py-2 text-sm" onClick={() => rpc('join_car', { p_car_id: car.id })} disabled={busy}>
                    Join
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}

      <div className="card p-4">
        <h3 className="font-bold text-bark text-sm mb-2">Unassigned</h3>
        {unassigned.length === 0 ? (
          <p className="text-sm text-bark/60">Everyone has a ride 🎉</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {unassigned.map((p) => (
              <PersonSquare key={p.user_id} profile={p.profile} />
            ))}
          </div>
        )}
      </div>

      {isParticipant && !iDrive && (
        addingCar ? (
          <div className="card p-4 flex items-center gap-2">
            <label className="text-sm font-semibold text-bark flex-1">
              Seats (incl. you)
              <input className="input mt-1" type="number" min={1} max={12} value={seats} onChange={(e) => setSeats(e.target.value)} autoFocus />
            </label>
            <button className="btn-primary py-2 text-sm self-end" onClick={addCar} disabled={busy}>Add</button>
            <button className="btn-secondary py-2 text-sm self-end" onClick={() => setAddingCar(false)}>Cancel</button>
          </div>
        ) : (
          <button className="btn-secondary" onClick={() => setAddingCar(true)}>🚗 Add a car</button>
        )
      )}
    </div>
  )
}
