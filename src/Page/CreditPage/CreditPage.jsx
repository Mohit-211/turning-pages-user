import { useState } from "react";

const creditActivities = [
  { activity: "Create a chapter outline", credits: 1, category: "Planning" },
  { activity: "Create a chapter draft", credits: 2, category: "Writing" },
  { activity: "Expand or rework a chapter section", credits: 1, category: "Writing" },
  { activity: "Edit or improve a chapter", credits: 1, category: "Editing" },
  { activity: "Style or voice alignment for a chapter", credits: 1, category: "Editing" },
  { activity: "Chapter summary", credits: 1, category: "Planning" },
  { activity: "Book summary", credits: 2, category: "Planning" },
  { activity: "Fact check a chapter", credits: 2, category: "Validation" },
  { activity: "Plagiarism check a chapter", credits: 2, category: "Validation" },
  { activity: "Rewrite a paragraph or short passage", credits: 1, category: "Writing" },
  { activity: "Title or subtitle ideas", credits: 1, category: "Planning" },
];

const includedFeatures = [
  { label: "Quote database access", icon: "📚" },
  { label: "Quote browsing and search", icon: "🔍" },
  { label: "Saved quotes and collections", icon: "🔖" },
  { label: "Dashboard access", icon: "🏠" },
  { label: "Manuscript storage", icon: "💾" },
  { label: "General platform access", icon: "✅" },
];

const separateServices = [
  { label: "Professional publishing packages", icon: "📦" },
  { label: "One-time publishing support services", icon: "🎯" },
  { label: "9-point TAV Analysis™ as a standalone service", icon: "📊" },
];

const sampleWorkflow = [
  { task: "Outline 6 chapters", credits: 6 },
  { task: "Draft 6 chapters", credits: 12 },
  { task: "Edit 6 chapters", credits: 6 },
  { task: "Book summary", credits: 2 },
  { task: "Fact check 2 chapters", credits: 4 },
];

const navItems = [
  { label: "Dashboard", icon: "⊞" },
  { label: "My Books", icon: "📖" },
  { label: "Submissions", icon: "✈" },
  { label: "Profile", icon: "👤" },
  { label: "My Directory", icon: "▦" },
  { label: "Credits", icon: "▭", active: true },
  { label: "Quotes", icon: "❝" },
  { label: "Support", icon: "🎧" },
  { label: "Chat", icon: "💬" },
];

const tabs = ["Overview", "Use Credits", "Included", "Workflow", "Separate Services"];

const categoryColors = {
  Planning:   { bg: "#EFF6FF", text: "#1D4ED8" },
  Writing:    { bg: "#F0FDF4", text: "#15803D" },
  Editing:    { bg: "#FFF7ED", text: "#C2410C" },
  Validation: { bg: "#FDF4FF", text: "#7E22CE" },
};

