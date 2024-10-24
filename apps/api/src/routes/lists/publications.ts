import lensPg from "@hey/db/lensPg";
import prisma from "@hey/db/prisma/db/client";
import logger from "@hey/helpers/logger";
import type { Request, Response } from "express";
import catchedError from "src/helpers/catchedError";
import { rateLimiter } from "src/helpers/middlewares/rateLimiter";
import { noBody, notFound } from "src/helpers/responses";

export const get = [
  rateLimiter({ requests: 500, within: 1 }),
  async (req: Request, res: Response) => {
    const { id } = req.query;

    if (!id) {
      return noBody(res);
    }

    try {
      const data = await prisma.list.findUnique({
        select: { profiles: { select: { profileId: true } } },
        where: { id: id as string }
      });

      if (!data) {
        return notFound(res);
      }

      const profiles = data.profiles.map((profile) => profile.profileId);
      const profilesList = profiles.map((p) => `'${p}'`).join(",");

      const result = await lensPg.query(
        `
          SELECT publication_id AS id
          FROM publication_view
          WHERE profile_id IN (${profilesList})
          AND publication_type IN ('POST', 'MIRROR')
          AND is_hidden = false
          ORDER BY timestamp DESC
          LIMIT 50
        `
      );

      const publications = result.map((row) => row.id);
      logger.info(`List publications fetched for ${id}`);

      return res.status(200).json({ result: publications, success: true });
    } catch (error) {
      return catchedError(res, error);
    }
  }
];
