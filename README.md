# ChatCleanerBot [WIP]: Telegram bot for chat history wiping

## Requisites

- Heroku-Cli installed and configured (https://devcenter.heroku.com/articles/heroku-cli)
- A telegram bot token (https://core.telegram.org/bots#6-botfather)

## How to use it

First, clone the repository, then customize the code on index.js and start deploy.sh passing bot token as argument:

```
./deploy.sh XXXXXXXXXXXXXXXXXXX
```

When you make changes on code, deploy the changes with a git commit & push:

```
git commit -am "some code changes" && git push heroku master

```

## Used APIs

- [Telegram Bot API](https://core.telegram.org/bots/api) (used via [telegraf](https://telegraf.js.org/#/))
- [MTProto API](https://core.telegram.org/methods) (used via [@mtproto/core](https://github.com/alik0211/mtproto-core))

## Discussion

Telegram Bot API doen't provide any methods to wipe chat history, so MTProto API must be used for this purpose.