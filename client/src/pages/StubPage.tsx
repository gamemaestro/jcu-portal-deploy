import { JcuLogo } from "@/components/JcuLogo";

interface StubPageProps {
  title: string;
  note?: string;
}

export function StubPage({ title, note }: StubPageProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "56px",
        padding: "56px 2rem 4rem",
      }}
      data-testid={`stub-page-${title.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <JcuLogo
          size={32}
          style={{ color: "var(--jcu-faint)", margin: "0 auto 2.5rem" }}
        />
        <h1
          className="font-serif font-light"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "0.03em",
            lineHeight: 1.2,
            marginBottom: "1.5rem",
          }}
        >
          {title}
        </h1>
        <p
          className="font-sans"
          style={{
            fontSize: "0.8rem",
            letterSpacing: "0.06em",
            color: "var(--jcu-muted)",
            lineHeight: 1.7,
          }}
        >
          {note || "This space is being constructed. Return soon."}
        </p>
      </div>
    </div>
  );
}

export default StubPage;
