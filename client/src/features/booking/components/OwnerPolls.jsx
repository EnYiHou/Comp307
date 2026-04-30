import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import useConfirmationDialog from "../../../components/confirmation/useConfirmationDialog";
import LoadingState from "../../../components/loading/LoadingState.jsx";
import api from "../../../shared/api/api.js";
import {
  formatTime,
  formatTimeRange,
  getDateOnly,
} from "../utils/bookingCalendarUtils.js";
import "./OwnerPolls.css";
import "./FullCalendarTheme.css";

// Extra Bugfixes: Ronald Zhang

function getHeatColor(voteCount) {
  const maxVoteCount = 5;

  if (voteCount <= 0) {
    return "rgba(226, 232, 240, 0.45)";
  }

  const cappedVoteCount = Math.min(voteCount, maxVoteCount);
  const intensity = cappedVoteCount / maxVoteCount;
  const lightness = 92 - intensity * 42;
  return `hsl(199, 89%, ${lightness}%)`;
}

function getFinalSlotId(poll) {
  if (!poll?.finalSelection?.startTime || !poll?.finalSelection?.endTime) {
    return "";
  }

  const finalStartMs = new Date(poll.finalSelection.startTime).getTime();
  const finalEndMs = new Date(poll.finalSelection.endTime).getTime();

  const matchingSlot = (poll.candidateSlots ?? []).find((slot) => {
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
    let isMounted = true;

    api
      .get("dashboard/getPolls")
      .then((response) => {
        if (isMounted) {
          const activePolls = Array.isArray(response.data)
            ? response.data.filter((poll) => poll.status === "collectingVotes")
            : [];
          setPolls(activePolls);
        }
      })
      .catch((caughtError) => {
        console.error("Error: ", caughtError);
        if (isMounted) {
          setError(caughtError.response?.data?.message || "Failed to load polls.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedPoll = useMemo(() => {
    return (
      polls.find((poll) => String(poll._id) === String(selectedPollId)) ??
      polls[0] ??
      null
    );
  }, [polls, selectedPollId]);

  function removePoll(pollId) {
    setPolls((prev) =>
      prev.filter((poll) => String(poll._id) !== String(pollId)),
    );
    setSelectedPollId("");
  }

  return (
    <section className="owner-dashboard-panel owner-polls-panel">
      <div className="owner-dashboard-panel-header">
        <div>
          <h2>Group Polls</h2>
          <p>Review votes and finalize the best time for group meetings.</p>
        </div>
        {!loading && <span>{polls.length}</span>}
      </div>

      {error ? (
        <p className="owner-polls-message is-error">{error}</p>
      ) : loading ? (
        <LoadingState label="Loading polls..." variant="panel" />
      ) : polls.length === 0 ? (
        <div className="owner-polls-empty">
          <h3>No active polls</h3>
          <p>Group polls that are collecting votes will appear here.</p>
        </div>
      ) : (
        <div className="owner-polls-body">
          <PollList
            polls={polls}
            selectedPollId={selectedPoll?._id}
            onSelectPoll={setSelectedPollId}
          />
          <PollDetails poll={selectedPoll} onFinalize={removePoll} />
        </div>
      )}
    </section>
  );
}

function PollList({ polls, selectedPollId, onSelectPoll }) {
  return (
    <aside className="owner-poll-list" aria-label="Owner group polls">
      {polls.map((poll) => {
        const isSelected = String(poll._id) === String(selectedPollId);

        return (
          <button
            className={`owner-poll-list__item${isSelected ? " is-selected" : ""}`}
            key={poll._id}
            type="button"
            onClick={() => onSelectPoll(poll._id)}
            aria-pressed={isSelected}
          >
            <span className="owner-poll-list__status">
              {getStatusLabel(poll.status)}
            </span>
            <span className="owner-poll-list__title">{poll.title}</span>
            <span className="owner-poll-list__description">
              {poll.description || "No description provided."}
            </span>
            <span className="owner-poll-list__meta">
              {poll.candidateSlots?.length ?? 0} candidate times
            </span>
          </button>
        );
      })}
    </aside>
  );
}

function PollDetails({ poll, onFinalize }) {
  if (!poll) {
    return (
      <section className="owner-poll-details">
        <p className="owner-polls-message">Select a poll to review votes.</p>
      </section>
    );
  }

  return (
    <PollDecisionDetails
      key={poll._id}
      poll={poll}
      onFinalize={onFinalize}
    />
  );
}

function PollDecisionDetails({ poll, onFinalize }) {
  const [selectedFinalSlotId, setSelectedFinalSlotId] = useState(() =>
    getFinalSlotId(poll),
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { confirm, confirmationDialog } = useConfirmationDialog();

  const selectedFinalSlot = useMemo(() => {
    return (
      (poll.candidateSlots ?? []).find(
        (slot) => String(slot._id) === String(selectedFinalSlotId),
      ) ?? null
    );
  }, [poll.candidateSlots, selectedFinalSlotId]);

  function setFinalSlotSelection(slotId) {
    setSelectedFinalSlotId(String(slotId));
    setSaveMessage("");
  }

  async function finalizePollDecision() {
    if (!selectedFinalSlotId) {
      setSaveMessage("Choose a final time before finalizing.");
      return;
    }

    const confirmed = await confirm({
      title: "Finalize group poll?",
      message: "This saves the selected time as the final decision.",
      confirmLabel: "Finalize",
      variant: "primary",
    });
    if (!confirmed) {
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
      .catch((caughtError) => {
        console.error("Failed to save final selection:", caughtError);
        setSaveMessage(
          caughtError.response?.data?.message || "Failed to finalize poll.",
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <section className="owner-poll-details">
      <div className="owner-poll-details__header">
        <div>
          <h3>{poll.title}</h3>
          <p>{poll.description || "No description provided."}</p>
        </div>
        <span>{getStatusLabel(poll.status)}</span>
      </div>

      <div className="owner-poll-details__meta">
        <span>{poll.method === "heatmap" ? "Heatmap" : "Calendar"}</span>
        <span>{poll.candidateSlots?.length ?? 0} candidate times</span>
        <span>{poll.recurrenceCount || 1} week(s)</span>
        <span>{formatFinalSelection(selectedFinalSlot)}</span>
      </div>

      {saveMessage && (
        <p className="owner-polls-message is-error" role="status">
          {saveMessage}
        </p>
      )}

      <PollCalendar
        poll={poll}
        selectedFinalSlotId={selectedFinalSlotId}
        onSelectFinalSlot={setFinalSlotSelection}
      />

      <div className="owner-poll-actions">
        <button
          type="button"
          onClick={finalizePollDecision}
          disabled={!selectedFinalSlotId || isSubmitting}
        >
          {isSubmitting ? "Finalizing..." : "Finalize Poll"}
        </button>
      </div>
      {confirmationDialog}
    </section>
  );
}

function PollCalendar({ poll, selectedFinalSlotId, onSelectFinalSlot }) {
  const isHeatmap = poll.method === "heatmap";
  const calendarEvents = useMemo(() => {
    return (poll.candidateSlots ?? []).map((slot) => {
      const isFinal = String(slot._id) === String(selectedFinalSlotId);
      const heatColor = getHeatColor(slot.voteCount ?? 0);

      return {
        id: String(slot._id),
        start: slot.startTime,
        end: slot.endTime,
        backgroundColor: isFinal ? "#0f766e" : isHeatmap ? heatColor : undefined,
        borderColor: isFinal ? "#0f766e" : isHeatmap ? heatColor : undefined,
        textColor: isFinal ? "#ffffff" : isHeatmap ? "#1f2937" : undefined,
        extendedProps: {
          voteCount: slot.voteCount ?? 0,
          isFinal,
        },
      };
    });
  }, [isHeatmap, poll.candidateSlots, selectedFinalSlotId]);

  function renderEventContent(info) {
    if (isHeatmap) {
      return (
        <div className="owner-poll-event owner-poll-event--heatmap">
          <span>{info.event.extendedProps.voteCount}</span>
        </div>
      );
    }

    return (
      <div className="owner-poll-event">
        <span>{formatTime(info.event.start)}</span>
        <span>{formatTime(info.event.end)}</span>
        <span>{info.event.extendedProps.voteCount} votes</span>
        {info.event.extendedProps.isFinal && <span>Final</span>}
      </div>
    );
  }

  return (
    <div className="owner-poll-calendar">
      <FullCalendar
        plugins={
          isHeatmap
            ? [timeGridPlugin, interactionPlugin]
            : [dayGridPlugin, interactionPlugin]
        }
        initialView={isHeatmap ? "timeGridWeek" : "dayGridMonth"}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        events={calendarEvents}
        validRange={
          isHeatmap
            ? {
              start: poll.rangeStart,
              end: poll.rangeEnd,
            }
            : undefined
        }
        allDaySlot={false}
        eventClick={(info) => onSelectFinalSlot(info.event.id)}
        eventContent={renderEventContent}
        slotDuration="00:30:00"
        snapDuration="00:30:00"
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        height="auto"
        fixedWeekCount={false}
        dayMaxEvents={3}
      />
    </div>
  );
}

export default OwnerPolls;
