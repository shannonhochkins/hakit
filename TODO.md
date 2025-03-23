- Swap out kinde for clerke?
- Now need to focus on the "Theme" part, where you can "install" themes, which will create a new config and related rows in the db, and also with preset values
- Need to figure out UX from login -> editor
  - We can have multiple "dashboards", each with their own global config, individual pages
  - Need to figure out how the navigation for this data type will work
  - Once loading the editor with a "dashboard" id /editor/1, it could show a dropdown menu with the "Dashboard", and another with the "pageConfigurations"


1. gcp upload repository should be only done once per repository
    - Should be stored in version folders named like the version of the package.json file
    - package name should be the name of the folder in gcp
    - Should skip upload if folder already exists in gcp and just give user access



    1. User Auth
      - Once domain is available, need to update kinde -> Application nodejs -> urls
      - Also update .env, one for dev and one for production for callback urls

Figure out why when navigation is added by itself, why it doesn't update, but when you add Background it does...


1. Figure out we can navigate to a DASHBOARD, and then be able to edit a page