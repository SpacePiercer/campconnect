const PALETTE = ['#47825d', '#c96f4a', '#6b5b4a', '#4a7a96', '#96604a', '#7d6a9e', '#a8842c', '#3d8a80']

function colorFor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')
}

export default function Avatar({ id, name, className = 'w-10 h-10 text-sm' }: { id: string; name: string; className?: string }) {
  return (
    <div
      className={`${className} rounded-xl flex items-center justify-center font-bold text-white shrink-0 select-none`}
      style={{ backgroundColor: colorFor(id) }}
      title={name}
    >
      {initials(name)}
    </div>
  )
}
