import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler( req: NextApiRequest,
  res: NextApiResponse) {
    const { steamids } = req.query;

    if (!steamids) {
      return res.status(400).json({ error: "Steam IDs are required" });
    }

    const API_KEY = "F37F0AF6BDC90BBBA742FFB39B122603";
    const GET_PLAYER_SUMMARIES_URL =
      "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/";

    try {
      const response = await axios.get(GET_PLAYER_SUMMARIES_URL, {
        params: {
          key: API_KEY,
          steamids,
        },
      });

      return res.status(200).json(response.data.response.players);
    } catch (error: unknown) {
      if (error instanceof Error) {
        // 明确将 error 转换为 Error 类型
        console.error("Error fetching Steam user info:", error.message);
        return res
          .status(500)
          .json({ error: "Failed to fetch Steam user info" });
      } else {
        console.error("Unknown error fetching Steam user info");
        return res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  }