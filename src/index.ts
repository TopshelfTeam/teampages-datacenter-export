import "dotenv/config";
import fs from "fs";

import { createProjects } from "./createProjects";
import { addPageData } from "./addPageData";

import { PROJECTS_FILE_PATH } from "./const";
const PROJECT_KEY = process.env.PROJECT_KEY;

async function start() {
  fs.writeFileSync(PROJECTS_FILE_PATH, JSON.stringify([]));
  await createProjects({
    projectsFilePath: PROJECTS_FILE_PATH,
    projectKey: PROJECT_KEY,
  });
  await addPageData({ projectsFilePath: PROJECTS_FILE_PATH });
}
start();
