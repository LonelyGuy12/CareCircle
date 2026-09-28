import data from '../data/mock.json'
import Card from '../components/Card.jsx'

// TODO (Phase 2): add/edit/delete form + weekly adherence chart
export default function Medications() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Medications</h1>
      <Card>
        <ul className="divide-y divide-slate-100">
          {data.medications.map((m) => (
            <li key={m.id} className="py-3">
              <p className="font-medium">{m.name} <span className="text-slate-500">{m.dosage}</span></p>
              <p className="text-sm text-slate-500">{m.times.join(', ')} · {m.instructions}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
