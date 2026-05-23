"use client"
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { type MouseEvent, useState } from 'react'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type AnchorClickEvent = MouseEvent<HTMLAnchorElement>;

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated =
    status === 'authenticated' && Boolean(session?.accessToken);

  const handleLogout = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await signOut({ redirect: false });
    router.replace('/login');
    router.refresh();
  };

  const handleClick = (e: AnchorClickEvent) => {
    e.preventDefault();

    if (window.location.pathname === "/") {
      document.getElementById("hero")?.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      router.push("/#hero");
    }
  };

  return (
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
<Link href="/#hero" onClick={handleClick}>
  <Image
    src="/images/workforceflowailogo1.png"
    alt="Revoostai logo"
    width={180}
    height={100}
    className="object-contain"
  />
</Link>           
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-cyan-500 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-cyan-500 transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-cyan-500 transition-colors">Pricing</a>
              {isAuthenticated ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e0f2fe] text-[#0284c7] font-bold ring-2 ring-transparent hover:ring-cyan-200 transition-all"
                  >
                    {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg shadow-slate-200/50 py-2 border border-slate-100 z-50">
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-cyan-600"
                      >
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isSigningOut}
                        className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSigningOut ? 'Logging out...' : 'Logout'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-cyan-500 transition-colors">Sign In</Link>
                  <Link href="/signup" className="bg-gradient-to-r from-cyan-400 to-teal-400 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                    Start Free Trial
                  </Link>
                </>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-4 pt-4 border-t border-slate-100">
                <a href="#features" className="text-sm font-medium text-slate-600 hover:text-cyan-500">Features</a>
                <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-cyan-500">How It Works</a>
                <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-cyan-500">Pricing</a>
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-600 hover:text-cyan-500">Dashboard</Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isSigningOut}
                      className="text-sm font-medium text-red-600 text-left disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSigningOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-cyan-500">Sign In</Link>
                    <Link href="/signup" className="bg-gradient-to-r from-cyan-400 to-teal-400 text-white px-5 py-2.5 rounded-lg text-sm font-medium text-center">
                      Start Free Trial
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
  )
}

export default Navbar
