import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import type { ContentItem } from "@shared/schema";

const categoryDoors = [
  { name: "Comedies", href: "/comedies", description: "Lighter frequencies. The self in play." },
  { name: "Histories", href: "/histories", description: "Origin events. The record as it was kept." },
  { name: "Mysteries", href: "/mysteries", description: "Coded frequencies. Return when ready." },
  { name: "The Archives", href: "/archives", description: "The Map. What the simulation is made of." },
];

export default function WorldPage() {
  const { user, logout } = useAuth();

  const { data: content } = useQuery<ContentItem[]>({
    queryKey: ["/api/content"],
  });

  const featuredContent = content?.filter(c => c.featured).slice(0, 4) ?? [];
  const recentContent = content?.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 5) ?? [];

  const initials = user?.displayName
    ? user.displayName.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "JC";

  const stateBadge = user ? `${user.userState.toUpperCase()} · THE STRANGER` : "";

  return (
    <div
      style={{ background: "#000000", color: "#ffffff", minHeight: "100vh", paddingTop: "56px" }}
      data-testid="universe-page"
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem clamp(1.5rem, 4vw, 3rem) 5rem" }}>

        {/* ─── Section 1: Player Card ───────────────────────────────────── */}
        <section style={{ marginBottom: "4rem" }} data-testid="player-card">
          <div
            style={{
              display: "flex",
              gap: "2rem",
              alignItems: "center",
              padding: "2rem 2.5rem",
              border: "1px solid var(--jcu-border)",
              background: "var(--jcu-surface)",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--jcu-surface-2)",
                border: "1px solid var(--jcu-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                fontFamily: "var(--font-serif)",
                color: "var(--jcu-accent)",
                flexShrink: 0,
              }}
              data-testid="player-avatar"
            >
              {initials}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                <h2
                  className="font-serif font-light"
                  style={{ fontSize: "1.5rem", letterSpacing: "0.02em" }}
                  data-testid="player-name"
                >
                  {user?.displayName || user?.email?.split("@")[0] || "Traveler"}
                </h2>
                <span
                  className="font-sans"
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--jcu-accent)",
                    padding: "0.2rem 0.6rem",
                    border: "1px solid rgba(200,169,110,0.3)",
                  }}
                  data-testid="player-state-badge"
                >
                  {stateBadge}
                </span>
              </div>
              <p
                className="font-sans"
                style={{ fontSize: "0.8rem", color: "var(--jcu-muted)", lineHeight: 1.6 }}
              >
                The portal is open. You are just arriving. There is no map yet — only the world.
              </p>
            </div>

            {/* Logout */}
            <button
              onClick={() => logout()}
              className="font-sans"
              style={{
                background: "transparent",
                border: "1px solid var(--jcu-border)",
                color: "var(--jcu-faint)",
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "0.5rem 0.875rem",
                cursor: "pointer",
                transition: "color var(--transition-interactive), border-color var(--transition-interactive)",
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--jcu-muted)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--jcu-muted)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--jcu-faint)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--jcu-border)";
              }}
              data-testid="btn-logout"
            >
              Exit
            </button>
          </div>
        </section>

        {/* ─── Section 2: Begin Here ──────────────────────────────────────── */}
        <section style={{ marginBottom: "4rem" }} data-testid="begin-here-section">
          <h2
            className="font-serif font-light"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "0.03em", marginBottom: "2rem" }}
          >
            Begin Here
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1px",
            }}
          >
            {featuredContent.length > 0
              ? featuredContent.map(item => (
                  <Link key={item.id} href="/origin">
                    <a
                      className="jcu-card"
                      style={{
                        display: "block",
                        padding: "1.75rem 1.5rem",
                        border: "1px solid rgba(255,255,255,0.07)",
                        background: "var(--jcu-surface)",
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                      data-testid={`content-card-${item.id}`}
                    >
                      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                        <span
                          className="font-sans"
                          style={{
                            fontSize: "0.6rem",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: "var(--jcu-accent)",
                            padding: "0.15rem 0.5rem",
                            border: "1px solid rgba(200,169,110,0.25)",
                          }}
                        >
                          {item.category}
                        </span>
                        <span
                          className="font-sans"
                          style={{
                            fontSize: "0.6rem",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: "var(--jcu-faint)",
                            padding: "0.15rem 0.5rem",
                            border: "1px solid var(--jcu-border)",
                          }}
                        >
                          {item.medium}
                        </span>
                      </div>
                      <h3
                        className="font-serif font-light"
                        style={{ fontSize: "1.1rem", letterSpacing: "0.02em", marginBottom: "0.75rem", color: "#ffffff" }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="font-sans"
                        style={{ fontSize: "0.78rem", color: "var(--jcu-muted)", lineHeight: 1.6 }}
                      >
                        {item.description}
                      </p>
                    </a>
                  </Link>
                ))
              : Array.from({ length: 4 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "1.75rem 1.5rem",
                      border: "1px solid rgba(255,255,255,0.07)",
                      background: "var(--jcu-surface)",
                      height: "160px",
                    }}
                  >
                    <div style={{ width: "60px", height: "8px", background: "var(--jcu-surface-2)", marginBottom: "1rem" }} />
                    <div style={{ width: "140px", height: "16px", background: "var(--jcu-surface-2)", marginBottom: "0.5rem" }} />
                    <div style={{ width: "180px", height: "10px", background: "var(--jcu-surface-2)" }} />
                  </div>
                ))
            }
          </div>
        </section>

        {/* ─── Section 3: Four Doors ─────────────────────────────────────── */}
        <section style={{ marginBottom: "4rem" }} data-testid="four-doors-section">
          <h2
            className="font-serif font-light"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "0.03em", marginBottom: "1.5rem", color: "var(--jcu-muted)" }}
          >
            Four Doors
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1px",
            }}
          >
            {categoryDoors.map(door => (
              <Link key={door.name} href={door.href}>
                <a
                  className="jcu-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "2rem 1.75rem",
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "var(--jcu-surface)",
                    textDecoration: "none",
                    minHeight: "120px",
                  }}
                  data-testid={`door-${door.name.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <h3
                    className="font-serif font-light"
                    style={{ fontSize: "1.25rem", letterSpacing: "0.02em", marginBottom: "0.5rem", color: "#ffffff" }}
                  >
                    {door.name}
                  </h3>
                  <p
                    className="font-sans"
                    style={{ fontSize: "0.75rem", color: "var(--jcu-muted)", lineHeight: 1.6 }}
                  >
                    {door.description}
                  </p>
                </a>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── Section 4: Recent Drops ────────────────────────────────────── */}
        <section data-testid="recent-drops-section">
          <h2
            className="font-serif font-light"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "0.03em", marginBottom: "1.5rem" }}
          >
            Latest from the Archive
          </h2>
          <div
            style={{ border: "1px solid var(--jcu-border)", background: "var(--jcu-surface)" }}
          >
            {recentContent.map((item, i) => (
              <Link key={item.id} href="/origin">
                <a
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: "1rem 1.5rem",
                    borderBottom: i < recentContent.length - 1 ? "1px solid var(--jcu-border)" : "none",
                    textDecoration: "none",
                    transition: "background var(--transition-interactive)",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  data-testid={`recent-item-${item.id}`}
                >
                  <span
                    className="font-sans"
                    style={{
                      fontSize: "0.6rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "var(--jcu-accent)",
                      minWidth: "80px",
                    }}
                  >
                    {item.category}
                  </span>
                  <span
                    className="font-serif font-light"
                    style={{ fontSize: "0.95rem", color: "#ffffff", flex: 1 }}
                  >
                    {item.title}
                  </span>
                  <span
                    className="font-sans"
                    style={{ fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--jcu-faint)", textTransform: "uppercase" }}
                  >
                    {item.medium}
                  </span>
                </a>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
