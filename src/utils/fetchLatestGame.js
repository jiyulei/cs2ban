import axios from "axios";

export const fetchRecentGames = async (steamid) => {
  try {
    const response = await axios.get(
      `/api/fetch-latestgame?steamid=${steamid}`
    );
    return response.data; 
  } catch (error) {
    console.error("Error fetching recent games:", error.message);
    return { success: false, message: "Failed to fetch recent games" };
  }
};
