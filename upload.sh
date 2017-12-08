#!/bin/bash

BUCKET=www.quit.social

gsutil defacl set public-read gs://$BUCKET/
gsutil -m acl set public-read gs://$BUCKET/*

for i in twitter facebook instagram; do
  gsutil -h "Content-Type: text/html" cp $i gs://$BUCKET/
done

for type in css html js json png; do
  gsutil cp *.$type gs://$BUCKET/
done
