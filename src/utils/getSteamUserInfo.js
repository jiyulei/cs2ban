import axios from "axios";
import fs from "fs"; // Node.js 文件系统模块

const API_KEY = "F37F0AF6BDC90BBBA742FFB39B122603";
const GET_PLAYER_SUMMARIES_URL =
  "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/";

/**
 * Fetch Steam user info for an array of Steam IDs.
 * @param {string[]} steamIDs - Array of Steam IDs
 */
async function getSteamUserInfo(steamIDs) {
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
    console.log("Fetched user info:", players);

    // Save the data to a JSON file
    fs.writeFileSync(
      "./steamUserInfo.json",
      JSON.stringify(players, null, 2), // 格式化输出
      "utf-8"
    );
    console.log("User info saved as steamUserInfo.json");

    return players; // Return the user info if needed
  } catch (error) {
    console.error("Error fetching Steam user info:", error.message);
  }
}

// Example usage
const steamIDs = [
  "76561198872990459",
  "76561199162068315",
  "76561198166300107",
  "76561198057449264",
  "76561198441182477",
  "76561199015029621",
  "76561198417126457",
  "76561198913629403",
  "76561199013102391",
  "76561198419381848",
  "76561199697454772",
  "76561199697983599",
  "76561199667238214",
  "76561199702087214",
  "76561198846884926",
  "76561198210464163",
  "76561198262417737",
  "76561199026910589",
  "76561198979910846",
  "76561198393185379",
];

getSteamUserInfo(steamIDs);



