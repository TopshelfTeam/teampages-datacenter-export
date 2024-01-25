import "dotenv/config";

import { getWikiPages, getWikiPage } from "./api";
import fs from "fs";

import { parser } from "stream-json";
import { streamValues } from "stream-json/streamers/StreamValues";
import { omit } from "underscore";
import {
  getResultsPageFilePath,
  getUniqUsersFromBodyContent,
  isUserExist,
} from "./utils";

import { addUserMappings } from "./addUserMappings";
import { addPageComments } from "./addPageComments";
import { addWikiHistory } from "./addWikiHistory";
import { addPageVersions } from "./addPageVersions";
import { addPageFiles } from "./addPageFiles";
import { addGroups } from "./addGroups";

import type { User, Group } from "./types";

const BASE_URL = process.env.BASE_URL as string;

export async function addPageData({
  projectsFilePath,
}: {
  projectsFilePath: string;
}) {
  const readStream = fs.createReadStream(projectsFilePath);
  for await (const data of readStream.pipe(parser()).pipe(streamValues())) {
    for (const value of data.value) {
      if (!fs.existsSync(`results/${value.key}`)) {
        fs.mkdirSync(`results/${value.key}`);
        console.log(`Project Key ${value.key} was created`);
      }
      await createProjectPages({
        startAt: 0,
        maxResults: 50,
        projectKey: value.key,
      });
    }
  }
}

async function createProjectPages({
  startAt = 0,
  maxResults = 1,
  projectKey,
}: {
  startAt?: number;
  maxResults?: number;
  projectKey: string;
}) {
  const pages = await getWikiPages({
    baseURL: BASE_URL,
    startAt,
    maxResults,
    projectKey,
    params: "&includePermissions=true",
  });

  for (const { id } of pages.values) {
    const users: User[] = [];
    const groupUsers: Group[] = [];

    const page = await getWikiPage({
      baseURL: BASE_URL,
      pageId: id.toString(),
    });

    const pageFilePath = `${getResultsPageFilePath(projectKey)}/${page.id}`;

    const newUsers = getUniqUsersFromBodyContent(page?.body);
    newUsers.forEach((user) => {
      if (!users.some((el) => el.name === user.name)) {
        users.push(user);
      }
    });

    if (!isUserExist({ username: page.owner.username, users })) {
      users.push({
        name: page.owner.username,
        displayName: page.owner.displayName,
      });
    }

    if (!isUserExist({ username: page.updateAuthor.username, users })) {
      users.push({
        name: page.updateAuthor.username,
        displayName: page.updateAuthor.displayName,
      });
    }

    if (page?.watchers?.length) {
      for (const watcher of page.watchers) {
        if (!isUserExist({ username: watcher.username, users })) {
          users.push({
            name: watcher.username,
            displayName: watcher.displayName,
          });
        }
      }
    }

    await new Promise((res) => {
      try {
        if (!fs.existsSync(pageFilePath)) {
          fs.mkdirSync(pageFilePath);
        }
        fs.writeFileSync(
          `${pageFilePath}/page.json`,
          JSON.stringify(omit(page, "permissions"))
        );

        console.log(`page data for pageId ${page.id}  was created`);

        if (page?.permissions?.length) {
          fs.writeFileSync(
            `${pageFilePath}/permissions.json`,
            JSON.stringify(page.permissions)
          );

          for (const permission of page.permissions) {
            if (permission.type !== "user") {
              groupUsers.push({ name: permission?.name, id: permission.id });
            } else {
              if (!isUserExist({ username: permission.name, users })) {
                users.push({
                  name: permission.name,
                  displayName: permission.displayName,
                });
              }
            }
          }
          console.log(`page permissions for pageId ${page.id}  was created`);
        }
      } catch (err) {
        console.debug({ err });
        throw err;
      } finally {
        res({});
      }
    });

    const pageCommentUsers = await addPageComments({
      startAt: 0,
      maxResults: 50,
      projectKey,
      pageId: page.id.toString(),
      users: [],
    });

    pageCommentUsers.forEach((user) => {
      if (!users.some((el) => el.name === user.name)) {
        users.push(user);
      }
    });

    const wikiHistoryUsers = await addWikiHistory({
      startAt: 0,
      maxResults: 50,
      projectKey,
      pageId: page.id.toString(),
      users: [],
    });
    wikiHistoryUsers.forEach((user) => {
      if (!users.some((el) => el.name === user.name)) {
        users.push(user);
      }
    });

    const pageVersionUsers = await addPageVersions({
      pageId: page.id.toString(),
      projectKey,
    });
    pageVersionUsers.forEach((user) => {
      if (!users.some((el) => el.name === user.name)) {
        users.push(user);
      }
    });

    const attachmentUsers = await addPageFiles({
      pageId: page.id.toString(),
      projectKey,
      users: [],
    });
    attachmentUsers.forEach((user) => {
      if (!users.some((el) => el.name === user.name)) {
        users.push(user);
      }
    });

    await addGroups({
      projectKey,
      pageId: page.id.toString(),
      groups: groupUsers,
    });

    await addUserMappings({ pageId: page.id.toString(), projectKey, users });
  }

  if (pages?.isLast === false) {
    await createProjectPages({
      startAt: startAt + maxResults,
      maxResults,
      projectKey,
    });
  }
}
