# ghi
GitHub Interface - an awesome command line tool

## Description

Simple command line tool created to automate the repetitive GitHub operations I perform regularly.

## Installation

### Developer (you want to contribute)
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

### Basic (you just want it to work)

If you're not interested in contributing right now, just use npm to install ghi:

```
$ npm install -g ghi
```

## Configuration

To use the ghi tool, you must configure the config.json file in the root directory. To do so, run any of the commands below and follow the instructions when prompted.

The default configuration file contains the following:

```json
{
  "github": {
    "token": "OAUTH_TOKEN",
    "webhook": "WEBHOOK_CONFIG_OBJECT"
  },
  "settings": {
    "openurls": false
  }
}
```

## Commands

### Configuration Commands

#### c (configure)

```sh
Usage: c
Description: Configure: edit application settings
Example: ghi c
Options:

  -h, --help     output usage information
  -V, --version  output the version number
```

### Repo Commands

#### rc (repo create)

```sh
Usage: rc <orgname/reponame>
Description: Repo Create: Create a repo on GitHub
Example: ghi rc macroscope/blog
Options:

  -h, --help     output usage information
  -V, --version  output the version number
```

##### Things to Note:
  - If `settings.openurls = true` in `config.json`, when running `ghi rc <orgname>/reponame>` the resulting github page will be opened automatically in your default browser.
  - If you replace `"WEBHOOK_CONFIG_OBJECT"` in `config.json` with a properly formated GitHub webhook configuration object, when running `ghi rc <orgname>/reponame>` that webhook will automatically be set on all repos created within orgs.

#### rd (repo destroy)

```sh
Usage: rd <orgname/reponame>
Description: Repo Destroy: Destroy a repo on GitHub
Example: ghi rd macroscope/blog
Options:

  -h, --help     output usage information
  -V, --version  output the version number
```

#### rhc (repo hook add)

```sh
Usage: rhc <orgname/reponame>
Description: Repo Hook Create: Add webhook defined in config.json to a repo
Example: ghi rhc macroscope/blog
Options:

  -h, --help     output usage information
  -V, --version  output the version number
```

#### rpn (repo patch name)

```sh
Usage: rpn [options]
Description: Repo Patch Name: change the name of an existing repo
Example: ghi rpn -o "macroscope" -r "venus" -p "mars"
Options:

  -h, --help               output usage information
  -o, --org <orgname>      GitHub OrgName
  -r, --repo <reponame>    GitHub RepoName
  -p, --patch <patchdata>  Updated RepoName
```

#### rs (repo sync)

```sh
Usage: rs [options]
Description: Repo Sync: sync a repo across owners using force push
Example: ghi rs -s "macroscope" -t "phillipalexander" -r "mars"
  Options:

    -h, --help                       output usage information
    -s, --ownersource <ownersource>  GitHub Source Owner
    -t, --ownertarget <ownertarget>  GitHub Target Owner
    -r, --reponame <reponame>        RepoName
```

### Team Commands

#### tua (team user add)

```sh
Usage: tua [options]
Description: Team User Add: Add a GitHub user to an existing team
Example: ghi tua -o "macroscope" -t "awesome force" -u "jasper"
Options:

  -h, --help             output usage information
  -o, --org <orgname>    GitHub OrgName
  -t, --team <teamname>  GitHub TeamName
  -u, --user <username>  GitHub UserName
```

#### tra (team repo add)

```sh
Usage: tra [options]
Description: Team Repo Add: Add a GitHub repo to an existing team
Example: ghi tra -o "macroscope" -t "awesome force" -r "blog"
Options:

  -h, --help             output usage information
  -o, --org <orgname>    GitHub OrgName
  -t, --team <teamname>  GitHub TeamName
  -u, --repo <reponame>  GitHub RepoName
```

### Org Commands

#### ogt (team get all)

```sh
Usage: ogt <orgname>
Description: Org Get Teams: Get the first 100 teams associated with an Org
Example: ghi ogt macroscope
Options:

  -h, --help     output usage information
  -V, --version  output the version number
```

#### ogr (org get repos)

```sh
Usage: ogr <orgname>
Description: Org Get Repos: Get the first 100 repos associated with an Org
Example: ghi ogr macroscope
Options:

  -h, --help     output usage information
  -V, --version  output the version number
```

For additional usage instructions, run

```
ghi --help
```

## License

Copyright (c) 2015 Phillip Alexander

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
