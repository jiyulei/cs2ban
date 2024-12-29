import React, { useEffect, useState } from "react";
import { fetchAdmins } from "../utils/fetchAdmins";
import { useRouter } from "next/router";

const AdminListPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getAdmins = async () => {
      setLoading(true);
      const data = await fetchAdmins();
      if (data.length > 0) {
        setAdmins(data);
      } else {
        setError("Failed to fetch admin data");
      }
      setLoading(false);
    };

    getAdmins();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Admins</h1>
      <p className="text-center text-gray-500 mb-8">
        Select the player who just played the game:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {admins.map((admin, index) => (
          <div
            key={index}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => router.push(`/admin/${admin.steamid}`)}
          >
            <img
              src={admin.avatarfull}
              alt={`${admin.personaname} avatar`}
              className="w-24 h-24 rounded-full shadow-md"
            />
            <h3 className="mt-4 text-sm font-medium text-gray-700">
              {admin.personaname}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminListPage;
