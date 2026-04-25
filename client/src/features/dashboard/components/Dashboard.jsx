import { useEffect, useState } from "react";
import "./dashboard.css";
import api from '../../../shared/api/api.js';

function AppointmentSection() {
    const [appointments, setAppointments] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [cancellingRequestId, setCancellingRequestId] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadAppointments() {
            try {
                const [appointmentsResponse, requestsResponse] = await Promise.all([
                    api.get("/dashboard/appointments"),
                    api.get("/meeting-requests/user"),
                ]);
                if (!isMounted) return;
                setAppointments(appointmentsResponse.data);
                setRequests(requestsResponse.data.data || []);
                setError(null);
            } catch (error) {
                if (!isMounted) return;
                setError(error.response?.data?.message || "Failed to fetch dashboard");
            } finally {
                if (!isMounted) return;
                setLoading(false);
            }
        }

        loadAppointments();

        return () => {
            isMounted = false;
        };
    }, []);

    async function deleteAppointment(appointmentId) {
        setDeletingId(appointmentId);
        setError(null);

        try {
            await api.delete(`/bookings/${appointmentId}/appointment`);
            setAppointments((prev) =>
                prev.filter((appointment) => appointment._id !== appointmentId),
            );
        } catch (error) {
            setError(error.response?.data?.message || "Failed to delete appointment");
        } finally {
            setDeletingId(null);
        }
    }

    async function cancelRequest(requestId) {
        setCancellingRequestId(requestId);
        setError(null);

        try {
            const { data } = await api.patch(`/meeting-requests/${requestId}/cancel`);
            setRequests((prev) =>
                prev.map((request) =>
                    request._id === requestId ? data.data : request,
                ),
            );
        } catch (error) {
            setError(error.response?.data?.message || "Failed to cancel request");
        } finally {
            setCancellingRequestId(null);
        }
    }

    if (loading) return <div>Loading appointments</div>;
    if (error) return <div>Error encountered: {error}</div>;

    return (
        <div className="dashboard-list-sections">
            <section>
                <h3>Upcoming Appointments</h3>
                {appointments.length === 0 ? (
                    <p>No upcoming appointments</p>
                ) : (
                    <div className="appointments-list">
                        {appointments.map((appointment) => (
                            <UpcomingAppointment
                                key={appointment._id}
                                appointment={appointment}
                                deleting={deletingId === appointment._id}
                                onDelete={deleteAppointment}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h3>My Requests</h3>
                {requests.length === 0 ? (
                    <p>No meeting requests</p>
                ) : (
                    <div className="appointments-list">
                        {requests.map((request) => (
                            <RequestCard
                                key={request._id}
                                request={request}
                                cancelling={cancellingRequestId === request._id}
                                onCancel={cancelRequest}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function formatDateTime(value) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function UpcomingAppointment({ appointment, deleting, onDelete }) {
    return (
        <div className="appointment-card">
            <div>
                <h2>{appointment.title}</h2>
                <p>{appointment.description}</p>
                {appointment.ownerId && (
                    <p>With {appointment.ownerId.name}</p>
                )}
            </div>

            <div className="details">
                <div><strong>Start:</strong> {formatDateTime(appointment.startTime)}</div>
                <div><strong>End:</strong> {formatDateTime(appointment.endTime)}</div>
                <div><strong>Status:</strong> {appointment.status}</div>
                <div><strong>Visibility:</strong> {appointment.visibility}</div>
            </div>

            <div>
                {appointment.ownerId?.email && (
                    <a href={`mailto:${appointment.ownerId.email}`}>Email owner</a>
                )}
                <button
                    type="button"
                    disabled={deleting}
                    onClick={() => onDelete(appointment._id)}
                >
                    {deleting ? "Deleting..." : "Delete appointment"}
                </button>
            </div>
        </div>
    );
}

function RequestCard({ request, cancelling, onCancel }) {
    return (
        <div className="appointment-card">
            <div>
                <h2>{request.topic}</h2>
                {request.message && <p>{request.message}</p>}
                {request.ownerId && <p>With {request.ownerId.name}</p>}
            </div>

            <div className="details">
                <div><strong>Start:</strong> {formatDateTime(request.preferredStart)}</div>
                <div><strong>End:</strong> {formatDateTime(request.preferredEnd)}</div>
                <div><strong>Status:</strong> {request.status}</div>
            </div>

            <div>
                {request.ownerId?.email && (
                    <a href={`mailto:${request.ownerId.email}`}>Email teacher</a>
                )}
                {request.status === "PENDING" && (
                    <button
                        type="button"
                        disabled={cancelling}
                        onClick={() => onCancel(request._id)}
                    >
                        {cancelling ? "Cancelling..." : "Cancel request"}
                    </button>
                )}
            </div>
        </div>
    );
}


function Dashboard() {
    return (
        <section className="dashboard-appointments">
            <h2>Dashboard</h2>
            <AppointmentSection />
        </section>
    )
}

export default Dashboard
