import axios from "axios";


// Todo : add logic here
export const fetchBannedPlayers = async (steamid) => {
  try {
    const response = await axios.get(`/api/bannedPlayers?steamid=${steamid}`);
    const { data } = response;
    if (data.success) {
      return data.players; 
    } else {
      console.error("Error fetching banned players:", data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching banned players:", error.message);
    return [];
  }
};
