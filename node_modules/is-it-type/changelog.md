# Changelog

## 5.1.3

Dependencies:

* Remove `@babel/runtime` dependency (#41)
* Update `package-lock.json` (#42)

## 5.1.2

Bug fixes:

* Publish `package.json` file in ESM dirs to NPM

## 5.1.1

Docs:

* Fix changelog

## 5.1.0

Semver minor:

* Drop support for Node v10

Performance:

* Speed up `isObject`
* Export `Array.isArray` directly

Dependencies:

* Update dependencies

Dev:

* Use NPM v7 for development
* Use Github Actions for CI
* Clean up after `cover` NPM script even if fails
* Update dev dependencies

Docs:

* Remove Greenkeeper badge
* Update license year
* Remove license indentation

## 5.0.0

Breaking changes:

* Remove `isArguments` method
* `isObject` return false for all built-ins

Bug fixes:

* Avoid relying on `Object.prototype.toString` to identify types

## 4.1.1

Build:

* Fix Rollup config [fix]

Deps:

* Update `@babel/runtime` dependency

Dev:

* Update dev dependencies

## 4.1.0

Features:

* `isArguments` method
* Drop support for Node v13

Dependencies:

* Update `@babel/runtime` dependency

Tests:

* Correct test [fix]

Dev:

* Update dev dependencies
* Simplify lint scripts

## 4.0.0

Breaking changes:

* `isObject` returns false for arrays and other built-ins

Dependencies:

* Update `@babel/runtime` dependency

No code:

* Remove duplicate code comment

Tests:

* Run coverage in dev mode
* Move ESLint config into config file [nocode]

Dev:

* Run tests on CI on Node v14
* Update dev dependencies
* `.editorconfig` config
* Replace `.npmignore` with `files` list in `package.json`

## 3.1.1

Bug fixes:

* ESM export fully tree-shakable

## 3.1.0

Features:

* ESM import without `es` path

Refactor:

* Remove extraneous code

Dev:

* Improve config for running tests on ESM build

## 3.0.2

Refactor:

* Shorten `isEmptyObject` function

## 3.0.1

Docs:

* README update

## 3.0.0

Breaking changes:

* Remove `isBuffer` function
* Re-implement core-util-is functions

Features:

* ESM exports

Refactor:

* Imports specify file extension

Dev:

* Update dev dependencies
* ESLint not ignore dot files
* Remove `npm-debug.log` from `.gitignore`

No code:

* Config files header comments
* Line spacing

Docs:

* README update

## 2.0.0

Breaking changes:

* Drop support for Node v8

Dev:

* Update dev dependencies
* Remove `sudo` from Travis CI config
* ESLint ignore coverage dir

Docs:

* Versioning policy
* Update license year

## 1.2.0

Features:

* Number methods

Tests:

* Split into multiple files

Dev:

* Update dev dependencies

## 1.1.2

Docs:

* Add `isEmptyObject` to README

## 1.1.1

Dev:

* CI run tests on Node 13

## 1.1.0

Features:

* `isEmptyObject` method

Dev:

* Update dev dependencies

## 1.0.0

Initial release

