import { ImageResponse } from "next/og";
import { getCaseBySlug, getVerdict } from "@/lib/cases";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await getCaseBySlug(slug);
  if (!c) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#fff",
            fontSize: 72,
            fontWeight: 800,
          }}
        >
          Gavel
        </div>
      ),
      size,
    );
  }

  const v = await getVerdict(c.id);
  const petty = c.mode === "petty";
  const bg = petty ? "#0b0b10" : "#f6f5ef";
  const fg = petty ? "#fafafa" : "#1a1a2e";
  const accent = petty ? "#f59e0b" : "#1e3a8a";
  const subtle = petty ? "rgba(255,255,255,0.72)" : "rgba(26,26,46,0.7)";
  const border = petty ? "rgba(255,255,255,0.12)" : "rgba(26,26,46,0.15)";

  const ruling =
    v?.ruling === "plaintiff"
      ? "FOR THE PLAINTIFF"
      : v?.ruling === "defendant"
        ? "FOR THE DEFENDANT"
        : v?.ruling === "split"
          ? "SPLIT DECISION"
          : "IN SESSION";
  const tally = (v?.votes ?? []).reduce(
    (acc, vt) => ({ ...acc, [vt.ruling]: acc[vt.ruling] + 1 }),
    { plaintiff: 0, defendant: 0 },
  );
  const modeLabel = `${c.mode} court`;
  const tallyLabel = `${tally.plaintiff}-${tally.defendant}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 64,
          background: bg,
          color: fg,
          fontFamily: "sans-serif",
        }}
      >
        {/* header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: accent,
                color: petty ? "#0b0b10" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 22,
              }}
            >
              G
            </div>
            <div style={{ display: "flex" }}>Gavel</div>
          </div>
          <div
            style={{
              display: "flex",
              padding: "8px 16px",
              borderRadius: 999,
              border: `1px solid ${border}`,
              color: subtle,
              fontSize: 18,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            {modeLabel}
          </div>
        </div>

        {/* main block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 60,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 4,
              color: subtle,
              fontWeight: 700,
            }}
          >
            THE COURT RULES
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              fontWeight: 900,
              letterSpacing: -1.5,
              color: accent,
              lineHeight: 1,
            }}
          >
            {ruling}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 700,
              marginTop: 20,
              lineHeight: 1.15,
              maxWidth: "90%",
            }}
          >
            {c.title}
          </div>
        </div>

        {/* footer row */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: subtle,
            fontWeight: 600,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "6px 14px",
                borderRadius: 999,
                border: `1px solid ${border}`,
                fontVariantNumeric: "tabular-nums",
                fontWeight: 800,
              }}
            >
              {tallyLabel}
            </div>
            <div style={{ display: "flex" }}>vote tally</div>
          </div>
          <div style={{ display: "flex", color: subtle }}>gavel.app</div>
        </div>
      </div>
    ),
    size,
  );
}
