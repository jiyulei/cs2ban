import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../utils/mongodb";

type Data = {
  message: string;
  success: boolean;
  insertedId?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    try {
      const client = await clientPromise;
      const db = client.db("cs2"); // Correct database name
      const collection = db.collection("gamehistory1"); // Correct collection name

      const { title, score } = req.body;

      if (!title || !score) {
        return res.status(400).json({
          message: "Title and score are required",
          success: false,
        });
      }

      const result = await collection.insertOne({
        title,
        score,
        createdAt: new Date(),
      });

      res.status(200).json({
        message: "Data saved successfully",
        success: true,
        insertedId: result.insertedId.toString(),
      });
    } catch (error) {
      console.error("Error saving data:", error);
      res.status(500).json({ message: "Error saving data", success: false });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed`, success: false });
  }
}
