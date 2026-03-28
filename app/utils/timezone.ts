export const EAST_8_TIMEZONE_OFFSET_HOURS = 8;

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

export function getDateInFixedTimezone(
  date: Date,
  timezoneOffsetHours: number,
) {
  return new Date(
    date.getTime() + timezoneOffsetHours * MILLISECONDS_PER_HOUR,
  );
}
