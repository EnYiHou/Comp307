import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import LoadingState from "../../../components/loading/LoadingState.jsx";
import api from "../../../shared/api/api.js";
import { formatTimeRange } from "../utils/bookingCalendarUtils.js";
import "./UserInvites.css";
import "./FullCalendarTheme.css";

const SLOT_DURATION_MINUTES = 30;
const SLOT_DURATION_MS = SLOT_DURATION_MINUTES * 60 * 1000;

function getSelectedSlotIds(invite) {
  return (invite?.candidateSlots ?? [])
    .filter((slot) => slot.selectedByCurrentUser)
    .map((slot) => String(slot._id));
}

function isSelectableRange(invite, start, end) {
  const rangeStart = new Date(invite.rangeStart);
  const rangeEnd = new Date(invite.rangeEnd);
  return start >= rangeStart && end <= rangeEnd && start < end;
}

function collectSlotIdsInRange(candidateSlots, rangeStart, rangeEnd) {
  const rangeStartMs = rangeStart.getTime();
  const rangeEndMs = rangeEnd.getTime();

  return candidateSlots.flatMap((slot) => {
    const slotStartMs = new Date(slot.startTime).getTime();
    const slotEndMs = new Date(slot.endTime).getTime();
    if (slotStartMs >= rangeStartMs && slotEndMs <= rangeEndMs) {
      return [String(slot._id)];
    }
    return [];
  });
}

