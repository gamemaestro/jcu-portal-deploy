import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { ReactNode } from "react";

export function AuthRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#000000" }}
      >
        <span className="text-xs tracking-widest uppercase" style={{ color: "var(--jcu-faint)" }}>
          Loading...
        </span>
      </div>
    );
  }

  if (!user) {
    navigate("/join");
    return null;
  }

  return <>{children}</>;
}
