import React, { useEffect, useState } from "react";
import { fetchBanlist } from "../utils/fetchBanlist";

const BanlistPage = () => {
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
    <div>
      <h1>Banlist</h1>
      <ul>
        {banlist.map((ban, index) => (
          <li key={index}>
            <strong>{ban.name}</strong> - {ban.banReason} (Banned on:{" "}
            {new Date(ban.date).toLocaleDateString()})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BanlistPage;
