import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { ContentItem } from "@shared/schema";

export default function BrowsePage() {
  const { data: content, isLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content"],
  });

  return (
    <div
      style={{ background: "#000000", color: "#ffffff", minHeight: "100vh", paddingTop: "56px" }}
      data-testid="browse-page"
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem clamp(1.5rem, 4vw, 3rem) 5rem" }}>
        <div style={{ marginBottom: "3rem", borderBottom: "1px solid var(--jcu-border)", paddingBottom: "2rem" }}>
          <p
            className="font-sans"
            style={{ fontSize: "0.65rem", letterSpacing: "0.25em", color: "var(--jcu-accent)", textTransform: "uppercase", marginBottom: "1rem" }}
          >
            JCU · Browse
          </p>
          <h1
            className="font-serif font-light"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", letterSpacing: "0.02em", lineHeight: 1 }}
          >
            Browse
          </h1>
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1px" }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} style={{ padding: "2rem", border: "1px solid rgba(255,255,255,0.07)", background: "var(--jcu-surface)", height: "180px" }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1px" }}>
            {content?.map(item => (
              <Link key={item.id} href="/join">
                <a
                  className="jcu-card"
                  style={{
                    display: "block",
                    padding: "2rem",
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "var(--jcu-surface)",
                    textDecoration: "none",
                  }}
                  data-testid={`browse-item-${item.id}`}
                >
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    <span className="font-sans" style={{ fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jcu-accent)", padding: "0.15rem 0.5rem", border: "1px solid rgba(200,169,110,0.25)" }}>
                      {item.category}
                    </span>
                    <span className="font-sans" style={{ fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--jcu-faint)", padding: "0.15rem 0.5rem", border: "1px solid var(--jcu-border)" }}>
                      {item.medium}
                    </span>
                  </div>
                  <h3 className="font-serif font-light" style={{ fontSize: "1.1rem", letterSpacing: "0.02em", marginBottom: "0.75rem", color: "#ffffff" }}>
                    {item.title}
                  </h3>
                  <p className="font-sans" style={{ fontSize: "0.78rem", color: "var(--jcu-muted)", lineHeight: 1.6 }}>
                    {item.description}
                  </p>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
