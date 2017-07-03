
# CONTRIBUTING

Yes, I'm yelling at you! CONTRIBUTE!

## Summary

Need-to-know information for contributing to this repository.

## First time setup

```
git clone git@github.com:coreyferguson/tweetsheets-api.git
cd tweetsheets-api
npm install
npm test
```

## On-going development

A full list of scripts can be found in the [`package.json`][] `scripts` section.

Some useful ones:

Command    | Description
---------- | -----------
`npm test` | Style check + automated tests.

## Deployments to Dev/Prod

Deployments require sensitive information to be placed in [`serverless.env.yml`][].

`npm run deploy` | Test and deploy to dev environment.



[`package.json`]: ./package.json
[`serverless.env.yml`]: ./serverless.env.yml
