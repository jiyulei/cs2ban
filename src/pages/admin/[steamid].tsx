import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchRecentGames } from "../../utils/fetchLatestGame";
import { fetchBannedPlayers } from "../../utils/fetchBannedPlayers";
import { fetchLeetifyGames } from "../../utils/fetchLeetifyGames";

const AdminDetailsPage = () => {
  const router = useRouter();
  const { steamid, name } = router.query; 
  const [activeTab, setActiveTab] = useState("recentGames");
  // const [recentGames, setRecentGames] = useState([]);
  const [bannedPlayers, setBannedPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [leetifyGames, setLeetifyGames] = useState([]);

  const [comparisonResults, setComparisonResults] = useState(null);


  // const handleFetchRecentGames = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const response = await fetchRecentGames(steamid); 
  //     if (response.success && response.gameData) {
  //       setRecentGames([response.gameData]);
  //     } else {
  //       setError(response.message || "Failed to retrieve game data");
  //     }
  //   } catch (error) {
  //     setError("An error occurred while fetching recent games.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  // const handleFetchLeetifyGames = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const response = await fetchLeetifyGames(steamid);
  //     if (response.games) {
  //       setLeetifyGames(response.games.slice(0, 3));
  //     } else {
  //       setError(response.message || "Failed to retrieve game data");
  //     }
  //   } catch (error) {
  //     setError("An error occurred while fetching recent games.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const compareGames = (recentGames, leetifyGames) => {
    const targetGameId = recentGames.gameId;
    console.log("targetgameid--->", targetGameId)
    if (!targetGameId) {
      return []; 
    }

    
    const index = leetifyGames.findIndex((el) => el.gameId === targetGameId);

    // if nothing match, return first 10 games
    if (index === -1) {
      return leetifyGames.slice(0, 10);
    }

    return leetifyGames.slice(0, index);
  };

  
  const handleFetchAndCompareGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recentGamesResponse, leetifyGamesResponse] = await Promise.all([
        fetchRecentGames(steamid),
        fetchLeetifyGames(steamid),
      ]);

      if (
        recentGamesResponse.success &&
        recentGamesResponse.gameData &&
        leetifyGamesResponse.games
      ) {
        const comparisonResult = compareGames(
          recentGamesResponse.gameData,
          leetifyGamesResponse.games
        );

        // 更新状态，存储比较结果
        setComparisonResults(comparisonResult);
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
    // console.log("leetifyGames--->",leetifyGames);
    // console.log("gameData--->", recentGames);
    console.log("comparison result--->", comparisonResults)
  })

  // const handleFetchBannedPlayers = async () => {
  //   setLoading(true);
  //   setError(null);
  //   const players = await fetchBannedPlayers(steamid);
  //   if (players) setBannedPlayers(players);
  //   setLoading(false);
  // };

  return (
    <div className="p-6 bg-gray-200 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin: {name}</h1>
      <p className="text-center text-gray-500 mb-8">SteamID: {steamid}</p>

      <div>
        {/* 按钮 */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleFetchAndCompareGames}
          >
            Get Recent Games
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => {}}
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

        {activeTab === "recentGames" &&
          comparisonResults &&
          comparisonResults.length > 0 && (
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
                {comparisonResults.map((game, index) => (
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
