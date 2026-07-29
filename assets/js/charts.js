import { escapeHtml } from "./utils.js";

const palette = {
  indigo: "#4f46e5",
  indigoSoft: "rgba(79, 70, 229, .14)",
  teal: "#14b8a6",
  tealSoft: "rgba(20, 184, 166, .15)",
  amber: "#f59e0b",
  rose: "#f43f5e",
  slate: "#94a3b8"
};

const chartInstances = new WeakMap();

const defaultOptions = (type) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 650 },
  plugins: {
    legend: { display: type === "doughnut", position: "bottom", labels: { usePointStyle: true, boxWidth: 7, padding: 18, font: { family: "DM Sans", size: 12, weight: "600" } } },
    tooltip: { backgroundColor: "#111827", padding: 10, titleFont: { family: "DM Sans" }, bodyFont: { family: "DM Sans" }, cornerRadius: 8, displayColors: false }
  },
  scales: type === "doughnut" ? {} : {
    x: { grid: { display: false }, border: { display: false }, ticks: { color: "#64748b", font: { family: "DM Sans", size: 11, weight: "600" }, maxRotation: 0 } },
    y: { min: 0, max: 100, grid: { color: "rgba(148, 163, 184, .16)" }, border: { display: false }, ticks: { color: "#94a3b8", font: { family: "DM Sans", size: 11 }, callback: (value) => `${value}%` } }
  }
});

export const renderChart = (canvas, { type, labels, values, label, colors = [] }) => {
  if (!canvas || !window.Chart) return null;
  chartInstances.get(canvas)?.destroy();
  const baseColor = colors[0] || palette.indigo;
  const config = {
    type,
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        backgroundColor: type === "doughnut" ? (colors.length ? colors : [palette.indigo, palette.teal, palette.amber, palette.rose, palette.slate]) : (type === "line" ? palette.indigoSoft : baseColor),
        borderColor: type === "doughnut" ? "#fff" : baseColor,
        borderWidth: type === "doughnut" ? 3 : (type === "line" ? 2.5 : 0),
        borderRadius: type === "bar" ? 7 : 0,
        borderSkipped: false,
        fill: type === "line",
        tension: .38,
        pointRadius: type === "line" ? 3 : 0,
        pointHoverRadius: type === "line" ? 5 : 0,
        pointBackgroundColor: baseColor
      }]
    },
    options: defaultOptions(type)
  };
  const chart = new window.Chart(canvas, config);
  chartInstances.set(canvas, chart);
  return chart;
};

export const chartCard = ({ title, description = "", canvasId, compact = false }) => `<article class="surface rounded-2xl p-5 sm:p-6"><div class="mb-5"><h2 class="text-base font-extrabold text-slate-900 dark:text-white">${escapeHtml(title)}</h2>${description ? `<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${escapeHtml(description)}</p>` : ""}</div><div class="chart-wrap ${compact ? "compact" : ""}"><canvas id="${escapeHtml(canvasId)}" role="img" aria-label="${escapeHtml(title)} chart"></canvas></div></article>`;

export const clearCharts = () => {
  document.querySelectorAll("canvas").forEach((canvas) => chartInstances.get(canvas)?.destroy());
};
