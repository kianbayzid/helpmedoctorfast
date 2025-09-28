const baseURL = import.meta.env.VITE_API_URL;

export const httpClient = {
  async get(endpoint: string) {
    const response = await fetch(`${baseURL}${endpoint}`);
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  },

  async post(endpoint: string, data: unknown) {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  },

  async patch(endpoint: string, data: unknown) {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  },
};