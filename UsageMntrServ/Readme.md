## Deploying steps
- docker build -t gcr.io/gold-obelisk-445820-s5/usagemntrserv .
- docker push gcr.io/gold-obelisk-445820-s5/usagemntrserv
- gcloud run deploy usagemntrserv \
  --image gcr.io/gold-obelisk-445820-s5/usagemntrserv \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGO_URI=<YOUR_URI>,JWT_SECRET=<YOUR_JWT>

current url: https://usagemntrserv-636982588286.us-central1.run.app
