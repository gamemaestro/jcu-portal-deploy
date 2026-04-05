import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import gsap from "gsap";
import { JcuLogo } from "@/components/JcuLogo";
import { useAuth } from "@/lib/auth";

export default function JoinPage() {
  const { login, register, user } = useAuth();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.onboardingComplete ? "/universe" : "/origin");
    }
  }, [user]);

  // Entrance animation
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(logoRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" })
      .fromTo(headlineRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, "-=0.5")
      .fromTo(subRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.4")
      .fromTo(formRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.3");

    return () => { tl.kill(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await register(email, password, displayName || undefined);
        navigate("/origin");
      } else {
        await login(email, password);
        navigate("/universe");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
      }}
      data-testid="join-page"
    >
      {/* Ambient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 50% 60% at 50% 40%, rgba(200,169,110,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        ref={containerRef}
        style={{ width: "100%", maxWidth: "400px", position: "relative", zIndex: 1 }}
      >
        {/* Top atmosphere */}
        <div className="flex flex-col items-center text-center" style={{ marginBottom: "4rem" }}>
          <div ref={logoRef} style={{ opacity: 0, marginBottom: "2.5rem" }}>
            <JcuLogo size={80} style={{ color: "var(--jcu-accent)", opacity: 0.7 }} />
          </div>
          <div ref={headlineRef} style={{ opacity: 0, marginBottom: "1rem" }}>
            <h1
              className="font-serif font-light"
              style={{ fontSize: "clamp(1.75rem, 5vw, 2.5rem)", letterSpacing: "0.03em", lineHeight: 1.2 }}
            >
              You have been expected.
            </h1>
          </div>
          <div ref={subRef} style={{ opacity: 0 }}>
            <p
              className="font-sans"
              style={{ fontSize: "0.85rem", color: "var(--jcu-muted)", letterSpacing: "0.03em", lineHeight: 1.6 }}
            >
              {mode === "register"
                ? "Create your account to enter the world."
                : "Welcome back. The world continues without you."}
            </p>
          </div>
        </div>

        {/* Form */}
        <div ref={formRef} style={{ opacity: 0 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {mode === "register" && (
              <div>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="input-minimal"
                  data-testid="input-displayname"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-minimal"
                data-testid="input-email"
                autoComplete="email"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="input-minimal"
                data-testid="input-password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
            </div>

            {error && (
              <p
                className="font-sans text-sm"
                style={{ color: "var(--jcu-error)", fontSize: "0.8rem" }}
                data-testid="auth-error"
              >
                {error}
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button
                type="submit"
                disabled={loading}
                className="font-sans"
                style={{
                  background: "#ffffff",
                  color: "#000000",
                  border: "none",
                  padding: "0.875rem",
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  transition: "opacity 180ms, background 180ms",
                  width: "100%",
                }}
                onMouseEnter={e => !loading && ((e.target as HTMLElement).style.background = "rgba(255,255,255,0.88)")}
                onMouseLeave={e => !loading && ((e.target as HTMLElement).style.background = "#ffffff")}
                data-testid="btn-submit"
              >
                {loading
                  ? "..."
                  : mode === "register"
                  ? "Enter the World"
                  : "Enter"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode(m => m === "register" ? "login" : "register");
                  setError("");
                }}
                className="font-sans"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--jcu-muted)",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  padding: "0.75rem",
                  transition: "color var(--transition-interactive)",
                }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = "#ffffff"}
                onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--jcu-muted)"}
                data-testid="btn-toggle-mode"
              >
                {mode === "register"
                  ? "I already have an account"
                  : "Create a new account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
