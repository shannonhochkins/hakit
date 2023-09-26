## TODO


local testing:

build: docker build --build-arg BUILD_FROM=ghcr.io/home-assistant/aarch64-base:latest -t hakit .

run: docker run -it --entrypoint /init hakit



TEST THIS
# Copy zipped dist files
COPY my_dist_files.zip /usr/app/

# Install unzip and then unzip the dist files
RUN apk add --no-cache unzip && \
    unzip my_dist_files.zip && \
    rm my_dist_files.zip



docker run --init -d \
--name home-assistant \
-e "TZ=America/New_York" \
-v /Users/shannonhochkins/Desktop/dev/PlaygroundXYZ/hakit/ha:/config \
-p 8123:8123 \
homeassistant/home-assistant:stable