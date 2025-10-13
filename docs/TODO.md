- Kinde
  - Do i really need this? supabase already has auth, haven't looked into it yet though
  - See if i can capture location of the user, to determine the best database location
  - 

## Deleting Assets
Currently the ImageUPload.tsx file performs a delete and will remove from database, it also triggers the local state change for the data, however if the user just refreshes after that point the value of the field will still be the previous url saved in the database.

Consider automatically saving after a delete, or when a users tries to refresh the page, we indicate that there's unsaved data

## Styles
We have index.css, and the use of Global from emotion, we should pick a consistent pattern and stick to it


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

# Editor

## UX
- When no addons are added or remotes, there's technically nothing you can do in the editor
  - In this case, there will be no components, so the left side bar should have a link back to the me/components portal
  - Global options for default root? Do we need this? Or can we just display "no options" when there are no fields for any component 

## Fields
- Breakpoints - A way to clear an individual breakpoint from the little badge style thing that appears underneath the field
- template - Rather than a field for templates, user can specify a "code" field of yaml, and conditionally show this field to support (https://www.home-assistant.io/docs/configuration/templating) (Jinja2), then on the consumer side when they receive the jinja2 template code, they can use the `useTemplate` hook from `hakit/core` to render the template where necessary, this will be complicated to expose for all fields out of the box, may be better to provide documentation on how to make a "field" templatable from the configuration side.
- page/pages - consider default value

## Breakpoints

- Display breakpoint titles in the fields somehow without displaying too long values
- Hide breakpoint functionality if only one breakpoint is defined/enabled
- test the shit out of this logic
- we currently "trim" the data to match the users configuration on load, which means if the user had a component of Navigation in their dashboard, and then either disables the component or uninstalls the repository, the renderer will simply remove any components that don't belong anymore, is this desireable? or should we make this an "opt in" feature? 


## Root Configurations

Currently, the functionality for multiple Root components from multiple repositories is a bit hairy, there's the possibility for repositories to clash with field keys which we'll need to try and sort out a solution for.