import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchRecentGames } from "../../utils/fetchLatestGame";
import { fetchBannedPlayers } from "../../utils/fetchBannedPlayers";
import { fetchLeetifyGames } from "../../utils/fetchLeetifyGames";
import { ADMINS_STEAMID } from "../../utils/constants";

const AdminDetailsPage = () => {
  const router = useRouter();
  const { steamid, name } = router.query;
  const [activeTab, setActiveTab] = useState("recentGames");
  const [bannedPlayers, setBannedPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newGames, setNewGames] = useState(null);

  const eloCheck = (gameId, games) => {
    const matchedIndex = games.findIndex(el => el.gameId = gameId);
    const [currentMatch, previousMatch] = games.slice(matchedIndex, matchedIndex + 2);
    // no skillLevel & loss
    if (previousMatch.skillLevel === 0 && currentMatch.skillLevel === 0) {
      // display to user
      return true;
    }
  
    // losing 300+ or dropping to 1000 (including 1000 -> 1000)
    if (
      (previousMatch.skillLevel - currentMatch.skillLevel) >= 300 ||
      currentMatch.skillLevel === 1000
    ) {
      // display to User
      return true;
    }

    return false;

  }

  const getRecentTeammatesAndEnemies = (games) => {
    const team = [];
    const enemy = [];
    games.forEach((game) => {
      const teammateIds = game.ownTeamSteam64Ids.filter(
        (el) => !ADMINS_STEAMID.includes(el)
      );

      let id = game.gameId.slice(-6);

      team.push({ gameId: id, teammate: teammateIds });
      const enemyIds = game.enemyTeamSteam64Ids;
      enemy.push({ gameId: id, enemy: enemyIds });
    });
    return [team, enemy];
  };

  const getNewGames = (recentGames, leetifyGames) => {
    // Todo: match only last 6 digits
    // eg: recentGames.gameId.slice(-6)
    const targetGameId = recentGames.gameId;
    console.log("targetgameid--->", targetGameId);
    if (!targetGameId) {
      return [];
    }

    const index = leetifyGames.findIndex((el) => el.gameId === targetGameId);

    if (index === -1) {
      return [];
    }
    // Todo: Change this to slice(0, index)
    return leetifyGames.slice(0, index + 1);
  };

  const handleClickBannedPlayers = () => {
    const team = getRecentTeammatesAndEnemies(newGames)[0];
    const enemy = getRecentTeammatesAndEnemies(newGames)[1];

    

    console.log("team", team);
    console.log("enemy", enemy);
  };

  const handleFetchAndCompareGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recentGamesResponse, leetifyGamesResponse] = await Promise.all([
        fetchRecentGames(steamid),
        fetchLeetifyGames(steamid),
      ]);
      console.log("leetifyGames--->", leetifyGamesResponse.games);
      console.log("recentGamesResponse-->", recentGamesResponse.gameData);
      if (
        recentGamesResponse.success &&
        recentGamesResponse.gameData &&
        leetifyGamesResponse.games
      ) {
        const comparisonResult = getNewGames(
          recentGamesResponse.gameData,
          leetifyGamesResponse.games
        );

        setNewGames(comparisonResult);
      } else {
        setError("Failed to retrieve or compare game data.");
      }
    } catch (error) {
      setError("An error occurred while fetching or comparing game data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("comparison result--->", newGames);
  });

  return (
    <div className="p-6 bg-gray-200 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin: {name}</h1>
      <p className="text-center text-gray-500 mb-8">SteamID: {steamid}</p>

      <div>
        <div className="flex justify-center space-x-4 mb-6">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleFetchAndCompareGames}
          >
            Get Recent Games
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleClickBannedPlayers}
          >
            Get Banned Players
          </button>
        </div>
      </div>

      {/* Loading / Error  */}
      {loading && <p className="text-center text-blue-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Tabs */}
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex justify-center border-b border-gray-200 pb-4">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              className={`text-sm font-medium px-4 py-2 border-b-2 ${
                activeTab === "recentGames"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("recentGames")}
            >
              Recent Games
            </button>
            <button
              className={`text-sm font-medium px-4 py-2 border-b-2 ${
                activeTab === "bannedPlayers"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("bannedPlayers")}
            >
              Banned Players
            </button>
          </nav>
        </div>

        {activeTab === "recentGames" && newGames && newGames.length > 0 && (
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg mt-6">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Map Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Match Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  K/D
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  GameFinishedAt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {newGames.map((game, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{game.mapName}</td>
                  <td className="px-6 py-4">{game.matchResult}</td>
                  <td className="px-6 py-4">
                    {game.kills} / {game.deaths}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(game.gameFinishedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "bannedPlayers" && bannedPlayers.length > 0 && (
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg mt-6">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Player Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ban Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Times Banned
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bannedPlayers.map((player, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{player.playerName}</td>
                  <td className="px-6 py-4">{player.banReason}</td>
                  <td className="px-6 py-4">{player.timesBanned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDetailsPage;
