import data from '../data/mock.json';
import Card from '../components/Card.tsx';
import type { MockData } from '../types/mock.ts';

const typedData = data as MockData;

export default function Summaries() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Daily Summaries</h1>
            {typedData.summaries.map((s) => (
                <Card key={s.id} title={s.date}>
                    <p className={`font-medium ${s.flags.length ? 'text-red-700' : ''}`}>
                        {s.headline}
                    </p>
                    <p className="text-slate-600 mt-1">{s.text}</p>
                </Card>
            ))}
        </div>
    );
}
