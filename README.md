# fsen-records
Nachweisübersicht für AFSG/BSFG

## deploy

```
npm run build
rsync -avzP --exclude data public/* hscmi:~/fsen
```
