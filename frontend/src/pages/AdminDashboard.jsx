import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../services/api";
import { questions as assessmentQuestions } from "../data/questions";

const COLORS = ["#14B8A6", "#3B82F6", "#A855F7", "#F59E0B"];

const MCQ_OPTION_A = "rgb(59, 130, 246)";
const MCQ_OPTION_B = "rgb(245, 158, 11)";

const mcqTooltipLight = {
  background: "rgba(17, 24, 39, 0.95)",
  border: "1px solid rgba(20, 184, 166, 0.3)",
  borderRadius: 8,
  color: "#ffffff",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
};

const mcqAxisLight = { fill: "#e2e8f0", fontSize: 11 };
const mcqGridLight = "rgba(148, 163, 184, 0.2)";

const chartTooltipStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 10,
};

const axisTick = { fill: "#94a3b8", fontSize: 11 };
const xAxisHourly = {
  dataKey: "label",
  tick: { fill: "#94a3b8", fontSize: 10 },
  interval: 3,
  tickFormatter: (label) => String(label || "").slice(0, 2),
  axisLine: { stroke: "#334155" },
  tickLine: false,
};

const competencyTick = (value) => {
  if (!value) return "";
  return String(value)
    .replace("Self-Awareness", "Self-Aware")
    .replace("Self-Management", "Self-Mgmt")
    .replace("Social Awareness", "Social")
    .replace("Relationship Management", "Relationship");
};

const competencyShortLabel = (value) => competencyTick(value);

