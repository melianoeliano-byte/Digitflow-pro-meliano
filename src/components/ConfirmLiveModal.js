import React from "react";

export default function ConfirmLiveModal({ open, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ background: "#0b1220", padding: 20, borderRadius: 8, width: 520, color: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>
        <h3>Enable Live Trading</h3>
        <p>
          Enabling live trading will attempt to place real trades on your Deriv account using the stored API token.
          This can result in real monetary gains or losses. Do NOT enable unless you understand the risks and have
          tested the system in Demo mode.
        </p>
        <p style={{ color: "#f6e05e" }}>
          You must confirm you understand the risks before Live mode is enabled.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <button onClick={onCancel} style={{ background: "#374151" }}>Cancel</button>
          <button onClick={onConfirm} style={{ background: "#dc2626" }}>I Understand — Enable Live</button>
        </div>
      </div>
    </div>
  );
}
