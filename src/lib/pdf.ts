import { jsPDF } from "jspdf";
import type { Audit } from "@/lib/types";
import type { DimensionResult, RagStatus } from "@/lib/audit/auditTypes";

/**
 * Professional, client-side PDF export for an audit. Produces a multi-page,
 * client-ready document: branded cover, scores, tables, the strategic
 * narrative and a consistent footer. Pure jsPDF (no plugins) so it stays
 * compatible and dependency-light.
 */

type RGB = [number, number, number];

const INDIGO: RGB = [99, 102, 241];
const INDIGO_DARK: RGB = [79, 70, 229];
const INK: RGB = [17, 24, 39];
const BODY: RGB = [55, 65, 81];
const MUTED: RGB = [107, 114, 128];
const LINE: RGB = [229, 231, 235];
const ZEBRA: RGB = [248, 249, 251];
const GREEN: RGB = [22, 163, 74];
const AMBER: RGB = [202, 138, 4];
const RED: RGB = [220, 38, 38];

const STATUS_LABEL: Record<RagStatus, string> = {
  green: "On track",
  yellow: "Needs work",
  red: "At risk",
};

function statusColor(label: string): RGB {
  if (label === "On track") return GREEN;
  if (label === "Needs work") return AMBER;
  if (label === "At risk") return RED;
  return BODY;
}

