## Deploying Commands

docker build -t gcr.io/gold-obelisk-445820-s5/useraccmgmtserv .
docker push gcr.io/gold-obelisk-445820-s5/useraccmgmtserv
gcloud run deploy useraccmgmtserv \
  --image gcr.io/gold-obelisk-445820-s5/useraccmgmtserv \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGO_URI=<YOUR_MONGO_URI>,JWT_SECRET=<YOUR_JWT_SECRET>
