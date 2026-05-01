// EnYi Hou (261165635)

import api from "../../shared/api/api.js";

export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}


export async function login(formData) {
  const response = await api.post("/auth/login", formData);
  return response.data;
}

export async function register(formData) {
  const response = await api.post("/auth/register", formData);
  return response.data;
}

export async function logout() {
  const response = await api.post("/auth/logout");
  return response.data;
}
