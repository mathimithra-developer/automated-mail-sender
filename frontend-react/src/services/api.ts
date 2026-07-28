// API Service Wrapper for MailFlow REST API

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'OWNCHAT-API-KEY': 'JWjSOZ4sDsxE-gRK3yRf-FHD0LFfSiv9nFpVsjlV',
      'OWNCHAT-API-SECRET': 'C_Pg-fMf5kDA_nvkMXrZMSKO5VD6qiAPhSprcFlw',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  const response = await fetch(endpoint, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  get: <T = any>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T = any>(url: string, body?: any) =>
    request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  postFormData: async <T = any>(url: string, formData: FormData): Promise<T> => {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'OWNCHAT-API-KEY': 'JWjSOZ4sDsxE-gRK3yRf-FHD0LFfSiv9nFpVsjlV',
        'OWNCHAT-API-SECRET': 'C_Pg-fMf5kDA_nvkMXrZMSKO5VD6qiAPhSprcFlw',
      },
      credentials: 'include',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }
    return data;
  },
  patch: <T = any>(url: string, body?: any) =>
    request<T>(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(url: string) => request<T>(url, { method: 'DELETE' }),
};

// OwnChat Campaign API service helpers
export const campaignApi = {
  // 1. Campaign List
  getCampaigns: (page = 1, limit = 30, filterValue = '', getAllType = 'all-campaigns', filterType = 'bulk_csv') =>
    api.post(`/apis/v1/campaign?page=${page}&limit=${limit}`, {
      filterValue,
      getAllType,
      filterType,
    }),

  // 2. Overall Campaign Count
  getOverallCount: (filterType = 'bulk_csv') =>
    api.post('/apis/v1/campaign/get-over-all-count', {
      filterType,
    }),

  // 3. ROI Analytics
  getRoiAnalytics: (campaignId: string) =>
    api.post('/apis/v1/roi/analytics/campaigns', {
      campaignId,
    }),

  // 4. Campaign Basic Details
  getBasicDetail: (campaignId: string) =>
    api.post('/apis/v1/campaign/get-basic-detail', {
      campaignId,
    }),

  // 5. Campaign Insights
  getInsights: (campaignId: string, filterType = 'all', buttonClicked = '') =>
    api.post('/apis/v1/campaign/get-insights-v2', {
      campaignId,
      filterType,
      buttonClicked,
    }),
};