function AdminHeader({ email, onLogout }) {
  return (
    <header className="admin-topbar glass-card">
      <div>
        <p className="admin-topbar-label">Elif · Admin</p>
        <h1>Dashboard</h1>
      </div>
      <div className="admin-topbar-actions">
        <Link to="/login" className="btn-secondary">
          User login
        </Link>
        <button type="button" className="btn-primary" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </header>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("elif_admin") || "null");
    } catch {
      return null;
    }
  });
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("elif_admin");
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!admin?.email) {
      navigate("/admin/login", { replace: true });
    }
  }, [admin, navigate]);

  const load = useCallback(async () => {
    if (!admin?.email) return;
    setLoading(true);
    setError("");
    try {
      const { data: res } = await api.get("/admin/analytics/today");
      setData(res);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        logout();
        return;
      }
      setError(e?.response?.data?.detail || "Could not load analytics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [admin?.email, logout]);

  useEffect(() => {
    load();
  }, [load]);

  const competencyData = useMemo(() => {
    const rows = data?.question_type_distribution ?? [];
    const total = rows.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
    return rows.map((row, i) => {
      const value = Number(row.value) || 0;
      const percent = total > 0 ? (value / total) * 100 : 0;
      return {
        ...row,
        value,
        percent: Number(percent.toFixed(2)),
        fill: COLORS[i % COLORS.length],
      };
    });
  }, [data]);

  const competencyTotal = useMemo(
    () => competencyData.reduce((sum, r) => sum + (Number(r.value) || 0), 0),
    [competencyData]
  );

  const hourly = useMemo(() => data?.hourly_performance ?? [], [data]);

  const breakdownById = useMemo(() => {
    const m = new Map();
    for (const row of data?.question_breakdown ?? []) {
      m.set(row.question_id, { count_a: row.count_a, count_b: row.count_b });
    }
    return m;
  }, [data?.question_breakdown]);

  const answerCapture = useMemo(() => {
    const captured = data?.question_answers_captured ?? 0;
    const expected = data?.expected_question_answers ?? 0;
    return {
      captured,
      expected,
      missing: Math.max(0, expected - captured),
      ready: expected === 0 ? true : captured >= expected,
    };
  }, [data?.question_answers_captured, data?.expected_question_answers]);

  const formattedDate = useMemo(() => {
    if (!data?.date) return "";
    try {
      return new Date(`${data.date}T12:00:00Z`).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return data.date;
    }
  }, [data]);

  if (!admin?.email) {
    return null;
  }

  return (
    <main className="page admin-analytics-page">
      <AdminHeader email={admin.email} onLogout={logout} />

      <div className="admin-toolbar">
        <div>
          <p className="admin-date-pill">
            {formattedDate}
          </p>
        </div>
        <button type="button" className="btn-secondary admin-refresh" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <section className="admin-kpi-row">
        <article className="glass-card admin-kpi">
          <p className="admin-kpi-label">Completions today</p>
          <p className="admin-kpi-value">{data?.completions_count ?? "—"}</p>
          <p className="admin-kpi-hint">Distinct assessment submissions recorded today.</p>
        </article>
        <article className="glass-card admin-kpi admin-kpi-wide">
          <p className="admin-kpi-label">How to read the charts</p>
          <p className="admin-kpi-hint">
            Summary charts show competency mix and hourly trends. At the bottom, each MCQ appears in
            its own card with a bar or pie chart (alternating), using today&apos;s cohort (N =
            completions).
          </p>
        </article>
      </section>

      <section className="admin-charts-layout">
        <article className="glass-card admin-chart-card admin-chart-pie-wide">
          <div className="admin-chart-head">
            <h2>Competency distribution (all submissions today)</h2>
          </div>
          {competencyTotal <= 0 ? (
            <div className="admin-empty-chart admin-empty-chart--short">
              <p>No assessments have been completed yet today.</p>
            </div>
          ) : (
            <div className="admin-pie-wrap">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={competencyData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="52%"
                    innerRadius={68}
                    outerRadius={112}
                    paddingAngle={2}
                    labelLine={false}
                    label={({ payload }) =>
                      `${competencyShortLabel(payload?.name)} ${Number(payload?.percent ?? 0).toFixed(0)}%`
                    }
                  >
                    {competencyData.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} stroke="rgba(15,23,42,0.9)" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${Number(value).toFixed(0)} A-answers`, "Count"]}
                    contentStyle={chartTooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>

        <div className="admin-charts-trio">
          <article className="glass-card admin-chart-card admin-chart-trio-cell">
            <div className="admin-chart-head">
              <h2>Column chart</h2>
              <p className="admin-chart-caption">All selected responses split by competency (%).</p>
            </div>
            {competencyTotal <= 0 ? (
              <div className="admin-empty-chart admin-empty-chart--short">
                <p>No assessments have been completed yet today.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={competencyData} margin={{ top: 12, right: 14, left: 6, bottom: 24 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={competencyTick}
                    axisLine={{ stroke: "#334155" }}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    tick={axisTick}
                    allowDecimals={false}
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(v, _k, item) => {
                      const c = Number(item?.payload?.value || 0).toFixed(0);
                      return [`${Number(v).toFixed(2)}% (count: ${c})`, "Share"];
                    }}
                  />
                  <Bar dataKey="percent" radius={[10, 10, 0, 0]} maxBarSize={44}>
                    {competencyData.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </article>

          <article className="glass-card admin-chart-card admin-chart-trio-cell">
            <div className="admin-chart-head">
              <h2>Area chart</h2>
            </div>
            {hourly.length === 0 ? (
              <div className="admin-empty-chart admin-empty-chart--short">
                <p>No hourly data.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={hourly} margin={{ top: 6, right: 8, left: 0, bottom: 16 }}>
                  <defs>
                    <linearGradient id="adminAreaCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" vertical={false} />
                  <XAxis {...xAxisHourly} />
                  <YAxis tick={axisTick} allowDecimals={false} axisLine={false} tickLine={false} width={36} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="cumulative_submissions"
                    name="Cumulative"
                    stroke="#2dd4bf"
                    strokeWidth={2}
                    fill="url(#adminAreaCumulative)"
                    dot={{ r: 0 }}
                    activeDot={{ r: 5, stroke: "#0f172a", strokeWidth: 2 }}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </article>

          <article className="glass-card admin-chart-card admin-chart-trio-cell">
            <div className="admin-chart-head">
              <h2>Line chart</h2>
            </div>
            {hourly.length === 0 ? (
              <div className="admin-empty-chart admin-empty-chart--short">
                <p>No hourly data.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourly} margin={{ top: 6, right: 8, left: 0, bottom: 16 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" vertical={false} />
                  <XAxis {...xAxisHourly} />
                  <YAxis
                    tick={axisTick}
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend
                    wrapperStyle={{ color: "#cbd5e1", fontSize: 11 }}
                    verticalAlign="bottom"
                    height={36}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg_performance_index"
                    name="Average"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    dot={{ r: 2 }}
                    activeDot={{ r: 5 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="performance_high"
                    name="High"
                    stroke="#4ade80"
                    strokeDasharray="5 4"
                    dot={false}
                    strokeWidth={1.5}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="performance_low"
                    name="Low"
                    stroke="#fb7185"
                    strokeDasharray="5 4"
                    dot={false}
                    strokeWidth={1.5}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </article>
        </div>
      </section>

      <section className="admin-mcq-board">
        <div className="admin-mcq-board-intro">
          <h2>Question &amp; MCQ responses</h2>
          <p>
            Distribution of Option A vs B for everyone who completed the assessment today
            {data?.completions_count != null ? (
              <>
                {" "}
                (<strong>N = {data.completions_count}</strong>, UTC date above)
              </>
            ) : null}
            . Layout matches survey-style reporting: column chart and pie chart alternate by question.
          </p>
          {!answerCapture.ready && (
            <p className="admin-mcq-warning">
              MCQ rows missing for today&apos;s cohort: captured {answerCapture.captured} of{" "}
              {answerCapture.expected}. Ask users to submit the assessment again after backend restart.
            </p>
          )}
        </div>

        <div className="admin-mcq-grid">
          {assessmentQuestions.map((q, index) => {
            const stats = breakdownById.get(q.id) ?? { count_a: 0, count_b: 0 };
            const { count_a: countA, count_b: countB } = stats;
            const nCohort = data?.completions_count ?? 0;
            const useBar = index % 2 === 0;
            const totalResponses = countA + countB;
            const pctA = totalResponses > 0 ? (countA / totalResponses) * 100 : 0;
            const pctB = totalResponses > 0 ? (countB / totalResponses) * 100 : 0;
            const barRows = [
              { key: "A", label: "A", count: countA, percent: Number(pctA.toFixed(2)), fill: MCQ_OPTION_A },
              { key: "B", label: "B", count: countB, percent: Number(pctB.toFixed(2)), fill: MCQ_OPTION_B },
            ];
            const pieSlices = [];
            if (countA > 0) {
              pieSlices.push({ name: "A", value: countA, fill: MCQ_OPTION_A });
            }
            if (countB > 0) {
              pieSlices.push({ name: "B", value: countB, fill: MCQ_OPTION_B });
            }
            const maxPercent = Math.max(pctA, pctB, 60);
            const yMax = Math.ceil(maxPercent / 15) * 15;
            const yTicks = Array.from({ length: Math.floor(yMax / 15) + 1 }, (_, i) => i * 15);

            return (
              <article key={q.id} className="admin-mcq-card">
                <h3 className="admin-mcq-qtitle">
                  <span className="admin-mcq-num">{q.id}).</span> {q.question}{" "}
                  <span className="admin-mcq-n">(N={nCohort})</span>
                </h3>

                {useBar ? (
                  <div className="admin-mcq-chart-wrap">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={barRows}
                        margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
                        barCategoryGap="28%"
                      >
                        <CartesianGrid stroke={mcqGridLight} strokeDasharray="4 4" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={mcqAxisLight}
                          axisLine={{ stroke: "#64748b" }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={mcqAxisLight}
                          allowDecimals={false}
                          domain={[0, yMax]}
                          ticks={yTicks}
                          axisLine={false}
                          tickLine={false}
                          width={36}
                        />
                        <Tooltip
                          formatter={(v, _name, item) => {
                            const c = Number(item?.payload?.count || 0);
                            return [`${Number(v).toFixed(2)}% (count: ${c})`, "Count"];
                          }}
                          contentStyle={mcqTooltipLight}
                        />
                        <Bar dataKey="percent" radius={[6, 6, 0, 0]} maxBarSize={56}>
                          {barRows.map((row) => (
                            <Cell key={row.key} fill={row.fill} />
                          ))}
                          <LabelList
                            dataKey="percent"
                            position="top"
                            formatter={(v) => `${Number(v).toFixed(0)}`}
                            style={{ fill: "#e2e8f0", fontSize: 11, fontWeight: 600 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <ul className="admin-mcq-option-key">
                      <li>
                        <span className="admin-mcq-swatch" style={{ background: MCQ_OPTION_A }} />
                        <strong>(a)</strong> {q.optionA}
                      </li>
                      <li>
                        <span className="admin-mcq-swatch" style={{ background: MCQ_OPTION_B }} />
                        <strong>(b)</strong> {q.optionB}
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="admin-mcq-chart-wrap">
                    {pieSlices.length === 0 ? (
                      <div className="admin-mcq-empty">
                        <p>No recorded answers for this question in today&apos;s cohort.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={pieSlices}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="48%"
                            innerRadius={54}
                            outerRadius={88}
                            paddingAngle={2}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(1)}%`
                            }
                          >
                            {pieSlices.map((s, i) => (
                              <Cell key={`${s.name}-${i}`} fill={s.fill} stroke="#fff" strokeWidth={1} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v) => {
                              const count = Number(v) || 0;
                              const pct = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
                              return [`${pct.toFixed(2)}% (count: ${count})`, "Count"];
                            }}
                            contentStyle={{
                              background: "rgba(17, 24, 39, 0.98)",
                              border: "1px solid rgba(20, 184, 166, 0.4)",
                              borderRadius: 8,
                              color: "#94a3b8",
                              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
                              fontSize: "12px",
                              fontWeight: "500"
                            }}
                            labelStyle={{ color: "#94a3b8", fontWeight: "600" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    <ul className="admin-mcq-legend-list">
                      <li>
                        <span className="admin-mcq-line" style={{ background: MCQ_OPTION_A }} />
                        <span>
                          <strong>(a)</strong> {q.optionA}
                        </span>
                      </li>
                      <li>
                        <span className="admin-mcq-line" style={{ background: MCQ_OPTION_B }} />
                        <span>
                          <strong>(b)</strong> {q.optionB}
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
