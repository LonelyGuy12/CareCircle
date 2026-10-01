import data from '../data/mock.json';
import Card from '../components/Card.tsx';
import type { MockData } from '../types/mock.ts';

const typedData = data as MockData;

export default function Profile() {
    const p = typedData.careRecipient;
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{p.name}</h1>
            <Card title="Details">
                <p>Age: {p.age}</p>
                <p>Conditions: {p.conditions.join(', ')}</p>
                <p className="text-slate-600 mt-2">{p.notes}</p>
            </Card>
            <Card title="Emergency contacts">
                <ul className="space-y-2">
                    {p.emergencyContacts.map((c) => (
                        <li key={c.phone}>
                            <span className="font-medium">{c.name}</span> ({c.relation}) · {c.phone}
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}
