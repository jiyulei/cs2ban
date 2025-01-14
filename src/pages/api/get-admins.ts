import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../utils/mongodb";

type AdminEntry = {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  lastlogoff: number;
  personastate: number;
};

type Data = {
  message: string;
  success: boolean;
  admins?: AdminEntry[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("cs2");
      const collection = db.collection("admin");

      // Fetch the admins data
      const admins = await collection
        .find({}, { projection: { _id: 0 } }) // Exclude `_id` field
        .sort({ personaname: 1 }) // Sort alphabetically by `personaname`
        .toArray();

      // Map MongoDB documents to AdminEntry[]
      const mappedAdmins: AdminEntry[] = admins.map((admin) => ({
        steamid: admin.steamid,
        personaname: admin.personaname,
        profileurl: admin.profileurl,
        avatar: admin.avatar,
        avatarmedium: admin.avatarmedium,
        avatarfull: admin.avatarfull,
        lastlogoff: admin.lastlogoff,
        personastate: admin.personastate,
      }));

      res.status(200).json({
        message: "Admins fetched successfully",
        success: true,
        admins: mappedAdmins,
      });
    } catch (error) {
      console.error("Error fetching admins:", error);
      res
        .status(500)
        .json({ message: "Error fetching admins", success: false });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed`, success: false });
  }
}
