import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import SearchBar from "../../search/components/SearchBar";
import { getAll } from "../../search/services/searchService";
import api from "../../../shared/api/api";
import {
  addDays,
  formatDate,
  formatTimeRange,
  getDateOnly,
} from "../utils/bookingCalendarUtils.js";
import "./BookingSlotCreation.css";
import "./FullCalendarTheme.css";

// Main: Bogdan
// Extra Bugfixes: Ronald Zhang

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function addWeeks(dateLike, weekOffset) {
  const nextDate = new Date(dateLike);
  nextDate.setDate(nextDate.getDate() + weekOffset * 7);
  return nextDate;
}

function BookingSlotCreation() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "private",
    capacity: 1,
    bookingMode: "slot",
    pollMethod: "calendar",
    rangeStart: "",
    rangeEnd: "",
    recurrenceCount: 1,
  });
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [activeDate, setActiveDate] = useState(formatDate(new Date()));
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [submitState, setSubmitState] = useState({
    status: "idle",
    message: "",
  });

  const visibleSearchResults =
    searchQuery.trim().length >= 3
      ? searchResults.filter(
          (user) => !selectedUsers.some((selected) => selected._id === user._id),
        )
      : [];

  const showCalendarSlotSelector =
    formData.bookingMode === "slot" ||
    (formData.bookingMode === "group" && formData.pollMethod === "calendar");
  const showHeatmapRangeSelector =
    formData.bookingMode === "group" && formData.pollMethod === "heatmap";
  const basicsReady = formData.title.trim() && Number(formData.capacity) >= 1;
  const accessReady =
    formData.bookingMode !== "group" || selectedUsers.length > 0;
  const timesReady =
    (showCalendarSlotSelector && selectedSlots.length > 0) ||
    (showHeatmapRangeSelector && formData.rangeStart && formData.rangeEnd);
  const canSubmit =
    basicsReady &&
    accessReady &&
    timesReady &&
    submitState.status !== "submitting";

  useEffect(() => {
    let isMounted = true;

    if (searchQuery.trim().length < 3) {
      return undefined;
    }

    getAll(searchQuery)
      .then((users) => {
        if (isMounted) {
          setSearchResults(Array.isArray(users) ? users : []);
        }
      })
      .catch((error) => {
        console.error("Search failed:", error);
        if (isMounted) {
          setSearchResults([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  function updateFormField(name, value) {
    setValidationMessage("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleChange(event) {
    const { name, type, value } = event.target;
    updateFormField(name, type === "number" ? Number(value) : value);
  }

  function handleModeChange(mode) {
    setValidationMessage("");
    setFormData((prev) => ({
      ...prev,
      bookingMode: mode,
      visibility: mode === "group" ? "private" : prev.visibility,
      recurrenceCount: mode === "group" ? 1 : prev.recurrenceCount,
    }));
  }

  function handleSelectedUsers(user) {
    setSelectedUsers((prev) =>
      prev.some((selectedUser) => selectedUser._id === user._id)
        ? prev
        : [...prev, user],
    );
    setSearchResults([]);
    setSearchQuery("");
    setValidationMessage("");
  }

  function handleRemoveUser(userId) {
    setSelectedUsers((prev) => prev.filter((user) => user._id !== userId));
  }

  function handleHeatmapRangeChange(nextRange) {
    setValidationMessage("");
    setFormData((prev) => ({
      ...prev,
      ...nextRange,
    }));
  }

  function validateForm() {
    if (!formData.title.trim()) {
      return "Add a title before creating availability.";
    }
    if (Number(formData.capacity) < 1) {
      return "Capacity must be at least 1.";
    }
    if (formData.bookingMode === "group" && selectedUsers.length === 0) {
      return "Invite at least one user for a group poll.";
    }
    if (showCalendarSlotSelector && selectedSlots.length === 0) {
      return "Select at least one time.";
    }
    if (showHeatmapRangeSelector && (!formData.rangeStart || !formData.rangeEnd)) {
      return "Select a start and end date for the poll.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const message = validateForm();
    if (message) {
      setValidationMessage(message);
      return;
    }

    const payload = {
      ...formData,
      selectedSlots,
      invitedUsers: selectedUsers.map((user) => user._id),
    };

    setSubmitState({
      status: "submitting",
      message: "Creating availability...",
    });

    try {
      const { data } = await api.post("/dashboard/createBookingSlot", payload);
      setSubmitState({
        status: "success",
        message: data.message || "Availability created successfully.",
      });
      navigate("/owner/dashboard", { replace: true });
    } catch (error) {
      console.error("Create booking slot error:", error);
      setSubmitState({
        status: "error",
        message:
          error.response?.data?.message || "Failed to create availability.",
      });
    }
  }

  return (
    <form className="availability-form" onSubmit={handleSubmit}>
      <ProgressSection
        number="1"
        title="Basics"
        description="Name what students will book and set the capacity."
        complete={Boolean(basicsReady)}
      >
        <BasicsStep formData={formData} onChange={handleChange} />
      </ProgressSection>

      {basicsReady && (
        <ProgressSection
          number="2"
          title="Booking Type"
          description="Choose direct booking or a group poll."
          complete={Boolean(formData.bookingMode)}
        >
          <TypeStep
            formData={formData}
            onModeChange={handleModeChange}
            onChange={handleChange}
          />
        </ProgressSection>
      )}

      {basicsReady && (
        <ProgressSection
          number="3"
          title="Access"
          description={
            formData.bookingMode === "group"
              ? "Invite the people who should vote."
              : "Choose whether this appears in Book Appointments."
          }
          complete={accessReady}
        >
          <AccessStep
            formData={formData}
            onChange={handleChange}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            visibleSearchResults={visibleSearchResults}
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectedUsers}
            onRemoveUser={handleRemoveUser}
          />
        </ProgressSection>
      )}

      {basicsReady && accessReady && (
        <ProgressSection
          number="4"
          title="Times"
          description="Select the exact times students can book or vote on."
          complete={Boolean(timesReady)}
        >
          <TimesStep
            formData={formData}
            selectedSlots={selectedSlots}
            setSelectedSlots={setSelectedSlots}
            activeDate={activeDate}
            setActiveDate={setActiveDate}
            showCalendarSlotSelector={showCalendarSlotSelector}
            showHeatmapRangeSelector={showHeatmapRangeSelector}
            onRangeChange={handleHeatmapRangeChange}
          />
        </ProgressSection>
      )}

      {basicsReady && accessReady && timesReady && (
        <ProgressSection
          number="5"
          title="Review"
          description="Check the summary, then create it."
          complete={false}
        >
          <ReviewStep
            formData={formData}
            selectedSlots={selectedSlots}
            selectedUsers={selectedUsers}
          />
          <div className="availability-actions">
            <button className="button" type="submit" disabled={!canSubmit}>
              {submitState.status === "submitting"
                ? "Creating..."
                : "Create Availability"}
            </button>
          </div>
        </ProgressSection>
      )}

      {!basicsReady && (
        <p className="availability-next-hint">
          Add a title and capacity to continue.
        </p>
      )}

      {basicsReady && formData.bookingMode === "group" && !accessReady && (
        <p className="availability-next-hint">
          Invite at least one user to unlock time selection.
        </p>
      )}

      {basicsReady && accessReady && !timesReady && (
        <p className="availability-next-hint">
          Select a time or date range to review and publish.
        </p>
      )}

      {validationMessage && (
        <p className="availability-feedback is-error">{validationMessage}</p>
      )}
      {submitState.message && submitState.status !== "success" && (
        <p className={`availability-feedback is-${submitState.status}`} role="status">
          {submitState.message}
        </p>
      )}
    </form>
  );
}

function ProgressSection({ number, title, description, complete, children }) {
  return (
    <section className="availability-section">
      <div className="availability-section-marker">
        <span>{complete ? "OK" : number}</span>
      </div>
      <div className="availability-card">
        <StepHeader title={title} description={description} />
        {children}
      </div>
    </section>
  );
}

function StepHeader({ title, description }) {
  return (
    <div className="availability-step-header">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function BasicsStep({ formData, onChange }) {
  return (
    <div className="availability-fields">
      <label className="availability-field">
        <span>Title</span>
        <input
          name="title"
          value={formData.title}
          onChange={onChange}
          maxLength={50}
          placeholder="Office hours, project check-in, review session"
        />
      </label>
      <label className="availability-field availability-field-full">
        <span>Description</span>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          maxLength={500}
          rows="4"
          placeholder="Optional context students should see before booking."
        />
      </label>
      <label className="availability-field">
        <span>Capacity per time</span>
        <input
          type="number"
          min="1"
          name="capacity"
          value={formData.capacity}
          onChange={onChange}
        />
      </label>
    </div>
  );
}

function TypeStep({ formData, onModeChange, onChange }) {
  return (
    <>
      <div className="availability-choice-grid">
        <ChoiceTile
          title="Bookable slots"
          description="Publish times students can reserve directly."
          active={formData.bookingMode === "slot"}
          onClick={() => onModeChange("slot")}
        />
        <ChoiceTile
          title="Group poll"
          description="Invite users to vote on candidate times."
          active={formData.bookingMode === "group"}
          onClick={() => onModeChange("group")}
        />
      </div>

      {formData.bookingMode === "group" && (
        <div className="availability-subsection">
          <h4>Poll style</h4>
          <div className="availability-choice-grid is-compact">
            <ChoiceTile
              title="Candidate times"
              description="Pick exact times for people to vote on."
              active={formData.pollMethod === "calendar"}
              onClick={() =>
                onChange({ target: { name: "pollMethod", value: "calendar" } })
              }
            />
            <ChoiceTile
              title="Date range heatmap"
              description="Let invitees mark 30-minute availability blocks."
              active={formData.pollMethod === "heatmap"}
              onClick={() =>
                onChange({ target: { name: "pollMethod", value: "heatmap" } })
              }
            />
          </div>
          <label className="availability-field availability-field-inline">
            <span>How many weekly meetings after final selection?</span>
            <input
              type="number"
              min="1"
              name="recurrenceCount"
              value={formData.recurrenceCount}
              onChange={onChange}
            />
          </label>
        </div>
      )}

      {formData.bookingMode === "slot" && (
        <div className="availability-subsection availability-subsection-compact">
          <h4>Repeat</h4>
          <label className="availability-field availability-field-inline">
            <span>How many weekly occurrences?</span>
            <input
              type="number"
              min="1"
              name="recurrenceCount"
              value={formData.recurrenceCount}
              onChange={onChange}
            />
          </label>
        </div>
      )}
    </>
  );
}

function ChoiceTile({ title, description, active, onClick }) {
  return (
    <button
      type="button"
      className={`availability-choice${active ? " is-active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span>{title}</span>
      <p>{description}</p>
    </button>
  );
}

function AccessStep({
  formData,
  onChange,
  searchQuery,
  setSearchQuery,
  visibleSearchResults,
  selectedUsers,
  onSelectUser,
  onRemoveUser,
}) {
  return (
    <>
      <div className="availability-choice-grid is-compact">
        <ChoiceTile
          title="Public"
          description="Visible to students browsing Book Appointments."
          active={formData.visibility === "public"}
          onClick={() =>
            onChange({ target: { name: "visibility", value: "public" } })
          }
        />
        <ChoiceTile
          title="Private"
          description="Only intended participants can use it."
          active={formData.visibility === "private"}
          onClick={() =>
            onChange({ target: { name: "visibility", value: "private" } })
          }
        />
      </div>

      {(formData.bookingMode === "group" || formData.visibility === "private") && (
        <div className="availability-subsection">
          <h4>Invite users</h4>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search users by name or email"
          />

          {visibleSearchResults.length > 0 && (
            <div className="availability-search-results">
              {visibleSearchResults.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => onSelectUser(user)}
                >
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </button>
              ))}
            </div>
          )}

          <div className="selected-users">
            {selectedUsers.length === 0 ? (
              <p>No users selected yet.</p>
            ) : (
              selectedUsers.map((user) => (
                <span key={user._id}>
                  {user.name}
                  <button type="button" onClick={() => onRemoveUser(user._id)}>
                    Remove
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

function TimesStep({
  formData,
  selectedSlots,
  setSelectedSlots,
  activeDate,
  setActiveDate,
  showCalendarSlotSelector,
  showHeatmapRangeSelector,
  onRangeChange,
}) {
  return (
    <>
      {showCalendarSlotSelector && (
        <>
          <SelectedSlotSummary selectedSlots={selectedSlots} />
          <TwoPanelSelector
            selectedSlots={selectedSlots}
            setSelectedSlots={setSelectedSlots}
            activeDate={activeDate}
            setActiveDate={setActiveDate}
            recurrenceCount={
              formData.bookingMode === "slot" ? formData.recurrenceCount : 1
            }
          />
        </>
      )}

      {showHeatmapRangeSelector && (
        <HeatmapSelector formData={formData} onRangeChange={onRangeChange} />
      )}
    </>
  );
}

function SelectedSlotSummary({ selectedSlots }) {
  return (
    <div className="selected-slot-summary">
      <strong>{selectedSlots.length}</strong>
      <span>{selectedSlots.length === 1 ? "time selected" : "times selected"}</span>
    </div>
  );
}

function ReviewStep({ formData, selectedSlots, selectedUsers }) {
  return (
    <div className="availability-review">
      <ReviewItem label="Title" value={formData.title || "Untitled"} />
      <ReviewItem
        label="Type"
        value={
          formData.bookingMode === "slot" ? "Bookable slots" : "Group poll"
        }
      />
      <ReviewItem label="Visibility" value={formData.visibility} />
      <ReviewItem label="Capacity" value={String(formData.capacity)} />
      {formData.bookingMode === "group" && (
        <>
          <ReviewItem
            label="Poll style"
            value={
              formData.pollMethod === "calendar"
                ? "Candidate times"
                : "Date range heatmap"
            }
          />
          <ReviewItem label="Invited users" value={String(selectedUsers.length)} />
          <ReviewItem
            label="Final recurrence"
            value={`${formData.recurrenceCount} week${
              Number(formData.recurrenceCount) === 1 ? "" : "s"
            }`}
          />
        </>
      )}
      <ReviewItem
        label="Times"
        value={
          formData.pollMethod === "heatmap" && formData.bookingMode === "group"
            ? `${formData.rangeStart || "Start"} to ${formData.rangeEnd || "End"}`
            : `${selectedSlots.length} selected times`
        }
      />
    </div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HeatmapSelector({ formData, onRangeChange }) {
  const todayStr = formatDate(new Date());

  function handleMonthDateClick(info) {
    const clickedDate = info.dateStr;

    // Reject clicks on past dates
    if (clickedDate < todayStr) {
      return;
    }

    if (formData.rangeEnd || !formData.rangeStart) {
      onRangeChange({
        rangeStart: clickedDate,
        rangeEnd: "",
      });
      return;
    }

    if (clickedDate < formData.rangeStart) {
      onRangeChange({
        rangeStart: clickedDate,
        rangeEnd: formData.rangeStart,
      });
    } else {
      onRangeChange({
        rangeStart: formData.rangeStart,
        rangeEnd: clickedDate,
      });
    }
  }

  const rangeEvents = useMemo(() => {
    if (!formData.rangeStart) {
      return [];
    }
    if (!formData.rangeEnd) {
      return [{ start: formData.rangeStart }];
    }
    return [
      {
        title: "Poll range",
        start: formData.rangeStart,
        end: addDays(formData.rangeEnd, 1),
        display: "background",
      },
    ];
  }, [formData.rangeStart, formData.rangeEnd]);

  return (
    <section className="availability-calendar-card">
      <div className="availability-calendar-header">
        <h4>Date range</h4>
        <p>
          Select a start date, then an end date. Invitees will vote on
          30-minute blocks within that range.
        </p>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        validRange={{ start: todayStr }}
        dateClick={handleMonthDateClick}
        events={rangeEvents}
        height="auto"
        fixedWeekCount={false}
      />
    </section>
  );
}

function TwoPanelSelector({
  selectedSlots,
  setSelectedSlots,
  activeDate,
  setActiveDate,
  recurrenceCount,
}) {
  const todayStr = formatDate(new Date());

  function handleMonthDateClick(info) {
    // Reject clicks on past dates
    if (info.dateStr < todayStr) {
      return;
    }
    setActiveDate(info.dateStr);
  }

  function handleDaySelect(info) {
    // Reject selections that start in the past
    if (info.startStr < new Date().toISOString()) {
      return;
    }
    const newSlot = {
      id: makeId(),
      start: info.startStr,
      end: info.endStr,
    };
    setSelectedSlots((prev) => [...prev, newSlot]);
  }

  function handleDayEventClick(info) {
    setSelectedSlots((prev) =>
      prev.filter((slot) => slot.id !== info.event.id),
    );
  }

  function handleMonthEventClick(info) {
    setActiveDate(getDateOnly(info.event.start));
  }

  const monthEvents = useMemo(() => {
    // Group slots by date → one count badge per day
    const countByDate = {};
    for (const slot of selectedSlots) {
      const date = getDateOnly(slot.start);
      countByDate[date] = (countByDate[date] || 0) + 1;
    }

    const countEvents = Object.entries(countByDate).map(([date, count]) => ({
      id: `count-${date}`,
      title: `${count} ${count === 1 ? "slot" : "slots"}`,
      start: date,
      allDay: true,
    }));

    const recurringPreviewEvents = selectedSlots.flatMap((slot) =>
      Array.from({ length: Math.max(0, recurrenceCount - 1) }, (_, index) => ({
        id: `${slot.id}-recurrence-${index + 1}`,
        start: getDateOnly(addWeeks(slot.start, index + 1)),
        end: addDays(getDateOnly(addWeeks(slot.start, index + 1)), 1),
        allDay: true,
        display: "background",
        classNames: ["booking-slot-recurring-preview"],
      })),
    );

    return [...countEvents, ...recurringPreviewEvents];
  }, [recurrenceCount, selectedSlots]);

  const dayEvents = useMemo(() => {
    const selectedDayEvents = selectedSlots
      .filter((slot) => getDateOnly(slot.start) === activeDate)
      .map((slot) => ({
        id: slot.id,
        title: formatTimeRange(slot.start, slot.end),
        start: slot.start,
        end: slot.end,
      }));

    const recurringPreviewEvents = selectedSlots.flatMap((slot) =>
      Array.from({ length: Math.max(0, recurrenceCount - 1) }, (_, index) => {
        const recurringStart = addWeeks(slot.start, index + 1);
        const recurringEnd = addWeeks(slot.end, index + 1);

        if (getDateOnly(recurringStart) !== activeDate) {
          return [];
        }

        return {
          id: `${slot.id}-day-recurrence-${index + 1}`,
          start: recurringStart,
          end: recurringEnd,
          display: "background",
          classNames: ["booking-slot-recurring-preview"],
        };
      }),
    );

    return [...selectedDayEvents, ...recurringPreviewEvents];
  }, [activeDate, recurrenceCount, selectedSlots]);

  return (
    <section className="availability-calendar-grid">
      <div className="availability-calendar-card">
        <div className="availability-calendar-header">
          <h4>Dates</h4>
          <p>Pick a date to focus the detailed time view.</p>
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          validRange={{ start: todayStr }}
          dateClick={handleMonthDateClick}
          events={monthEvents}
          eventClick={handleMonthEventClick}
          height="auto"
          fixedWeekCount={false}
          dayMaxEvents={3}
          dayCellClassNames={(arg) =>
            arg.dateStr === activeDate ? ["is-active-date"] : []
          }
        />
      </div>

      <div className="availability-calendar-card">
        <div className="availability-calendar-header">
          <h4>Times on {activeDate}</h4>
          <p>Drag over a time range to add it. Click an existing time to remove it.</p>
        </div>
        <FullCalendar
          key={activeDate}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          initialDate={activeDate}
          headerToolbar={false}
          validRange={{ start: new Date().toISOString() }}
          selectable={true}
          selectMirror={false}
          select={handleDaySelect}
          eventClick={handleDayEventClick}
          events={dayEvents}
          slotDuration="00:30:00"
          snapDuration="00:30:00"
          slotMinTime="08:00:00"
          slotMaxTime="18:00:00"
          allDaySlot={false}
          height="auto"
        />
      </div>
    </section>
  );
}

export default BookingSlotCreation;
