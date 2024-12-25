## Deploying Commands

docker build -t gcr.io/gold-obelisk-445820-s5/useraccmgmtserv .
docker push gcr.io/gold-obelisk-445820-s5/useraccmgmtserv
gcloud run deploy useraccmgmtserv \
  --image gcr.io/gold-obelisk-445820-s5/useraccmgmtserv \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGO_URI=<YOUR_MONGO_URI>,JWT_SECRET=<YOUR_JWT_SECRET>


gcloud run deploy useraccmgmtserv \
  --image gcr.io/gold-obelisk-445820-s5/useraccmgmtserv \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGO_URI=mongodb+srv://abc:abc@cluster0.penqh.mongodb.net/,PORT=8080,JWT_SECRET=8eee3089d65390efb72064e396a6afe1805e9dff509ea697624aa4680bb81e5380ee660c71360097e69af5dfd64a844ffbfb44e135dd5c35ae9d7e303ce6bece3c9a306bfe48ca03abc2fb06a7cc32253557d85eef370f59e7ebd197bab1db97c8f2ef35ea896ff839598f8600a0b68e47313212f54c5b9936b602a060de2e175d6b95185eef91334806cb5b6f5eed80c59d75573ec2fa1398a02e41be66509befb7ffb59330e813490d69ab7fc723bc6436a36dc8aecd25d8651c743aaac7c98062f889daf57b7bce25510adfa57d2d523d9499bacc368001e9cd5f80e2c7bca529913c92721b365f9281e05569faadf9ba42f1333c280a3ab23f5b9616c327
