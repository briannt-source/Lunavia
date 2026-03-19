import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function PortfolioTours({ tours }: { tours: any[] }) {
    if (!tours || tours.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Portfolio Tours</h3>
                <p className="text-gray-500">No completed tours on Lunavia yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Portfolio Tours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map((tour) => (
                    <div key={tour.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-gray-50 p-4 border-b border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tour.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {tour.status}
                                </span>
                                <span className="text-xs text-gray-400">{tour.category}</span>
                            </div>
                            <h3 className="text-md font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">{tour.title}</h3>
                        </div>
                        <div className="p-4 text-sm text-gray-500 space-y-2">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                <span>{new Date(tour.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="h-4 w-4 text-gray-400" />
                                <span>{tour.province || 'Vietnam'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
