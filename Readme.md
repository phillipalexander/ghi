# ghi
GitHub Interface - a minimal command line tool

## Description

Simple command line tool created to automate the repetative GitHub operations I perform regularly.

## Development Installation

If you'd like to contribute to the repo:
  1. clone down the repo

    ```sh
    git clone git@github.com:phillipalexander/ghi.git
    ```

  1. cd to the root directory of the project

    ```sh
    cd ./ghi
    ```

  1. use [npm-link](https://www.npmjs.org/doc/cli/npm-link.html) to create a local link to the github repo so that you can develop on it more effectively

    ```sh
    npm link
    ```

  1. start hacking!

## Normal Installation

If you're not insterested in contributing right now, just use npm to install ghi:

```
$ npm install -g ghi
```


## Usage

  Usage: ghi [options] [command]

  Commands:

    rc <fullname> Create repo on GitHub
    rd <fullname> Destroy repo on GitHub
    rha <fullname> Create a webhook on a repo
    rta <fullname> Add all teams listed in config.json to an existing repo
    tga <org>    Get the first 100 teams associated with an Org
    rga <org>    Get the first 100 repos associated with an Org
    uqa          User Quick Add

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

```
ghi --help
```

## License

Copyright (c) 2014 Phillip Alexander

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
