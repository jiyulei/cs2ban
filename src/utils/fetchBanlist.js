export async function fetchBanlist() {
  try {
    const response = await fetch("/api/get-banlist");
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data; // Data will include message, success, and banlist
  } catch (error) {
    console.error("Failed to fetch banlist:", error);
    return null;
  }
}