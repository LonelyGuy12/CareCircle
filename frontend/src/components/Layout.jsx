import { NavLink, Outlet } from 'react-router-dom'
import data from '../data/mock.json'

const links = [
  { to: '/', label: 'Today' },
  { to: '/medications', label: 'Medications' },
  { to: '/appointments', label: 'Appointments' },
  { to: '/summaries', label: 'Daily Summaries' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/profile', label: 'Profile' },
]

export default function Layout() {
  const unread = data.alerts.filter((a) => !a.read).length

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-white border-b md:border-b-0 md:border-r border-slate-200 md:w-60 md:min-h-screen">
        <div className="p-5">
          <p className="text-xl font-bold text-teal-700">CareCircle</p>
          <p className="text-sm text-slate-500">Caring for {data.careRecipient.name}</p>
        </div>
        <nav className="flex md:flex-col gap-1 px-3 pb-3 overflow-x-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg whitespace-nowrap font-medium ${
                  isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {l.label}
              {l.to === '/alerts' && unread > 0 && (
                <span className="ml-2 rounded-full bg-red-600 text-white text-xs px-2 py-0.5">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-5 md:p-8 max-w-5xl">
        <Outlet />
      </main>
    </div>
  )
}
