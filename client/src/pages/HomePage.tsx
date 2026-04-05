import { useEffect, useRef } from "react";
import { Link } from "wouter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JcuLogo } from "@/components/JcuLogo";

gsap.registerPlugin(ScrollTrigger);

// Helper to batch-register scroll reveal animations
function revealOnScroll(
  targets: Element[],
  options: { stagger?: number; delay?: number } = {}
) {
  if (targets.length === 0) return;
  gsap.fromTo(
    targets,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      stagger: options.stagger ?? 0.15,
      delay: options.delay ?? 0,
      scrollTrigger: {
        trigger: targets[0],
        start: "top 85%",
        once: true,
      },
    }
  );
}

const worldCopy = [
  "This is not a story you watch.",
  "It is a simulation you enter.",
  "The game has been running since before you arrived.",
  "The missing woman's higher self — who has already completed the journey — built this world as a portal.",
  "For her. For others.",
  "For you.",
  "You are not the audience.",
  "You never were.",
];

const categories = [
  {
    name: "Comedies",
    href: "/comedies",
    teaser:
      "Lighter frequencies. The self in play. Stories that laugh at the architecture while building it.",
  },
  {
    name: "Histories",
    href: "/histories",
    teaser:
      "Origin events. The war. The field before and after collapse. The record as it was kept.",
  },
  {
    name: "Mysteries",
    href: "/mysteries",
    teaser:
      "Coded frequencies. Some of this will not make sense yet. Return when you have traveled further.",
  },
  {
    name: "The Archives",
    href: "/archives",
    teaser:
      "The Game Manual. The Cosmology. The Map. What the simulation is made of.",
  },
];

const characters = [
  {
    name: "Dove",
    description:
      "An investigator operating from shadows. Writes to The Family. Identity deliberately ambiguous.",
  },
  {
    name: "The Missing Woman",
    description:
      "The event horizon. Everything orbits her absence. Her higher self is the architect of the simulation.",
  },
  {
    name: "The Internal Council",
    description:
      "Multiple aspects of self in active dialogue. Making the internal external and the metaphysical literal.",
  },
];

