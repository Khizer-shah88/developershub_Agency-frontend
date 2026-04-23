'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">DH</div>
          <span className="text-3xl font-semibold tracking-tighter">DevelopersHub</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-violet-400 transition">Home</Link>
          <Link href="/services" className="hover:text-violet-400 transition">Services</Link>
          <Link href="/portfolio" className="hover:text-violet-400 transition">Portfolio</Link>
          <Link href="/blog" className="hover:text-violet-400 transition">Blog</Link>
          <Link href="/about" className="hover:text-violet-400 transition">About</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-zinc-800 transition">
            Login
          </Link>
          <Link href="/booking" className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 transition">
            Book a Meeting
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-zinc-950 border-t border-zinc-800 py-6">
          <div className="flex flex-col items-center gap-6 text-lg">
            <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/services" onClick={() => setIsOpen(false)}>Services</Link>
            <Link href="/portfolio" onClick={() => setIsOpen(false)}>Portfolio</Link>
            <Link href="/blog" onClick={() => setIsOpen(false)}>Blog</Link>
            <Link href="/booking" onClick={() => setIsOpen(false)} className="w-4/5 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 transition">
              Book a Meeting
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}