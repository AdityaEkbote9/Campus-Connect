const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const token = localStorage.getItem("campus-connect-token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.details ? `${data.message} ${data.details}` : data.message ?? "Request failed");
  }

  return data;
};

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) })
};
