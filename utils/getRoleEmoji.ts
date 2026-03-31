
export function getRoleEmoji(trigram: string): string {
  switch (trigram.length) { 
    case 3:
        return "🧑‍🔧"; 
    case 4:
        return "👷🏻‍♀️";
    case 8:
        return "🧑‍✈️"; 
    case 18:
        return "🤴"; 
    default:
        return "👨‍💼"; 
  }
}
