import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // Redireciona para o Assistente IA Jurídico (app principal)
    const target = window.location.origin + "/assistente/";
    window.location.replace(target);
  }, []);

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#0d1520",
      color: "#fff",
      fontFamily: "system-ui, sans-serif",
      gap: 16,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32,
      }}>⚖️</div>
      <p style={{ color: "#ffffff80", fontSize: 14 }}>Abrindo Assistente IA Jurídico…</p>
      <a href="/assistente/" style={{ color: "#a78bfa", fontSize: 12, marginTop: 8 }}>
        Clique aqui se não redirecionar
      </a>
    </div>
  );
}
