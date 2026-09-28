import data from '../data/mock.json'
import Card from '../components/Card.jsx'
import { formatDate, formatTime } from '../utils.js'

// TODO (Phase 2): add/edit form
export default function Appointments() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Appointments</h1>
      <Card>
        <ul className="divide-y divide-slate-100">
          {data.appointments.map((a) => (
            <li key={a.id} className="py-3">
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-slate-500">{formatDate(a.dateTime)}, {formatTime(a.dateTime)} · {a.doctor} · {a.location}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
