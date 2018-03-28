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

# Use dumb-init as the entrypoint for correct and prompt
# handling of SIGINT, SIGTERM etc.
ENTRYPOINT ["dumb-init"]

CMD ["/usr/local/bin/yarn", "start:prod"]
