import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchRecentGames } from "../../utils/fetchLatestGame";
import { fetchLeetifyGames } from "../../utils/fetchLeetifyGames";
import { ADMINS_STEAMID } from "../../utils/constants";
import BannedEnemiesTable from "../../components/BannedEnemiesTable";
import BannedTeammateTable from "../../components/BannedTeammateTable";
import Layout from "../../components/Layout";

const AdminDetailsPage = () => {
  const router = useRouter();
  const { steamid, name } = router.query;
  const [activeTab, setActiveTab] = useState("recentGames");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newGames, setNewGames] = useState(null);
  const [bannedTeammates, setBannedTeammates] = useState([]);
  const [bannedEnemies, setBannedEnemies] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

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
    const targetGameId = recentGames.gameId.slice(-6);
    console.log("targetgameid--->", targetGameId);
    if (!targetGameId) {
      return [];
    }

    const index = leetifyGames.findIndex(
      (el) => el.gameId.slice(-6) === targetGameId
    );

    if (index === -1) {
      return [];
    }
    return leetifyGames.slice(0, index);
  };

  const handleClickTeammates = async (game) => {
    setLoading(true);
    const teammateIds = game.ownTeamSteam64Ids.filter(
      (id) => !ADMINS_STEAMID.includes(id)
    );
    const gameId = game.gameId.slice(-6);

    try {
      console.log("game", game);
      console.log("team", teammateIds);
      const result = await Promise.all(
        teammateIds.map(async (id) => {
          const leetifyResponse = await fetchLeetifyGames(id);
          if (
            leetifyResponse.games &&
            eloCheck(gameId, leetifyResponse.games)
          ) {
            return id;
          }
          return null;
        })
      );

      const bannedIds = result.filter((id) => id !== null);

      console.log("banned Teammates", bannedIds);
      if (bannedIds.length > 0) {
        const updatedTeammates = [...bannedTeammates];

        const existingEntryIndex = updatedTeammates.findIndex(
          (entry) => entry.gameId === gameId
        );

        if (existingEntryIndex !== -1) {
          updatedTeammates[existingEntryIndex].teammates = [
            ...new Set([
              ...updatedTeammates[existingEntryIndex].teammates,
              ...bannedIds,
            ]),
          ];
        } else {
          updatedTeammates.push({
            gameId: gameId,
            teammates: bannedIds,
            date: game.gameFinishedAt,
          });
        }
        setBannedTeammates(updatedTeammates);
        setSuccessMessage(
          "Boom! Another one bites the dust. Head over to the Banned Teammates tab for the juicy details!"
        );
      } else {
        setSuccessMessage("No bans this round. Someone's having a lucky day!");
      }
    } catch (error) {
      console.error("Error fetching teammates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClickEnemies = async (game) => {
    setLoading(true);
    const enemyIds = game.enemyTeamSteam64Ids;
    const gameId = game.gameId.slice(-6);

    try {
      console.log("game", game);
      console.log("enemy", enemyIds);
      const result = await Promise.all(
        enemyIds.map(async (id) => {
          const leetifyResponse = await fetchLeetifyGames(id);
          if (
            leetifyResponse.games &&
            eloCheck(gameId, leetifyResponse.games)
          ) {
            return id;
          }
          return null;
        })
      );

      const bannedIds = result.filter((id) => id !== null);

      console.log("banned enemies", bannedIds);

      if (bannedIds.length > 0) {
        const updatedEnemies = [...bannedEnemies];
        const existingEntryIndex = updatedEnemies.findIndex(
          (entry) => entry.gameId === gameId
        );

        if (existingEntryIndex !== -1) {
          updatedEnemies[existingEntryIndex].enemies = [
            ...new Set([
              ...updatedEnemies[existingEntryIndex].enemies,
              ...bannedIds,
            ]),
          ];
        } else {
          updatedEnemies.push({
            gameId: gameId,
            enemies: bannedIds,
            date: game.gameFinishedAt,
          });
        }

        setBannedEnemies(updatedEnemies);
        setSuccessMessage(
          "Boom! Another one bites the dust. Head over to the Banned Enemies tab for the juicy details!"
        );
      } else {
        setSuccessMessage("No bans this round. Someone's having a lucky day!");
      }
    } catch (error) {
      console.error("Error fetching enemies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAndCompareGames = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage("");
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

        if (comparisonResult.length === 0) {
          setSuccessMessage("No new games found for this admin recently.");
        }

        setNewGames(comparisonResult);
      } else {
        setError("Failed to retrieve or compare game data.");
      }
    } catch (error) {
      setError(
        `An error occurred while fetching or comparing game data. ${error}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("comparison result--->", newGames);
  }, [newGames]);

  useEffect(() => {
    console.log("state bannedTeammates", bannedTeammates);
  }, [bannedTeammates]);

  useEffect(() => {
    console.log("state bannedEnemies", bannedEnemies);
  }, [bannedEnemies]);

  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  return (
    <Layout>
      <div className="p-6 bg-gray-200 min-h-screen">
        {/* Loading / Error  */}
        {loading && <p className="text-center text-blue-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {successMessage && (
          <div className="text-center bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-2">
            {successMessage}
          </div>
        )}

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
                Banned Teammates
              </button>
            </nav>

            <button
              className={`text-sm font-medium px-4 py-2 border-b-2 ${
                activeTab === "bannedEnemies"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("bannedEnemies")}
            >
              Banned Enemies
            </button>
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
                    <td className="px-3 py-4">
                      {game.kills} / {game.deaths}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(game.gameFinishedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          className={`px-4 py-2 rounded ${
                            loading
                              ? "bg-gray-500 text-white cursor-not-allowed"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                          onClick={() => handleClickTeammates(game)}
                          disabled={loading}
                        >
                          {loading ? "Loading..." : "Teammates"}
                        </button>

                        <button
                          className={`px-4 py-2 rounded ${
                            loading
                              ? "bg-gray-500 text-white cursor-not-allowed"
                              : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                          onClick={() => handleClickEnemies(game)}
                          disabled={loading}
                        >
                          {loading ? "Loading..." : "Enemies"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "bannedTeammates" && bannedTeammates.length > 0 && (
            <BannedTeammateTable players={bannedTeammates} />
          )}

          {activeTab === "bannedEnemies" && bannedEnemies.length > 0 && (
            <BannedEnemiesTable players={bannedEnemies} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDetailsPage;
