import { useMemo, useState } from "react";
import api from "../../../shared/api/api";
import "./BookingSlotCreation.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDatePart(dateStr) {
  const date = new Date(dateStr);
  return formatDate(date);
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatTimeRange(start, end) {
  return `${formatTime(start)}-${formatTime(end)}`;
}

function addDays(dateStr, nb) {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + nb);
  return formatDate(date);
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  const [submitState, setSubmitState] = useState({
    status: "idle",
    message: "",
  });

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

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      ...formData,
      selectedSlots,
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

      {showCalendarSlotSelector && (
        <TwoPanelSelector
          selectedSlots={selectedSlots}
          setSelectedSlots={setSelectedSlots}
          activeDate={activeDate}
          setActiveDate={setActiveDate}
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
    setActiveDate(getDatePart(info.event.start));
  }

  const monthEvents = useMemo(() => {
    return selectedSlots.map((slot) => ({
      id: slot.id,
      title: formatTimeRange(slot.start, slot.end),
      start: slot.start,
      end: slot.end,
    }));
  }, [selectedSlots]);

  const dayEvents = useMemo(() => {
    return selectedSlots
      .filter((slot) => getDatePart(slot.start) === activeDate)
      .map((slot) => ({
        id: slot.id,
        title: formatTimeRange(slot.start, slot.end),
        start: slot.start,
        end: slot.end,
      }));
  }, [activeDate, selectedSlots]);

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
          selectMirror={true}
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