export default function UserInvites() {
  const [invites, setInvites] = useState([]);
  const [selectedInviteId, setSelectedInviteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    api
      .get("dashboard/getInvites")
      .then((response) => {
        if (isMounted) {
          const activeInvites = Array.isArray(response.data)
            ? response.data.filter(
                (invite) => invite.status === "collectingVotes",
              )
            : [];
          setInvites(activeInvites);
        }
      })
      .catch((caughtError) => {
        console.error("Error: ", caughtError);
        if (isMounted) {
          setError(caughtError.response?.data?.message || "Failed to load invites.");
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

  const selectedInvite = useMemo(() => {
    return (
      invites.find((invite) => String(invite._id) === String(selectedInviteId)) ??
      invites[0] ??
      null
    );
  }, [invites, selectedInviteId]);

  function applyLocalChange(inviteId, selectedSlotIds) {
    const selectedSlotIdsSet = new Set(selectedSlotIds.map(String));
    setInvites((prev) =>
      prev.map((invite) => {
        if (String(invite._id) !== String(inviteId)) {
          return invite;
        }

        return {
          ...invite,
          voteAny: selectedSlotIds.length > 0,
          candidateSlots: (invite.candidateSlots ?? []).map((slot) => {
            const currentlySelected = selectedSlotIdsSet.has(String(slot._id));
            const wasSelected = slot.selectedByCurrentUser;
            let newVoteCount = slot.voteCount ?? 0;

            if (currentlySelected && !wasSelected) {
              newVoteCount += 1;
            } else if (!currentlySelected && wasSelected) {
              newVoteCount -= 1;
            }

            return {
              ...slot,
              voteCount: newVoteCount,
              selectedByCurrentUser: currentlySelected,
            };
          }),
        };
      }),
    );
  }

  return (
    <section className="dashboard-panel dashboard-panel--wide invite-panel">
      <div className="dashboard-panel__header">
        <div>
          <h2>Invites</h2>
          <p>{loading ? "Loading..." : `${invites.length} total`}</p>
        </div>
        {!loading && <span className="dashboard-panel__count">{invites.length}</span>}
      </div>

      {error ? (
        <p className="dashboard-panel__message is-error">{error}</p>
      ) : loading ? (
        <LoadingState label="Loading invites..." variant="panel" />
      ) : invites.length === 0 ? (
        <p className="dashboard-panel__message">No group meeting invites yet.</p>
      ) : (
        <div className="invite-panel__body">
          <InviteList
            invites={invites}
            selectedInviteId={selectedInvite?._id}
            onSelectInvite={setSelectedInviteId}
          />
          <InviteDetails
            key={selectedInvite?._id ?? "no-invite"}
            invite={selectedInvite}
            onLocalChange={applyLocalChange}
          />
        </div>
      )}
    </section>
  );
}

function InviteList({ invites, selectedInviteId, onSelectInvite }) {
  return (
    <aside className="invite-list" aria-label="Meeting invites">
      {invites.map((invite) => {
        const isSelected = String(invite._id) === String(selectedInviteId);
        const hasVoted = Boolean(invite.voteAny);

        return (
          <button
            className={`invite-list__item${isSelected ? " is-selected" : ""}${
              hasVoted ? " is-voted" : ""
            }`}
            key={invite._id}
            type="button"
            onClick={() => onSelectInvite(invite._id)}
            aria-pressed={isSelected}
          >
            <span className="invite-list__status">
              {hasVoted ? "Voted" : "Pending"}
            </span>
            <span className="invite-list__title">{invite.title}</span>
            <span className="invite-list__description">
              {invite.description || "No description provided."}
            </span>
            <span className="invite-list__owner">
              {invite.ownerId?.name || "Unknown teacher"}
            </span>
          </button>
        );
      })}
    </aside>
  );
}

function InviteDetails({ invite, onLocalChange }) {
  const [selectedSlotIds, setSelectedSlotIds] = useState(() =>
    getSelectedSlotIds(invite),
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");
  const saveTimeoutRef = useRef(null);
  const hideSaveMessageTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(saveTimeoutRef.current);
      clearTimeout(hideSaveMessageTimeoutRef.current);
    };
  }, []);

  function setSlotSelection(newSelectedSlotIds) {
    if (!invite) {
      return;
    }

    const normalizedSelectedSlotIds = [
      ...new Set(newSelectedSlotIds.map(String)),
    ];

    setSelectedSlotIds(normalizedSelectedSlotIds);
    setSaveStatus("saving");
    setSaveMessage("Saving changes...");
    onLocalChange(invite._id, normalizedSelectedSlotIds);

    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      api
        .patch(`/dashboard/pollVoting/${invite._id}`, {
          selectedSlotIds: normalizedSelectedSlotIds,
        })
        .then(() => {
          setSaveStatus("success");
          setSaveMessage("Changes saved.");

          clearTimeout(hideSaveMessageTimeoutRef.current);
          hideSaveMessageTimeoutRef.current = setTimeout(() => {
            setSaveMessage("");
            setSaveStatus("idle");
          }, 2000);
        })
        .catch((caughtError) => {
          console.error("Failed to save vote:", caughtError);
          setSaveStatus("error");
          setSaveMessage("Failed to save changes.");
        });
    }, 200);
  }

  function toggleSlotSelection(slotId) {
    const normalizedSlotId = String(slotId);
    const newSelectedSlotIds = selectedSlotIds.includes(normalizedSlotId)
      ? selectedSlotIds.filter((id) => id !== normalizedSlotId)
      : [...selectedSlotIds, normalizedSlotId];

    setSlotSelection(newSelectedSlotIds);
  }

  if (!invite) {
    return (
      <section className="invite-details">
        <p className="invite-details__empty">Select an invite to vote.</p>
      </section>
    );
  }

  return (
    <section className="invite-details">
      <div className="invite-details__header">
        <div>
          <h3>{invite.title}</h3>
          <p>{invite.description || "No description provided."}</p>
        </div>
        <span className={`invite-badge${invite.voteAny ? " is-voted" : ""}`}>
          {invite.voteAny ? "Voted" : "Pending"}
        </span>
      </div>

      <div className="invite-details__meta">
        <span>{invite.ownerId?.name || "Unknown teacher"}</span>
        <span>{selectedSlotIds.length} selected</span>
        <span>{invite.method === "heatmap" ? "Heatmap" : "Calendar"}</span>
      </div>

      {saveMessage && (
        <p className={`invite-save-message is-${saveStatus}`} role="status">
          {saveMessage}
        </p>
      )}

      <div className="invite-calendar-shell">
        {invite.method === "heatmap" ? (
          <HeatmapInvite
            invite={invite}
            selectedSlotIds={selectedSlotIds}
            onSetSlotSelection={setSlotSelection}
          />
        ) : (
          <CalendarInvite
            invite={invite}
            selectedSlotIds={selectedSlotIds}
            onToggleSlotSelection={toggleSlotSelection}
          />
        )}
      </div>
    </section>
  );
}

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

