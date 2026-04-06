import Link from "next/link";
import { SearchBar } from "@/components/layout/SearchBar";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <p className="text-7xl font-bold text-gray-200">404</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 tracking-tight">
            Page not found
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div>
          <p className="text-gray-400 text-xs mb-3">Try searching for a product</p>
          <SearchBar />
        </div>

        <div className="flex justify-center gap-6 text-sm">
          <Link href="/" className="text-[#0d1b4a] hover:text-[#1e3a7a] transition-colors font-medium">Home</Link>
          <Link href="/categories" className="text-[#0d1b4a] hover:text-[#1e3a7a] transition-colors font-medium">Categories</Link>
          <Link href="/submit" className="text-[#0d1b4a] hover:text-[#1e3a7a] transition-colors font-medium">Submit</Link>
        </div>
      </div>
    </div>
  );
}
