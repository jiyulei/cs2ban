import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/utils/mongodb";

type Data = {
  message: string;
  success?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const client = await clientPromise;
    const db = client.db("Cluster0"); 

    // Test: List all collections
    const collections = await db.listCollections().toArray();

    res.status(200).json({
      message: `Successfully connected to the database. Collections: ${collections.map(
        (c) => c.name
      )}`,
      success: true,
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    res.status(500).json({
      message: "Error connecting to MongoDB",
      success: false,
    });
  }
}
