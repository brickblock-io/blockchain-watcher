FROM node:8-alpine

# Use dumb-init to correctly and promptly handle SIGINT, SIGTERM etc
# https://github.com/Yelp/dumb-init#dumb-init
ENV DUMB_INIT_VERSION 1.2.1
ADD https://github.com/Yelp/dumb-init/releases/download/v${DUMB_INIT_VERSION}/dumb-init_${DUMB_INIT_VERSION}_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Create Application Directory and 'cd' into it
RUN mkdir -p /opt/app
WORKDIR /opt/app

# Copy over application files
COPY . ./

# remove this so yarn does not complain about SECRET_NPM_TOKEN running any yarn task
RUN rm .npmrc

# Use dumb-init as the entrypoint for correct and prompt
# handling of SIGINT, SIGTERM etc.
ENTRYPOINT ["dumb-init"]

# As it turns out, yarn will not wait for child processes to exit, until that is fixed
# we should not use yarn commands as the CMD (ie. `yarn start:prod` is a no-go)
#
# https://github.com/yarnpkg/yarn/issues/4667
# CMD ["/usr/local/bin/yarn start:prod"]
ENV NODE_PATH ./build
RUN echo "/usr/local/bin/yarn db:migrate && /usr/local/bin/node build/index.js" > ./boot.sh
CMD ["/bin/sh", "./boot.sh"]
