import data from '../data/mock.json';
import Card from '../components/Card';
import { formatTime } from '../utils';
import type { MockData } from '../types/mock';

const typedData = data as MockData;

export default function Alerts() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Alerts</h1>
            <Card>
                <ul className="divide-y divide-slate-100">
                    {typedData.alerts.map((a) => (
                        <li key={a.id} className="py-3 flex justify-between gap-4">
                            <p className={a.read ? 'text-slate-600' : 'font-medium'}>{a.message}</p>
                            <span className="text-sm text-slate-500 whitespace-nowrap">
                                {formatTime(a.createdAt)}
                            </span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}
