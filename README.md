## WIP

This is extremely early days, but the intent of this project, is to have an addon to create any dashboard with @hakit/core or @hakit/components with a UI in home assistant rather than having to create / upload react components.

Additionally, i hope to have a way to create / write custom components that can automatically be updated as a component to pick from in the UI, meaning you can create your own components and share them with others.

### Local Development
Simply run `npm run dev` and it will spin up a server and client under port 2022.
From there, it will create/update files under the `ha` folder in your current working directory.


### Configuration Files
These are currently read/written to /config/hakit so you can store the configurations correctly. Additionally, this means that you can copy/paste the files and provide them to someone else and the dashboard will render! Neato!

### Next Steps
- figure out how to pass authentication token through to hakit
- https://github.com/react-grid-layout/react-grid-layout - I want to use this for the ui layout so users can drag / drop components or entire sections, need to check if this can be achieved to have nested layouts.
- each "drop zone" should have a "component picker" to allow users to dump any component into a dropzone.
- add configurable popup for every component used.
- generate the options for the popup from @hakit/core @hakit/component packages so there's nothing to maintain.


### Test the build with docker
If the below passes, it can then be tested in home assistant instance (need to write docs for this)
```
docker build --build-arg BUILD_FROM=ghcr.io/home-assistant/aarch64-base:latest -t hakit .
```

### PROBLEMS
- the current addon takes a while to install, close to 5 minutes, need to assess if this can be improved by pre-building the application and sending zipped files to the addon image.