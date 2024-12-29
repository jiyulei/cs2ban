import React from "react";
import { useRouter } from "next/router";

const AdminDetailsPage = () => {
  const router = useRouter();
  const { steamid } = router.query; // Extract steamid from the URL

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Details</h1>
      <p className="text-center text-gray-500 mb-8">SteamID: {steamid}</p>
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-6"
          onClick={() => console.log(`Button clicked for SteamID: ${steamid}`)}
        >
          Add User
        </button>
        <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Column 1
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Column 2
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Column 3
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4">Data 1</td>
              <td className="px-6 py-4">Data 2</td>
              <td className="px-6 py-4">Data 3</td>
            </tr>
            {/* Add more rows here */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDetailsPage;
