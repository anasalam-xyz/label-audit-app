export function SegmentedScoreRing({
  segments,
  size = 176,
  thickness = 16,
}: {
  segments: { passed: boolean }[];
  size?: number;
  thickness?: number;
}) {
  const count = segments.length;
  const segmentDeg = 360 / count;
  const gapDeg = 8;

  const stops: string[] = [];
  segments.forEach((seg, i) => {
    const start = i * segmentDeg + gapDeg / 2;
    const end = (i + 1) * segmentDeg - gapDeg / 2;
    const color = seg.passed ? "var(--color-pass)" : "var(--color-violation)";
    if (i > 0) {
      stops.push(`transparent ${i * segmentDeg}deg ${start}deg`);
    } else {
      stops.push(`transparent 0deg ${start}deg`);
    }
    stops.push(`${color} ${start}deg ${end}deg`);
  });
  stops.push(`transparent ${360 - gapDeg / 2}deg 360deg`);

  const passedCount = segments.filter((s) => s.passed).length;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from -90deg, ${stops.join(", ")})`,
          WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${thickness}px), black calc(100% - ${thickness}px))`,
          mask: `radial-gradient(farthest-side, transparent calc(100% - ${thickness}px), black calc(100% - ${thickness}px))`,
        }}
      />
      <div className="flex flex-col items-center">
        <span className="font-display text-3xl font-semibold text-ink">
          {passedCount}/{count}
        </span>
        <span className="font-body text-xs text-muted">Aspects Passed</span>
      </div>
    </div>
  );
}
