
interface TrustEvent {
    id: string;
    delta: number;
    reason: string;
    createdAt: string;
}

export function TrustHistoryList({ events }: { events: TrustEvent[] }) {
    if (!events || events.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500 text-sm">
                No trust history recorded yet.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action / Reason</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                        <tr key={event.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(event.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                                {event.reason}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${event.delta > 0 ? 'text-green-600' : event.delta < 0 ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                {event.delta > 0 ? '+' : ''}{event.delta}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
