/* Bogdan Timercan 261166331 */

export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDateOnly(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return formatDate(new Date(value));
}

export function formatTime(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimeRange(start, end) {
  return `${formatTime(start)}-${formatTime(end)}`;
}

export function addDays(dateStr, amount) {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return formatDate(date);
}
