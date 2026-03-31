export default function getVR2Date() {
  const baseDate = new Date("2025-03-31T00:00:00+05:30"); // Monday
  const now = new Date();
  
  // 1. Get current IST time
  let target = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));

  // 2. Rule: If past 17:05, move to NEXT day
  const hours = target.getUTCHours();
  const minutes = target.getUTCMinutes();
  if (hours > 17 || (hours === 17 && minutes >= 5)) {
    target.setUTCDate(target.getUTCDate() + 1);
  }

  // 3. Rule: If result is Sunday, move to Monday
  if (target.getUTCDay() === 0) {
    target.setUTCDate(target.getUTCDate() + 1);
  }

  // 4. Calculate Difference (using UTC midnights to keep math exact)
  const start = Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate());
  const end = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  
  const diffDays = Math.round((end - start) / (24 * 60 * 60 * 1000));
  
  // 5. Calculate Week and Day
  // Since we already moved the 'target' date forward, 
  // Math.floor(diffDays / 7) will naturally give you 47 tonight.
  const weekNumber = Math.floor(diffDays / 7);
  let dayOfWeek = target.getUTCDay() || 7; 

  // Map Sunday (7) back to Monday (1) for your string requirements
  if (dayOfWeek === 7) dayOfWeek = 1;

  const dayAbbr = ["", "MO", "TU", "WE", "TH", "FR", "SA"][dayOfWeek];
  return `${String(weekNumber).padStart(3, "0")}-${dayOfWeek}${dayAbbr}`;
}