const gameBody = [
  "There is a game running alongside the content.",
  "It is optional. It will never interrupt your experience.",
  "You can enter, pause, and exit at any time.",
  "The game simulates the alchemical journey:",
  "Solid → Liquid → Gas → Plasma.",
  "It is not a reward system.",
  "It is not a leaderboard.",
  "It is a mirror.",
  "Begin when you are ready.",
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const worldSectionRef = useRef<HTMLDivElement>(null);
  const worldParagraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const contentSectionRef = useRef<HTMLDivElement>(null);
  const categoryCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const charSectionRef = useRef<HTMLDivElement>(null);
  const charCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gameSectionRef = useRef<HTMLDivElement>(null);
  const gameParagraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Hero fade-in on load
  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      line1Ref.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }
    )
      .fromTo(
        line2Ref.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" },
        "-=0.6"
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.4"
      );

    return () => {
      tl.kill();
    };
  }, []);

  // Scroll reveals
  useEffect(() => {
    // World section paragraphs
    const paragraphs = worldParagraphRefs.current.filter(Boolean) as Element[];
    paragraphs.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
          delay: i * 0.04,
        }
      );
    });

    // Category cards
    const cards = categoryCardRefs.current.filter(Boolean) as Element[];
    if (cards.length) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: cards[0],
            start: "top 85%",
            once: true,
          },
        }
      );
    }

    // Character cards
    const charCards = charCardRefs.current.filter(Boolean) as Element[];
    if (charCards.length) {
      gsap.fromTo(
        charCards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: charCards[0],
            start: "top 85%",
            once: true,
          },
        }
      );
    }

    // Game section paragraphs
    const gameParas = gameParagraphRefs.current.filter(Boolean) as Element[];
    if (gameParas.length) {
      gsap.fromTo(
        gameParas,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: gameParas[0],
            start: "top 85%",
            once: true,
          },
        }
      );
    }

    // Ticker
    if (tickerRef.current) {
      gsap.fromTo(
        tickerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: tickerRef.current,
            start: "top 90%",
            once: true,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  const tickerText = "Spring Collection · April 23 · Letter from Dove · The Portal Opens · jackscinema.com · Phase One · ";

  return (
    <div style={{ background: "#000000", color: "#ffffff" }}>
      {/* ─── Section 1: Hero ─────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="hero-ambient grain-overlay relative flex flex-col items-center justify-center"
        style={{ minHeight: "100vh" }}
        data-testid="hero-section"
      >
        <div className="relative z-10 flex flex-col items-center text-center px-6" style={{ maxWidth: "700px" }}>
          {/* Line 1 */}
          <div ref={line1Ref} style={{ opacity: 0 }}>
            <h1
              className="font-serif font-light"
              style={{
                fontSize: "clamp(2rem, 5vw, 4rem)",
                letterSpacing: "0.03em",
                lineHeight: 1.2,
                marginBottom: "1.5rem",
              }}
            >
              The world is already running.
            </h1>
          </div>

          {/* Line 2 */}
          <div ref={line2Ref} style={{ opacity: 0 }}>
            <p
              className="font-serif font-light italic"
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                color: "var(--jcu-muted)",
                letterSpacing: "0.04em",
                lineHeight: 1.5,
                marginBottom: "3rem",
              }}
            >
              You have always been inside it.
            </p>
          </div>

          {/* CTA */}
          <div ref={ctaRef} style={{ opacity: 0 }}>
            <Link href="/join">
              <a
                className="inline-block px-10 py-3 text-sm tracking-[0.25em] uppercase transition-all"
                style={{
                  border: "1px solid rgba(255,255,255,0.4)",
                  color: "#ffffff",
                  textDecoration: "none",
                  letterSpacing: "0.25em",
                  fontFamily: "var(--font-body)",
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                  (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.background = "transparent";
                  (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.4)";
                }}
                data-testid="hero-cta"
              >
                Enter
              </a>
            </Link>
          </div>
        </div>

        {/* Ambient gradient at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "200px",
            background: "linear-gradient(to bottom, transparent, #000000)",
            zIndex: 2,
          }}
        />
      </section>

      {/* ─── Section 2: What is this world ──────────────────────────────── */}
      <section
        ref={worldSectionRef}
        className="flex flex-col items-center"
        style={{
          padding: "clamp(6rem, 12vh, 10rem) 2rem",
          maxWidth: "680px",
          margin: "0 auto",
        }}
        data-testid="world-section"
      >
        {worldCopy.map((line, i) => (
          <p
            key={i}
            ref={el => { worldParagraphRefs.current[i] = el; }}
            className="font-serif text-center"
            style={{
              fontSize: "clamp(1.25rem, 3.5vw, 2.25rem)",
              fontWeight: 300,
              letterSpacing: "0.04em",
              lineHeight: 1.6,
              marginBottom: line === "" ? "2rem" : "1.25rem",
              color: i === 7 ? "#ffffff" : i >= 5 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.75)",
              opacity: 0,
            }}
          >
            {line}
          </p>
        ))}
      </section>

      {/* ─── Section 3: Content Previews ────────────────────────────────── */}
      <section
        ref={contentSectionRef}
        style={{
          padding: "clamp(4rem, 8vh, 8rem) clamp(1.5rem, 5vw, 5rem)",
          borderTop: "1px solid var(--jcu-border)",
        }}
        data-testid="content-section"
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Section header */}
          <div style={{ marginBottom: "3rem" }}>
            <h2
              className="font-serif font-light"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "0.02em", lineHeight: 1, marginBottom: "0.75rem" }}
            >
              The World
            </h2>
            <p
              className="font-sans"
              style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: "var(--jcu-muted)", textTransform: "uppercase" }}
            >
              Comedies · Histories · Mysteries · The Archives
            </p>
          </div>

          {/* 4 category cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.5px",
            }}
          >
            {categories.map((cat, i) => (
              <Link key={cat.name} href="/join">
                <a
                  ref={el => { categoryCardRefs.current[i] = el as HTMLDivElement; }}
                  className="jcu-card"
                  style={{
                    display: "block",
                    padding: "2.5rem 2rem",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "var(--jcu-surface)",
                    textDecoration: "none",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                  data-testid={`category-card-${cat.name.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <h3
                    className="font-serif font-light"
                    style={{
                      fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                      letterSpacing: "0.03em",
                      marginBottom: "1.25rem",
                      color: "#ffffff",
                    }}
                  >
                    {cat.name}
                  </h3>
                  <p
                    className="font-sans"
                    style={{
                      fontSize: "0.8rem",
                      lineHeight: 1.7,
                      color: "var(--jcu-muted)",
                      marginBottom: "2rem",
                    }}
                  >
                    {cat.teaser}
                  </p>
                  <span
                    className="font-sans"
                    style={{
                      fontSize: "0.7rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--jcu-accent)",
                    }}
                  >
                    Preview →
                  </span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 4: Characters ────────────────────────────────────────── */}
      <section
        ref={charSectionRef}
        style={{
          padding: "clamp(4rem, 8vh, 8rem) clamp(1.5rem, 5vw, 5rem)",
          borderTop: "1px solid var(--jcu-border)",
        }}
        data-testid="characters-section"
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            className="font-serif font-light"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              letterSpacing: "0.03em",
              marginBottom: "3rem",
            }}
          >
            Who Moves Through This World
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1px",
            }}
          >
            {characters.map((char, i) => (
              <div
                key={char.name}
                ref={el => { charCardRefs.current[i] = el; }}
                className="jcu-card"
                style={{
                  padding: "2rem 1.75rem",
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "var(--jcu-surface)",
                  opacity: 0,
                }}
                data-testid={`character-card-${i}`}
              >
                {/* Placeholder circle for future image */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    border: "1px solid var(--jcu-border)",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <JcuLogo size={20} style={{ opacity: 0.3 }} />
                </div>
                <h3
                  className="font-serif"
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 300,
                    letterSpacing: "0.03em",
                    marginBottom: "0.75rem",
                    color: "#ffffff",
                  }}
                >
                  {char.name}
                </h3>
                <p
                  className="font-sans"
                  style={{
                    fontSize: "0.8rem",
                    lineHeight: 1.7,
                    color: "var(--jcu-muted)",
                  }}
                >
                  {char.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 5: The Game ──────────────────────────────────────────── */}
      <section
        ref={gameSectionRef}
        style={{
          padding: "clamp(5rem, 10vh, 9rem) clamp(1.5rem, 5vw, 5rem)",
          borderTop: "1px solid var(--jcu-border)",
          textAlign: "center",
        }}
        data-testid="game-section"
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2
            className="font-serif font-light"
            style={{
              fontSize: "clamp(2rem, 5vw, 4rem)",
              letterSpacing: "0.04em",
              marginBottom: "3rem",
            }}
          >
            The Game
          </h2>
          <div>
            {gameBody.map((line, i) => (
              <p
                key={i}
                ref={el => { gameParagraphRefs.current[i] = el; }}
                className="font-serif font-light"
                style={{
                  fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
                  letterSpacing: "0.04em",
                  lineHeight: 1.7,
                  marginBottom: line.includes("→") ? "1.5rem" : "0.75rem",
                  color: line.includes("→") ? "var(--jcu-accent)" : "rgba(255,255,255,0.7)",
                  opacity: 0,
                }}
              >
                {line}
              </p>
            ))}
          </div>
          <div style={{ marginTop: "3rem" }}>
            <Link href="/join">
              <a
                className="inline-block px-10 py-3 text-xs tracking-[0.25em] uppercase transition-all font-sans"
                style={{
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#ffffff",
                  textDecoration: "none",
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                  (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.6)";
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.background = "transparent";
                  (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)";
                }}
                data-testid="game-cta"
              >
                Enter the Game
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Section 6: Updates Ticker ───────────────────────────────────── */}
      <section
        ref={tickerRef}
        style={{
          borderTop: "1px solid var(--jcu-border)",
          borderBottom: "1px solid var(--jcu-border)",
          padding: "1rem 0",
          overflow: "hidden",
          opacity: 0,
        }}
        data-testid="ticker-section"
      >
        <div
          style={{
            display: "flex",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <div className="ticker-track">
            <span
              className="font-sans"
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                color: "var(--jcu-muted)",
                textTransform: "uppercase",
                paddingRight: "0",
              }}
            >
              {tickerText}{tickerText}
            </span>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: "#000000",
          borderTop: "1px solid var(--jcu-border)",
          padding: "4rem clamp(1.5rem, 5vw, 5rem) 2rem",
        }}
        data-testid="footer"
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          {/* Left: Logo */}
          <div className="flex flex-col gap-3">
            <JcuLogo size={36} style={{ color: "var(--jcu-accent)", opacity: 0.8 }} />
            <p
              className="font-sans"
              style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jcu-muted)" }}
            >
              Jacks Cinema Universe
            </p>
          </div>

          {/* Center: Links */}
          <div className="flex flex-col gap-3">
            {[
              { label: "About", href: "/about" },
              { label: "Browse", href: "/browse" },
              { label: "The Game", href: "/game" },
              { label: "Archives", href: "/archives" },
            ].map(({ label, href }) => (
              <Link key={label} href={href}>
                <a
                  className="font-sans"
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--jcu-faint)",
                    textDecoration: "none",
                    display: "block",
                    transition: "color var(--transition-interactive)",
                  }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--jcu-muted)"}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--jcu-faint)"}
                >
                  {label}
                </a>
              </Link>
            ))}
          </div>

          {/* Right: Social */}
          <div className="flex flex-col gap-3">
            <a
              href="https://instagram.com/jordenlacyjackson"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans"
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                color: "var(--jcu-faint)",
                textDecoration: "none",
                transition: "color var(--transition-interactive)",
              }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--jcu-muted)"}
              onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--jcu-faint)"}
            >
              @jordenlacyjackson
            </a>
            <a
              href="https://jackscinema.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans"
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                color: "var(--jcu-faint)",
                textDecoration: "none",
                transition: "color var(--transition-interactive)",
              }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--jcu-muted)"}
              onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--jcu-faint)"}
            >
              jackscinema.com
            </a>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--jcu-border)",
            paddingTop: "1.5rem",
            textAlign: "center",
          }}
        >
          <p
            className="font-sans"
            style={{ fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--jcu-faint)" }}
          >
            © 2026 Jacks Cinema Universe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
