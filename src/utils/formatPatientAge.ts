import dayjs from "dayjs";

export const formatPatientAge = (
  patient: any,
  abbreviated = false
) => {
  if (!patient) return "-";

  const suffixes = abbreviated
    ? { year: "Y", month: "M", day: "D" }
    : { year: "years", month: "months", day: "days" };

  const start = patient.date_of_birth
    ? dayjs(new Date(patient.date_of_birth))
    : patient.year_of_birth
      ? dayjs(new Date(patient.year_of_birth, 0, 1))
      : null;

  if (!start) return "-";

  const end = dayjs();

  const years = end.diff(start, "years");
  if (years > 0) {
    return `${years} ${suffixes.year}`;
  }

  if (!patient.date_of_birth) {
    return abbreviated
      ? `Born ${patient.year_of_birth}`
      : `Born on ${patient.year_of_birth}`;
  }

  const months = end.diff(start, "month");
  const days = end.diff(start.add(months, "month"), "day");

  if (months > 0) {
    return `${months} ${suffixes.month} ${days} ${suffixes.day}`;
  }

  return `${days} ${suffixes.day}`;
};
