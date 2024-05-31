# fsen-records
FS data and payout request management

This Frontend is written in Vue3 and is part of a three-component 
application.
The other two components are:
- A folder structure full of documents, with a Python script that turns 
  the information contained therein into a JSON file.
- A [backend](../fsen-records-backend) for user and access management.

Now all that is left to do is to deploy those things together.

## setup

```
git clone https://github.com/HSZemi/fsen-records.git
cd fsen-records
npm install
```

## develop
```
npm run dev
```
This starts a local development server.

## deploy

```
npm run build
rsync -avzP --exclude data --exclude dataupdate dist/* fsen-dds:/opt/datendrehscheibe/frontend
ssh fsen-dds 'cd /opt/datendrehscheibe && docker compose build && docker compose down && docker compose up -d'
```
