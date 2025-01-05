export async function addBanlist(entry) {
  try {
    console.log("Formatted newEntry:", entry);
    const response = await fetch("/api/add-banlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error("Failed to add to banlist:", error);
    return null;
  }
}
