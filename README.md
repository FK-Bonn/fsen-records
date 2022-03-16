# fsen-records
Nachweisübersicht für AFSG/BSFG

## deploy

```
npm run build
rsync -avzP --exclude data --exclude dataupdate public/* hscmi:~/fsen
```
