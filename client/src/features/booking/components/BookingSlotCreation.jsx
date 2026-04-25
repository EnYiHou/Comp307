import { useMemo, useState, useEffect } from "react";
import api from "../../../shared/api/api";
import "./BookingSlotCreation.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import SearchBar from "../../search/components/SearchBar";
import { getAll } from "../../search/services/searchService";
import {
  addDays,
  formatDate,
  formatTimeRange,
  getDateOnly,
} from "../utils/bookingCalendarUtils.js";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function addWeeks(dateLike, weekOffset) {
  const nextDate = new Date(dateLike);
  nextDate.setDate(nextDate.getDate() + weekOffset * 7);
  return nextDate;
}

function BookingSlotCreation() {
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

  const [submitState, setSubmitState] = useState({
    status: "idle",
    message: "",
  });

  const visibleSearchResults =
    searchQuery.trim().length >= 3 ? searchResults : [];

  function handleChange(event) {
    const { name, type, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function handleHeatmapRangeChange(nextRange) {
    setFormData((prev) => ({
      ...prev,
      ...nextRange,
    }));
  }

  function handleSelectedUsers(user) {
    setSelectedUsers((prev) => {
      return (prev.some((u) => u._id === user._id)) ? prev : [...prev, user];
    })

    setSearchResults([]);
    setSearchQuery("");
  }

  function handleRemoveUser(user_id) {
    setSelectedUsers((prev) =>
      prev.filter((user) => user._id !== user_id)
    );
  }

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      return;
    }
    getAll(searchQuery)
      .then((users) => {
        setSearchResults(users);
      })
      .catch((error) => {
        console.error("Search failed:", error);
        setSearchResults([]);
      });
  }, [searchQuery]);

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...formData,
      selectedSlots,
      invitedUsers: selectedUsers.map((user) => user._id)
    };

    setSubmitState({
      status: "submitting",
      message: "Creating booking slot...",
    });

    try {
      const { data } = await api.post("/dashboard/createBookingSlot", payload);
      setSubmitState({
        status: "success",
        message: data.message || "Booking slot created successfully.",
      });
    } catch (error) {
      console.error("Create booking slot error:", error);
      setSubmitState({
        status: "error",
        message:
          error.response?.data?.message || "Failed to create booking slot.",
      });
    }
  }

  const showCalendarSlotSelector =
    formData.bookingMode === "slot" ||
    (formData.bookingMode === "group" && formData.pollMethod === "calendar");
  const showHeatmapRangeSelector =
    formData.bookingMode === "group" && formData.pollMethod === "heatmap";

  return (
    <form className="booking-slot-form" onSubmit={handleSubmit}>
      <BookingFields formData={formData} handleChange={handleChange} />

      {formData.bookingMode === "group" && (
        <section>
          <label>Invite users
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search users by name or email"
            />
          </label>
          {visibleSearchResults.length > 0 && (
            <div className="search-results">
              {visibleSearchResults.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => handleSelectedUsers(user)}
                  className="search-result-item"
                >
                  {user.name} — {user.email} ({user.role})
                </button>
              ))}
            </div>
          )}
          <h3>Selected users</h3>
          {selectedUsers.length === 0 ? (
            <p>No users selected yet.</p>
          ) : (
            <ul>
              {selectedUsers.map((user) => (
                <li key={user._id}>
                  <div>
                    {user.name} — {user.email} ({user.role})
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveUser(user._id)}
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {showCalendarSlotSelector && (
        <TwoPanelSelector
          selectedSlots={selectedSlots}
          setSelectedSlots={setSelectedSlots}
          activeDate={activeDate}
          setActiveDate={setActiveDate}
          recurrenceCount={formData.bookingMode === "slot" ? formData.recurrenceCount : 1}
        />
      )}

      {showHeatmapRangeSelector && (
        <HeatmapSelector
          formData={formData}
          onRangeChange={handleHeatmapRangeChange}
        />
      )}

      <div className="booking-slot-actions">
        <button
          className="button"
          type="submit"
          disabled={submitState.status === "submitting"}
        >
          {submitState.status === "submitting"
            ? "Creating..."
            : "Create Booking Slot"}
        </button>

        {submitState.message && (
          <p
            className={`booking-slot-feedback is-${submitState.status}`}
            role="status"
          >
            {submitState.message}
          </p>
        )}
      </div>
    </form>
  );
}

function HeatmapSelector({ formData, onRangeChange }) {
  function handleMonthDateClick(info) {
    const clickedDate = info.dateStr;

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
      return [
        {
          start: formData.rangeStart,
        },
      ];
    } else {
      return [
        {
          title: "Time Interval",
          start: formData.rangeStart,
          end: addDays(formData.rangeEnd, 1),
          display: "background",
        },
      ];
    }
  }, [formData.rangeStart, formData.rangeEnd]);

  return (
    <section className="booking-slot-card">
      <div className="booking-slot-card_header">
        <h3>Date Range</h3>
        <p>Select a date interval for the heatmap-style group poll.</p>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
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
  function handleMonthDateClick(info) {
    setActiveDate(info.dateStr);
  }

  function handleDaySelect(info) {
    const newSlot = {
      id: makeId(),
      start: info.startStr,
      end: info.endStr,
    };
    //check overlaps
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
    const selectedSlotEvents = selectedSlots.map((slot) => ({
      id: slot.id,
      title: formatTimeRange(slot.start, slot.end),
      start: slot.start,
      end: slot.end,
    }));

    const recurringPreviewEvents = selectedSlots.flatMap((slot) =>
      Array.from({ length: Math.max(0, recurrenceCount - 1) }, (_, index) => ({
        id: `${slot.id}-recurrence-${index + 1}`,
        start: addWeeks(slot.start, index + 1),
        end: addWeeks(slot.end, index + 1),
        display: "background",
        classNames: ["booking-slot-recurring-preview"],
      })),
    );

    return [...selectedSlotEvents, ...recurringPreviewEvents];
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
    <section className="booking-slot-selector">
      <div className="booking-slot-card">
        <div className="booking-slot-card_header">
          <h3>Dates</h3>
          <p>Pick a day on the month calendar to focus the detailed view.</p>
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          dateClick={handleMonthDateClick}
          events={monthEvents}
          eventClick={handleMonthEventClick}
          height="auto"
          fixedWeekCount={false}
          dayMaxEvents={3}
        />
      </div>

      <div className="booking-slot-card">
        <div className="booking-slot-card_header">
          <h3>Selected Day</h3>
          <p>{activeDate}</p>
        </div>
        <FullCalendar
          key={activeDate}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          initialDate={activeDate}
          headerToolbar={false}
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

function BookingFields({ formData, handleChange }) {
  return (
    <section className="booking-slot-card">
      <div className="booking-slot-card_header">
        <h3>Booking Details</h3>
        <p>Configure the slot basics before choosing dates and times.</p>
      </div>

      <div className="booking-slot-fields">
        <label className="booking-slot-field">
          <span>Title</span>
          <input name="title" value={formData.title} onChange={handleChange} />
        </label>

        <label className="booking-slot-field booking-slot-field-full">
          <span>Description</span>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </label>

        <label className="booking-slot-field">
          <span>Capacity</span>
          <input
            type="number"
            min="1"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
          />
        </label>

        {formData.bookingMode === "slot" && (
          <label className="booking-slot-field">
            <span>Recurrence Count</span>
            <input
              type="number"
              min="1"
              name="recurrenceCount"
              value={formData.recurrenceCount}
              onChange={handleChange}
            />
          </label>
        )}
      </div>

      <fieldset className="booking-slot-choice-group">
        <legend>Booking Mode</legend>
        <label>
          Slot
          <input
            type="radio"
            name="bookingMode"
            value="slot"
            checked={formData.bookingMode === "slot"}
            onChange={handleChange}
          />
        </label>
        <label>
          Group
          <input
            type="radio"
            name="bookingMode"
            value="group"
            checked={formData.bookingMode === "group"}
            onChange={handleChange}
          />
        </label>
      </fieldset>

      <fieldset className="booking-slot-choice-group">
        <legend>Visibility</legend>
        <label>
          Public
          <input
            type="radio"
            name="visibility"
            value="public"
            checked={formData.visibility === "public"}
            onChange={handleChange}
          />
        </label>
        <label>
          Private
          <input
            type="radio"
            name="visibility"
            value="private"
            checked={formData.visibility === "private"}
            onChange={handleChange}
          />
        </label>
      </fieldset>

      {formData.bookingMode === "group" && (
        <fieldset className="booking-slot-choice-group">
          <legend>Polling Method</legend>
          <label>
            Calendar
            <input
              type="radio"
              name="pollMethod"
              value="calendar"
              checked={formData.pollMethod === "calendar"}
              onChange={handleChange}
            />
          </label>
          <label>
            Heatmap
            <input
              type="radio"
              name="pollMethod"
              value="heatmap"
              checked={formData.pollMethod === "heatmap"}
              onChange={handleChange}
            />
          </label>
        </fieldset>
      )}
    </section>
  );
}

export default BookingSlotCreation;
