import { useCallback, useEffect, useRef, useState } from "react";
import useConfirmationDialog from "../../components/confirmation/useConfirmationDialog.jsx";
import api from "../../shared/api/api.js";
import { useAuth } from "../../features/auth/useAuth.js";
import "./TeamFinder.css";

// Main: Ronald Zhang

export default function TeamFinder() {
    const [myTeams, setMyTeams] = useState([]);
    const [searchedTeams, setSearchedTeams] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const hasLoadedOnce = useRef(false);

    const fetchData = useCallback(async () => {
        if (!hasLoadedOnce.current) {
            setLoading(true);
        } else {
            setSearching(true);
        }

        try {
            const trimmedSearch = searchQuery.trim();
            const [myRes, searchRes] = await Promise.all([
                api.get("/teams"),
                api.get(`/teams/search${trimmedSearch ? `?query=${encodeURIComponent(trimmedSearch)}` : ""}`)
            ]);
            setMyTeams(myRes.data);
            setSearchedTeams(searchRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            hasLoadedOnce.current = true;
            setLoading(false);
            setSearching(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <p>Loading teams...</p>;
    }


    return (
        <div className="team-finder page-stack">
            <header className="team-finder-header">
                <h1>Tinder</h1>
                <p>Find partners for your courses or manage your existing teams.</p>
                <button 
                    className="button"
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create Team
                </button>
            </header>

            <div className="team-finder-content">
                <section className="team-finder-section">
                    <h2>My Teams</h2>
                    <TeamsListBox 
                        teams={myTeams} 
                        onViewTeam={setSelectedTeam} 
                        onRefresh={fetchData}
                    />
                </section>

                <section className="team-finder-section">
                    <h2>Find Teams</h2>
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                    {searching && <p className="search-status">Searching...</p>}
                    <TeamsListBox 
                        teams={searchedTeams} 
                        onViewTeam={setSelectedTeam} 
                        onRefresh={fetchData}
                    />
                </section>
            </div>

            {selectedTeam && (
                <TeamCardView 
                    team={selectedTeam} 
                    onClose={() => setSelectedTeam(null)} 
                    onRefresh={fetchData}
                />
            )}

            {showCreateModal && (
                <CreateTeamModal 
                    onClose={() => setShowCreateModal(false)} 
                    onRefresh={fetchData}
                />
            )}
        </div>
    );
}

function TeamsListBox({ teams, onViewTeam, onRefresh }) {
    const validTeams = Array.isArray(teams) ? teams.filter(t => t && t._id) : [];
    
    if (validTeams.length === 0) {
        return <div className="no-teams">No teams found in this category.</div>;
    }
    return (
        <div className="teams-list-box">
            {validTeams.map((team) => (
                <TeamCard 
                    key={team._id} 
                    team={team} 
                    onView={() => onViewTeam(team)} 
                    onRefresh={onRefresh}
                />
            ))}
        </div>
    );
}

function TeamCard({ team, onView, onRefresh }) {
    const { user } = useAuth();
    if (!team) return null;
    
    const isMember = Array.isArray(team.members) && team.members.some(m => {
        if (!m) return false;
        const memberId = m._id || m;
        return memberId === user?.id;
    });

    return (
    <div className="team-card">
        <div className="team-card-top">
            <span className="team-card-name">{team.name}</span>
            <span className="team-card-course">{team.course}</span>
        </div>
        <div className="team-card-members">
            👥 {team.members?.length || 0} / {team.size} members
        </div>
        <div className="team-card-body">
            <span>👑 {team.leader?.name || "Unknown Leader"}</span>
            {team.leader?.email && (
                <span><a href={`mailto:${team.leader.email}`}>{team.leader.email}</a></span>
            )}
        </div>
        <div className="team-card-middle">
            <p>{team.description?.length > 120 ? team.description.substring(0, 120) + "..." : team.description}</p>
        </div>
        <div className="team-card-bottom">
            <button className="button button-secondary" onClick={onView}>View Details</button>
            {!isMember && <JoinButton team={team} onRefresh={onRefresh} />}
            {team.leader?._id === user?.id && <DeleteButton team={team} onRefresh={onRefresh} />}
        </div>
    </div>
    );
}

function TeamCardView({ team, onClose, onRefresh }) {
    const { user } = useAuth();
    const { confirm, confirmationDialog } = useConfirmationDialog();
    if (!team) return null;

    const isMember = Array.isArray(team.members) && team.members.some(m => {
        if (!m) return false;
        const memberId = m._id || m;
        return memberId === user?.id;
    });

    const members = Array.isArray(team.members) ? team.members.filter(Boolean) : [];

    const handleRemoveMember = async (teamId, memberId) => {
        const confirmed = await confirm({
            title: "Remove member?",
            message: "This person will be removed from the team.",
            confirmLabel: "Remove",
        });
        if (!confirmed) return;

        try {
            await api.post(`/teams/${teamId}/remove/${memberId}`);
            onRefresh();
        } catch (error) {
            console.error("Failed to remove member", error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-modal" onClick={onClose}>&times;</button>
                <div className="team-card-view-top">
                    <h2>{team.name}</h2>
                    <span className="team-card-course">{team.course}</span>
                </div>
                
                <div className="team-details">
                    <p className="description">{team.description}</p>
                    
                    <div className="member-list">
                        <h3>Members ({members.length}/{team.size})</h3>
                        {members.map((member) => (
                            <div key={member._id || member} className="team-card-view-body-member">
                                <div>
                                    <span>{member._id === team.leader?._id ? <span>👑</span> : null} {member.name || "Unknown User"}</span>
                                    {member.email && (
                                        <span> - <a href={`mailto:${member.email}`}>{member.email}</a></span>
                                    )}
                                </div>
                                {team.leader?._id === user?.id && member._id !== user?.id && (
                                    <button 
                                        className="remove-member-btn"
                                        onClick={() => handleRemoveMember(team._id, member._id)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="team-card-view-bottom">
                    {isMember ? (
                        <LeaveButton team={team} onRefresh={() => { onClose(); onRefresh(); }} />
                    ) : (
                        <JoinButton team={team} onRefresh={onRefresh} />
                    )}
                </div>
            </div>
            {confirmationDialog}
        </div>
    );
}

function SearchBar({ value, onChange }) {
    return (
        <div className="search-bar">
            <input 
                type="text" 
                placeholder="Search by course (e.g. COMP 307)" 
                value={value}
                maxLength={100}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function LeaveButton({ team, onRefresh }) {
    const { confirm, confirmationDialog } = useConfirmationDialog();

    const handleLeave = async () => {
        const confirmed = await confirm({
            title: "Leave team?",
            message: "You will no longer be listed as a member of this team.",
            confirmLabel: "Leave team",
        });
        if (!confirmed) return;

        try {
            await api.post(`/teams/${team._id}/leave`);
            onRefresh();
        } catch (error) {
            console.error("Failed to leave team", error);
        }
    };

    return (
        <>
            <button className="button button-secondary" onClick={handleLeave} style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }}>Leave Team</button>
            {confirmationDialog}
        </>
    );
}

function DeleteButton({ team, onRefresh }) {
    const { confirm, confirmationDialog } = useConfirmationDialog();

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: "Delete team?",
            message: "This permanently removes the team and cannot be undone.",
            confirmLabel: "Delete team",
        });
        if (!confirmed) return;

        try {
            await api.delete(`/teams/${team._id}`);
            onRefresh();
        } catch (error) {
            console.error("Failed to delete team", error);
        }
    };

    return (
        <>
            <button className="button button-secondary" onClick={handleDelete} style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }}>Delete Team</button>
            {confirmationDialog}
        </>
    );
}

function JoinButton({ team, onRefresh }) {
    const [status, setStatus] = useState("Join");
    const [loading, setLoading] = useState(false);

    const handleJoin = async () => {
        setLoading(true);
        try {
            await api.post(`/teams/${team._id}/join`);
            setStatus("Joined");
            onRefresh();
        } catch (error) {
            const msg = error.response?.data?.message;
            if (msg === "Already in team") setStatus("Joined");
            else if (msg === "Team is full") setStatus("Full");
            else setStatus("Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            className="button" 
            onClick={handleJoin} 
            disabled={loading || status !== "Join"}
        >
            {loading ? "Processing..." : status}
        </button>
    );
}

// AI generated this regex because I do not know my regexes
const courseCodeRegex = /^[A-Za-z]{3,4} \d{3}$/;

function CreateTeamModal({ onClose, onRefresh }) {
    const [formData, setFormData] = useState({
        name: "",
        course: "",
        description: "",
        size: 3
    });
    const [courseError, setCourseError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!courseCodeRegex.test(formData.course.trim())) {
            setCourseError("Course code must be 3–4 letters, a space, then 3 digits (e.g. COMP 307).");
            return;
        }
        setCourseError("");

        try {
            await api.post("/teams", formData);
            console.log("Team created successfully!");
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Failed to create team", error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-modal" onClick={onClose}>&times;</button>
                <h2>Create a New Team</h2>
                <form onSubmit={handleSubmit} className="create-team-form">
                    <div className="form-group">
                        <label>Team Name</label>
                        <input 
                            type="text" 
                            required 
                            maxLength={50}
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Course</label>
                        <input 
                            type="text" 
                            required 
                            maxLength={10}
                            placeholder="e.g. COMP 307"
                            value={formData.course}
                            onChange={e => {
                                setFormData({...formData, course: e.target.value});
                                setCourseError("");
                            }}
                        />
                        {courseError && (
                            <span style={{ color: "var(--color-danger)", fontSize: "var(--font-size-sm)" }}>
                                {courseError}
                            </span>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Max Size</label>
                        <input 
                            type="number" 
                            min="2" 
                            max="10" 
                            required 
                            value={formData.size}
                            onChange={e => setFormData({...formData, size: parseInt(e.target.value)})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            required 
                            maxLength={200}
                            rows="4"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            style={{ resize: "none" }}
                        ></textarea>
                    </div>
                    <button type="submit" className="button">Create Team</button>
                </form>
            </div>
        </div>
    );
}
