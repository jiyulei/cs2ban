import React, { useState } from "react";
import { useRouter } from "next/router";

const AdminDetailsPage = () => {
  const router = useRouter();
  const { steamid, name } = router.query; // Extract steamid and name from query
  const [activeTab, setActiveTab] = useState("recentGames"); // Manage active tab

  return (
    <div className="p-6 bg-gray-200 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin: {name}</h1>
      <p className="text-center text-gray-500 mb-8">SteamID: {steamid}</p>

      <div >
        {/* Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() =>
              console.log(`Fetching recent games for SteamID: ${steamid}`)
            }
          >
            Get Recent Games
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() =>
              console.log(`Fetching banned players for SteamID: ${steamid}`)
            }
          >
            Get Banned Players
          </button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
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

        {/* Content */}
        {activeTab === "recentGames" && (
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
              <tr>
                <td className="px-6 py-4">mapName</td>
                <td className="px-6 py-4">matchResult</td>
                <td className="px-6 py-4">kills/deaths</td>
                <td className="px-6 py-4">gameFinishedAt</td>
              </tr>
              {/* Add more rows here */}
            </tbody>
          </table>
        )}
        {activeTab === "bannedPlayers" && (
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
              <tr>
                <td className="px-6 py-4">playerName</td>
                <td className="px-6 py-4">banReason</td>
                <td className="px-6 py-4">timesBanned</td>
              </tr>
              {/* Add more rows here */}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDetailsPage;
