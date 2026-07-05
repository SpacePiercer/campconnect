export const todayISO = () => new Date().toLocaleDateString('sv') // YYYY-MM-DD local

export function formatDate(d: string): string {
  return new Date(d + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatTime(t: string): string {
  return t.slice(0, 5)
}
