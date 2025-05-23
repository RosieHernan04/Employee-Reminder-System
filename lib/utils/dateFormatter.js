export const formatDate = (timestamp) => {
  if (!timestamp) return "Not set";

  // Convert Firestore Timestamp to JS Date safely
  let dateObj;

  if (timestamp.toDate) {
    dateObj = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    dateObj = timestamp;
  } else if (typeof timestamp === "string" || typeof timestamp === "number") {
    dateObj = new Date(timestamp);
  } else {
    return "Invalid Date";
  }

  // Check if dateObj is valid
  if (isNaN(dateObj.getTime())) return "Invalid Date";

  // Format the Date
  return dateObj.toLocaleString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateWithoutTime = (timestamp) => {
  if (!timestamp) return "Not set";

  let dateObj;

  if (timestamp.toDate) {
    dateObj = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    dateObj = timestamp;
  } else if (typeof timestamp === "string" || typeof timestamp === "number") {
    dateObj = new Date(timestamp);
  } else {
    return "Invalid Date";
  }

  // Check if dateObj is valid
  if (isNaN(dateObj.getTime())) return "Invalid Date";

  return dateObj.toLocaleString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}; 