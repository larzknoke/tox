export function getWeekdayName(dayNumber) {
  const weekdays = [
    "Sonntag", // 0
    "Montag", // 1
    "Dienstag", // 2
    "Mittwoch", // 3
    "Donnerstag", // 4
    "Freitag", // 5
    "Samstag", // 6
  ];

  // Ensure the input is a valid number between 0 and 6
  if (dayNumber < 0 || dayNumber > 6 || isNaN(dayNumber)) {
    throw new Error("Invalid day number. Must be between 0 and 6.");
  }

  return weekdays[dayNumber];
}
