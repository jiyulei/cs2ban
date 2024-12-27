import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../utils/mongodb";

type BanEntry = {
  name: string;
  ratingReduced: number;
  banReason: string;
  date: string;
  banDuration: number;
  steamURL: string;
  timesBanned: number;
};

type Data = {
  message: string;
  success: boolean;
  banlist?: BanEntry[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("cs2"); 
      const collection = db.collection("banlist"); 

      // Fetch the banlist data
      const banlist = await collection
        .find({}, { projection: { _id: 0 } }) // Exclude `_id` field if not needed
        .sort({ date: -1 }) // Sort by `date` descending
        .toArray();

      res.status(200).json({
        message: "Banlist fetched successfully",
        success: true,
        banlist,
      });
    } catch (error) {
      console.error("Error fetching banlist:", error);
      res
        .status(500)
        .json({ message: "Error fetching banlist", success: false });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed`, success: false });
  }
}
