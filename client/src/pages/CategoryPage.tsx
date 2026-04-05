import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { ContentItem } from "@shared/schema";

interface CategoryPageProps {
  category: string;
}

const categoryDescriptions: Record<string, string> = {
  comedies: "Lighter frequencies. The self in play. Stories that laugh at the architecture while building it.",
  histories: "Origin events. The war. The field before and after collapse. The record as it was kept.",
  mysteries: "Coded frequencies. Some of this will not make sense yet. Return when you have traveled further.",
  archives: "The Game Manual. The Cosmology. The Map. What the simulation is made of.",
};

export default function CategoryPage({ category }: CategoryPageProps) {
  const { data: content, isLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content", { category }],
    queryFn: async () => {
      const res = await fetch(`/api/content?category=${category}`, { credentials: "include" });
      return res.json();
    },
  });

  const label = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div
      style={{ background: "#000000", color: "#ffffff", minHeight: "100vh", paddingTop: "56px" }}
      data-testid={`category-page-${category}`}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem clamp(1.5rem, 4vw, 3rem) 5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "3rem", borderBottom: "1px solid var(--jcu-border)", paddingBottom: "2rem" }}>
          <p
            className="font-sans"
            style={{ fontSize: "0.65rem", letterSpacing: "0.25em", color: "var(--jcu-accent)", textTransform: "uppercase", marginBottom: "1rem" }}
          >
            JCU · {label}
          </p>
          <h1
            className="font-serif font-light"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", letterSpacing: "0.02em", marginBottom: "1rem", lineHeight: 1 }}
          >
            {label}
          </h1>
          <p
            className="font-sans"
            style={{ fontSize: "0.85rem", color: "var(--jcu-muted)", maxWidth: "500px", lineHeight: 1.7 }}
          >
            {categoryDescriptions[category] || ""}
          </p>
        </div>

        {/* Content grid */}
        {isLoading ? (
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1px" }}
          >
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                style={{
                  padding: "2rem",
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "var(--jcu-surface)",
                  height: "180px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div style={{ width: "60px", height: "8px", background: "var(--jcu-surface-2)" }} />
                <div style={{ width: "160px", height: "18px", background: "var(--jcu-surface-2)" }} />
                <div style={{ width: "200px", height: "10px", background: "var(--jcu-surface-2)" }} />
              </div>
            ))}
          </div>
        ) : content && content.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1px" }}>
            {content.map(item => (
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
                  data-testid={`content-item-${item.id}`}
                >
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
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
                      Act {item.act}
                    </span>
                  </div>
                  <h3
                    className="font-serif font-light"
                    style={{ fontSize: "1.25rem", letterSpacing: "0.02em", marginBottom: "0.75rem", color: "#ffffff" }}
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
            ))}
          </div>
        ) : (
          <p
            className="font-sans"
            style={{ color: "var(--jcu-faint)", fontSize: "0.8rem", letterSpacing: "0.06em" }}
          >
            Content is being prepared. Return soon.
          </p>
        )}
      </div>
    </div>
  );
}
