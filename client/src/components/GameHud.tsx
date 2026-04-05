import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

export function GameHud() {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!user || !user.gameActive) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      data-testid="game-hud"
    >
      {/* Drawer */}
      <div
        className={`hud-drawer ${drawerOpen ? "open" : "closed"} mb-2`}
        style={{
          background: "var(--jcu-surface-2)",
          border: "1px solid var(--jcu-border)",
          borderRadius: "4px",
          padding: "1rem 1.25rem",
          width: "220px",
          boxShadow: "0 0 30px rgba(200,169,110,0.08)",
        }}
      >
        <div className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--jcu-accent)" }}>
          Game Status
        </div>
        <div className="text-xs mb-1" style={{ color: "var(--jcu-muted)" }}>
          Current State
        </div>
        <div className="text-sm font-light mb-4" style={{ color: "var(--jcu-text)" }}>
          {user.userState.charAt(0).toUpperCase() + user.userState.slice(1)} · The Stranger
        </div>
        <Link href="/game">
          <a
            className="text-xs tracking-widest uppercase"
            style={{ color: "var(--jcu-accent)", textDecoration: "none" }}
          >
            View Game →
          </a>
        </Link>
      </div>

      {/* HUD trigger */}
      <button
        className="flex items-center gap-2.5 px-3 py-2 rounded-sm"
        style={{
          background: "var(--jcu-surface-2)",
          border: "1px solid var(--jcu-border)",
        }}
        onClick={() => setDrawerOpen(v => !v)}
        data-testid="hud-trigger"
      >
        <span
          className="hud-dot w-2 h-2 rounded-full"
          style={{ background: "var(--jcu-accent)" }}
        />
        <span className="text-xs tracking-widest uppercase" style={{ color: "var(--jcu-muted)" }}>
          Game · Active Challenge
        </span>
      </button>
    </div>
  );
}
