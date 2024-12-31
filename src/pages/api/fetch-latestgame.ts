import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../utils/mongodb";

type Data = {
  message: string;
  success: boolean;
  gameData?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    const { steamid } = req.query;

    if (!steamid || typeof steamid !== "string") {
      return res.status(400).json({
        message: "Invalid or missing steamid parameter",
        success: false,
      });
    }

    try {
      // Connect to MongoDB
      const client = await clientPromise;
      const db = client.db("cs2");
      const collection = db.collection("adminsLatestGame");

      // Query the collection for the matching steamid
      const gameData = await collection.findOne({ steamid });
 


      if (!gameData) {
        return res.status(404).json({
          message: `No game data found for steamid: ${steamid}`,
          success: false,
        });
      }

      // Respond with the found game data
      res.status(200).json({
        message: "Game data retrieved successfully",
        success: true,
        gameData,
      });
    } catch (error: any) {
      console.error("Error fetching game data:", error.message);
      res.status(500).json({
        message: "Internal server error",
        success: false,
        error: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed`, success: false });
  }
}
