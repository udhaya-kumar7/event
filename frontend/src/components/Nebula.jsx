import React from 'react';

// Nebula: renders a few large, blurred radial blobs that animate slowly.
// Uses an internal <style> tag to avoid touching global CSS.
const Nebula = ({ className = '', tint = '255,70,70', opacity = 0.18 }) => {
  const style = `
  @keyframes neb-move-1 { 0% { transform: translate(-10%, -10%) scale(1); } 50% { transform: translate(6%, -6%) scale(1.05);} 100% { transform: translate(-10%, -10%) scale(1); } }
  @keyframes neb-move-2 { 0% { transform: translate(10%, 6%) scale(1); } 50% { transform: translate(-6%, 8%) scale(1.03);} 100% { transform: translate(10%, 6%) scale(1); } }
  @keyframes neb-fade { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
  .nebula-wrap { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .nebula-blob { position: absolute; filter: blur(48px) contrast(120%); mix-blend-mode: screen; opacity: ${opacity}; }
  .neb1 { width: 700px; height: 700px; left: -10%; top: -8%; background: radial-gradient(circle at 30% 30%, rgba(${tint},0.22), rgba(${tint},0.06) 40%, rgba(${tint},0.0) 65%); animation: neb-move-1 36s ease-in-out infinite, neb-fade 28s ease-in-out infinite; }
  .neb2 { width: 900px; height: 900px; right: -18%; bottom: -10%; background: radial-gradient(circle at 70% 70%, rgba(${tint},0.18), rgba(${tint},0.04) 30%, rgba(${tint},0) 60%); animation: neb-move-2 44s ease-in-out infinite, neb-fade 30s ease-in-out infinite; }
  .neb3 { width: 520px; height: 520px; left: 40%; top: 10%; background: radial-gradient(circle at 50% 50%, rgba(${tint},0.12), rgba(${tint},0.02) 40%, rgba(${tint},0) 70%); animation: neb-move-1 50s ease-in-out infinite; }
  `;

  return (
    <div className={"nebula-wrap " + className} aria-hidden>
      <style>{style}</style>
      <div className="nebula-blob neb1" />
      <div className="nebula-blob neb2" />
      <div className="nebula-blob neb3" />
    </div>
  );
};

export default Nebula;
