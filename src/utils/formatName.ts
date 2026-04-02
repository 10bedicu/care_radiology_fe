export const formatName = (
  user?: {
    first_name: string;
    last_name: string;
    prefix?: string | null;
    suffix?: string | null;
    username?: string;
  },
  hidePrefixSuffix: boolean = false,
) => {
  if (!user) return "-";

  const name = [
    hidePrefixSuffix ? undefined : user.prefix,
    user.first_name,
    user.last_name,
    hidePrefixSuffix ? undefined : user.suffix,
  ]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(" ");

  return name || user.username || "-";
};