export default function CreditSystem() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [selected, setSelected] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const totalSelected = selected.reduce((s, i) => s + creditActivities[i].credits, 0);
  const workflowTotal = sampleWorkflow.reduce((s, r) => s + r.credits, 0);
  const toggle = (idx) => setSelected((p) => p.includes(idx) ? p.filter((i) => i !== idx) : [...p, idx]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', Tahoma, sans-serif", background: "#F0F4F8", overflow: "hidden" }}>

      {/* Sidebar */}
      {/* <aside style={{
        width: sidebarOpen ? "230px" : "0", minWidth: sidebarOpen ? "230px" : "0",
        background: "#fff", borderRight: "1px solid #E2E8F0",
        display: "flex", flexDirection: "column", transition: "all 0.25s", overflow: "hidden",
      }}>
        <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid #F1F5F9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px",
              background: "linear-gradient(135deg, #1E3A5F 0%, #C0392B 100%)",
              borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px",
            }}>📚</div>
            <div>
              <div style={{ fontWeight: "700", color: "#1E3A5F", fontSize: "13px" }}>Turning Pages</div>
              <div style={{ fontSize: "10px", color: "#94A3B8" }}>Write. Publish. Inspire.</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "14px 16px 6px" }}>
          <span style={{ fontSize: "10px", color: "#94A3B8", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: "600" }}>Navigation</span>
        </div>
        <nav style={{ flex: 1, padding: "0 10px", overflowY: "auto" }}>
          {navItems.map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 10px", borderRadius: "7px", marginBottom: "2px",
              background: item.active ? "#EFF6FF" : "transparent",
              color: item.active ? "#1D4ED8" : "#64748B",
              borderLeft: item.active ? "3px solid #C0392B" : "3px solid transparent",
              fontWeight: item.active ? "600" : "400",
              fontSize: "13px", cursor: "pointer",
            }}>
              <span style={{ fontSize: "14px", width: "18px", textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>
      </aside> */}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        {/* <header style={{
          background: "#fff", borderBottom: "1px solid #E2E8F0",
          padding: "0 20px", height: "58px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button onClick={() => setSidebarOpen(v => !v)} style={{
              background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#64748B",
            }}>☰</button>
            <span style={{ fontWeight: "700", fontSize: "15px", color: "#1E3A5F" }}>Turning Pages</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              border: "1px solid #E2E8F0", borderRadius: "8px", padding: "6px 12px",
            }}>
              <span style={{ fontSize: "13px", color: "#1E3A5F", fontWeight: "600" }}>Credits 316</span>
              <div style={{ width: "38px", height: "5px", background: "#E2E8F0", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "60%", height: "100%", background: "#C0392B", borderRadius: "3px" }} />
              </div>
            </div>
            <button style={{
              background: "#C0392B", color: "#fff", border: "none", borderRadius: "8px",
              padding: "7px 14px", cursor: "pointer", fontWeight: "600", fontSize: "12px",
            }}>+ More Credits</button>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{
                width: "30px", height: "30px", borderRadius: "50%", background: "#1E3A5F",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px",
              }}>B</div>
              <span style={{ fontSize: "13px", color: "#1E3A5F", fontWeight: "500" }}>Bhavya Soni ▾</span>
            </div>
          </div>
        </header> */}

        {/* Scrollable content */}
        <main style={{ flex: 1, padding: "20px" }}>

          {/* Welcome */}
          <div style={{
            background: "#fff", borderRadius: "12px", padding: "22px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#1E3A5F",textAlign:"left" }}>Book Credits Guide</h1>
              <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "13px" }}>Understand how Book Credits work and plan your writing journey</p>
            </div>
            {/* <button style={{
              background: "#1E3A5F", color: "#fff", border: "none", borderRadius: "8px",
              padding: "10px 20px", cursor: "pointer", fontWeight: "600", fontSize: "13px",
            }}>+ Buy More Credits</button> */}
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "16px" }}>
            {[
              { label: "YOUR CREDITS", value: "316", color: "#1E3A5F" },
              { label: "CREDITS USED", value: "84",  color: "#C0392B" },
              { label: "AVG PER BOOK",  value: "~25", color: "#1E3A5F" },
              { label: "ACTIVITIES",   value: "11",  color: "#1E3A5F" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "#fff", borderRadius: "12px", padding: "18px 20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                <div style={{ fontSize: "10px", letterSpacing: "1.5px", color: "#94A3B8", fontWeight: "600", textTransform: "uppercase", marginBottom: "6px" }}>{s.label}</div>
                <div style={{ fontSize: "30px", fontWeight: "700", color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Card with tabs */}
          <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0", padding: "0 16px", overflowX: "auto" }}>
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "13px 16px", background: "none", border: "none",
                  borderBottom: activeTab === tab ? "2px solid #C0392B" : "2px solid transparent",
                  color: activeTab === tab ? "#C0392B" : "#64748B",
                  fontWeight: activeTab === tab ? "600" : "400",
                  fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap",
                  fontFamily: "inherit", marginBottom: "-1px", transition: "all 0.15s",
                }}>{tab}</button>
              ))}
            </div>

            <div style={{ padding: "22px" }}>

              {/* OVERVIEW */}
              {activeTab === "Overview" && (
                <div>
                  <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.75", marginTop: 0, marginBottom: "18px" }}>
                    Turning Pages uses <strong style={{ color: "#1E3A5F" }}>Book Credits</strong> to help you make meaningful progress on your manuscript.
                    A Book Credit is used when the platform helps you move your book forward through writing, editing, refining, or validating your content.
                    Most authors use <strong style={{ color: "#C0392B" }}>20 to 30 Book Credits</strong> to write, revise, and prepare a full book for publishing.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    {[
                      { title: "Included in subscription", desc: "Quote database, dashboard, manuscript storage & more — no credits needed.", icon: "✅" },
                      { title: "Credit-based activities", desc: "Writing, editing, fact-checking, and validation features consume credits.", icon: "🔖" },
                      { title: "Typical usage", desc: "A full 6-chapter book typically uses around 30 credits from outline to summary.", icon: "📖" },
                      { title: "Separate services", desc: "Publishing packages, TAV Analysis™ and professional services are priced separately.", icon: "📦" },
                    ].map((c) => (
                      <div key={c.title} style={{
                        border: "1px solid #E2E8F0", borderRadius: "10px", padding: "16px",
                        display: "flex", gap: "12px", alignItems: "flex-start", background: "#FAFAFA",
                      }}>
                        <span style={{ fontSize: "20px" }}>{c.icon}</span>
                        <div>
                          <div style={{ fontWeight: "600", color: "#1E3A5F", fontSize: "13px", marginBottom: "3px" }}>{c.title}</div>
                          <div style={{ color: "#64748B", fontSize: "12px", lineHeight: "1.5" }}>{c.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* USE CREDITS */}
              {activeTab === "Use Credits" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <p style={{ margin: 0, color: "#64748B", fontSize: "13px" }}>Click activities to build a credit estimate</p>
                    {selected.length > 0 && (
                      <div style={{
                        background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px",
                        padding: "7px 16px", display: "flex", alignItems: "center", gap: "10px",
                      }}>
                        <span style={{ color: "#1D4ED8", fontSize: "13px" }}>{selected.length} selected</span>
                        <span style={{ color: "#1E3A5F", fontWeight: "700", fontSize: "17px" }}>{totalSelected} Credits</span>
                        <button onClick={() => setSelected([])} style={{
                          background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "16px",
                        }}>×</button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {creditActivities.map((item, idx) => {
                      const sel = selected.includes(idx);
                      const cat = categoryColors[item.category];
                      return (
                        <div key={idx} onClick={() => toggle(idx)} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "12px 14px",
                          border: sel ? "1.5px solid #1D4ED8" : "1px solid #E2E8F0",
                          borderRadius: "8px", cursor: "pointer",
                          background: sel ? "#F0F7FF" : "#FAFAFA", transition: "all 0.15s",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                              border: sel ? "none" : "2px solid #CBD5E1",
                              background: sel ? "#1D4ED8" : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {sel && <span style={{ color: "#fff", fontSize: "10px" }}>✓</span>}
                            </div>
                            <span style={{ fontSize: "13px", color: sel ? "#1E3A5F" : "#475569", fontWeight: sel ? "600" : "400" }}>
                              {item.activity}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{
                              fontSize: "11px", padding: "2px 8px", borderRadius: "20px",
                              background: cat.bg, color: cat.text, fontWeight: "500",
                            }}>{item.category}</span>
                            <span style={{
                              background: sel ? "#1D4ED8" : "#E2E8F0",
                              color: sel ? "#fff" : "#475569",
                              padding: "3px 11px", borderRadius: "6px",
                              fontSize: "12px", fontWeight: "600", minWidth: "48px", textAlign: "center",
                              transition: "all 0.15s",
                            }}>{item.credits} cr</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* INCLUDED */}
              {activeTab === "Included" && (
                <div>
                  <p style={{ color: "#64748B", fontSize: "13px", marginTop: 0, marginBottom: "18px" }}>
                    The following features are included as part of your subscription and do not use Book Credits.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
                    {includedFeatures.map((f, i) => (
                      <div key={i} style={{
                        border: "1px solid #E2E8F0", borderRadius: "10px", padding: "16px",
                        display: "flex", alignItems: "center", gap: "10px", background: "#FAFAFA",
                      }}>
                        <span style={{ fontSize: "18px" }}>{f.icon}</span>
                        <span style={{ color: "#1E3A5F", fontSize: "13px", fontWeight: "500" }}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WORKFLOW */}
              {activeTab === "Workflow" && (
                <div>
                  <p style={{ color: "#64748B", fontSize: "13px", marginTop: 0, marginBottom: "18px" }}>
                    A sample credit usage for a full 6-chapter book.
                  </p>
                  <div style={{ border: "1px solid #E2E8F0", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "9px 16px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                      <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Task</span>
                      <span style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Credits</span>
                    </div>
                    {sampleWorkflow.map((row, i) => (
                      <div key={i} style={{
                        display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center",
                        padding: "13px 16px",
                        borderBottom: i < sampleWorkflow.length - 1 ? "1px solid #F1F5F9" : "none",
                        background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{
                            width: "22px", height: "22px", borderRadius: "50%",
                            background: "#EFF6FF", color: "#1D4ED8",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "11px", fontWeight: "700", flexShrink: 0,
                          }}>{i + 1}</span>
                          <span style={{ color: "#1E3A5F", fontSize: "13px" }}>{row.task}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "55px", height: "5px", background: "#E2E8F0", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${Math.min((row.credits / workflowTotal) * 100 * 3, 100)}%`, height: "100%", background: "#1D4ED8", borderRadius: "3px" }} />
                          </div>
                          <span style={{ fontWeight: "700", color: "#C0392B", fontSize: "14px", minWidth: "28px", textAlign: "right" }}>{row.credits}</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "13px 16px", background: "#1E3A5F" }}>
                      <span style={{ color: "#fff", fontWeight: "600", fontSize: "13px" }}>Total</span>
                      <span style={{ color: "#fff", fontWeight: "700", fontSize: "17px" }}>{workflowTotal}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SEPARATE SERVICES */}
              {activeTab === "Separate Services" && (
                <div>
                  <p style={{ color: "#64748B", fontSize: "13px", marginTop: 0, marginBottom: "18px" }}>
                    Some services are separate from Book Credits because they are professional publishing or premium editorial services.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                    {separateServices.map((s, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        border: "1px solid #FEE2E2", borderRadius: "10px", padding: "14px 16px", background: "#FFF5F5",
                      }}>
                        <span style={{ fontSize: "18px" }}>{s.icon}</span>
                        <span style={{ color: "#1E3A5F", fontSize: "13px", fontWeight: "500", flex: 1 }}>{s.label}</span>
                        <span style={{
                          background: "#FEE2E2", color: "#B91C1C",
                          fontSize: "10px", fontWeight: "600", padding: "3px 10px",
                          borderRadius: "20px", letterSpacing: "0.5px",
                        }}>Priced Separately</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "#F0F7FF", border: "1px solid #BFDBFE", borderRadius: "10px", padding: "14px 16px" }}>
                    <p style={{ color: "#1D4ED8", fontSize: "13px", lineHeight: "1.7", margin: 0 }}>
                      <strong>Note:</strong> Turning Pages subscriptions are designed to help authors write and prepare their manuscript.
                      Professional publishing services, formatting, cover design, upload assistance, and related publishing services
                      are optional one-time services and are not included in the credit subscription system.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}