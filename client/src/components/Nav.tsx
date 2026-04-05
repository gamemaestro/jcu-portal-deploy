import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, X, Menu } from "lucide-react";
import { JcuLogo } from "./JcuLogo";
import { useAuth } from "@/lib/auth";

const navLinks = [
  { label: "Browse", href: "/browse" },
  { label: "Comedies", href: "/comedies" },
  { label: "Histories", href: "/histories" },
  { label: "Mysteries", href: "/mysteries" },
  { label: "Archives", href: "/archives" },
];

export function Nav() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.displayName
    ? user.displayName.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "JC";

  return (
    <>
      <nav
        className="nav-blur fixed top-0 left-0 right-0 z-50 border-b"
        style={{ borderColor: "var(--jcu-border)" }}
        data-testid="nav"
      >
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" data-testid="nav-logo">
            <a className="flex items-center gap-2.5 text-white hover:text-white/80 transition-colors" style={{ textDecoration: "none" }}>
              <JcuLogo size={22} />
              <span className="text-xs tracking-[0.2em] uppercase font-sans font-light hidden sm:block" style={{ color: "var(--jcu-muted)" }}>
                JCU
              </span>
            </a>
          </Link>

          {/* Center links (desktop) */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(({ label, href }) => (
              <Link key={href} href={href}>
                <a
                  className="text-xs tracking-[0.12em] uppercase transition-colors"
                  style={{
                    color: location === href ? "#ffffff" : "var(--jcu-muted)",
                    textDecoration: "none",
                    fontFamily: "var(--font-body)",
                  }}
                  data-testid={`nav-link-${label.toLowerCase()}`}
                >
                  {label}
                </a>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link href="/search">
              <a className="text-white/40 hover:text-white transition-colors" data-testid="nav-search">
                <Search size={16} />
              </a>
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/universe">
                  <a
                    className="flex items-center gap-2 text-xs tracking-widest uppercase"
                    style={{ color: "var(--jcu-muted)", textDecoration: "none" }}
                    data-testid="nav-profile-link"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                      style={{ background: "var(--jcu-surface-2)", border: "1px solid var(--jcu-border)", color: "var(--jcu-accent)" }}
                      data-testid="nav-avatar"
                    >
                      {initials}
                    </div>
                  </a>
                </Link>
              </div>
            ) : (
              <Link href="/origin">
                <a
                  className="hidden sm:inline-flex px-4 py-1.5 text-xs tracking-[0.15em] uppercase border transition-colors hover:bg-white hover:text-black"
                  style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff", textDecoration: "none" }}
                  data-testid="nav-enter-btn"
                >
                  Enter
                </a>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white/60 hover:text-white transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              data-testid="nav-mobile-toggle"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col pt-14"
          style={{ background: "rgba(0,0,0,0.96)" }}
          data-testid="nav-mobile-drawer"
        >
          <div className="flex flex-col gap-0 px-6 py-8">
            {navLinks.map(({ label, href }) => (
              <Link key={href} href={href}>
                <a
                  className="py-4 text-sm tracking-[0.15em] uppercase border-b"
                  style={{
                    color: "var(--jcu-muted)",
                    borderColor: "var(--jcu-border)",
                    textDecoration: "none",
                    display: "block",
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </a>
              </Link>
            ))}
            {!user && (
              <Link href="/origin">
                <a
                  className="mt-8 py-4 text-center text-sm tracking-[0.15em] uppercase border"
                  style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff", textDecoration: "none" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Enter the World
                </a>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
