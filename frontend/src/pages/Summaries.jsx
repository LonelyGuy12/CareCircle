import data from '../data/mock.json'
import Card from '../components/Card.jsx'

// TODO (Phase 3): load from Musha's summary endpoint
export default function Summaries() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Daily Summaries</h1>
      {data.summaries.map((s) => (
        <Card key={s.id} title={s.date}>
          <p className={`font-medium ${s.flags.length ? 'text-red-700' : ''}`}>{s.headline}</p>
          <p className="text-slate-600 mt-1">{s.text}</p>
        </Card>
      ))}
    </div>
  )
}
