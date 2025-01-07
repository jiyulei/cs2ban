import React, { useState, useEffect } from "react";
import Dropdown from "./Dropdown";
import { getSteamUserInfo } from "../utils/getSteamUserInfo";
import { addBanlist } from "../utils/addBanlist";
import type { Teammates } from "../types/types";
import { fetchBanlist } from "../utils/fetchBanlist";

type Props = {
  players: Teammates[];
};

type PlayerInfo = {
  steamid: string;
  personaname?: string;
  avatar?: string;
  avatarfull?: string;
  avatarmedium?: string;
  profileurl?: string;
};

type Entry = {
  gameId: string;
  date: string;
  teammates: string[];
};

type BanEntry = {
  name: string;
  ratingReduced: number;
  banReason: string;
  date: string;
  banDuration: number;
  steamURL: string;
  timesBanned: number;
  gameId?: string; // gameId 可选
};

type TeammateEntry = {
  gameId: string;
  date: string;
  teammates: string[]; // 每个队友的 Steam ID
};

const BannedTeammateTable = ({ players }: Props) => {
  const [successMessage, setSuccessMessage] = useState("");

  const [localState, setLocalState] = useState<
    Record<
      string,
      { banReason: string; ratingReduced: string; banDuration: string }
    >
  >(
    players.reduce((acc, entry) => {
      entry.teammates.forEach((teammate) => {
        acc[teammate] = { banReason: "", ratingReduced: "", banDuration: "" };
      });
      return acc;
    }, {} as Record<string, { banReason: string; ratingReduced: string; banDuration: string }>)
  );

  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});
  const [filteredPlayerNames, setFilteredPlayers] = useState<TeammateEntry[]>(
    []
  );

  useEffect(() => {
    const fetchBanlistAndFilter = async () => {
      try {
        // 假设你有一个 API 方法 `fetchBanlist`，用来获取数据库中的 banlist
        const data = await fetchBanlist();

        const filteredPlayers: TeammateEntry[] = players.map((entry) => ({
          ...entry,
          teammates: entry.teammates.filter(
            (teammate) =>
              !data.banlist.some(
                (banEntry: BanEntry) =>
                  banEntry.gameId && // 确保 banEntry 包含 gameId
                  banEntry.gameId === entry.gameId && // 比较 gameId
                  banEntry.steamURL ===
                    `https://steamcommunity.com/profiles/${teammate}` // 比较 steamURL
              )
          ),
        }));

        // 过滤掉没有 teammates 的 entry
        const nonEmptyEntries = filteredPlayers.filter(
          (entry) => entry.teammates.length > 0
        );

        setFilteredPlayers(nonEmptyEntries);
      } catch (error) {
        console.error("Error fetching banlist or filtering players:", error);
      }
    };

    fetchBanlistAndFilter();
  }, [players]);

  useEffect(() => {
    console.log("filtered Players", filteredPlayerNames);
  });

  useEffect(() => {
    const steamIDs = [...new Set(players.flatMap((entry) => entry.teammates))];
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

  const handleFieldChange = (
    teammate: string,
    field: string,
    value: string | number
  ) => {
    setLocalState((prev) => ({
      ...prev,
      [teammate]: {
        ...prev[teammate],
        [field]: value,
      },
    }));
  };

  const handleAddToDatabase = async (entry: Entry, teammate: string) => {
    const { banReason, ratingReduced, banDuration } = localState[teammate];
    if (!banReason || ratingReduced === undefined || !banDuration) {
      console.error("All fields are required");
      return;
    }

    const newEntry = {
      name: playerNames[teammate] || "Unknown",
      ratingReduced: parseInt(ratingReduced, 10),
      banReason,
      date: new Date().toISOString(),
      banDuration: parseFloat(banDuration),
      steamURL: `https://steamcommunity.com/profiles/${teammate}`,
      gameId: entry.gameId,
    };

    const result = await addBanlist(newEntry);

    if (result && result.success) {
      console.log("Successfully added to banlist");
      setSuccessMessage(
        `${playerNames[teammate]} has been successfully added to the banlist!`
      );

      setFilteredPlayers(
        (prev) =>
          prev
            .map((playerEntry) => ({
              ...playerEntry,
              teammates: playerEntry.teammates.filter(
                (t) =>
                  !(
                    (
                      t === teammate && // match teammate
                      playerEntry.gameId === entry.gameId
                    ) // match gameId
                  )
              ),
            }))
            .filter((entry) => entry.teammates.length > 0)
      );
    } else {
      console.error("Failed to add to banlist");
      setSuccessMessage(
        `Failed to add ${playerNames[teammate]} to the banlist.`
      );
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
            {filteredPlayerNames.map((entry) =>
              entry.teammates.map((teammate) => (
                <tr key={teammate}>
                  <td className="px-6 py-4">{entry.gameId}</td>
                  <td className="px-6 py-4" title={teammate}>
                    {playerNames[teammate] || teammate}
                  </td>
                  <td className="px-6 py-4">
                    <Dropdown
                      options={[
                        "Gun",
                        "Molotov",
                        "Knife",
                        "Team Rage",
                        "Grenade",
                        "Zeus",
                        "Suicide",
                        "AFK",
                        "VAC",
                        "Transformers",
                      ]}
                      onSelect={(value: string | number) =>
                        handleFieldChange(teammate, "banReason", value)
                      }
                      defaultValue={localState[teammate]?.banReason || "Select"}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Dropdown
                      options={["0", "1000"]}
                      onSelect={(value: string | number) =>
                        handleFieldChange(teammate, "ratingReduced", value)
                      }
                      defaultValue={
                        localState[teammate]?.ratingReduced || "Select"
                      }
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Dropdown
                      options={["0.5", "2", "24", "168"]}
                      onSelect={(value: string | number) =>
                        handleFieldChange(teammate, "banDuration", value)
                      }
                      defaultValue={
                        localState[teammate]?.banDuration || "Select"
                      }
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
                        !localState[teammate]?.banReason ||
                        !localState[teammate]?.ratingReduced ||
                        !localState[teammate]?.banDuration
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => handleAddToDatabase(entry, teammate)}
                      disabled={
                        !localState[teammate]?.banReason ||
                        !localState[teammate]?.ratingReduced ||
                        !localState[teammate]?.banDuration
                      }
                    >
                      Add
                    </button>

                    {successMessage && (
                      <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded shadow">
                        {successMessage}
                        <button
                          className="ml-4 text-black bg-white rounded px-2 py-1"
                          onClick={() => setSuccessMessage("")}
                        >
                          Close
                        </button>
                      </div>
                    )}
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

export default BannedTeammateTable;
