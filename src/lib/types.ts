export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
}

export interface Hike {
  id: string
  host_id: string
  name: string
  description: string
  location_name: string
  lat: number
  lng: number
  date: string // YYYY-MM-DD
  time: string // HH:MM:SS
  capacity: number
  carpool_enabled: boolean
  created_at: string
}

export interface Participant {
  hike_id: string
  user_id: string
  joined_at: string
  profile?: Profile
}

export interface Car {
  id: string
  hike_id: string
  driver_id: string
  capacity: number
}

export interface CarRider {
  car_id: string
  user_id: string
}

export type ItemKind = 'provision' | 'tool'

export interface Item {
  id: string
  hike_id: string
  owner_id: string
  name: string
  kind: ItemKind
  car_id: string | null
}

/** Maps DB exception messages (raised by RPCs) to friendly UI text. */
export function friendlyError(message: string): string {
  if (message.includes('hike_full')) return 'Sorry, this hike just filled up!'
  if (message.includes('car_full')) return 'Sorry, that car just filled up!'
  if (message.includes('driver_has_car')) return "You're driving your own car on this hike."
  if (message.includes('not_participant')) return 'Join the hike first.'
  if (message.includes('not_your_car')) return 'Only the driver can manage this car.'
  return message
}
