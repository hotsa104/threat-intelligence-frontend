/**
 * API クライアント
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const api = {
  get: <T = any>(path: string, config?: { params?: Record<string, any> }) => {
    const fullPath = API_BASE + path;
    const url = new URL(fullPath, window.location.origin);
    if (config?.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return fetch(url.toString()).then(r => r.json() as Promise<T>);
  },
};

// === Threats ===
export interface Threat {
  id?: string;
  text: string;
  keywords?: string[];
  cves?: string[];
  timestamp?: string;
  url?: string;
  source?: string;
}

export interface ThreatsParams {
  keyword?: string;
  cve?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface ThreatsResponse {
  total: number;
  count: number;
  offset: number;
  data: Threat[];
}

export const fetchThreats = (params: ThreatsParams = {}) =>
  api.get<ThreatsResponse>("/threats", {
    params: { limit: 50, ...params },
  });

// === Vulnerabilities ===
export interface Vulnerability {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  dueDate: string;
  shortDescription: string;
  published?: string;
  lastModified?: string;
  cvss_score?: number;
  epss_score?: number;
  priority: string;
  knownRansomwareCampaignUse: string;
  enriched_at?: string;
}

export interface VulnerabilitiesResponse {
  count: number;
  total: number;
  offset: number;
  data: Vulnerability[];
}

export interface VulnParams {
  limit?: number;
  offset?: number;
  priority?: string;
  query?: string;
  enrich_nvd?: boolean;
}

export const fetchVulnerabilities = (params: VulnParams = {}) =>
  api.get<VulnerabilitiesResponse>("/vulnerabilities", { params });

export const fetchVulnStats = () =>
  api.get<{
    total: number;
    priority_counts: Record<string, number>;
    threat_categories?: Record<string, number>;
    last_sync?: string;
  }>("/vulnerabilities/stats");

export interface StatsSummary {
  kev_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  tpot_attacks_24h: number;
  last_sync?: Record<string, any> | null;
}

export const fetchStatsSummary = () =>
  api.get<StatsSummary>("/stats/summary");

// === Critical Vulnerabilities ===
export const fetchCriticalEnriched = () =>
  api.get<VulnerabilitiesResponse>("/vulnerabilities", {
    params: { priority: "CRITICAL", limit: 10 },
  });

// === Honeypot Stats ===
export interface HoneypotPortEntry {
  port: number;
  count: number;
}

export interface HoneypotStats {
  available: boolean;
  total: number;
  top_ports: HoneypotPortEntry[];
  message?: string;
}

export const fetchHoneypotStats = () =>
  api.get<HoneypotStats>("/honeypot/stats");
