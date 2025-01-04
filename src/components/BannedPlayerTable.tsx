import React, { useState } from "react";
import Dropdown from "./Dropdown";

const BannedPlayerTable = ({ players }) => {
    // Todo: update this function
    const handleAddToDatabase = async (
      entry,
      banReason,
      ratingReduced,
      banDuration
    ) => {
      const newEntry = {
        name: entry.name,
        steamURL: entry.steamURL,
        timesBanned: entry.timesBanned || 1,
        banReason,
        ratingReduced,
        banDuration,
        date: new Date().toISOString(),
      };

      try {
        const response = await fetch("/api/addBanEntry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEntry),
        });

        if (response.ok) {
          console.log("Successfully added to database");
        } else {
          console.error("Failed to add to database");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

  const [banReason, setBanReason] = useState("");
  const [ratingReduced, setRatingReduced] = useState("");
  const [banDuration, setBanDuration] = useState("");

  const handleReasonSelect = (reason) => setBanReason(reason);
  const handleRatingSelect = (rating) => setRatingReduced(rating);
  const handleDurationSelect = (duration) => setBanDuration(duration);

  return (
    <div className="mt-6">
      {players.length === 0 ? (
        <p className="text-center text-gray-500">
          No banned players to display.
        </p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Game ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Player ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ban Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rating Reduced
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ban Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Add
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((entry, index) =>
              entry.teammates.map((teammate, subIndex) => (
                <tr key={`${index}-${subIndex}`}>
                  <td className="px-6 py-4">{entry.gameId}</td>
                  <td className="px-6 py-4">{teammate}</td>
                  <td className="px-6 py-4">
                    <Dropdown
                      options={["Cheating", "Toxic Behavior", "Other"]}
                      onSelect={handleReasonSelect}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Dropdown
                      options={["100", "200", "300"]}
                      onSelect={handleRatingSelect}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Dropdown
                      options={["1 day", "7 days", "Permanent"]}
                      onSelect={handleDurationSelect}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() =>
                        handleAddToDatabase(
                          entry,
                          banReason,
                          ratingReduced,
                          banDuration
                        )
                      }
                      disabled={!banReason || !ratingReduced || !banDuration}
                    >
                      Add
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BannedPlayerTable;
