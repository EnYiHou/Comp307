export function buildMailto(email, subject, body = "") {
  const params = new URLSearchParams();

  if (subject) {
    params.set("subject", subject);
  }

  if (body) {
    params.set("body", body);
  }

  const query = params.toString();
  return `mailto:${email}${query ? `?${query}` : ""}`;
}

export function bookingMailto(email, action, booking) {
  const start = booking?.startTime
    ? new Date(booking.startTime).toLocaleString()
    : "the selected time";
  const title = booking?.title || "Booking appointment";

  return buildMailto(
    email,
    `${action}: ${title}`,
    `Hello,\n\nThis is a notification about "${title}" scheduled for ${start}.\n\nThank you.`,
  );
}
