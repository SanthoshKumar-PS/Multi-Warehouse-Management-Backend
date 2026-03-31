export function getISTDateOnly(date: Date) {
  const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffsetMs);

  return new Date(Date.UTC(
    istDate.getUTCFullYear(),
    istDate.getUTCMonth(),
    istDate.getUTCDate()
  ));
}