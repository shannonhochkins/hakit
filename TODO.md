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


## UI Todos

1. Figure out we can navigate to a DASHBOARD, and then be able to edit a page
2. From the editor page, swap to other pages, potentially in the top left part of the menu

## Component data - Page information/data
- we send a 'hakit' object over to every component with some internal information/methods, we should probably expose the ability to navigate to a page programmatically
    packages/editor/src/lib/helpers/createComponent/index.tsx -> finalProps passes this information across
  - We should indicate on the dashboards param we send over which page is currently active
  Shape, something like:
  dashboards = {
    id: '',
    name: '',
    path: '',
    pages: {
      id: '',
      name: '',
      path: '',
    }
  }[] - currently we just send the dashboard object, but we should also send maybe all dashboards, or just dashboard, undecided

### Generate Thumbnails
- When saving a dashboard, in the background we should generate a thumbnail of the current page, and save it to the database against the entity (page or dashboard), dashboard will just be the first page as we can't really generate a thumbnail of the dashboard as a whole, or show all images in a slider or something?
- Needs to be a background task, something like puppeteer, or a headless browser to generate the image as client side, you can only use canvas realistically and its never accurate enough to get a good image of the page

### Page Selector in main UI
- path field should be automatically populated with tthe name of the page, but we should also allow the user to change this
- need to add validation as this will be a route path, can't have weird characters
- need to add a way to delete a page, and also a way to duplicate a page
- maybe the "new page" option should change to a "customize" option which shows a popup with all pages to manage them
- What if the user renames the page they're currently on, do we just refresh the page or replace the url?

### Dashboard Selector in main UI
- duplicate a dashboard - currently only does this, doesn't duplicate related pages which it probably should
- delete a dashboard - needs confirmation
- What if the user renames the dashboard they're currently on, do we just refresh the page or replace the url?
- What if a user deletes the current dashboard, need a seamless way to handle this so routes/requests don't fetch on entities that no longer exist

## Fields
- Breakpoints - A way to clear an individual breakpoint from the little badge style thing that appears underneath the field
- template - Rather than a field for templates, user can specify a "code" field of yaml, and conditionally show this field to support (https://www.home-assistant.io/docs/configuration/templating) (Jinja2), then on the consumer side when they receive the jinja2 template code, they can use the `useTemplate` hook from `hakit/core` to render the template where necessary
- page/pages - consider default value
- for anything using arrays/objects, we should probably automatically set a default value of `[]` or `{}` if the user doesn't specify a value, so that we don't have to check for undefined values in the code

## Breakpoints
- Change hakit/components getBreakpoints so that it doesn't throw an error on an empty breakpoint object (excluding xlg) and just add `xlg` as 1 in this case to get rid of the `At least one breakpoint must be defined.` error (I think this is done)
- Display breakpoint titles in the fields somehow without displaying too long values
- Hide breakpoint functionality if only one breakpoint is defined/enabled
- test the shit out of this logic

## Thumbnails 
Currently, dashboards/pages support thumbnails, but consider removing this as they're not displayed or used