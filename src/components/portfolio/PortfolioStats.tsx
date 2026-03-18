export default function PortfolioStats({ stats, role }: { stats: any, role: string }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                    {role === 'TOUR_OPERATOR' ? 'Tours Created' : 'Tours Completed'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                    {role === 'TOUR_OPERATOR' ? stats.toursCreated : stats.toursCompleted}
                </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Completion Rate</p>
                <p className={`text-2xl font-bold ${stats.completionRate >= 90 ? 'text-green-600' : stats.completionRate >= 70 ? 'text-yellow-600' : 'text-gray-900'}`}>
                    {stats.completionRate}%
                </p>
            </div>

            {role === 'TOUR_OPERATOR' ? (
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Collaborating Guides</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.collaborators}</p>
                </div>
            ) : (
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Rating</p>
                    <p className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                        {stats.rating > 0 ? stats.rating : '-'}
                        {stats.rating > 0 && <span className="text-yellow-400 text-lg">★</span>}
                    </p>
                    {stats.reviewCount > 0 && <span className="text-xs text-gray-400">({stats.reviewCount} reviews)</span>}
                </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow-sm text-center flex flex-col justify-center items-center">
                <p className="text-xs text-gray-400 italic">
                    Verified Stats via Lunavia
                </p>
            </div>
        </div>
    );
}
