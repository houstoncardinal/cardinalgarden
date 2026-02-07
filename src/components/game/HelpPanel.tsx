export function HelpPanel() {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-lg border border-border">
      <h2 className="font-display text-lg font-bold text-foreground mb-3">🌿 How to Play</h2>
      <ul className="space-y-2 text-sm font-body text-muted-foreground">
        <li>✋ <strong className="text-foreground">Pick</strong> — Tap a blooming rose to collect it</li>
        <li>💧 <strong className="text-foreground">Water</strong> — Water roses to help them grow</li>
        <li>🌱 <strong className="text-foreground">Plant</strong> — Plant seeds in empty plots</li>
        <li>✂️ <strong className="text-foreground">Trim</strong> — Trim blooms (keeps the bush!)</li>
        <li>✨ Watered roses grow to the next stage every few seconds</li>
      </ul>
    </div>
  );
}
