import { useEffect, useState } from "react";
import "./dashboard.css";
import api from '../../../shared/api/api.js';

function AppointmentSection() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadAppointments() {
            try {
                const { data } = await api.get("/dashboard/appointments");
                if (!isMounted) return;
                setAppointments(data);
                setError(null);
            } catch (error) {
                if (!isMounted) return;
                setError(error.response?.data?.message || "Failed to fetch appointments");
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

    if (loading) return <div>Loading appointments</div>;
    if (error) return <div>Error encountered: {error}</div>;
    if (appointments.length === 0) return <div>No upcoming appointments</div>;

    return (
        <div className="appointments-list">
            {appointments.map((appointment) => (
                <UpcomingAppointment
                    key={appointment._id}
                    appointment={appointment}
                />
            ))}
        </div>
    );
}

function formatDateTime(value) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function UpcomingAppointment({ appointment }) {
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
                <button>Delete appointment</button>
            </div>
        </div>
    );
}


function Dashboard() {
    return (
        <section className="dashboard-appointments">
            <h2>Upcoming Appointments</h2>
            <AppointmentSection />
        </section>
    )
}

export default Dashboard
