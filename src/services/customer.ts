import { http } from "./http";

export interface CustomerProfile {
  id: string;
  name: string;
  address: string;
  email?: string;
  gender?: string;
  birthDate?: string;
}

export async function loginCustomer(identifier: string, password: string) {
  const { data } = await http.post("/api/customer/login", { identifier, password });
  return data;
}

export async function logoutCustomer() {
  const res = await fetch("/api/customer/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Logout failed");
  }
  return res.json();
}

export async function fetchCustomerProfile(): Promise<CustomerProfile> {
  const { data } = await http.get("/api/customer/profile");
  return data.user;
}

export async function updateCustomerProfile(data: Partial<CustomerProfile>) {
  const { data: responseData } = await http.patch("/api/customer/profile", data);
  return responseData;
}
