/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AuthenticatedImport } from './routes/_authenticated'
import { Route as IndexImport } from './routes/index'
import { Route as AuthenticatedEditorIndexImport } from './routes/_authenticated/editor/index'
import { Route as AuthenticatedEditorDashboardPathPagePathImport } from './routes/_authenticated/editor/$dashboardPath.$pagePath'

// Create/Update Routes

const AuthenticatedRoute = AuthenticatedImport.update({
  id: '/_authenticated',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const AuthenticatedEditorIndexRoute = AuthenticatedEditorIndexImport.update({
  id: '/editor/',
  path: '/editor/',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedEditorDashboardPathPagePathRoute =
  AuthenticatedEditorDashboardPathPagePathImport.update({
    id: '/editor/$dashboardPath/$pagePath',
    path: '/editor/$dashboardPath/$pagePath',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/_authenticated': {
      id: '/_authenticated'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthenticatedImport
      parentRoute: typeof rootRoute
    }
    '/_authenticated/editor/': {
      id: '/_authenticated/editor/'
      path: '/editor'
      fullPath: '/editor'
      preLoaderRoute: typeof AuthenticatedEditorIndexImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/editor/$dashboardPath/$pagePath': {
      id: '/_authenticated/editor/$dashboardPath/$pagePath'
      path: '/editor/$dashboardPath/$pagePath'
      fullPath: '/editor/$dashboardPath/$pagePath'
      preLoaderRoute: typeof AuthenticatedEditorDashboardPathPagePathImport
      parentRoute: typeof AuthenticatedImport
    }
  }
}

// Create and export the route tree

interface AuthenticatedRouteChildren {
  AuthenticatedEditorIndexRoute: typeof AuthenticatedEditorIndexRoute
  AuthenticatedEditorDashboardPathPagePathRoute: typeof AuthenticatedEditorDashboardPathPagePathRoute
}

const AuthenticatedRouteChildren: AuthenticatedRouteChildren = {
  AuthenticatedEditorIndexRoute: AuthenticatedEditorIndexRoute,
  AuthenticatedEditorDashboardPathPagePathRoute:
    AuthenticatedEditorDashboardPathPagePathRoute,
}

const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren,
)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '': typeof AuthenticatedRouteWithChildren
  '/editor': typeof AuthenticatedEditorIndexRoute
  '/editor/$dashboardPath/$pagePath': typeof AuthenticatedEditorDashboardPathPagePathRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '': typeof AuthenticatedRouteWithChildren
  '/editor': typeof AuthenticatedEditorIndexRoute
  '/editor/$dashboardPath/$pagePath': typeof AuthenticatedEditorDashboardPathPagePathRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/_authenticated': typeof AuthenticatedRouteWithChildren
  '/_authenticated/editor/': typeof AuthenticatedEditorIndexRoute
  '/_authenticated/editor/$dashboardPath/$pagePath': typeof AuthenticatedEditorDashboardPathPagePathRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '' | '/editor' | '/editor/$dashboardPath/$pagePath'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '' | '/editor' | '/editor/$dashboardPath/$pagePath'
  id:
    | '__root__'
    | '/'
    | '/_authenticated'
    | '/_authenticated/editor/'
    | '/_authenticated/editor/$dashboardPath/$pagePath'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthenticatedRoute: typeof AuthenticatedRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/_authenticated"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/_authenticated": {
      "filePath": "_authenticated.tsx",
      "children": [
        "/_authenticated/editor/",
        "/_authenticated/editor/$dashboardPath/$pagePath"
      ]
    },
    "/_authenticated/editor/": {
      "filePath": "_authenticated/editor/index.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/editor/$dashboardPath/$pagePath": {
      "filePath": "_authenticated/editor/$dashboardPath.$pagePath.tsx",
      "parent": "/_authenticated"
    }
  }
}
ROUTE_MANIFEST_END */