function HeatmapInvite({ invite, selectedSlotIds, onSetSlotSelection }) {
  const candidateSlots = useMemo(() => {
    return invite.candidateSlots ?? [];
  }, [invite.candidateSlots]);

  const selectedSlotIdSet = useMemo(() => {
    return new Set(selectedSlotIds.map(String));
  }, [selectedSlotIds]);

  const heatmapEvents = useMemo(() => {
    return candidateSlots.map((slot) => {
      const slotId = String(slot._id);
      return {
        id: `heat-${slotId}`,
        start: slot.startTime,
        end: slot.endTime,
        display: "background",
        backgroundColor: getHeatColor(slot.voteCount ?? 0),
        classNames: ["heatmap-vote-background"],
      };
    });
  }, [candidateSlots]);

  const selectedEvents = useMemo(() => {
    return candidateSlots
      .filter((slot) => selectedSlotIdSet.has(String(slot._id)))
      .map((slot) => {
        const slotId = String(slot._id);
        return {
          id: `selected-${slotId}`,
          start: slot.startTime,
          end: slot.endTime,
          display: "background",
          classNames: ["heatmap-selected-background"],
        };
      });
  }, [candidateSlots, selectedSlotIdSet]);

  const calendarEvents = useMemo(() => {
    return [...heatmapEvents, ...selectedEvents];
  }, [heatmapEvents, selectedEvents]);

  function setSlotsInRange(rangeStart, rangeEnd) {
    if (!isSelectableRange(invite, rangeStart, rangeEnd)) {
      return;
    }

    const slotIdsInRange = collectSlotIdsInRange(
      candidateSlots,
      rangeStart,
      rangeEnd,
    );

    if (slotIdsInRange.length === 0) {
      return;
    }

    const currentSelection = new Set(selectedSlotIds.map(String));
    const firstSlotId = slotIdsInRange[0];
    const toRemove = currentSelection.has(firstSlotId);

    slotIdsInRange.forEach((slotId) => {
      if (toRemove) {
        currentSelection.delete(slotId);
      } else {
        currentSelection.add(slotId);
      }
    });

    onSetSlotSelection([...currentSelection]);
  }

  function handleSelect(info) {
    setSlotsInRange(info.start, info.end);
  }

  function handleDateClick(info) {
    const start = info.date;
    const end = new Date(start.getTime() + SLOT_DURATION_MS);
    setSlotsInRange(start, end);
  }

  return (
    <div className="invite-calendar heatmap-calendar">
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
          start: invite.rangeStart,
          end: invite.rangeEnd,
        }}
        allDaySlot={false}
        selectable={true}
        selectMirror={false}
        selectMinDistance={1}
        select={handleSelect}
        selectAllow={(info) => isSelectableRange(invite, info.start, info.end)}
        dateClick={handleDateClick}
        slotDuration="00:30:00"
        snapDuration="00:30:00"
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        height="auto"
      />
    </div>
  );
}

function CalendarInvite({ invite, selectedSlotIds, onToggleSlotSelection }) {
  const calendarEvents = useMemo(() => {
    return (invite.candidateSlots ?? []).map((slot) => {
      const slotId = String(slot._id);
      return {
        id: slotId,
        start: slot.startTime,
        end: slot.endTime,
        extendedProps: {
          voteCount: slot.voteCount ?? 0,
          isSelected: selectedSlotIds.includes(slotId),
        },
      };
    });
  }, [invite.candidateSlots, selectedSlotIds]);

  function renderEventContent(info) {
    return (
      <div className="invite-event">
        <span>{formatTimeRange(info.event.start, info.event.end)}</span>
        <span>{info.event.extendedProps.voteCount} votes</span>
        {info.event.extendedProps.isSelected && <span>Selected</span>}
      </div>
    );
  }

  return (
    <div className="invite-calendar">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        events={calendarEvents}
        eventClick={(info) => onToggleSlotSelection(info.event.id)}
        eventContent={renderEventContent}
        height="auto"
        fixedWeekCount={false}
        dayMaxEvents={3}
      />
    </div>
  );
}
