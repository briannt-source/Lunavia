export default function AccountBlocked() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold text-red-700">Account Blocked</h1>
        <p>Your account has been blocked. Please contact support for assistance.</p>
        <a
          href="/login"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Return to Login
        </a>
      </div>
    </main>
  );
}
