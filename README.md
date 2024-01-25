
## Description

This repo contains node.js based scripts that export [Simple Team Pages app](https://marketplace.atlassian.com/apps/1211794/simple-team-pages-for-jira?hosting=datacenter&tab=overview) data (for the Server/Data Center version) from your self hosted Jira instance to local disk.

From there, you can submit it to support for import in Jira Cloud.


## Prerequisites

Either node.js + npm or Docker.


## Using this with Docker

If you have docker installed, you can simply build an image for this code using the Dockerfile from this repo.

From the root of the repo, you would run this command:

    docker build -t team-pages-export:local . 

This builds a docker image with the name `team-pages-export` and version `local`.

Once the image is built, create a folder where the exported data should be stored.  
For example:  `exported_data`

Then run the container using this command:

    docker run \
      --name "team-pages-export" \
      -it \
      --rm \
      -e USERNAME="admin" \
      -e PASSWORD="admin" \
      -e BASE_URL="https://jira.mycompany.com/jira" \
      -v "$(pwd)"/exported_data:/app/results \
      team-pages-export:local

Replace the `BASE_URL` with the url to your Jira instance. Note that you need `/jira` only if that is where your instance runs, otherwise leave it off.

Replace the USERNAME and PASSWORD and with those of the user you wish to run the export under. Ideally, this should be an admin user, so they have access to all the relevant projects.

When the container runs, it mounts the local `exported_data` folder into place and performs the export, writing the files to that folder, so they are accessible once the export finishes and the container is torn down.  
(Note we are passing `--rm` into the docker run, so the container will be deleted once the export finishes).

By default, the export runs for all projects. If you wish to limit the export to a specific project, add a `PROJECT` env variable with the project key you wish to export.



## Using this without Docker

If you do not wish to use docker, and have node.js and npm installed, you can simply use the code from the repo without building the docker container.

1. install all the node dependencies via `npm install`.
2. crete a .env file in the root of the repo, and put the following in it:
    
        USERNAME="admin"
        PASSWORD="admin"
        BASE_URL="https://jira.mycompany.com/jira"
        PROJECT_KEY=

    Replace the values with those for your user/instance of course.
3. create a folder called `results`, which is where the exported data is stored by default.  
    Note: there is no configuration option for this, so the folder has to be named this.
4. run the export via `npm start`




## What data is exported vs what is not exported

The data exported includes:

- all pages
- past page versions
- page comments
- page attachments
- page permissions
- page history
- user mappings (see details below)


Data not exported:

- page audit log / visitor log
- favorites


## Additional Notes:

- the exported data contains a file called `user-mappings.json` for each page. This file contains information about your users. Specifically: the username and the email address for each user involved in a page. 
    - We use this information during imports, by looking up the corresponding user in Jira cloud via their email address, and then remapping all the history entries and ownership entries to point to their atlassian account id, instead of their username
- the exported data contains page permissions. This does not includes only groups and users, and specifically ignores roles, as Jira Cloud does not support roles.
- the export does not include the auditlog, which means "recent pages" will be empty for each user, as there won't be any history of when a given user has seen a page
- the export does not include favorites, as those are stored per-user, and we are running the export as a specific user which doesn't have access to the favorites data of other users. The result is that your users will have to re-establish favorites.
- the export scripts makes many API calls to retrieve all the various pieces. If your Jira instance is particularly busy, or starved for resources, we recommend running the export during off-hours
- as a data point for performance: during testing, we exported ~1200 pages with about 30mb of attachments in roughly 15 minutes

