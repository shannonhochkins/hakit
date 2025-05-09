- Introduce dropdown menu for selecting a page within a dashboard
   - Also introduce a way to create a new page, potentially a popup with a name field?
- Kinde
  - Do i really need this? supabase already has auth, haven't looked into it yet though
  - See if i can capture location of the user, to determine the best database location
- Now need to focus on the "Theme" part, where you can "install" themes, which will create a new config and related rows in the db, and also with preset values
- Need to figure out UX from login -> editor
  - We can have multiple "dashboards", each with their own global config, individual pages
  - Need to figure out how the navigation for this data type will work
  - Once loading the editor with a "dashboard" id /editor/1, it could show a dropdown menu with the "Dashboard", and another with the "pageConfigurations"

## Deleting Assets
Currently the ImageUPload.tsx file performs a delete and will remove from database, it also triggers the local state change for the data, however if the user just refreshes after that point the value of the field will still be the previous url saved in the database.

Consider automatically saving after a delete, or when a users tries to refresh the page, we indicate that there's unsaved data

## GITHUB Upload

1. upload repository should be only done once per repository
    - Should be stored in version folders named like the version of the package.json file
    - package name should be the name of the folder in gcp
    - Should skip upload if folder already exists in gcp and just give user access

## Rendering issue
Figure out why when navigation component is added by itself, why it doesn't update, but when you add Background it does...

## UI Todos

1. Figure out we can navigate to a DASHBOARD, and then be able to edit a page


## Fields
- template - Rather than a field, user can specify a "code" field of yaml, and conditionally show this field to support (https://www.home-assistant.io/docs/configuration/templating) (Jinja2)

## Breakpoints
- Change hakit/components getBreakpoints so that it doesn't throw an error on an empty breakpoint object (excluding xlg) and just add `xlg` as 1 in this case to get rid of the `At least one breakpoint must be defined.` error
- Display breakpoint titles in the fields somehow without displaying too long values
- Hide breakpoint functionality if only one breakpoint is defined/enabled
- test the shit out of this logic