# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.20] - 2025-11-04
- Extensive changes to the addon package, sharable components now exported via @hakit/addon/components, these aren't real components, and the host application will load these via module federation

## [0.0.20] - 2025-11-03
- Trying live reload disabling and polyfill for for node react

## [0.0.19] - 2025-11-03
- Adding missing package

## [0.0.18] - 2025-11-03
- Removed "code" field from exports, including monaco in the package causes unnecessary bloat

## [0.0.17] - 2025-11-03
- Added tree shaking support, exporting re-usable form fields, buttons, alerts

## [0.0.16] - 2025-10-30
- Updating object field, styles return type to better naming convention

## [0.0.15] - 2025-10-30
- Updating base port from 3000 to 5000 to avoid conflicts with main editor application in development mode.

## [0.0.14] - 2025-10-29
- Updating types

## [0.0.13] - 2025-08-05
- Removing GIT_IGNORE from template output
- Removing versions directory from GIT_IGNORE as these are intended to be tracked
- Fixed "label" of default component config

## [0.0.12] - 2025-08-05
- Changing .gitignore process again
- Updating types and including "slot" types exported

## [0.0.11] - 2025-07-31
- Ensuring .gitignore is copied correctly from template
- Updated component template to render description prop

## [0.0.10] - 2025-07-31
- added typescript check support to template

## [0.0.9] - 2025-07-31
### Fixed
- All three commands working correctly with the latest version of `@hakit/addon`

## [0.0.3] - 2025-07-30
### Fixed
- Fixed npm create commands in documentation to use correct npx syntax
- Updated all package manager examples to use proper scoped package commands
- Corrected installation instructions for all supported package managers

## [0.0.1] - 2025-01-27

### Added
- Initial release of `@hakit/addon`
- Support for creating HAKIT editor applications
- CLI tool for scaffolding new projects
- Basic template with React + TypeScript + RSBuild
- Programmatic API for creating projects
- Build utilities export (`@hakit/addon/bundle`)
- Support for all major package managers (npm, yarn, pnpm, bun)
- TypeScript definitions and full type support
- Hot reload development experience
- Monorepo integration within HAKIT

### Features
- ⚛️ React 19 support
- 🏗️ RSBuild/RSPack for fast builds
- 📝 Full TypeScript support
- 🏠 HAKIT components integration ready
- 📦 Package manager agnostic
- 🚀 Fast project scaffolding
