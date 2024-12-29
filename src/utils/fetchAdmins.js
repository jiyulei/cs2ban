import axios from "axios";

export const fetchAdmins = async () => {
  try {
    const response = await axios.get("/api/get-admins");
    const { data } = response;

    if (data.success) {
      return data.admins; // Return the list of admins if the request was successful
    } else {
      console.error("Error fetching admins:", data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching admins:", error.message);
    return [];
  }
};
