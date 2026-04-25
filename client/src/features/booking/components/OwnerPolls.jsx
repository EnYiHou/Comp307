import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import api from "../../../shared/api/api.js";
import {
    formatTimeRange,
    getDateOnly,
} from "../utils/bookingCalendarUtils.js";
import "./BookingSlotCreation.css";

function getHeatColor(voteCount) {
    const MAX_VOTE_COUNT = 5;

    if (voteCount <= 0) {
        return "rgba(226, 232, 240, 0.45)";
    }

    const cappedVoteCount = Math.min(voteCount, MAX_VOTE_COUNT);
    const intensity = cappedVoteCount / MAX_VOTE_COUNT;
    const lightness = 92 - intensity * 42;
    return `hsl(199, 89%, ${lightness}%)`;
}

function getFinalSlotId(poll) {
    if (!poll?.finalSelection?.startTime || !poll?.finalSelection?.endTime) {
        return "";
    }

    const finalStartMs = new Date(poll.finalSelection.startTime).getTime();
    const finalEndMs = new Date(poll.finalSelection.endTime).getTime();

    const matchingSlot = poll.candidateSlots.find((slot) => {
        return (
            new Date(slot.startTime).getTime() === finalStartMs &&
            new Date(slot.endTime).getTime() === finalEndMs
        );
    });

    return matchingSlot ? String(matchingSlot._id) : "";
}

function formatFinalSelection(finalSelection) {
    if (!finalSelection?.startTime || !finalSelection?.endTime) {
        return "Not selected yet";
    }

    return `${getDateOnly(finalSelection.startTime)} ${formatTimeRange(
        finalSelection.startTime,
        finalSelection.endTime,
    )}`;
}

function getStatusLabel(status) {
    if (status === "finalized") {
        return "Finalized";
    }

    if (status === "cancelled") {
        return "Cancelled";
    }

    return "Collecting votes";
}

