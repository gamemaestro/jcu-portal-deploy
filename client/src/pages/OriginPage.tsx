/**
 * /origin — Typeform-style onboarding
 * 4 steps, sacred geometry progress indicator, cinematic transitions
 * On completion: route to /universe with Symbol 1→2 transition
 */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// ─── Sacred geometry SVGs ─────────────────────────────────────────────────
const SYMBOLS = [
  {
    id: 1, name: "Solid", color: "#ffffff",
    svg: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="8" width="24" height="24" />
      </svg>
    ),
  },
  {
    id: 2, name: "Melting", color: "#e53e3e",
    svg: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="20,6 34,32 6,32" />
      </svg>
    ),
  },
  {
    id: 3, name: "Liquid", color: "#dd6b20",
    svg: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="20,4 36,20 28,36 12,36 4,20" />
        <polygon points="20,12 28,24 12,24" />
      </svg>
    ),
  },
  {
    id: 4, name: "Vaporization", color: "#d69e2e",
    svg: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="20,4 36,28 4,28" />
        <polygon points="20,36 36,12 4,12" />
      </svg>
    ),
  },
  {
    id: 5, name: "Gas", color: "#38a169",
    svg: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="20,4 33,12 36,27 26,36 14,36 4,27 7,12" />
      </svg>
    ),
  },
  {
    id: 6, name: "Ionization", color: "#6b46c1",
    svg: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="20,4 34,28 6,28" />
        <polygon points="20,36 6,12 34,12" />
      </svg>
    ),
  },
  {
    id: 7, name: "Plasma", color: "#000000",
    svg: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="20" cy="20" r="15" />
      </svg>
    ),
  },
];

// ─── Steps ────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 4;

interface FormData {
  birthName: string;
  birthdate: string;
  characterName: string;
  currentLocation: string;
}

