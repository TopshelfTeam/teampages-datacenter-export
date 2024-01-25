# --- --- --- --- --- --- --- --- 
# NODE DEPENDENCIES
# note: we install dependencies separately, in their own layer, 
#       so we don't have to constantly reinstall them when re-building the container
# --- --- --- --- --- --- --- --- 
FROM node:16.14.2-buster AS deps

# set the working directory as /app
WORKDIR /app

# copy the files necessary to install dependencies
COPY ./package*.json /app/
COPY ./yarn*.lock /app/

# install dependencies
RUN yarn



# --- --- --- --- --- --- --- --- 
# RUNNER
# --- --- --- --- --- --- --- --- 
FROM node:16.14.2-buster as runner

# install dependencies
RUN apt-get update && apt-get install -y dumb-init

# set the working directory as /app
WORKDIR /app

# copy the node modules from the build image into this one
COPY --chown=node:node --from=deps /app/node_modules /app/node_modules

# copy the app into the container and make it owned by the node user
COPY --chown=node:node . /app

# copy the docker entrypoint into the container. this is what starts up the app
COPY --chown=node:node ./docker-entrypoint.sh /app

# create the folder where we store the exported data
RUN mkdir /app/results

# make sure the entire folder is owned by node user, so we can write log files, etc
RUN chown node:node /app

# drop down to the node user, so the app won't run as root
USER node

# setup our entry point, so the export runs when the container starts
# note: this setup means that we can pass a command into the docker run, 
#       and thus skip the docker-entrypoint if we need, which is useful for debugging.
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/app/docker-entrypoint.sh"]
