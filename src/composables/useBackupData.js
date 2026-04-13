const API_BASE = 'https://rbs.lunadeer.cn/api/v2';
const INSTANCE_ID = 3;
const TOKEN = 'rbs_a5e9c4291aea58e5d17c222d4c73a4dd85a6e0dfeb8f4d13';

function headers() {
  return { Authorization: `Bearer ${TOKEN}` };
}

async function apiFetch(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.message || 'API error');
  return json.data;
}

export function fetchOverview() {
  return apiFetch(`/instances/${INSTANCE_ID}/overview`);
}

export function fetchDisasterRecovery() {
  return apiFetch(`/instances/${INSTANCE_ID}/disaster-recovery`);
}

export function fetchCurrentTask() {
  return apiFetch(`/instances/${INSTANCE_ID}/current-task`);
}

export function fetchPolicies() {
  return apiFetch(`/instances/${INSTANCE_ID}/policies`);
}

export function fetchBackups(page = 1, pageSize = 20) {
  return apiFetch(`/instances/${INSTANCE_ID}/backups`, { page, page_size: pageSize });
}

export function fetchUpcomingTasks(withinHours = 168) {
  return apiFetch(`/instances/${INSTANCE_ID}/plan`, { within_hours: withinHours });
}
