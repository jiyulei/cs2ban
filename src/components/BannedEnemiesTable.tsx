import React, { useState, useEffect } from "react";
import Dropdown from "./Dropdown";
import { getSteamUserInfo } from "../utils/getSteamUserInfo";
import { addBanlist } from "../utils/addBanlist";
import type { Enemies } from "../types/types";

type Entry = {
  gameId: string;
  date: string;
  enemies: string[];
};

type PlayerInfo = {
  steamid: string;
  personaname?: string;
  avatar?: string;
  avatarfull?: string;
  avatarmedium?: string;
  profileurl?: string;
};

type Props = {
  players: Enemies[];
};

const BannedEnemiesTable = ({ players }: Props) => {
  const [localState, setLocalState] = useState<
    Record<
      string,
      { banReason: string; ratingReduced: string; banDuration: string }
    >
  >(
    players.reduce((acc, entry) => {
      entry.enemies.forEach((enemy) => {
        acc[enemy] = { banReason: "", ratingReduced: "", banDuration: "" };
      });
      return acc;
    }, {} as Record<string, { banReason: string; ratingReduced: string; banDuration: string }>)
  );

  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const steamIDs = [...new Set(players.flatMap((entry) => entry.enemies))];
    console.log("STEAMiDS", steamIDs);

    const fetchPlayerNames = async () => {
      const playerInfo: PlayerInfo[] = await getSteamUserInfo(steamIDs);
      if (playerInfo) {
        const namesMap = playerInfo.reduce<Record<string, string>>(
          (acc, player) => {
            acc[player.steamid] = player.personaname || "Unknown";
            return acc;
          },
          {}
        );
        setPlayerNames(namesMap);
      }
    };

    fetchPlayerNames();
  }, [players]);

  const handleFieldChange = (enemy: string, field: string, value: string | number) => {
    setLocalState((prev) => ({
      ...prev,
      [enemy]: {
        ...prev[enemy],
        [field]: value,
      },
    }));
  };

  const handleAddToDatabase = async (entry: Entry, enemy: string) => {
    const { banReason, ratingReduced, banDuration } = localState[enemy];
    if (!banReason || ratingReduced === undefined || !banDuration) {
      console.error("All fields are required");
      return;
    }

    const newEntry = {
      name: playerNames[enemy] || "Unknown",
      ratingReduced: parseInt(ratingReduced, 10),
      banReason,
      date: new Date().toISOString(),
      banDuration: parseFloat(banDuration),
      steamURL: `https://steamcommunity.com/profiles/${enemy}`,
      gameId: entry.gameId,
    };

    const result = await addBanlist(newEntry);

    if (result && result.success) {
      console.log("Successfully added to banlist");
    } else {
      console.error("Failed to add to banlist");
    }
  };

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
                Ban Duration(h)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Add
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-black">
            {players.map((entry) =>
              entry.enemies.map((enemy) => (
                <tr key={enemy}>
                  <td className="px-6 py-4">{entry.gameId}</td>
                  <td className="px-6 py-4" title={enemy}>
                    {playerNames[enemy] || enemy}
                  </td>
                  <td className="px-6 py-4">
                    <Dropdown
                      options={[
                        "Gun",
                        "Molotov",
                        "Knife",
                        "Enemy Rage",
                        "Grenade",
                        "Zeus",
                        "Suicide",
                        "AFK",
                        "VAC",
                      ]}
                      onSelect={(value: string) =>
                        handleFieldChange(enemy, "banReason", value)
                      }
                      defaultValue={localState[enemy]?.banReason || "Select"}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Dropdown
                      options={["0", "1000"]}
                      onSelect={(value: string | number) =>
                        handleFieldChange(enemy, "ratingReduced", value)
                      }
                      defaultValue={
                        localState[enemy]?.ratingReduced || "Select"
                      }
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Dropdown
                      options={["0.5", "2", "24", "168"]}
                      onSelect={(value: string | number) =>
                        handleFieldChange(enemy, "banDuration", value)
                      }
                      defaultValue={localState[enemy]?.banDuration || "Select"}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
                        !localState[enemy]?.banReason ||
                        !localState[enemy]?.ratingReduced ||
                        !localState[enemy]?.banDuration
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => handleAddToDatabase(entry, enemy)}
                      disabled={
                        !localState[enemy]?.banReason ||
                        !localState[enemy]?.ratingReduced ||
                        !localState[enemy]?.banDuration
                      }
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

export default BannedEnemiesTable;