function OwnerPolls() {
    const [polls, setPolls] = useState([]);
    const [selectedPollId, setSelectedPollId] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api
            .get("dashboard/getPolls")
            .then((response) => {
                setPolls(
                    response.data.filter((poll) => poll.status === "collectingVotes"),
                );
            })
            .catch((error) => {
                console.error("Error: ", error);
                setError(error.response?.data?.message || "Failed to load polls.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const selectedPoll = useMemo(() => {
        return polls.find((poll) => poll._id === selectedPollId) ?? null;
    }, [polls, selectedPollId]);

    function removePoll(pollId) {
        setPolls((prev) => {
            return prev.filter((poll) => String(poll._id) !== String(pollId));
        });
        setSelectedPollId("");
    }

    if (loading) {
        return <p>Loading polls...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <section>
            <PollList polls={polls} setSelectedPollId={setSelectedPollId} />
            <PollDetails poll={selectedPoll} onLocalChange={removePoll} />
        </section>
    );
}

function PollList({ polls, setSelectedPollId }) {
    return (
        <section>
            <div>
                <h3>Your Polls</h3>
            </div>
            <div>
                {polls.length === 0 && <p>No polls created yet.</p>}
                {polls.map((poll) => {
                    return (
                        <button
                            key={poll._id}
                            type="button"
                            onClick={() => setSelectedPollId(poll._id)}
                        >
                            <div>{poll.title}</div>
                            <p>{poll.description || "No description provided."}</p>
                            <div>
                                <div>Status: {getStatusLabel(poll.status)}</div>
                                <div>
                                    Final date: {formatFinalSelection(poll.finalSelection)}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function PollDetails({ poll, onLocalChange }) {
    if (!poll) {
        return (
            <section>
                <h3>Select a Poll</h3>
            </section>
        );
    }

    return (
        <PollDecisionDetails
            key={poll._id}
            poll={poll}
            onFinalize={onLocalChange}
        />
    );
}

function PollDecisionDetails({ poll, onFinalize }) {
    const [selectedFinalSlotId, setSelectedFinalSlotId] = useState(() =>
        getFinalSlotId(poll),
    );
    const [saveMessage, setSaveMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedFinalSlot = useMemo(() => {
        return (
            poll.candidateSlots.find(
                (slot) => String(slot._id) === String(selectedFinalSlotId),
            ) ?? null
        );
    }, [poll.candidateSlots, selectedFinalSlotId]);

    function setFinalSlotSelection(slotId) {
        setSelectedFinalSlotId(String(slotId));
        setSaveMessage("");
    }

    function finalizePollDecision() {
        if (!selectedFinalSlotId) {
            return;
        }

        setIsSubmitting(true);
        api
            .patch(`/dashboard/pollDecision/${poll._id}`, {
                finalSlotId: selectedFinalSlotId,
            })
            .then(() => {
                onFinalize(poll._id);
            })
            .catch((error) => {
                console.error("Failed to save final selection:", error);
                setSaveMessage("Failed to save changes.");
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }

    if (poll.method === "calendar") {
        return (
            <section>
                {saveMessage && <p>{saveMessage}</p>}
                <CalendarPoll
                    poll={poll}
                    selectedFinalSlot={selectedFinalSlot}
                    selectedFinalSlotId={selectedFinalSlotId}
                    onSelectFinalSlot={setFinalSlotSelection}
                    onFinalizePoll={finalizePollDecision}
                    isSubmitting={isSubmitting}
                />
            </section>
        );
    } else if (poll.method === "heatmap") {
        return (
            <section>
                {saveMessage && <p>{saveMessage}</p>}
                <HeatmapPoll
                    poll={poll}
                    selectedFinalSlot={selectedFinalSlot}
                    selectedFinalSlotId={selectedFinalSlotId}
                    onSelectFinalSlot={setFinalSlotSelection}
                    onFinalizePoll={finalizePollDecision}
                    isSubmitting={isSubmitting}
                />
            </section>
        );
    }

    return null;
}

function CalendarPoll({
    poll,
    selectedFinalSlot,
    selectedFinalSlotId,
    onSelectFinalSlot,
    onFinalizePoll,
    isSubmitting,
}) {
    const calendarEvents = useMemo(() => {
        return poll.candidateSlots.map((slot) => {
            const isFinal = String(slot._id) === selectedFinalSlotId;

            return {
                id: String(slot._id),
                start: slot.startTime,
                end: slot.endTime,
                backgroundColor: isFinal ? "#0f766e" : undefined,
                borderColor: isFinal ? "#0f766e" : undefined,
                extendedProps: {
                    voteCount: slot.voteCount,
                    isFinal,
                },
            };
        });
    }, [poll.candidateSlots, selectedFinalSlotId]);

    function renderEventContent(info) {
        return (
            <section>
                <div>{formatTimeRange(info.event.start, info.event.end)}</div>
                <div>Votes: {info.event.extendedProps.voteCount}</div>
                {info.event.extendedProps.isFinal && <div>Final selection</div>}
            </section>
        );
    }

    return (
        <section>
            <h3>{poll.title}</h3>
            <p>{poll.description} Click a candidate slot, then confirm the final decision.</p>
            <div>Status: {getStatusLabel(poll.status)}</div>
            <div>
                Selected final date:{" "}
                {selectedFinalSlot
                    ? formatFinalSelection(selectedFinalSlot)
                    : "Not selected yet"}
            </div>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "",
                }}
                events={calendarEvents}
                eventClick={(info) => onSelectFinalSlot(info.event.id)}
                eventContent={renderEventContent}
                height="auto"
                fixedWeekCount={false}
                dayMaxEvents={3}
            />
            <button
                type="button"
                onClick={onFinalizePoll}
                disabled={!selectedFinalSlotId || isSubmitting}
            >
                {isSubmitting ? "Finalizing..." : "Finalize decision"}
            </button>
        </section>
    );
}

function HeatmapPoll({
    poll,
    selectedFinalSlot,
    selectedFinalSlotId,
    onSelectFinalSlot,
    onFinalizePoll,
    isSubmitting,
}) {
    const calendarEvents = useMemo(() => {
        return poll.candidateSlots.map((slot) => {
            const isFinal = String(slot._id) === selectedFinalSlotId;

            return {
                id: String(slot._id),
                start: slot.startTime,
                end: slot.endTime,
                backgroundColor: isFinal ? "#0f766e" : getHeatColor(slot.voteCount),
                borderColor: isFinal ? "#0f766e" : getHeatColor(slot.voteCount),
                textColor: isFinal ? "#ffffff" : "#0f172a",
                extendedProps: {
                    voteCount: slot.voteCount,
                    isFinal,
                },
            };
        });
    }, [poll.candidateSlots, selectedFinalSlotId]);

    function renderEventContent(info) {
        return (
            <section>
                <div>{formatTimeRange(info.event.start, info.event.end)}</div>
                <div>Votes: {info.event.extendedProps.voteCount}</div>
                {info.event.extendedProps.isFinal && <div>Final selection</div>}
            </section>
        );
    }

    return (
        <section>
            <h3>{poll.title}</h3>
            <p>{poll.description} Click a candidate slot, then confirm the final decision.</p>
            <div>Status: {getStatusLabel(poll.status)}</div>
            <div>
                Selected final date:{" "}
                {selectedFinalSlot
                    ? formatFinalSelection(selectedFinalSlot)
                    : "Not selected yet"}
            </div>
            <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "",
                }}
                events={calendarEvents}
                validRange={{
                    start: poll.rangeStart,
                    end: poll.rangeEnd,
                }}
                allDaySlot={false}
                eventClick={(info) => onSelectFinalSlot(info.event.id)}
                eventContent={renderEventContent}
                slotDuration="00:30:00"
                snapDuration="00:30:00"
                slotMinTime="08:00:00"
                slotMaxTime="18:00:00"
                height="auto"
            />
            <button
                type="button"
                onClick={onFinalizePoll}
                disabled={!selectedFinalSlotId || isSubmitting}
            >
                {isSubmitting ? "Finalizing..." : "Finalize decision"}
            </button>
        </section>
    );
}

export default OwnerPolls;
