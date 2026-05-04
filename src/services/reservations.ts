import type { ReservationDTO } from "@/types";
import { http } from "./http";

export async function createReservation(payload: {
  fullName: string;
  phone: string;
  guests: number;
  reservationDate: string;
  reservationTime: string;
  notes?: string;
}): Promise<ReservationDTO> {
  const { data } = await http.post<ReservationDTO>("/api/reservations", payload);
  return data;
}

export async function fetchReservationsAdmin(): Promise<ReservationDTO[]> {
  const { data } = await http.get<ReservationDTO[]>("/api/reservations");
  return data;
}

export async function updateReservationStatusAdmin(
  id: string,
  status: "pending" | "confirmed" | "rejected"
): Promise<void> {
  await http.put(`/api/reservations/${id}`, { status });
}

export async function deleteReservationAdmin(id: string): Promise<void> {
  await http.delete(`/api/reservations/${id}`);
}
