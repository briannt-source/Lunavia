export default function InternalFooter() {
    return (
        <footer className="border-t border-gray-200 bg-white py-4 px-6 mt-auto">
            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                    <span>Lunavia Operations</span>
                    <span>•</span>
                    <span className="font-mono">v0.9.0</span>
                </div>
                <div>
                    Support: <a href="mailto:support@lunavia.vn" className="text-indigo-600 hover:underline">support@lunavia.vn</a>
                </div>
            </div>
        </footer>
    );
}
