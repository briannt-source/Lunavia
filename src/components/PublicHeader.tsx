import Link from 'next/link';

export default function PublicHeader() {
  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-lunavia-primary hover:text-lunavia-primary-hover">
          Lunavia
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-gray-700 md:flex">
          <Link href="/how-it-works" className="hover:text-lunavia-primary">
            About
          </Link>
          <Link href="/how-it-works" className="hover:text-lunavia-primary">
            How it works
          </Link>
          <Link href="/trust-safety" className="hover:text-lunavia-primary">
            Trust &amp; Safety
          </Link>
          <Link href="/marketplace-preview" className="hover:text-lunavia-primary">
            Marketplace Preview
          </Link>
        </nav>
        <Link
          href="/login"
          className="rounded bg-lunavia-primary px-4 py-2 text-white transition hover:bg-lunavia-primary-hover focus:outline-none focus:ring focus:ring-blue-300"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
