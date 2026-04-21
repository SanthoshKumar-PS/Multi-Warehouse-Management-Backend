export default function getPurchaseDate() {
  const baseDate = new Date("2025-03-31"); // base date
  const today = new Date();

  const diffDays = Math.floor(
    (today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const weekNumber = Math.floor(diffDays / 7);
  const dayOfWeek = today.getDay(); // 0-6

  const dayAbbr = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  return `PR-${weekNumber.toString().padStart(3, "0")}-${dayOfWeek}${dayAbbr[dayOfWeek]}`;
}