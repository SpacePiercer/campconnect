import { NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/', label: 'Explore',
    icon: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.9 6.1-2.1 5.7a1 1 0 0 1-.6.6l-5.7 2.1a.5.5 0 0 1-.6-.6l2.1-5.7a1 1 0 0 1 .6-.6l5.7-2.1a.5.5 0 0 1 .6.6ZM12 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z" />,
  },
  {
    to: '/mine', label: 'My hikes',
    icon: <path d="M13.6 3.2a2 2 0 0 0-3.2 0L3.3 12.7A2 2 0 0 0 4.9 16h.6l-1.2 3.4A2 2 0 0 0 6.2 22h11.6a2 2 0 0 0 1.9-2.6L18.5 16h.6a2 2 0 0 0 1.6-3.3L13.6 3.2ZM12 8l3.5 6h-7L12 8Z" />,
  },
  {
    to: '/create', label: 'Create',
    icon: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 6v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H8a1 1 0 1 1 0-2h3V8a1 1 0 1 1 2 0Z" />,
  },
  {
    to: '/profile', label: 'Profile',
    icon: <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 12c-4.4 0-8 2.7-8 6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2c0-3.3-3.6-6-8-6Z" />,
  },
]

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-[1000] bg-white/95 backdrop-blur border-t border-sand pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-4">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 min-h-14 justify-center ${isActive ? 'text-pine-600' : 'text-bark/60'}`
            }
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">{t.icon}</svg>
            <span className="text-[11px] font-semibold">{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
