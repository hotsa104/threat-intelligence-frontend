import React, { useEffect, useState, useMemo } from "react";
import { fetchThreats } from "../api";
import type { Threat } from "../api";
import { getKeywordColor } from "../theme";
import { useTheme } from "../ThemeContext";

export const XThreatsPage: React.FC<{
  initialKeyword?: string | null;
  onKeywordConsumed?: () => void;
}> = ({ initialKeyword, onKeywordConsumed }) => {
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);
  const [activeCve, setActiveCve] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 親からのキーワードフィルタを受け取る
  useEffect(() => {
    if (initialKeyword) {
      setActiveKeyword(initialKeyword);
      onKeywordConsumed?.();
    }
  }, [initialKeyword]);

  // === デバウンス (400ms) ===
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  // === フェッチ ===
  useEffect(() => {
    setLoading(true);
    fetchThreats({
      keyword: activeKeyword || undefined,
      cve: activeCve || undefined,
      query: debouncedSearch || undefined,
      limit: 100,
    })
      .then((data) => setPosts(data.data))
      .catch((err) => {
        console.error("Failed to fetch threats:", err);
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, [activeKeyword, activeCve, debouncedSearch]);

  // === キーワード集計 ===
  const keywordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((post) => {
      (post.keywords || []).forEach((kw) => {
        counts[kw] = (counts[kw] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [posts]);

  // === イベントハンドラ ===
  const handleKeywordClick = (kw: string) => {
    setActiveKeyword(activeKeyword === kw ? null : kw);
  };

  const handleCveClick = (cve: string) => {
    setActiveCve(activeCve === cve ? null : cve);
  };

  const handleClearSearch = () => setSearchText("");
  const handleClearCve = () => setActiveCve(null);

  return (
    <div className="w-full transition-colors duration-200">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          X Threats
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--text-secondary)" }}
        >
          {posts.length > 0
            ? `${posts.length} threats found`
            : "No threats found"}
        </p>
      </div>

      {/* Search Box */}
      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Free text search..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none transition"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor =
                "var(--input-focus)";
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor =
                "var(--input-border)";
            }}
          />
          {searchText && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition"
              style={{ color: "var(--text-tertiary)", cursor: "pointer" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--text-tertiary)";
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Keyword Pills */}
      <div className="mb-4">
        <p
          className="text-xs mb-2"
          style={{ color: "var(--text-tertiary)" }}
        >
          Top Keywords
        </p>
        <div className="flex flex-wrap gap-2">
          {keywordCounts.map(([kw, count]) => {
            const colors = getKeywordColor(kw, theme);
            const isActive = activeKeyword === kw;
            return (
              <button
                key={kw}
                onClick={() => handleKeywordClick(kw)}
                className="px-3 py-1 rounded-full text-sm font-medium transition"
                style={{
                  backgroundColor: isActive ? colors.border : colors.bg,
                  color: isActive ? "#fff" : colors.text,
                  border: `1px solid ${colors.border}`,
                  cursor: "pointer",
                }}
              >
                {kw} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Active CVE Filter */}
      {activeCve && (
        <div
          className="mb-4 p-3 rounded-lg flex items-center gap-2"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderLeft: "4px solid var(--input-focus)",
          }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            CVE: {activeCve}
          </span>
          <button
            onClick={handleClearCve}
            className="text-sm font-medium transition"
            style={{ color: "var(--input-focus)", cursor: "pointer" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div
            className="text-center py-8"
            style={{ color: "var(--text-tertiary)" }}
          >
            Loading...
          </div>
        ) : posts.length === 0 ? (
          <div
            className="text-center py-8"
            style={{ color: "var(--text-tertiary)" }}
          >
            No threats to display
          </div>
        ) : (
          posts.map((post, idx) => (
            <div
              key={post.id || idx}
              className="p-4 rounded-lg transition"
              style={{
                backgroundColor: "var(--bg-glass)",
                border: "1px solid var(--border-color)",
                cursor: post.url ? "pointer" : "default",
                transition: "all 0.18s ease",
              }}
              onClick={() => post.url && window.open(post.url, "_blank", "noopener,noreferrer")}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = "var(--bg-glass-hover)";
                el.style.borderColor = "rgba(99,102,241,0.4)";
                el.style.transform = "translateY(-2px)";
                el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = "var(--bg-glass)";
                el.style.borderColor = "var(--border-color)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Keywords & CVEs */}
              <div className="flex flex-wrap gap-2 mb-3">
                {(post.keywords || []).map((kw) => {
                  const colors = getKeywordColor(kw, theme);
                  return (
                    <button
                      key={kw}
                      onClick={(e) => { e.stopPropagation(); handleKeywordClick(kw); }}
                      className="px-2 py-1 text-xs font-medium rounded transition"
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        cursor: "pointer",
                      }}
                    >
                      {kw}
                    </button>
                  );
                })}
                {(post.cves || []).map((cve) => (
                  <button
                    key={cve}
                    onClick={(e) => { e.stopPropagation(); handleCveClick(cve); }}
                    className="px-2 py-1 text-xs font-medium rounded transition"
                    style={{
                      backgroundColor: "#ea580c",
                      color: "#fff",
                      border: "1px solid #d97706",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#d97706"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ea580c"; }}
                  >
                    {cve}
                  </button>
                ))}
              </div>

              {/* Text Content */}
              <p className="text-sm mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {post.text}
              </p>

              {/* Timestamp & X icon */}
              <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-tertiary)" }}>
                <span>{post.timestamp ? new Date(post.timestamp).toLocaleString("ja-JP") : "Unknown date"}</span>
                {post.url && (
                  <span className="flex items-center gap-1" style={{ color: "var(--accent-primary)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    View post
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
