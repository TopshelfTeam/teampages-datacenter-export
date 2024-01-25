import fetch from "isomorphic-fetch";
import { log } from "./logger";
import "dotenv/config";

import type { User } from "../types";
import { uniq } from "lodash";

export const getResultsPageFilePath = (projectKey: string) =>
  `results/${projectKey}`;

export function cleanURL(url: URL | string) {
  const cleanUrl = new URL(url.toString());
  cleanUrl.password = new Array(cleanUrl.password.length).fill("*").join("");
  return cleanUrl.toString();
}

export function fetchWrap(urlStr: string, init?: RequestInit | undefined) {
  const url = new URL(urlStr);
  url.username = process.env.USERNAME as string;
  url.password = process.env.PASSWORD as string;

  return fetch(url.toString(), init).then((response) => {
    if (!response.ok) {
      log("Fetch Error", {
        url: cleanURL(url.toString()),
        method: init?.method || "GET",
        body: init?.body,
      });
    }

    return response;
  });
}

export function isUserExist({
  username,
  users,
}: {
  username: string;
  users: User[];
}): boolean {
  return users.some((el) => el.name === username);
}

export function getUniqUsersFromBodyContent(body: string): User[] {
  const matchedStrs = body?.match(/~([\w\d:-])*]/g) || [];

  return uniq(matchedStrs.map((str) => str.substring(1, str.length - 1))).map(
    (username) => {
      return {
        name: username,
      };
    }
  );
}
