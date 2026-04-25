import { useEffect, useMemo, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import api from "../../../shared/api/api.js";
import { useAuth } from "../../auth/useAuth.js";
import {
  addDays,
  formatDate,
  formatTimeRange,
  getDateOnly,
} from "../utils/bookingCalendarUtils.js";
import "./BookingSlotCreation.css";

const SLOT_DURATION_MINUTES = 30;
const SLOT_DURATION_MS = SLOT_DURATION_MINUTES * 60 * 1000;

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
function UserInvites() {
  const [invites, setInvites] = useState([]);
  const [selectedInviteId, setSelectedInviteId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("dashboard/getInvites")
      .then((response) => {
        setInvites(response.data);
      })
      .catch((error) => {
        console.error("Error: ", error);
        setError(error.response?.data?.message || "Failed to load invites.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const selectedInvite = useMemo(() => {
    return invites.find((invite) => invite._id === selectedInviteId) ?? null;
  }, [invites, selectedInviteId]);

  function applyLocalChange(inviteId, selectedSlotIds) {
    const selectedSlotIdsSet = new Set(selectedSlotIds.map(String));
    setInvites((prev) => {
      return prev.map((invite) => {
        if (String(invite._id) !== String(inviteId)) {
          return invite;
        }
        return {
          ...invite,
          voteAny: selectedSlotIds.length > 0,
          candidateSlots: invite.candidateSlots.map((slot) => {
            const currentlySelected = selectedSlotIdsSet.has(String(slot._id));
            const wasSelected = slot.selectedByCurrentUser;
            let newVoteCount = slot.voteCount;
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
      });
    });
  }

  if (loading) {
    return <p>Loading invites...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section>
      <InviteList invites={invites} setSelectedInviteId={setSelectedInviteId} />
      <InviteDetails invite={selectedInvite} onLocalChange={applyLocalChange} />
    </section>
  );
}

function InviteList({ invites, setSelectedInviteId }) {
  return (
    <section>
      <div>
        <h3>Your Invites</h3>
      </div>
      <div>
        {invites.map((invite) => {
          return (
            <button
              key={invite._id}
              type="button"
              onClick={() => setSelectedInviteId(invite._id)}
            >
              <div>{invite.title}</div>
              <p>{invite.description || "No description provided."}</p>
              <div>
                <div>Professor: {invite.ownerId.name}</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function InviteDetails({ invite, onLocalChange }) {
  const [selectedSlotIds, setSelectedSlotIds] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");
  const saveTimeoutRef = useRef(null);
  const hideSaveMessageTimeoutRef = useRef(null);

  useEffect(() => {
    if (!invite) {
      setSelectedSlotIds([]);
      return;
    }
    const alreadySelectedSlotIds = invite.candidateSlots
      .filter((slot) => slot.selectedByCurrentUser)
      .map((slot) => String(slot._id));

    setSelectedSlotIds(alreadySelectedSlotIds);
  }, [invite]);

  useEffect(() => {
    return () => {
      clearTimeout(saveTimeoutRef.current);
      clearTimeout(hideSaveMessageTimeoutRef.current);
    };
  }, []);

  function setSlotSelection(newSelectedSlotIds) {
    const normalizedSelectedSlotIds = [
      ...new Set(newSelectedSlotIds.map(String)),
    ];

    setSelectedSlotIds(normalizedSelectedSlotIds);
    onLocalChange(invite._id, normalizedSelectedSlotIds);

    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      api
        .patch(`/dashboard/pollVoting/${invite._id}`, {
          selectedSlotIds: normalizedSelectedSlotIds,
        })
        .then(() => {
          setSaveMessage("Changes saved.");

          clearTimeout(hideSaveMessageTimeoutRef.current);
          hideSaveMessageTimeoutRef.current = setTimeout(() => {
            setSaveMessage("");
          }, 2000);
        })
        .catch((error) => {
          console.error("Failed to save vote:", error);
          setSaveMessage("Failed to save changes.");
        });
    }, 200);
  }

  function toggleSlotSelection(slotId) {
    const newSelectedSlotIds = selectedSlotIds.includes(slotId)
      ? selectedSlotIds.filter((id) => id !== slotId)
      : [...selectedSlotIds, slotId];

    setSlotSelection(newSelectedSlotIds);
  }

  if (!invite) {
    return (
      <section>
        <h3>Select an Invite</h3>
      </section>
    );
  } else if (invite.method === "calendar") {
    return (
      <section>
        {saveMessage && <p>{saveMessage}</p>}
        <CalendarInvite
          invite={invite}
          selectedSlotIds={selectedSlotIds}
          onToggleSlotSelection={toggleSlotSelection}
        />
      </section>
    );
  } else if (invite.method === "heatmap") {
    return (
      <section>
        {saveMessage && <p>{saveMessage}</p>}
        <HeatmapInvite
          invite={invite}
          selectedSlotIds={selectedSlotIds}
          onSetSlotSelection={setSlotSelection}
        />
      </section>
    );
  }
}

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
        backgroundColor: getHeatColor(slot.voteCount),
        classNames: ["heatmap-vote-background"],
        extendedProps: {
          slotId,
          voteCount: slot.voteCount,
        },
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
          extendedProps: {
            slotId,
          },
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
    <section>
      <h3>{invite.title}</h3>
      <p>
        {invite.description} Click a candidate slot to select or unselect your
        vote.
      </p>
      <div>Professor: {invite.ownerId.name}</div>
      <div>Status: {invite.voteAny ? "Voted" : "Not voted yet"}</div>
      <div className="heatmap-calendar">
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
          selectAllow={(info) =>
            isSelectableRange(invite, info.start, info.end)
          }
          dateClick={handleDateClick}
          slotDuration="00:30:00"
          snapDuration="00:30:00"
          slotMinTime="08:00:00"
          slotMaxTime="18:00:00"
          height="auto"
        />
      </div>
    </section>
  );
}

function CalendarInvite({ invite, selectedSlotIds, onToggleSlotSelection }) {
  const calendarEvents = useMemo(() => {
    return invite.candidateSlots.map((slot, index) => {
      return {
        id: slot._id,
        start: slot.startTime,
        end: slot.endTime,
        extendedProps: {
          voteCount: slot.voteCount,
          isSelected: selectedSlotIds.includes(slot._id),
        },
      };
    });
  }, [invite.candidateSlots, selectedSlotIds]);

  function renderEventContent(info) {
    return (
      <section>
        <div>{formatTimeRange(info.event.start, info.event.end)}</div>
        <div>Votes: {info.event.extendedProps.voteCount}</div>
        {info.event.extendedProps.isSelected && <div>Selected</div>}
      </section>
    );
  }

  return (
    <section>
      <h3>{invite.title}</h3>
      <p>
        {invite.description} Click a candidate slot to select or unselect your
        vote.
      </p>
      <div>Professor: {invite.ownerId.name}</div>
      <div>Status: {invite.voteAny ? "Voted" : "Not voted yet"}</div>
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
    </section>
  );
}

export default UserInvites;
