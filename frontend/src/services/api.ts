const API_BASE_URL = 'http://localhost:3000/api/v1';

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags?: string;
  content?: string;
  excerpt?: string;
}

export interface Script {
  id: string;
  title: string;
  scenario: string;
  content: string;
}

export interface Document {
  id: string;
  title: string;
  status: string;
  contentEncrypted?: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  encryptedData?: string;
  createdAt: string;
  updatedAt: string;
}

const getHeaders = () => {
  const token = localStorage.getItem('kinready_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const apiService = {
  // Auth
  register: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  login: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  // Education
  getArticles: async (): Promise<Article[]> => {
    const response = await fetch(`${API_BASE_URL}/content/education`);
    if (!response.ok) throw new Error('Failed to fetch articles');
    return response.json();
  },

  getArticleBySlug: async (slug: string): Promise<Article> => {
    const response = await fetch(`${API_BASE_URL}/content/education/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch article');
    return response.json();
  },

  // Scripts
  getScripts: async (): Promise<Script[]> => {
    const response = await fetch(`${API_BASE_URL}/content/scripts`);
    if (!response.ok) throw new Error('Failed to fetch scripts');
    return response.json();
  },

  getScriptById: async (id: string): Promise<Script> => {
    const response = await fetch(`${API_BASE_URL}/content/scripts/${id}`);
    if (!response.ok) throw new Error('Failed to fetch script');
    return response.json();
  },

  // Documents
  getDocuments: async (): Promise<Document[]> => {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  getDocumentById: async (id: string): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch document');
    return response.json();
  },

  createDocument: async (data: { title: string; contentEncrypted: string; templateId?: string }): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create document');
    return response.json();
  },

  updateDocument: async (id: string, data: Partial<Document>): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update document');
    return response.json();
  },

  deleteDocument: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete document');
    return response.json();
  },

  // Vault
  getVaultItems: async (): Promise<VaultItem[]> => {
    const response = await fetch(`${API_BASE_URL}/vault`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch vault items');
    return response.json();
  },

  getVaultItemById: async (id: string): Promise<VaultItem> => {
    const response = await fetch(`${API_BASE_URL}/vault/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch vault item');
    return response.json();
  },

  createVaultItem: async (data: { title: string; description?: string; encryptedData: string; category?: string }): Promise<VaultItem> => {
    const response = await fetch(`${API_BASE_URL}/vault`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create vault item');
    return response.json();
  },

  updateVaultItem: async (id: string, data: Partial<VaultItem>): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/vault/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update vault item');
    return response.json();
  },

  deleteVaultItem: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/vault/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete vault item');
    return response.json();
  },

  // Workflows
  getWorkflows: async () => {
    const response = await fetch(`${API_BASE_URL}/workflows`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch workflows');
    return response.json();
  },

  getWorkflowById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/workflows/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch workflow');
    return response.json();
  },

  getWorkflowProgress: async (workflowId: string) => {
    const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/progress`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch workflow progress');
    return response.json();
  },

  updateWorkflowProgress: async (workflowId: string, stepId: string, status: string, data?: string) => {
    const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}/steps/${stepId}/progress`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status, data }),
    });
    if (!response.ok) throw new Error('Failed to update workflow progress');
    return response.json();
  },

  // MFA
  setupMFA: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/mfa/setup`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to setup MFA');
    return response.json();
  },

  verifyMFA: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/mfa/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ token }),
    });
    if (!response.ok) throw new Error('Failed to verify MFA');
    return response.json();
  },

  updateMe: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update user profile');
    return response.json();
  },

  deleteMe: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete account');
    return response.json();
  },

  exportData: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me/export`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to export data');
    return response.json();
  },

  changePassword: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to change password');
    return response.json();
  },
};
