import React from 'react';
import { useEffect, useState } from "react";
import "./dashboard.css";



function AppointmentSection() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("sending");

        fetch("http://localhost:3000/api/dashboard/appointments")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch appointments");
                }
                return response.json();
            })
            .then((data) => {
                setAppointments(data);
            })
            .catch((error) => {
                console.log("fetch error:", error);
                setError(error.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading appointments</div>;
    if (error) return <div>Error encountered: {error}</div>;

    return (
        <div>
            {appointments.map((item, index) => (
                <div className="test" key={index}>{item}</div>
            ))}
        </div>
    );
}




function Dashboard() {
    return (
        <div>
            <AppointmentSection />
        </div>
    )
}

export default Dashboard
