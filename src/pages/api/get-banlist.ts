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
  gameId?: string;
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

      // Fetch the banlist data and type cast
      const rawBanlist = await collection
        .find({}, { projection: { _id: 0 } }) // Exclude `_id`
        .sort({ date: -1 })
        .toArray();

      // Map the raw data to BanEntry type
      const banlist: BanEntry[] = rawBanlist.map((item) => ({
        name: item.name,
        ratingReduced: item.ratingReduced,
        banReason: item.banReason,
        date: item.date,
        banDuration: item.banDuration,
        steamURL: item.steamURL,
        timesBanned: item.timesBanned,
        gameId: item.gameId
      }));

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
