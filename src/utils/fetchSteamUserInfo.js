import axios from "axios";
// TODO: hide this when deploy
const API_KEY = "F37F0AF6BDC90BBBA742FFB39B122603";
const GET_PLAYER_SUMMARIES_URL =
  "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/";

/**
 * Fetch Steam user info for an array of Steam IDs.
 * @param {string[]} steamIDs - Array of Steam IDs
 * @returns {Promise<Object>} A map of Steam IDs to player names (or null if not found).
 */
export async function fetchSteamUserInfo(steamIDs) {
  try {
    // Join all Steam IDs into a comma-separated string (up to 100 per API request)
    const steamIDsString = steamIDs.join(",");

    // Make the API request
    const response = await axios.get(GET_PLAYER_SUMMARIES_URL, {
      params: {
        key: API_KEY,
        steamids: steamIDsString,
      },
    });

    // Extract player information
    const players = response.data.response.players;

    // Map Steam IDs to player names
    const steamIDToNameMap = {};
    players.forEach((player) => {
      steamIDToNameMap[player.steamid] = player.personaname || "Unknown";
    });

    return steamIDToNameMap;
  } catch (error) {
    console.error("Error fetching Steam user info:", error);
    return null; // Return null in case of an error
  }
}
