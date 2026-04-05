/**
 * /archives — The Archives
 * Combined content library + storefront for lore documents.
 * No separate shop. Items show "Read" or "Acquire" based on unlock status.
 * Inline purchase flow via Stripe Payment Element.
 */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ContentItem } from "@shared/schema";

// Stripe publishable key from env
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

// ─── Main Archives Page ───────────────────────────────────────────────────
export default function ArchivesPage() {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const { data: archives, isLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content", "archives"],
    queryFn: () => fetch("/api/content?category=archives").then(r => r.json()),
  });

  const { data: unlocks } = useQuery<number[]>({
    queryKey: ["/api/unlocks"],
    enabled: !!user,
    queryFn: () =>
      fetch("/api/unlocks", { credentials: "include" }).then(r =>
        r.ok ? r.json() : []
      ),
  });

  const unlockedIds = new Set(unlocks ?? []);

  const handleAcquire = async (item: ContentItem) => {
    if (!user) {
      window.location.hash = "/join";
      return;
    }
    setPurchasing(true);
    setSelectedItem(item);
    try {
      const res = await apiRequest("POST", "/api/stripe/create-payment-intent", {
        contentItemId: item.id,
      });
      const data = await res.json();
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setPurchasing(false);
      setSelectedItem(null);
    }
  };

  const handleClose = () => {
    setSelectedItem(null);
    setClientSecret(null);
    setPurchasing(false);
  };

  return (
    <div
      style={{ background: "#000000", color: "#ffffff", minHeight: "100vh", paddingTop: "56px" }}
      data-testid="archives-page"
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem clamp(1.5rem, 4vw, 3rem) 5rem" }}>

        {/* Header */}
        <header style={{ marginBottom: "3.5rem" }}>
          <p
            className="font-sans"
            style={{ fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jcu-accent)", marginBottom: "1rem" }}
          >
            The Archives
          </p>
          <h1
            className="font-serif font-light"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "0.02em", lineHeight: 1.1, marginBottom: "1.5rem" }}
          >
            Recovered Texts
          </h1>
          <p
            className="font-sans"
            style={{ fontSize: "0.85rem", color: "var(--jcu-muted)", lineHeight: 1.7, maxWidth: "480px" }}
          >
            These are recovered texts. Ancient. Fragmentary by design.
            The framing is discovery, not purchase.
          </p>
        </header>

        {/* Content grid */}
        {isLoading ? (
          <ArchivesSkeleton />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            {(archives ?? []).map((item, i) => {
              const isUnlocked = !item.isForSale || unlockedIds.has(item.id);
              return (
                <ArchiveItem
                  key={item.id}
                  item={item}
                  isUnlocked={isUnlocked}
                  isLast={i === (archives?.length ?? 0) - 1}
                  onAcquire={() => handleAcquire(item)}
                  onRead={() => {/* future: open reader */}}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Purchase modal */}
      {selectedItem && (
        <PurchaseModal
          item={selectedItem}
          clientSecret={clientSecret}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

// ─── Archive Item Row ─────────────────────────────────────────────────────
function ArchiveItem({
  item, isUnlocked, isLast, onAcquire, onRead,
}: {
  item: ContentItem;
  isUnlocked: boolean;
  isLast: boolean;
  onAcquire: () => void;
  onRead: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        padding: "1.75rem 2rem",
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.06)",
        background: hovered ? "rgba(255,255,255,0.015)" : "transparent",
        transition: "background 0.2s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid={`archive-item-${item.id}`}
    >
      {/* Medium indicator */}
      <div
        style={{
          width: "32px", height: "32px", flexShrink: 0,
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "0.6rem", color: "var(--jcu-faint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {item.medium === "pdf" ? "PDF" : item.medium?.slice(0, 3).toUpperCase()}
        </span>
      </div>

      {/* Title + description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          className="font-serif font-light"
          style={{ fontSize: "1.05rem", letterSpacing: "0.02em", marginBottom: "0.3rem", color: "#ffffff" }}
        >
          {item.title}
        </h3>
        {item.description && (
          <p
            className="font-sans"
            style={{
              fontSize: "0.75rem", color: "var(--jcu-muted)", lineHeight: 1.55,
              overflow: "hidden", display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}
          >
            {item.description}
          </p>
        )}
      </div>

      {/* Price + CTA */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "1.25rem" }}>
        {item.isForSale && item.price != null && !isUnlocked && (
          <span
            className="font-sans"
            style={{ fontSize: "0.8rem", color: "var(--jcu-muted)", letterSpacing: "0.05em" }}
          >
            ${item.price.toFixed(2)}
          </span>
        )}

        {isUnlocked ? (
          <button
            onClick={onRead}
            className="font-sans"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#ffffff",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "0.5rem 1.25rem",
              cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.4)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
            }}
            data-testid={`btn-read-${item.id}`}
          >
            Read
          </button>
        ) : (
          <button
            onClick={onAcquire}
            className="font-sans"
            style={{
              background: "#ffffff",
              color: "#000000",
              border: "none",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "0.5rem 1.25rem",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.88)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#ffffff"}
            data-testid={`btn-acquire-${item.id}`}
          >
            Acquire
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Purchase modal ───────────────────────────────────────────────────────
function PurchaseModal({
  item, clientSecret, onClose,
}: {
  item: ContentItem;
  clientSecret: string | null;
  onClose: () => void;
}) {
  const stripeAppearance = {
    theme: "night" as const,
    variables: {
      colorPrimary: "#c8a96e",
      colorBackground: "#0a0a0a",
      colorText: "#ffffff",
      colorTextSecondary: "rgba(255,255,255,0.5)",
      colorDanger: "#e53e3e",
      fontFamily: "Inter, sans-serif",
      borderRadius: "0px",
      spacingUnit: "5px",
    },
    rules: {
      ".Input": { border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "#0f0f0f" },
      ".Input:focus": { border: "1px solid rgba(200,169,110,0.5)", boxShadow: "none" },
      ".Label": { fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" },
    },
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      data-testid="purchase-modal"
    >
      <div
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.1)",
          width: "100%",
          maxWidth: "440px",
          padding: "2.5rem",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <p className="font-sans" style={{ fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--jcu-accent)", marginBottom: "0.75rem" }}>
            Acquire
          </p>
          <h2 className="font-serif font-light" style={{ fontSize: "1.4rem", letterSpacing: "0.02em", marginBottom: "0.5rem" }}>
            {item.title}
          </h2>
          <p className="font-sans" style={{ fontSize: "0.75rem", color: "var(--jcu-muted)" }}>
            ${item.price?.toFixed(2)} · Digital delivery · Permanent access
          </p>
        </div>

        {/* Payment form or loading */}
        {!stripePromise ? (
          <div style={{ padding: "2rem 0", textAlign: "center" }}>
            <p className="font-sans" style={{ fontSize: "0.75rem", color: "var(--jcu-muted)" }}>
              Payment processing is not yet configured.
            </p>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
            <CheckoutForm item={item} onSuccess={onClose} />
          </Elements>
        ) : (
          <div style={{ padding: "2rem 0", display: "flex", justifyContent: "center" }}>
            <div style={{
              width: "20px", height: "20px",
              border: "1px solid rgba(255,255,255,0.2)",
              borderTopColor: "#ffffff",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="font-sans"
          style={{
            background: "transparent", border: "none",
            color: "rgba(255,255,255,0.25)", fontSize: "0.65rem",
            letterSpacing: "0.15em", textTransform: "uppercase",
            cursor: "pointer", marginTop: "1.5rem", padding: "0",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)"}
          data-testid="btn-close-modal"
        >
          Cancel
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Checkout form (inside Stripe Elements) ────────────────────────────────
function CheckoutForm({ item, onSuccess }: { item: ContentItem; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed.");
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // Invalidate unlocks cache so the UI updates
      await queryClient.invalidateQueries({ queryKey: ["/api/unlocks"] });
      toast({ title: "Acquired", description: `${item.title} is now yours.` });
      onSuccess();
    } else {
      setError("Payment did not complete. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <p className="font-sans" style={{ fontSize: "0.75rem", color: "var(--jcu-error)", marginTop: "1rem" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="font-sans"
        style={{
          marginTop: "1.5rem",
          width: "100%",
          background: processing ? "rgba(255,255,255,0.1)" : "#ffffff",
          color: processing ? "rgba(255,255,255,0.3)" : "#000000",
          border: "none",
          padding: "0.875rem",
          fontSize: "0.7rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          cursor: processing ? "not-allowed" : "pointer",
          transition: "background 0.2s, color 0.2s",
        }}
        data-testid="btn-pay"
      >
        {processing ? "Processing..." : `Pay $${item.price?.toFixed(2)}`}
      </button>
    </form>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────
function ArchivesSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          style={{
            display: "flex", alignItems: "center", gap: "1.5rem",
            padding: "1.75rem 2rem",
            borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          <div style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ width: "200px", height: "14px", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ width: "320px", height: "10px", background: "rgba(255,255,255,0.03)" }} />
          </div>
          <div style={{ width: "80px", height: "30px", background: "rgba(255,255,255,0.05)" }} />
        </div>
      ))}
    </div>
  );
}
