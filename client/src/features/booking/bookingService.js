import api from "../../shared/api/api.js";

export async function getOwnerBookings(ownerId, userId) {
    const response = await api.get("/bookings/owner", {
        params: {
            ownerId,
            userId,
        }
    });
    return response.data.data;
}

export async function acceptBooking(bookingId, userId) {
    const response = await api.post(`/bookings/${bookingId}/accept`, {
        userId,
    });
    return response.data;
}
