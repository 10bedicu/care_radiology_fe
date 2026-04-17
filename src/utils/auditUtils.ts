import dayjs from "dayjs";

export const formatDateTime = (date?: string | Date) => {
  if (!date) return "-";
  return dayjs(date).format("DD MMM YYYY, hh:mm A");
};

export const formatName = (
  user?: {
    first_name?: string;
    last_name?: string;
    username?: string;
  } | null,
) => {
  if (!user) return "-";
  const name = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || user.username || "-";
};
