import logger from '@hey/lib/logger';

import createNotionClient from './createNotionClient';

const notion = createNotionClient();

const pushToNotionDatabase = async (database_id: string, properties: any) => {
  try {
    const newPage = await notion.pages.create({
      parent: { database_id },
      properties
    });

    return newPage;
  } catch {
    logger.error('Failed to push to Notion database');
  }
};

export default pushToNotionDatabase;
