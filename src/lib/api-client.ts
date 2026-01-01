/**
 * API Client for Lunavia Platform
 * Centralized API calls with error handling
 */

const API_BASE = "/api";

async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || error.message || "API request failed");
  }

  return response.json();
}

export const api = {
  // User & Profile
  user: {
    getInfo: () => fetchAPI("/user/info"),
    info: () => fetchAPI("/user/info"), // Alias for getInfo
    updateProfile: (data: any) =>
      fetchAPI("/user/profile", { method: "PUT", body: JSON.stringify(data) }),
  },

  // Companies
  companies: {
    list: (search?: string) =>
      fetchAPI(`/companies${search ? `?search=${encodeURIComponent(search)}` : ""}`),
    get: (id: string) => fetchAPI(`/companies/${id}`),
    create: (data: any) =>
      fetchAPI("/companies", { method: "POST", body: JSON.stringify(data) }),
    requestJoin: (companyId: string, message?: string) =>
      fetchAPI(`/companies/${companyId}/join-request`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    invite: (companyId: string, data: { guideId?: string; email?: string }) =>
      fetchAPI(`/companies/${companyId}/invite`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getGuides: (companyId: string) =>
      fetchAPI(`/companies/${companyId}/guides`),
    removeGuide: (companyId: string, guideId: string) =>
      fetchAPI(`/companies/${companyId}/guides?guideId=${guideId}`, {
        method: "DELETE",
      }),
    updateGuide: (companyId: string, data: { guideId: string; companyEmail?: string; status?: string; employmentContractUrl?: string }) =>
      fetchAPI(`/companies/${companyId}/guides`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // Tours
  tours: {
    list: (params?: { city?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.city) query.append("city", params.city);
      if (params?.search) query.append("search", params.search);
      return fetchAPI(`/tours${query.toString() ? `?${query}` : ""}`);
    },
    my: () => fetchAPI("/tours/my"),
    get: (id: string) => fetchAPI(`/tours/${id}`),
    create: (data: any) =>
      fetchAPI("/tours", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      fetchAPI(`/tours/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      fetchAPI(`/tours/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    updateVisibility: (id: string, visibility: string) =>
      fetchAPI(`/tours/${id}/visibility`, {
        method: "PUT",
        body: JSON.stringify({ visibility }),
      }),
    apply: (id: string, data: { role: string; coverLetter?: string }) =>
      fetchAPI(`/tours/${id}/apply`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getApplications: (id: string, params?: { status?: string; role?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append("status", params.status);
      if (params?.role) query.append("role", params.role);
      return fetchAPI(`/tours/${id}/applications${query.toString() ? `?${query}` : ""}`);
    },
    acceptApplication: (tourId: string, applicationId: string) =>
      fetchAPI(`/tours/${tourId}/applications/${applicationId}/accept`, {
        method: "POST",
      }),
    rejectApplication: (tourId: string, applicationId: string, reason?: string) =>
      fetchAPI(`/tours/${tourId}/applications/${applicationId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    moderate: (id: string, action: "block" | "unblock", data: { reason?: string; notes?: string }) =>
      fetchAPI(`/tours/${id}/moderate`, {
        method: "POST",
        body: JSON.stringify({ action, ...data }),
      }),
    assign: (id: string, data: { guideId: string; role: string }) =>
      fetchAPI(`/tours/${id}/assign`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    pay: (id: string, data: { guideId: string; amount: number }) =>
      fetchAPI(`/tours/${id}/pay`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getReports: (id: string) =>
      fetchAPI(`/tours/${id}/reports`),
    confirmTourAndLockPayment: (tourId: string, guideId: string, data: {
      paymentAmount: number;
      notes?: string;
    }) =>
      fetchAPI(`/tours/${tourId}/reports/${guideId}/confirm`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    requestPayment: (tourId: string) =>
      fetchAPI(`/tours/${tourId}/reports/request-payment`, {
        method: "POST",
      }),
    submitSOS: (tourId: string, data: {
      type: string;
      severity: string;
      description: string;
      location?: string;
    }) =>
      fetchAPI(`/tours/${tourId}/emergency`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getEmergencies: (tourId: string) =>
      fetchAPI(`/tours/${tourId}/emergencies`),
    getAIMatching: (
      tourId: string,
      criteria?: {
        prioritizeExperience?: boolean;
        prioritizeRating?: boolean;
        prioritizeLanguages?: string[];
        minRating?: number;
        minExperience?: number;
      }
    ) => {
      const params = new URLSearchParams();
      if (criteria?.prioritizeExperience) {
        params.append("prioritizeExperience", "true");
      }
      if (criteria?.prioritizeRating) {
        params.append("prioritizeRating", "true");
      }
      if (criteria?.prioritizeLanguages?.length) {
        params.append("prioritizeLanguages", criteria.prioritizeLanguages.join(","));
      }
      if (criteria?.minRating) {
        params.append("minRating", criteria.minRating.toString());
      }
      if (criteria?.minExperience) {
        params.append("minExperience", criteria.minExperience.toString());
      }
      return fetchAPI(`/tours/${tourId}/ai-matching?${params.toString()}`);
    },
    cancelApplication: (applicationId: string, reason?: string) =>
      fetchAPI(`/applications/${applicationId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    delete: (id: string) =>
      fetchAPI(`/tours/${id}/delete`, {
        method: "DELETE",
      }),
  },

  // Applications
  applications: {
    list: (params?: { status?: string; role?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append("status", params.status);
      if (params?.role) query.append("role", params.role);
      return fetchAPI(`/applications${query.toString() ? `?${query}` : ""}`);
    },
  },

  // Assignments
  assignments: {
    list: (params?: { status?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append("status", params.status);
      return fetchAPI(`/assignments${query.toString() ? `?${query}` : ""}`);
    },
    accept: (id: string) =>
      fetchAPI(`/assignments/${id}/accept`, {
        method: "POST",
      }),
    reject: (id: string, reason: string) =>
      fetchAPI(`/assignments/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
  },

  // Guides
  guides: {
    list: (params?: {
      city?: string;
      search?: string;
      availabilityStatus?: string;
      specialties?: string[];
      languages?: string[];
    }) => {
      const query = new URLSearchParams();
      if (params?.city) query.append("city", params.city);
      if (params?.search) query.append("search", params.search);
      if (params?.availabilityStatus)
        query.append("availabilityStatus", params.availabilityStatus);
      if (params?.specialties)
        query.append("specialties", params.specialties.join(","));
      if (params?.languages)
        query.append("languages", params.languages.join(","));
      return fetchAPI(`/guides${query.toString() ? `?${query}` : ""}`);
    },
    getProfile: (id: string) => fetchAPI(`/guides/${id}/profile`),
  },

  // Wallet
  wallet: {
    topup: (data: { 
      amount: number; 
      method: string;
      paymentMethodId?: string;
      customAccountInfo?: string;
    }) =>
      fetchAPI("/wallet/topup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    withdrawal: (data: {
      amount: number;
      method: string;
      paymentMethodId?: string;
      customAccountInfo?: string;
      accountOwnerName?: string;
    }) =>
      fetchAPI("/wallet/withdrawal", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getTransactions: () => fetchAPI("/wallet/transactions"),
    getTotalSpent: () => fetchAPI("/wallet/total-spent"),
    getTotalEarned: () => fetchAPI("/wallet/total-earned"),
  },
  guide: {
    getAnalytics: () => fetchAPI("/guide/analytics"),
  },
  settings: {
    get: () => fetchAPI("/settings"),
    update: (data: any) =>
      fetchAPI("/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    updateAccount: (data: {
      currentPassword?: string;
      newPassword?: string;
      newEmail?: string;
    }) =>
      fetchAPI("/settings/account", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // Notifications
  notifications: {
    list: (params?: { read?: boolean; type?: string }) => {
      const query = new URLSearchParams();
      if (params?.read !== undefined) query.append("read", String(params.read));
      if (params?.type) query.append("type", params.type);
      return fetchAPI(`/notifications${query.toString() ? `?${query}` : ""}`);
    },
    markRead: (id: string) =>
      fetchAPI(`/notifications/${id}/read`, { method: "PUT" }),
  },

  // Verifications
  verifications: {
    submitKYC: (documents: string[]) =>
      fetchAPI("/verifications/kyc", {
        method: "POST",
        body: JSON.stringify({ documents }),
      }),
    submitKYB: (documents: string[]) =>
      fetchAPI("/verifications/kyb", {
        method: "POST",
        body: JSON.stringify({ documents }),
      }),
  },

  // Cities
  cities: {
    list: (params?: { region?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.region) query.append("region", params.region);
      if (params?.search) query.append("search", params.search);
      return fetchAPI(`/cities${query.toString() ? `?${query}` : ""}`);
    },
  },

  // Operator
  operator: {
    getAnalytics: () => fetchAPI("/operator/analytics"),
    getPaymentRequests: (params?: { status?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append("status", params.status);
      return fetchAPI(`/operator/payment-requests${query.toString() ? `?${query}` : ""}`);
    },
    approvePaymentRequest: (requestId: string) =>
      fetchAPI(`/operator/payment-requests/${requestId}/approve`, {
        method: "POST",
      }),
    rejectPaymentRequest: (requestId: string) =>
      fetchAPI(`/operator/payment-requests/${requestId}/reject`, {
        method: "POST",
      }),
  },

  // Messages
  messages: {
    getConversations: () => fetchAPI("/messages/conversations"),
    getOrCreateConversation: (tourId: string, guideId: string) =>
      fetchAPI("/messages/conversations", {
        method: "POST",
        body: JSON.stringify({ tourId, guideId }),
      }),
    getMessages: (conversationId: string) =>
      fetchAPI(`/messages/conversations/${conversationId}/messages`),
    sendMessage: (conversationId: string, content: string) =>
      fetchAPI(`/messages/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
  },

  // Admin
  admin: {
    tours: {
      list: (params?: { status?: string; city?: string; search?: string }) => {
        const query = new URLSearchParams();
        if (params?.status) query.append("status", params.status);
        if (params?.city) query.append("city", params.city);
        if (params?.search) query.append("search", params.search);
        return fetchAPI(`/admin/tours${query.toString() ? `?${query}` : ""}`);
      },
      delete: (id: string) =>
        fetchAPI(`/admin/tours/${id}/delete`, {
          method: "DELETE",
        }),
    },
    users: {
      list: (params?: { role?: string; search?: string; verified?: string }) => {
        const query = new URLSearchParams();
        if (params?.role) query.append("role", params.role);
        if (params?.search) query.append("search", params.search);
        if (params?.verified) query.append("verified", params.verified);
        return fetchAPI(`/admin/users${query.toString() ? `?${query}` : ""}`);
      },
      get: (id: string) => fetchAPI(`/admin/users/${id}`),
      block: (id: string, action: "block" | "unblock", data: { reason?: string; notes?: string }) =>
        fetchAPI(`/admin/users/${id}/block`, {
          method: "POST",
          body: JSON.stringify({ action, ...data }),
        }),
      delete: (id: string) =>
        fetchAPI(`/admin/users/${id}/delete`, {
          method: "DELETE",
        }),
    },
  },
  standby: {
    create: async (data: {
      title: string;
      city: string;
      requiredDate: string;
      budget: number;
      standbyFee?: number;
      mainGuideId?: string;
      subGuideId?: string;
      description?: string;
    }) => {
      const res = await fetch("/api/standby-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    list: async (status?: string) => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      const res = await fetch(`/api/standby-requests?${params}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    accept: async (id: string) => {
      const res = await fetch(`/api/standby-requests/${id}/accept`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    reject: async (id: string, reason?: string) => {
      const res = await fetch(`/api/standby-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
  availability: {
    get: async (startDate: string, endDate: string) => {
      const params = new URLSearchParams();
      params.set("startDate", startDate);
      params.set("endDate", endDate);
      const res = await fetch(`/api/guides/availability?${params}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    update: async (data: {
      status?: "AVAILABLE" | "BUSY" | "ON_TOUR";
      date?: string;
      slots?: any[];
    }) => {
      const res = await fetch("/api/guides/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  },
  escrow: {
    list: (params?: { tourId?: string; guideId?: string; operatorId?: string }) => {
      const query = new URLSearchParams();
      if (params?.tourId) query.append("tourId", params.tourId);
      if (params?.guideId) query.append("guideId", params.guideId);
      if (params?.operatorId) query.append("operatorId", params.operatorId);
      return fetchAPI(`/escrow${query.toString() ? `?${query}` : ""}`);
    },
    create: (data: {
      guideId: string;
      tourId?: string;
      standbyRequestId?: string;
      amount: number;
    }) =>
      fetchAPI("/escrow/create", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    lock: (id: string) =>
      fetchAPI(`/escrow/${id}/lock`, {
        method: "POST",
      }),
    release: (id: string, reason?: string) =>
      fetchAPI(`/escrow/${id}/release`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    refund: (id: string, reason?: string) =>
      fetchAPI(`/escrow/${id}/refund`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
  },
  disputes: {
    list: (params?: { tourId?: string; status?: string; type?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.tourId) searchParams.set("tourId", params.tourId);
      if (params?.status) searchParams.set("status", params.status);
      if (params?.type) searchParams.set("type", params.type);
      return fetchAPI(`/disputes?${searchParams.toString()}`);
    },
    get: (id: string) => fetchAPI(`/disputes/${id}`),
    create: (data: {
      tourId?: string;
      applicationId?: string;
      paymentId?: string;
      escrowAccountId?: string;
      type: string;
      description: string;
      evidence?: string[];
    }) => fetchAPI("/disputes", { method: "POST", body: JSON.stringify(data) }),
    addEvidence: (id: string, evidenceUrls: string[]) =>
      fetchAPI(`/disputes/${id}/evidence`, {
        method: "POST",
        body: JSON.stringify({ evidenceUrls }),
      }),
    escalate: (id: string) => fetchAPI(`/disputes/${id}/escalate`, { method: "POST" }),
    resolve: (id: string, data: {
      resolution: string;
      resolutionAmount?: number;
      resolutionNotes?: string;
    }) =>
      fetchAPI(`/disputes/${id}/resolve`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    reject: (id: string, reason?: string) =>
      fetchAPI(`/disputes/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    appeal: (id: string, appealDescription: string) =>
      fetchAPI(`/disputes/${id}/appeal`, {
        method: "POST",
        body: JSON.stringify({ appealDescription }),
      }),
  },
};

