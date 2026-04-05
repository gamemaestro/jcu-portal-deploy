import { Link } from "wouter";
import { JcuLogo } from "@/components/JcuLogo";

export default function NotFound() {
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
      }}
      data-testid="not-found-page"
    >
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <JcuLogo size={32} style={{ color: "var(--jcu-faint)", margin: "0 auto 2.5rem" }} />
        <p
          className="font-sans"
          style={{ fontSize: "0.65rem", letterSpacing: "0.25em", color: "var(--jcu-faint)", textTransform: "uppercase", marginBottom: "1.5rem" }}
        >
          404
        </p>
        <h1
          className="font-serif font-light"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.03em", lineHeight: 1.2, marginBottom: "1.5rem" }}
        >
          This frequency does not exist.
        </h1>
        <p
          className="font-sans"
          style={{ fontSize: "0.8rem", color: "var(--jcu-muted)", lineHeight: 1.7, marginBottom: "3rem" }}
        >
          The page you are looking for is not in the record. Perhaps it has not been built yet, or perhaps you have traveled too far.
        </p>
        <Link href="/">
          <a
            className="font-sans"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--jcu-muted)",
              textDecoration: "none",
              borderBottom: "1px solid var(--jcu-border)",
              paddingBottom: "2px",
              transition: "color var(--transition-interactive)",
            }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = "#ffffff"}
            onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--jcu-muted)"}
          >
            Return to the beginning →
          </a>
        </Link>
      </div>
    </div>
  );
}
