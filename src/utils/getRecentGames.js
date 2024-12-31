// Get admins most recent game (only one)
import axios from "axios";
import fs from "fs";

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
  
  "76561199702087214",
  "76561198846884926",
  "76561198210464163",
  "76561198262417737",
  "76561199026910589",
  "76561198979910846",
  "76561198393185379",
];

const BASE_URL = "https://api.leetify.com/api/profile/";

const fetchAndSaveGames = async () => {
  const results = {};

  for (const steamid of steamIDs) {
    try {
      const response = await axios.get(`${BASE_URL}${steamid}`);
      const games = response.data?.games;

      if (games && games.length > 0) {
        results[steamid] = games[0]; // Save the first game
      } else {
        results[steamid] = null; // Save null if no games found
      }
    } catch (error) {
      console.error(
        `Error fetching data for SteamID: ${steamid}`,
        error.message
      );
      results[steamid] = null; // Save null in case of an error
    }
  }

  // Save results to a JSON file
  fs.writeFileSync(
    "./adminsMostRecentGames.json",
    JSON.stringify(results, null, 2), // Format the JSON nicely
    "utf-8"
  );
  console.log("Saved game data to adminsMostRecentGames.json");
};

// Call the function
fetchAndSaveGames();
