import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../utils/mongodb";

type Game = {
  title: string;
  score: number;
  createdAt: string;
};

type Data = {
  message: string;
  success: boolean;
  games?: Game[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("cs2"); // Correct database name
      const collection = db.collection("gamehistory1"); // Correct collection name

      // Fetch games with optional projection and limit
      const games = await collection
        .find({}, { projection: { title: 1, score: 1, createdAt: 1 } }) // Include only the fields you want
        .sort({ createdAt: -1 }) // Sort by createdAt descending
        .limit(20) // Limit to 20 results
        .toArray();

      res.status(200).json({
        message: "Games fetched successfully",
        success: true,
        games,
      });
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Error fetching games", success: false });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed`, success: false });
  }
}
