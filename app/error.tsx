"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          marginBottom: "1rem",
          color: "#E0E0FF",
        }}
      >
        Une erreur est survenue
      </h2>
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
    </div>
  );
}
