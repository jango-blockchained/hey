import prisma from "@hey/db/prisma/db/client";
import { getRedis, setRedis } from "@hey/db/redisClient";
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
      const cacheKey = `list:${id}`;
      const cachedData = await getRedis(cacheKey);

      if (cachedData) {
        logger.info(`(cached) List fetched for ${id}`);
        return res
          .status(200)
          .json({ result: JSON.parse(cachedData), success: true });
      }

      const data = await prisma.list.findUnique({
        include: {
          _count: { select: { profiles: true } },
          profiles: { take: 10, select: { profileId: true } }
        },
        where: { id: id as string }
      });

      if (!data) {
        return notFound(res);
      }

      const { _count, profiles, ...rest } = data;

      const result = {
        ...rest,
        profiles: profiles.map((profile) => profile.profileId),
        count: _count.profiles
      };

      await setRedis(cacheKey, result);
      logger.info(`List fetched for ${id}`);

      return res.status(200).json({ result, success: true });
    } catch (error) {
      return catchedError(res, error);
    }
  }
];
