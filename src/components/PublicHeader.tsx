import Link from 'next/link';

export default function PublicHeader() {
  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-blue-600 hover:text-blue-700">
          Lunavia
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-gray-700 md:flex">
          <Link href="/how-it-works" className="hover:text-blue-600">
            About
          </Link>
          <Link href="/how-it-works" className="hover:text-blue-600">
            How it works
          </Link>
          <Link href="/trust-safety" className="hover:text-blue-600">
            Trust &amp; Safety
          </Link>
          <Link href="/marketplace-preview" className="hover:text-blue-600">
            Marketplace Preview
          </Link>
        </nav>
        <Link
          href="/login"
          className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
