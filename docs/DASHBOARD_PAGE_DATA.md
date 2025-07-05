# Page Data

This document outlines the structure and considerations for the dashboard page data in the Hakit editor.



## Saved Data

The following data structure is saved in the database for each dashboard page:

```json
{
    "root": {
        "props": {}
    },
    "content": [
        {
            "type": "HeadingBlock",
            "props": {
                "id": "HeadingBlock-59619f25-0704-4507-9e84-787500239d3b",
                "title": {
                  "$xlg": "Dashboard Page" // by default, even if breakpoints are disabled, we store the default value for $xlg
                },
                "subtitle": {
                    "$xlg": "This is a dashboard page",
                    "$md": "This is a dashboard page", // If breakpoints are enabled, we store the value for each breakpoint defined
                },
            }
        }
    ],
    "zones": {}
}
```


## What does puck receive?

[Puck](https://github.com/puckeditor/puck) will receive a transformed value from the above based on the current active breakpoint. For example, if the active breakpoint is `md`, Puck will receive:

```json
{
    "root": {
        "props": {}
    },
    "content": [
        {
            "type": "HeadingBlock",
            "props": {
                "id": "HeadingBlock-59619f25-0704-4507-9e84-787500239d3b",
                "title": "Dashboard Page",
                "subtitle": "This is a dashboard page",
            }
        }
    ],
    "zones": {}
}
```

> Note: If the current breakpoint is `md` and there is no value for `md` in the original data it will use the value for `xlg` as the default value as there will always be a value for `xlg`.

> Note: If there's a value for `xlg`, `md` and the current breakpoint is `xs`, Puck will receive the value for `md` as its the closest value to the current breakpoint.

> Note: Some values of the page data will not be transformed, for example some of the internal values for puck stay as is and will remain in a static format, such as `id`, see packages/editor/src/lib/helpers/pageData/constants.ts -> `BREAKPOINT_TRANSFORM_EXCLUDE` for the list of fields that are not transformed.

## When we change values in the editor

When a user changes a value in the editor, the Puck.onChange method is fired, and we update the zustand store with `unsavedPuckPageData`. This will use the current breakpoint data and update the original Saved data with the new data, for example, it converts back to the original format:

```json
{
    "root": {
        "props": {}
    },
    "content": [
        {
            "type": "HeadingBlock",
            "props": {
                "id": "HeadingBlock-59619f25-0704-4507-9e84-787500239d3b",
                "title": {
                    "$xlg": "New Dashboard Page Title"
                },
                "subtitle": {
                    "$xlg": "This is a dashboard page",
                    "$md": "This is a dashboard page"
                }
            }
        }
    ],
    "zones": {}
}

```

## Dead data
It's possible for data to exist in the database that is no longer valid data for the current set of components, for example if a component deprecates a field option, or renames a field option but we had the value saved in the database, On page load we initially cull all dead data from the page data, this is done by checking the component config against the saved data and removing any fields that no longer exist in the component config.

## Component Config