function priorityColor(label: string): RGB {
  const p = label.toLowerCase();
  if (p.startsWith("critical")) return RED;
  if (p.startsWith("high")) return AMBER;
  return MUTED;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

interface Column {
  header: string;
  width: number;
  align?: "left" | "right";
  color?: (value: string) => RGB;
}

export function exportAuditToPdf(audit: Audit) {
  const report = audit.report;
  if (!report) throw new Error("Audit has no report to export.");
  const narrative = audit.narrative;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  const footerReserve = 54;
  let y = margin;

  const generatedAt = narrative?.generatedAt ?? report.generatedAt;

  // ----- low-level helpers -------------------------------------------------
  const setColor = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const setFill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const setDraw = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - footerReserve) {
      doc.addPage();
      y = margin;
    }
  };

  const sectionHeading = (text: string) => {
    ensureSpace(34);
    y += 6;
    setFill(INDIGO);
    doc.rect(margin, y - 10, 4, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    setColor(INK);
    doc.text(text, margin + 12, y + 3);
    y += 20;
  };

  const subHeading = (text: string) => {
    ensureSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setColor(INDIGO_DARK);
    doc.text(text, margin, y);
    y += 15;
  };

  const paragraph = (text: string, size = 10, color: RGB = BODY) => {
    if (!text) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    setColor(color);
    const lineH = size + 4;
    const lines = doc.splitTextToSize(text, contentW) as string[];
    lines.forEach((line) => {
      ensureSpace(lineH);
      doc.text(line, margin, y);
      y += lineH;
    });
  };

  const bullets = (items: string[], size = 10) => {
    doc.setFontSize(size);
    const lineH = size + 4;
    items.forEach((item) => {
      const lines = doc.splitTextToSize(item, contentW - 14) as string[];
      ensureSpace(lineH * lines.length);
      setFill(INDIGO);
      doc.circle(margin + 3, y - 3, 1.6, "F");
      doc.setFont("helvetica", "normal");
      setColor(BODY);
      lines.forEach((line, i) => {
        doc.text(line, margin + 14, y);
        if (i < lines.length - 1) y += lineH;
      });
      y += lineH;
    });
  };

  // ----- table renderer (page-break aware, multiline cells) ----------------
  const table = (columns: Column[], rows: string[][]) => {
    const padX = 6;
    const padY = 5;
    const lh = 12;
    const tableRight = margin + columns.reduce((s, c) => s + c.width, 0);
    const xs: number[] = [];
    let cx = margin;
    for (const c of columns) {
      xs.push(cx);
      cx += c.width;
    }

    const drawHeader = () => {
      const h = lh + padY * 2;
      ensureSpace(h);
      setFill(INDIGO);
      doc.rect(margin, y, tableRight - margin, h, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      columns.forEach((c, i) => {
        const right = c.align === "right";
        const tx = right ? xs[i] + c.width - padX : xs[i] + padX;
        doc.text(c.header, tx, y + padY + lh - 3, {
          align: right ? "right" : "left",
        });
      });
      y += h;
    };

    drawHeader();

    rows.forEach((row, ri) => {
      doc.setFontSize(9);
      const cellLines = row.map((cell, ci) =>
        doc.splitTextToSize(cell ?? "", columns[ci].width - padX * 2) as string[],
      );
      const maxLines = Math.max(1, ...cellLines.map((l) => l.length));
      const h = maxLines * lh + padY * 2;

      if (y + h > pageH - footerReserve) {
        doc.addPage();
        y = margin;
        drawHeader();
      }

      if (ri % 2 === 1) {
        setFill(ZEBRA);
        doc.rect(margin, y, tableRight - margin, h, "F");
      }

      doc.setFont("helvetica", "normal");
      columns.forEach((c, ci) => {
        setColor(c.color ? c.color(row[ci] ?? "") : BODY);
        const right = c.align === "right";
        const tx = right ? xs[ci] + c.width - padX : xs[ci] + padX;
        cellLines[ci].forEach((ln, li) => {
          doc.text(ln, tx, y + padY + lh - 3 + li * lh, {
            align: right ? "right" : "left",
          });
        });
      });

      setDraw(LINE);
      doc.line(margin, y + h, tableRight, y + h);
      y += h;
    });

    y += 10;
  };

  // ===================== COVER PAGE =======================================
  // Brand band
  setFill(INDIGO);
  doc.rect(0, 0, pageW, 76, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("PRODUCT AUDIT STUDIO", margin, 46);

  // Title block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  setColor(INK);
  doc.text("Product Audit Report", margin, 230);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  setColor(INDIGO_DARK);
  doc.text(audit.profile.productName || "Untitled product", margin, 264);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  setColor(MUTED);
  const meta = [audit.profile.industry, audit.profile.stage]
    .filter(Boolean)
    .join("  ·  ");
  let metaY = 288;
  if (meta) {
    doc.text(meta, margin, metaY);
    metaY += 16;
  }
  if (audit.profile.website) {
    doc.text(audit.profile.website, margin, metaY);
    metaY += 16;
  }
  doc.text(`Generated ${formatDate(generatedAt)}`, margin, metaY);

  // Score card
  const cardY = 360;
  const cardH = 132;
  setFill([249, 250, 251]);
  setDraw(LINE);
  doc.roundedRect(margin, cardY, contentW, cardH, 12, 12, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setColor(MUTED);
  doc.text("OVERALL SCORE", margin + 28, cardY + 34);

  doc.setFontSize(60);
  setColor(INDIGO);
  doc.text(`${report.overallScore}`, margin + 24, cardY + 96);
  doc.setFontSize(16);
  setColor(MUTED);
  const numW = doc.getTextWidth(`${report.overallScore}`);
  doc.text("/ 100", margin + 24 + numW + 10, cardY + 96);

  // Maturity badge on the right of the card
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setColor(MUTED);
  doc.text("MATURITY STAGE", margin + contentW - 200, cardY + 34);
  doc.setFontSize(20);
  setColor(INK);
  doc.text(report.maturityStage, margin + contentW - 200, cardY + 64);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setColor(MUTED);
  doc.text(
    `${report.completeness}% of questions answered`,
    margin + contentW - 200,
    cardY + 84,
  );

  // Cover footer note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setColor(MUTED);
  doc.text(
    "Confidential — prepared by Product Audit Studio",
    margin,
    pageH - 64,
  );

  // ===================== SCORE OVERVIEW ===================================
  doc.addPage();
  y = margin;

  sectionHeading("Score overview");
  paragraph(report.summary);
  y += 4;

  subHeading("Category scores");
  table(
    [
      { header: "Category", width: contentW - 160 },
      { header: "Score", width: 70, align: "right" },
      { header: "Status", width: 90, color: statusColor },
    ],
    report.categories.map((c) => [
      c.title,
      `${c.score}/100`,
      STATUS_LABEL[c.status],
    ]),
  );

  subHeading("Dimension scores");
  table(
    [
      { header: "Dimension", width: contentW - 230 },
      { header: "Score", width: 60, align: "right" },
      { header: "Status", width: 80, color: statusColor },
      { header: "Priority", width: 90, color: priorityColor },
    ],
    report.dimensions.map((d) => [
      d.title,
      `${d.score}/100`,
      STATUS_LABEL[d.status],
      capitalize(d.priority),
    ]),
  );

  // ===================== NARRATIVE SECTIONS ===============================
  if (narrative) {
    sectionHeading("Executive summary");
    paragraph(narrative.executiveSummary);

    sectionHeading("Main diagnosis");
    paragraph(narrative.productDiagnosis);
    y += 2;
    paragraph(narrative.scoreOverview);

    sectionHeading("Key problems");
    if (report.topPriorities.length) {
      table(
        [
          { header: "Issue", width: contentW - 160 },
          { header: "Score", width: 60, align: "right" },
          { header: "Priority", width: 90, color: priorityColor },
        ],
        report.topPriorities.map((d: DimensionResult) => [
          d.title,
          `${d.score}/100`,
          capitalize(d.priority),
        ]),
      );
    }
    bullets(narrative.growthBottlenecks);

    sectionHeading("Recommendations");
    table(
      [
        { header: "#", width: 28, align: "right" },
        { header: "Action", width: contentW - 118, align: "left" },
        { header: "Priority", width: 90, color: priorityColor },
      ],
      narrative.topActions.map((a, i) => [
        `${i + 1}`,
        a.title,
        capitalize(a.priority),
      ]),
    );
    if (narrative.quickWins.length) {
      subHeading("Quick wins");
      bullets(narrative.quickWins);
    }

    sectionHeading("30-day improvement roadmap");
    table(
      [
        { header: "Timeframe", width: 90 },
        { header: "Focus", width: 150 },
        { header: "Key actions", width: contentW - 240 },
      ],
      narrative.roadmap30Day.map((p) => [
        p.timeframe,
        p.focus,
        p.actions.map((a) => `• ${a}`).join("\n"),
      ]),
    );

    sectionHeading("Detailed report");
    const analyses: [string, string][] = [
      ["Positioning analysis", narrative.positioningAnalysis],
      ["Landing page analysis", narrative.landingPageAnalysis],
      ["Onboarding analysis", narrative.onboardingAnalysis],
      ["Pricing analysis", narrative.pricingAnalysis],
      ["Trust & credibility analysis", narrative.trustAnalysis],
      ["PMF signal analysis", narrative.pmfAnalysis],
    ];
    analyses.forEach(([title, body]) => {
      subHeading(title);
      paragraph(body);
      y += 2;
    });

    if (narrative.strategicRisks.length) {
      subHeading("Strategic risks");
      bullets(narrative.strategicRisks);
    }

    sectionHeading("Final recommendation");
    // Highlighted callout box.
    {
      const padded = 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(
        narrative.finalRecommendation,
        contentW - padded * 2,
      ) as string[];
      const boxH = lines.length * 16 + padded * 2;
      ensureSpace(boxH);
      setFill([238, 242, 255]);
      doc.roundedRect(margin, y, contentW, boxH, 10, 10, "F");
      setColor(INDIGO_DARK);
      let ty = y + padded + 11;
      lines.forEach((line) => {
        doc.text(line, margin + padded, ty);
        ty += 16;
      });
      y += boxH + 8;
    }
  } else {
    sectionHeading("Strategic report");
    paragraph(
      "Generate the strategic report from the results page to include the executive summary, diagnosis, recommendations and roadmap in this export.",
    );
  }

  // ===================== FOOTERS (all content pages) =======================
  const pageCount = doc.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);
    setDraw(LINE);
    doc.line(margin, pageH - 38, pageW - margin, pageH - 38);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setColor(INDIGO);
    doc.text("Product Audit Studio", margin, pageH - 24);
    doc.setFont("helvetica", "normal");
    setColor(MUTED);
    doc.text(audit.profile.productName || "", pageW / 2, pageH - 24, {
      align: "center",
    });
    doc.text(`Page ${i - 1} of ${pageCount - 1}`, pageW - margin, pageH - 24, {
      align: "right",
    });
  }

  const filename = `${audit.profile.productName || "product"}-audit-report.pdf`
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-");
  doc.save(filename);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
