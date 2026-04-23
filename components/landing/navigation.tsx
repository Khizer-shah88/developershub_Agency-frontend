"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, UserCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { getRoleRedirectPath, resolveRole } from "@/lib/auth";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Blog", href: "/blog" },
  { name: "Inquiries", href: "/inquiries" },
  { name: "Appointments", href: "/appointments" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClientUser, setIsClientUser] = useState(false);
  const [clientName, setClientName] = useState("Client");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (!token) {
      setIsAuthenticated(false);
      setIsClientUser(false);
      setClientName("Client");
      return;
    }

    setIsAuthenticated(true);

    let parsedUser: { role?: string; name?: string } | null = null;
    let role: string | undefined;
    try {
      parsedUser = rawUser ? JSON.parse(rawUser) : null;
      role = parsedUser?.role;
    } catch {
      role = undefined;
    }

    const resolvedRole = resolveRole(role, token);
    setIsClientUser(resolvedRole === "CLIENT");
    setClientName(parsedUser?.name || "Client");
  }, []);

  useEffect(() => {
    const closeProfileMenu = () => setIsProfileOpen(false);
    window.addEventListener("click", closeProfileMenu);
    return () => window.removeEventListener("click", closeProfileMenu);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled 
          ? "top-4 left-4 right-4" 
          : "top-0 left-0 right-0"
      }`}
    >
      <nav 
        className={`mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div 
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <span className={`font-display tracking-tight transition-all duration-500 ${isScrolled ? "text-xl" : "text-2xl"}`}>Developer Hub</span>
            <span className={`text-muted-foreground font-mono transition-all duration-500 ${isScrolled ? "text-[10px] mt-0.5" : "text-xs mt-1"}`}>TM</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-300 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle className={isScrolled ? "size-8" : "size-9"} />
            {isAuthenticated && isClientUser ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-4 py-2 text-sm text-foreground/85 hover:bg-foreground/5"
                >
                  <UserCircle2 className="size-4" />
                  Profile
                  <ChevronDown className="size-4" />
                </button>

                {isProfileOpen ? (
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-foreground/15 bg-background p-2 shadow-xl">
                    <div className="px-3 py-2">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Client</p>
                      <p className="truncate text-sm font-medium">{clientName}</p>
                    </div>
                    <a
                      href="/dashboard"
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-foreground/85 transition hover:bg-foreground/5"
                    >
                      Client Dashboard
                    </a>
                    <button
                      type="button"
                      onClick={logout}
                      className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm text-foreground/85 transition hover:bg-foreground/5"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <a href="/login" className={`text-foreground/70 hover:text-foreground transition-all duration-500 ${isScrolled ? "text-xs" : "text-sm"}`}>
                Login
              </a>
            )}
            <Button
              size="sm"
              className={`bg-foreground hover:bg-foreground/90 text-background rounded-full transition-all duration-500 ${isScrolled ? "px-4 h-8 text-xs" : "px-6"}`}
              onClick={() => {
                window.location.href = "/booking";
              }}
            >
              Start your project
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-foreground/90 transition hover:bg-foreground/5"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

      </nav>
      
      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-background z-40 transition-all duration-500 ${
          isMobileMenuOpen 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        }`}
        style={{ top: 0 }}
      >
        <div className="flex h-full flex-col px-6 pb-8 pt-6 sm:px-8">
          <div className="mb-6 flex items-center justify-between">
            <a
              href="/"
              className="font-display text-xl tracking-tight"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Developer Hub
            </a>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg border border-foreground/15 p-2 text-foreground/90 transition hover:bg-foreground/5"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-1 flex-col justify-center gap-6">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-3xl font-display leading-none text-foreground transition-all duration-500 hover:text-muted-foreground sm:text-4xl ${
                  isMobileMenuOpen 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms" }}
              >
                {link.name}
              </a>
            ))}
          </div>
          
          {/* Bottom CTAs */}
          <div className={`flex flex-wrap gap-3 border-t border-foreground/10 pt-6 transition-all duration-500 ${
            isMobileMenuOpen 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
          >
            <Button 
              variant="outline" 
              className="h-12 min-w-[150px] flex-1 rounded-full text-sm"
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (isAuthenticated && isClientUser) {
                  window.location.href = "/dashboard";
                  return;
                }
                window.location.href = "/login";
              }}
            >
              {isAuthenticated && isClientUser ? "Client Dashboard" : "Login"}
            </Button>
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="h-12 min-w-[150px] flex-1 rounded-full text-sm"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
              >
                Logout
              </Button>
            ) : null}
            <Button 
              className="h-12 min-w-[170px] flex-1 rounded-full bg-foreground text-sm text-background"
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.location.href = "/booking";
              }}
            >
              Start your project
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
