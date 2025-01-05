import React, { useEffect, useState } from "react";
import { fetchBanlist } from "../utils/fetchBanlist";

const BanlistPage = () => {
const getIconPath = (banReason) => {
  const basePath = "/icons"; // Path to your icons folder
  const iconMap = {
    Gun: `${basePath}/gun.png`,
    Molotov: `${basePath}/molly.png`,
    "Team Rage": `${basePath}/teammaterage.png`,
    "Enemy Rage": `${basePath}/enemyrage.png`,
    Kick: `${basePath}/kick.png`,
    Zeus: `${basePath}/zeus.png`,
    Knife: `${basePath}/knife.png`,
    Molly: `${basePath}/molly.png`,
    Vac: `${basePath}/vac.png`,
    Suicide: `${basePath}/suicide.png`,
    Grenade: `${basePath}/grenade.png`,
    Transformers: `${basePath}/transformers.png`,
    AFK: `${basePath}/afk.png`,
  };
  return iconMap[banReason] || `${basePath}/default.png`; // Fallback to a default icon
};



  const [banlist, setBanlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBanlist = async () => {
      setLoading(true);
      const data = await fetchBanlist();
      if (data && data.success) {
        setBanlist(data.banlist);
      } else {
        setError(data?.message || "Failed to fetch banlist");
      }
      setLoading(false);
    };

    getBanlist();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Banlist</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Name
              </th>
              <th className="pl-20 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Ban Reason
              </th>
              <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Rating Reduced
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Ban Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lg:table-cell">
                Times Banned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Steam URL
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {banlist.map((ban, index) => (
              <tr
                key={index}
                className={ban.timesBanned > 1 ? "bg-red-100" : ""}
              >
                <td className="px-4 py-2 truncate max-w-xs sm:min-w-sm">
                  {ban.name}
                </td>
                <td className="px-8 py-2 hidden sm:table-cell">
                  <div className="flex justify-between items-center">
                    <span>{ban.banReason}</span>
                    <img
                      src={getIconPath(ban.banReason)}
                      alt={`${ban.banReason} icon`}
                      className="w-5 h-5  "
                    />
                  </div>
                </td>

                <td className="pl-4 py-2">
                  {ban.date}
                </td>
                <td className="px-12 py-2 hidden lg:table-cell">
                  {ban.ratingReduced}
                </td>
                <td className="px-12 py-2 hidden md:table-cell">
                  {ban.banDuration}
                </td>
                <td className="px-16 py-2 lg:table-cell">{ban.timesBanned}</td>
                <td className="px-8 py-2">
                  <a
                    href={ban.steamURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    Profile
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BanlistPage;
