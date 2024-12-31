import axios from "axios";

export const fetchLeetifyGames = async (steamid) => {
  try {
    const response = await axios.get(
      `https://api.leetify.com/api/profile/${steamid}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching recent games:", error.message);
    return { success: false, message: "Failed to fetch recent games" };
  }
};

