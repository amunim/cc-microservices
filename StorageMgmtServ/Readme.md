## Steps to Deploy

- docker build -t gcr.io/gold-obelisk-445820-s5/storagemgmtserv .
- docker push gcr.io/gold-obelisk-445820-s5/storagemgmtserv
- gcloud run deploy storagemgmtserv \
  --image gcr.io/gold-obelisk-445820-s5/storagemgmtserv \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GCS_BUCKET_NAME=cc-project-amunim,USAGE_MONITORING_SERVICE_URL=<YOUR_MNTRSERVICE>,MONGO_URI=<YOUR_MONGO_URI>,JWT_SECRET=<YOUR_JWT>

current url: https://storagemgmtserv-636982588286.us-central1.run.app