export default function OriginPage() {
  const { user, refreshUser } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [form, setForm] = useState<FormData>({
    birthName: "",
    birthdate: "",
    characterName: "",
    currentLocation: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false); // final cinematic

  const contentRef = useRef<HTMLDivElement>(null);
  const symbolsRef = useRef<HTMLDivElement>(null);

  // Redirect if already onboarded
  useEffect(() => {
    if (user?.onboardingComplete) navigate("/universe");
    if (!user) navigate("/join");
  }, [user]);

  // Animate step transitions
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const fromX = direction === "forward" ? 40 : -40;
    el.style.opacity = "0";
    el.style.transform = `translateX(${fromX}px)`;
    const raf = requestAnimationFrame(() => {
      el.style.transition = "opacity 0.45s ease, transform 0.45s ease";
      el.style.opacity = "1";
      el.style.transform = "translateX(0)";
    });
    return () => cancelAnimationFrame(raf);
  }, [step]);

  const goNext = () => {
    setDirection("forward");
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    setDirection("back");
    setStep(s => Math.max(s - 1, 1));
  };

  const canAdvance = () => {
    if (step === 1) return form.birthName.trim().length > 0;
    if (step === 2) return form.birthdate.length === 10;
    if (step === 3) return form.characterName.trim().length > 0;
    if (step === 4) return form.currentLocation.trim().length > 0;
    return false;
  };

  const handleComplete = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/onboarding/complete", form);
      await refreshUser();
      // Cinematic transition
      setCompleting(true);
      setTimeout(() => navigate("/universe"), 2400);
    } catch (err: any) {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  // Progress: step 1 = symbol 1 active; completing = symbol 2 lights up
  const activeSymbol = completing ? 2 : 1;

  if (completing) {
    return <CompletionTransition />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000000",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}
      data-testid="origin-page"
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,169,110,0.03) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Sacred geometry progress indicator */}
      <div
        ref={symbolsRef}
        style={{
          position: "fixed",
          top: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "clamp(0.75rem, 2vw, 1.5rem)",
          alignItems: "center",
          zIndex: 10,
        }}
        data-testid="symbol-progress"
      >
        {SYMBOLS.map((sym, i) => {
          const isActive = sym.id === activeSymbol;
          const isPast = sym.id < activeSymbol;
          return (
            <div
              key={sym.id}
              style={{
                width: "28px",
                height: "28px",
                color: isActive ? sym.color : isPast ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                transition: "color 0.6s ease, filter 0.6s ease",
                filter: isActive ? `drop-shadow(0 0 6px ${sym.color})` : "none",
              }}
              data-testid={`symbol-${sym.id}`}
            >
              {sym.svg}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div
        ref={contentRef}
        style={{
          width: "100%",
          maxWidth: "480px",
          position: "relative",
          zIndex: 1,
          paddingTop: "5rem",
        }}
      >
        {/* Step counter */}
        <p
          className="font-sans"
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
            marginBottom: "3rem",
            textAlign: "center",
          }}
        >
          {step} / {TOTAL_STEPS}
        </p>

        {/* Step 1: Birth Name */}
        {step === 1 && (
          <StepWrapper
            prompt="What's your birth name?"
            sub="This is kept private. It will never be shown publicly."
          >
            <input
              type="text"
              autoFocus
              value={form.birthName}
              onChange={e => setForm(f => ({ ...f, birthName: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && canAdvance() && goNext()}
              placeholder="First and last"
              className="input-minimal"
              style={{ fontSize: "1.15rem", letterSpacing: "0.02em" }}
              data-testid="input-birth-name"
              autoComplete="name"
            />
          </StepWrapper>
        )}

        {/* Step 2: Birthdate */}
        {step === 2 && (
          <StepWrapper
            prompt="When were you born?"
            sub="Used to calculate your place in the world."
          >
            <input
              type="date"
              autoFocus
              value={form.birthdate}
              onChange={e => setForm(f => ({ ...f, birthdate: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && canAdvance() && goNext()}
              className="input-minimal"
              style={{
                fontSize: "1.15rem",
                colorScheme: "dark",
                letterSpacing: "0.05em",
              }}
              data-testid="input-birthdate"
            />
          </StepWrapper>
        )}

        {/* Step 3: Character Name */}
        {step === 3 && (
          <StepWrapper
            prompt="What would you like to be called in this world?"
            sub="This is your public name. It will appear on your profile and throughout the portal."
          >
            <input
              type="text"
              autoFocus
              value={form.characterName}
              onChange={e => setForm(f => ({ ...f, characterName: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && canAdvance() && goNext()}
              placeholder="Your name in the world"
              className="input-minimal"
              style={{ fontSize: "1.15rem", letterSpacing: "0.02em" }}
              data-testid="input-character-name"
            />
          </StepWrapper>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <StepWrapper
            prompt="Where are you right now?"
            sub="City and country. Used to mark this moment."
          >
            <input
              type="text"
              autoFocus
              value={form.currentLocation}
              onChange={e => setForm(f => ({ ...f, currentLocation: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && canAdvance() && handleComplete()}
              placeholder="City, Country"
              className="input-minimal"
              style={{ fontSize: "1.15rem", letterSpacing: "0.02em" }}
              data-testid="input-location"
            />
          </StepWrapper>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "3rem", alignItems: "center" }}>
          {step > 1 && (
            <button
              onClick={goBack}
              className="font-sans"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "0.75rem 1.25rem",
                cursor: "pointer",
                transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
              }}
              data-testid="btn-back"
            >
              ← Back
            </button>
          )}

          <button
            onClick={step === TOTAL_STEPS ? handleComplete : goNext}
            disabled={!canAdvance() || submitting}
            className="font-sans"
            style={{
              background: canAdvance() && !submitting ? "#ffffff" : "rgba(255,255,255,0.1)",
              color: canAdvance() && !submitting ? "#000000" : "rgba(255,255,255,0.2)",
              border: "none",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "0.875rem 2rem",
              cursor: canAdvance() && !submitting ? "pointer" : "not-allowed",
              transition: "background 0.3s, color 0.3s",
              flex: 1,
            }}
            data-testid="btn-continue"
          >
            {submitting ? "—" : step === TOTAL_STEPS ? "Enter the World" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step wrapper ─────────────────────────────────────────────────────────
function StepWrapper({ prompt, sub, children }: { prompt: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1
          className="font-serif font-light"
          style={{
            fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
            lineHeight: 1.25,
            letterSpacing: "0.02em",
            marginBottom: sub ? "0.75rem" : 0,
          }}
        >
          {prompt}
        </h1>
        {sub && (
          <p
            className="font-sans"
            style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.03em", lineHeight: 1.6 }}
          >
            {sub}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Completion transition (Symbol 1 → Symbol 2 cinematic) ───────────────
function CompletionTransition() {
  const [phase, setPhase] = useState<"square" | "melting" | "gone">("square");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("melting"), 600);
    const t2 = setTimeout(() => setPhase("gone"), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "#000000",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, flexDirection: "column", gap: "2.5rem",
      }}
    >
      {/* The melting transition */}
      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        {/* Symbol 1 — Square — fading */}
        <div
          style={{
            width: "48px", height: "48px",
            color: "#ffffff",
            opacity: phase === "melting" ? 0 : 1,
            transform: phase === "melting" ? "translateY(8px) scale(0.85)" : "none",
            transition: "opacity 0.9s ease, transform 0.9s ease",
          }}
        >
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="8" y="8" width="24" height="24" />
          </svg>
        </div>

        {/* Arrow */}
        <div style={{
          color: "rgba(255,255,255,0.2)",
          fontSize: "0.8rem",
          opacity: phase === "melting" ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}>→</div>

        {/* Symbol 2 — Triangle — emerging */}
        <div
          style={{
            width: "48px", height: "48px",
            color: "#e53e3e",
            opacity: phase === "melting" ? 1 : 0,
            filter: phase === "melting" ? "drop-shadow(0 0 12px #e53e3e)" : "none",
            transform: phase === "melting" ? "none" : "translateY(-8px) scale(1.1)",
            transition: "opacity 0.9s ease, transform 0.9s ease, filter 0.9s ease",
          }}
        >
          <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="20,6 34,32 6,32" />
          </svg>
        </div>
      </div>

      <p
        className="font-serif font-light"
        style={{
          fontSize: "1rem",
          letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.4)",
          opacity: phase === "melting" ? 1 : 0,
          transition: "opacity 0.9s ease",
        }}
      >
        The melting begins.
      </p>
    </div>
  );
}
