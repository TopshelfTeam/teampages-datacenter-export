import "dotenv/config";

import { getWikiHistory } from "./api";
import fs from "fs";
import { History, User } from "./types";
import { getResultsPageFilePath, isUserExist } from "./utils";

const BASE_URL = process.env.BASE_URL as string;

export async function addWikiHistory({
  startAt = 0,
  maxResults = 1,
  projectKey,
  pageId,
  users,
}: {
  startAt?: number;
  maxResults?: number;
  projectKey: string;
  pageId: string;
  users: User[];
}): Promise<User[]> {
  const history = await getWikiHistory({
    baseURL: BASE_URL,
    startAt,
    maxResults,
    pageId,
  });

  const historyFilePath = `${getResultsPageFilePath(
    projectKey
  )}/${pageId}/history.json`;

  await new Promise((res) => {
    try {
      if (!fs.existsSync(historyFilePath)) {
        fs.writeFileSync(
          historyFilePath,
          JSON.stringify(history?.values || [])
        );
      }

      if (!history?.values?.length) {
        console.log(`history for page id ${pageId} not found`);
        return users;
      }

      const data = fs.readFileSync(historyFilePath, "utf-8");
      const jsonObject = data ? JSON.parse(data) : [];
      const results = history.values.filter(
        (el) => !jsonObject.some((data: History) => data.id === el.id)
      );
      fs.writeFileSync(
        historyFilePath,
        JSON.stringify([...jsonObject, ...results])
      );

      console.log(
        `history ids ${results
          .map(({ id }) => id)
          .join(", ")} for pageId ${pageId}  was updated`
      );
    } catch (err) {
      console.debug({ err });
      throw err;
    } finally {
      res({});
    }
  });

  for (const item of history.values) {
    if (!isUserExist({ username: item.author.username, users })) {
      users.push({
        name: item.author.username,
        displayName: item.author.displayName,
      });
    }
  }

  if (history?.isLast === false) {
    await addWikiHistory({
      startAt: startAt + maxResults,
      maxResults,
      projectKey,
      pageId,
      users,
    });
  }

  return users;
}
