
# FROM mhart/alpine-node:latest
FROM node:7.1
MAINTAINER Marco Sampellegrini <babbonatale@alpacaaa.net>

RUN apt-get update && apt-get install -y zip \
  && mkdir -p /src/elm/elm-0.18.0 \
  && wget -qO- https://dl.bintray.com/elmlang/elm-platform/0.18.0/linux-x64.tar.gz \
  | tar xvz -C  /src/elm/elm-0.18.0 \
  && wget -qO- https://github.com/avh4/elm-format/releases/download/0.5.2-alpha/elm-format-0.18-0.5.2-alpha-linux-x64.tgz \
  | tar xvz -C  /src/elm/ \
  && groupadd -r runelm && useradd -m -r -g runelm runelm \
  && mkdir -p /src/cache && chown runelm:runelm /src/cache

USER runelm

EXPOSE 3000
