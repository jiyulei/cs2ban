import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../utils/mongodb";

type Data = {
  message: string;
  success: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    try {
      const {
        name,
        ratingReduced,
        banReason,
        date,
        banDuration,
        steamURL,
        gameId,
      } = req.body;

      console.log("Request body:", req.body);

      if (
        !name ||
        ratingReduced === undefined ||
        !banReason ||
        !date ||
        !banDuration ||
        !steamURL
      ) {
        console.error("Missing required fields:", {
          name,
          ratingReduced,
          banReason,
          date,
          banDuration,
          steamURL,
        });
        return res
          .status(400)
          .json({ message: "Missing required fields", success: false });
      }

      const client = await clientPromise;
      const db = client.db("cs2");
      const collection = db.collection("banlist");

      // 确保 `date` 字段为 Date 类型
      const parsedDate = new Date(date);

      if (isNaN(parsedDate.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid date format", success: false });
      }

      const existingEntries = await collection.find({ steamURL }).toArray();

      const totalTimesBanned = existingEntries.length + 1;

      const result = await collection.insertOne({
        name,
        ratingReduced,
        banReason,
        date: parsedDate,
        banDuration,
        steamURL,
        gameId,
        timesBanned: totalTimesBanned,
      });

      console.log("Inserted new entry with updated timesBanned:", result);

      res.status(200).json({
        message: "Entry added successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error adding to banlist:", error);
      res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed`, success: false });
  }
}
