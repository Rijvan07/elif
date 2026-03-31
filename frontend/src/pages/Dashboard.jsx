import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "../components/Navbar";
import api from "../services/api";

const COLORS = ["#14B8A6", "#3B82F6", "#A855F7", "#F59E0B"];

export default function Dashboard() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("elif_user") || "null");

  useEffect(() => {
    const fetchResult = async () => {
      if (!user?.id) return;
      try {
        const { data } = await api.get(`/results/${user.id}`);
        setResult(data);
      } catch (e) {
        setError(e?.response?.data?.detail || "No result found.");
      }
    };

    fetchResult();
  }, [user?.id]);

  const chartData = useMemo(() => {
    if (!result) return [];
    const normalizeScore = (rawValue) => {
      // Backward compatibility: old submissions were saved on a 10-20 scale.
      const normalized = rawValue > 10 ? rawValue / 2 : rawValue;
      return Math.max(0, Math.min(10, Math.round(normalized)));
    };

    return [
      { name: "Self Awareness", key: "self_awareness", value: normalizeScore(result.self_awareness) },
      { name: "Self Management", key: "self_management", value: normalizeScore(result.self_management) },
      { name: "Social Awareness", key: "social_awareness", value: normalizeScore(result.social_awareness) },
      {
        name: "Relationship Mgmt",
        key: "relationship_management",
        value: normalizeScore(result.relationship_management),
      },
    ].map((item) => ({ ...item, percent: Math.min(100, (item.value / 10) * 100) }));
  }, [result]);

  return (
    <main className="page">
      <Navbar />
      <section className="test-header">
        <h2>Result Dashboard</h2>
      </section>

      {error && <p className="error-text">{error}</p>}

      {chartData.length > 0 && (
        <>
          <section className="dashboard-grid">
            {chartData.map((item, index) => (
              <article key={item.key} className="score-card glass-card">
                <h3>{item.name}</h3>
                <p className="score-value">
                  {item.value}/10
                </p>
                <div className="mini-progress">
                  <span style={{ width: `${item.percent}%`, background: COLORS[index] }} />
                </div>
              </article>
            ))}
          </section>

          <section className="charts-grid">
            <article className="glass-card chart-card">
              <h3>Circular Score View</h3>
              <ResponsiveContainer width="100%" height={320}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="90%"
                  barSize={12}
                  data={chartData}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="percent" background>
                    {chartData.map((entry, index) => (
                      <Cell key={entry.key} fill={COLORS[index]} />
                    ))}
                  </RadialBar>
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </article>

            <article className="glass-card chart-card">
              <h3>Dimension Comparison</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                  <XAxis dataKey="name" stroke="#E5E7EB" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#E5E7EB" />
                  <Tooltip />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={entry.key} fill={COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </article>
          </section>
        </>
      )}
    </main>
  );
}
