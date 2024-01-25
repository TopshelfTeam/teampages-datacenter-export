import "dotenv/config";

import { getWikiComments } from "./api";
import fs from "fs";
import { WikiComment } from "./types";
import {
  getResultsPageFilePath,
  getUniqUsersFromBodyContent,
  isUserExist,
} from "./utils";

import type { User } from "./types";
const BASE_URL = process.env.BASE_URL as string;
export async function addPageComments({
  startAt = 0,
  maxResults = 1,
  projectKey,
  pageId,
  users = [],
}: {
  startAt?: number;
  maxResults?: number;
  projectKey: string;
  pageId: string;
  users: User[];
}): Promise<User[]> {
  const comments = await getWikiComments({
    baseURL: BASE_URL,
    startAt,
    maxResults,
    pageId,
  });

  if (!comments?.values?.length) return users;

  const commentsFilePath = `${getResultsPageFilePath(
    projectKey
  )}/${pageId}/comments.json`;

  await new Promise((res) => {
    try {
      if (!fs.existsSync(commentsFilePath)) {
        fs.writeFileSync(commentsFilePath, JSON.stringify(comments.values));
      } else {
        const data = fs.readFileSync(commentsFilePath, "utf-8");
        const jsonObject = data ? JSON.parse(data) : [];
        const results = comments.values.filter(
          (el) => !jsonObject.some((data: WikiComment) => data.id === el.id)
        );
        fs.writeFileSync(
          commentsFilePath,
          JSON.stringify([...jsonObject, ...results])
        );

        if (results.length) {
          console.log(
            `comments ids ${results
              .map(({ id }) => id)
              .join(", ")} for pageId ${pageId}  was updated`
          );
        }
      }
    } catch (err) {
      console.debug({ err });
      throw err;
    } finally {
      res({});
    }
  });

  for (const comment of comments.values) {
    const newUsers = getUniqUsersFromBodyContent(comment?.body);
    newUsers.forEach((user) => {
      if (!users.some((el) => el.name === user.name)) {
        users.push(user);
      }
    });

    if (!isUserExist({ username: comment.author.username, users })) {
      newUsers.push({
        name: comment.author.username,
        displayName: comment.author.displayName,
      });
    }
    if (!isUserExist({ username: comment.updateAuthor.username, users })) {
      newUsers.push({
        name: comment.updateAuthor.username,
        displayName: comment.updateAuthor.displayName,
      });
    }
  }

  if (comments?.isLast === false) {
    await addPageComments({
      startAt: startAt + maxResults,
      maxResults,
      projectKey,
      pageId,
      users,
    });
  }

  return users;
}
