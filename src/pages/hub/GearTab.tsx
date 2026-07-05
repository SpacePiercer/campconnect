import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { friendlyError, type Item, type ItemKind, type Profile } from '../../lib/types'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/Avatar'
import type { HubData } from './useHub'

function ItemSquare({
  item, mine, isMyCarItem, canLoad, onDelete, onToggleLoad,
}: {
  item: Item & { owner: Profile }
  mine: boolean
  isMyCarItem: boolean // loaded in MY car (driver can unload)
  canLoad: boolean // I drive and item is unloaded
  onDelete: () => void
  onToggleLoad: () => void
}) {
  const loaded = item.car_id !== null
  const tappable = canLoad || isMyCarItem
  return (
    <div
      className={`relative aspect-square rounded-xl border p-1.5 flex items-center justify-center text-center bg-white ${
        loaded ? 'border-pine-400 bg-pine-50' : 'border-sand'
      } ${tappable ? 'cursor-pointer active:bg-pine-100' : ''}`}
      onClick={tappable ? onToggleLoad : undefined}
    >
      <span className="text-xs font-semibold leading-tight break-words w-full">{item.name}</span>
      <Avatar id={item.owner.id} name={item.owner.display_name} className="w-5 h-5 text-[9px] absolute bottom-1 right-1 rounded-md" />
      {loaded && <span className="absolute top-1 left-1 text-[11px]">🚙</span>}
      {mine && (
        <button
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] leading-none flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

function Pool({
  title, emoji, kind, hub, myCarId,
}: {
  title: string
  emoji: string
  kind: ItemKind
  hub: HubData
  myCarId: string | null
}) {
  const { session } = useAuth()
  const me = session!.user.id
  const { hike, items, participants, reload } = hub
  const isParticipant = participants.some((p) => p.user_id === me)
  const [name, setName] = useState('')
  const pool = items.filter((i) => i.kind === kind)

  async function add() {
    const n = name.trim()
    if (!n) return
    setName('')
    const { error } = await supabase.from('items').insert({ hike_id: hike!.id, owner_id: me, name: n, kind })
    if (error) alert(friendlyError(error.message))
    await reload()
  }

  async function del(id: string) {
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) alert(friendlyError(error.message))
    await reload()
  }

  async function toggleLoad(item: Item) {
    const target = item.car_id === myCarId ? null : myCarId
    const { error } = await supabase.rpc('set_item_car', { p_item_id: item.id, p_car_id: target })
    if (error) alert(friendlyError(error.message))
    await reload()
  }

  return (
    <div className="card p-4">
      <h3 className="font-bold text-bark text-sm mb-3">{emoji} {title}</h3>
      {pool.length === 0 && <p className="text-sm text-bark/60 mb-3">Nothing yet.</p>}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {pool.map((item) => (
          <ItemSquare
            key={item.id}
            item={item}
            mine={item.owner_id === me}
            isMyCarItem={myCarId !== null && item.car_id === myCarId}
            canLoad={myCarId !== null && item.car_id === null}
            onDelete={() => del(item.id)}
            onToggleLoad={() => toggleLoad(item)}
          />
        ))}
      </div>
      {isParticipant && (
        <form
          className="flex gap-2"
          onSubmit={(e) => { e.preventDefault(); add() }}
        >
          <input className="input py-2 text-sm" placeholder={`Add ${kind === 'provision' ? 'food & drink' : 'a tool'}…`} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          <button className="btn-primary py-2 px-4 text-sm" type="submit">+</button>
        </form>
      )}
    </div>
  )
}

export default function GearTab({ hub }: { hub: HubData }) {
  const { session } = useAuth()
  const me = session!.user.id
  const { hike, cars, items, participants } = hub
  if (!hike) return null

  const myCarId = cars.find((c) => c.driver_id === me)?.id ?? null
  const profileOf = (uid: string) => participants.find((p) => p.user_id === uid)?.profile

  return (
    <div className="flex flex-col gap-4">
      {myCarId && (
        <p className="text-xs text-bark bg-pine-50 border border-pine-200 rounded-xl px-3 py-2">
          You're a driver — tap an item to load it into your car, tap again to unload.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <Pool title="Provisions" emoji="🍎" kind="provision" hub={hub} myCarId={myCarId} />
        <Pool title="Tools" emoji="⛺" kind="tool" hub={hub} myCarId={myCarId} />
      </div>

      {hike.carpool_enabled && cars.length > 0 && (
        <div className="card p-4">
          <h3 className="font-bold text-bark text-sm mb-3">🚙 Car loading</h3>
          <div className="flex flex-col gap-3">
            {cars.map((car) => {
              const driver = profileOf(car.driver_id)
              const loaded = items.filter((i) => i.car_id === car.id)
              return (
                <div key={car.id} className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    {driver && <Avatar id={driver.id} name={driver.display_name} className="w-9 h-9 text-xs" />}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {loaded.length === 0 ? (
                      <span className="text-xs text-bark/50">empty trunk</span>
                    ) : (
                      loaded.map((i) => (
                        <span key={i.id} className="text-xs font-semibold bg-sand rounded-lg px-2 py-1">{i.name}</span>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
