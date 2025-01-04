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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newGames, setNewGames] = useState(null);
  const [bannedTeammates, setBannedTeammates] = useState([]);

  const eloCheck = (gameId, games) => {
    const matchedIndex = games.findIndex(
      (el) => el.gameId.slice(-6) === gameId
    );
    const [currentMatch, previousMatch] = games.slice(
      matchedIndex,
      matchedIndex + 2
    );
    // no skillLevel & loss
    if (previousMatch.skillLevel === 0 && currentMatch.skillLevel === 0) {
      // display to user
      return true;
    }

    // losing 300+ or dropping to 1000 (including 1000 -> 1000)
    if (
      previousMatch.skillLevel - currentMatch.skillLevel >= 300 ||
      currentMatch.skillLevel === 1000
    ) {
      // display to User
      return true;
    }

    return false;
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

  const handleClickTeammates = async (game) => {
    const teammateIds = game.ownTeamSteam64Ids.filter(
      (id) => !ADMINS_STEAMID.includes(id)
    );
    const gameId = game.gameId.slice(-6);

    console.log("game", game);
    console.log("team", teammateIds);
    const result = await Promise.all(
      teammateIds.map(async (id) => {
        const leetifyResponse = await fetchLeetifyGames(id);
        if (leetifyResponse.games && eloCheck(gameId, leetifyResponse.games)) {
          return id;
        }
        return null;
      })
    );

    const bannedIds = result.filter((id) => id !== null);

    console.log("banned Teammates", bannedIds);
    // update state
    if (bannedIds.length > 0) {
      const updatedTeammates = [
        ...bannedTeammates,
        { gameId: gameId, teammates: bannedIds },
      ];
      setBannedTeammates(updatedTeammates);
    }
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
  }, [newGames]);

  useEffect(() => {
    console.log("state", bannedTeammates);
  }, [bannedTeammates]);

  return (
    <div className="p-6 bg-gray-200 min-h-screen">
      {/* Loading / Error  */}
      {loading && <p className="text-center text-blue-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <h1 className="text-2xl font-bold mb-6 text-center">Admin: {name}</h1>
      <p className="text-center text-gray-500 mb-8">SteamID: {steamid}</p>

      <div>
        <div className="flex justify-center mb-6">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleFetchAndCompareGames}
          >
            Get Recent Games
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex justify-center border-b border-gray-200 ">
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
                activeTab === "bannedTeammates"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("bannedTeammates")}
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
                  K / D
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Game Finished At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Get Banned Players
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
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {/* Get Banned Players 按钮 */}
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        onClick={() => handleClickTeammates(game)}
                      >
                        Teammates
                      </button>

                      {/* Get Enemy 按钮 */}
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        onClick={() => {}}
                      >
                        Enemies
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "bannedTeammates" && bannedTeammates.length > 0 && (
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
              {bannedTeammates.map((player, index) => (
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
