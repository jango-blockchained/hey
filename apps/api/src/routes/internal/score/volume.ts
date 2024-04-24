import type { Handler } from 'express';

import catchedError from 'src/lib/catchedError';
import heyPrisma from 'src/lib/heyPrisma';

// TODO: add tests
export const get: Handler = async (req, res) => {
  try {
    const score = await heyPrisma.cachedProfileScore.aggregate({
      _count: { score: true },
      _sum: { score: true }
    });

    return res.status(200).json({
      cached: score._count.score,
      success: true,
      volume: score._sum.score
    });
  } catch (error) {
    catchedError(res, error);
  }
};