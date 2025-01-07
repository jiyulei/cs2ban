import React, { useEffect, useState } from "react";
import { fetchBanlist } from "../utils/fetchBanlist";
import Layout from "../components/Layout";

const BanlistPage = () => {
  const [banlist, setBanlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20; // 每页显示的行数
  console.log("banlist", banlist[0]);
  const getIconPath = (banReason) => {
    const basePath = "/icons";
    const iconMap = {
      Gun: `${basePath}/gun.png`,
      Molotov: `${basePath}/molly.png`,
      "Team Rage": `${basePath}/teammaterage.png`,
      "Enemy Rage": `${basePath}/enemyrage.png`,
      Kick: `${basePath}/kick.png`,
      Zeus: `${basePath}/zeus.png`,
      Knife: `${basePath}/knife.png`,
      Vac: `${basePath}/vac.png`,
      Suicide: `${basePath}/suicide.png`,
      Grenade: `${basePath}/grenade.png`,
      Transformers: `${basePath}/transformers.png`,
      AFK: `${basePath}/afk.png`,
    };
    return iconMap[banReason] || `${basePath}/default.png`;
  };

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

  const totalPages = Math.ceil(banlist.length / rowsPerPage);

  const generatePageNumbers = () => {
    const pageNumbers = [];
    const range = 2; // 当前页两侧显示的页数范围
    const start = Math.max(2, currentPage - range);
    const end = Math.min(totalPages - 1, currentPage + range);

    pageNumbers.push(1); // 始终显示第一页

    if (start > 2) {
      pageNumbers.push("..."); // 添加省略号
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    if (end < totalPages - 1) {
      pageNumbers.push("..."); // 添加省略号
    }

    if (totalPages > 1) {
      pageNumbers.push(totalPages); // 始终显示最后一页
    }

    return pageNumbers;
  };

  const handlePageChange = (page) => {
    if (typeof page === "number" && page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const displayedRows = banlist.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Layout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-black">Banlist</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Name
                </th>
                <th className="pl-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
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
            <tbody className="bg-white divide-y divide-gray-200 text-black">
              {displayedRows.map((ban, index) => (
                <tr
                  key={index}
                  className={ban.timesBanned > 1 ? "bg-red-100" : ""}
                >
                  <td className="px-4 py-2 truncate max-w-xs sm:min-w-sm">
                    {ban.name}
                  </td>
                  <td className="px-8 py-2 hidden sm:table-cell">
                    <div className="flex items-center">
                      <span>{ban.banReason}</span>
                      <img
                        src={getIconPath(ban.banReason)}
                        alt={`${ban.banReason} icon`}
                        className="w-5 h-5 ml-2"
                      />
                    </div>
                  </td>
                  <td className="pl-4 py-2">
                    {new Date(ban.date).toISOString().slice(0, 10)}
                  </td>
                  <td className="px-12 py-2 hidden lg:table-cell">
                    {ban.ratingReduced}
                  </td>
                  <td className="px-12 py-2 hidden md:table-cell">
                    {ban.banDuration}
                  </td>
                  <td className="px-16 py-2 lg:table-cell">
                    {ban.timesBanned}
                  </td>
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

        {/* Pagination */}
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          {generatePageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(page)}
              disabled={page === "..."}
              className={`px-4 py-2 mx-1 rounded ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              } ${page === "..." ? "cursor-default" : ""}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default BanlistPage;
