"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F0F1A",
          color: "#E0E0FF",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
          Une erreur est survenue
        </h1>
        <p style={{ color: "#8888AA", marginBottom: "2rem" }}>
          Quelque chose s&apos;est mal passé. Veuillez réessayer.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.75rem 2rem",
            background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
            color: "#fff",
            border: "none",
            borderRadius: "0.75rem",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
