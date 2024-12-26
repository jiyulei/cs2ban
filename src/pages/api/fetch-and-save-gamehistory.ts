import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../utils/mongodb";

type Data = {
  message: string;
  success: boolean;
  insertedCount?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    try {
      // Fetch data from the external api
      const response = await axios.get(
        "https://api.leetify.com/api/profile/76561198872990459"
      );
      const games = response.data.games;

      if (!Array.isArray(games) || games.length === 0) {
        return res.status(400).json({
          message: "No games found in the external API response",
          success: false,
        });
      }

      //Connect to MongoDB
      const client = await clientPromise;
      const db = client.db("cs2"); 
      const collection = db.collection("gamehistory1");

      //Insert games into the collection
      const formattedGames = games.map((game: any) => ({
        createdAt: new Date(), // current timestamp
        ...game,
      }));

      const result = await collection.insertMany(formattedGames);

      res.status(200).json({
        message: "Games fetched and saved successfully",
        success: true,
        insertedCount: result.insertedCount,
      });
    } catch (error: any) {
      console.error("Error fetching or saving games:", error.message);
      res.status(500).json({
        message: "Error fetching or saving games",
        success: false,
        error: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed`, success: false });
  }
}
