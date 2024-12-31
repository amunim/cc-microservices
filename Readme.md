### Deployment
Each serice contains its own DockerFile and Readme to deploy that service only

Later I used kubernetes to scale each service easily so, inside k8s/deploy.yml, contains a GH Action that deploys each serice independantly without kubernetes

The current deployment used GH Actions to build and push docker images to artifacts then deploying to kubernetes

If you want to re-use the same workflow make sure to replicate the secrets, environment variables and create required object in GCP like docker repo and kubernetes cluster. Ask any GPT by showing the deploy.yml file that you want for any further instructions on pre requisites
To create a kubernetes cluster
gcloud container clusters create microservices-cluster \
    --project <YOUR_PROJECT_ID> \
    --region us-central1 \
    --num-nodes 1 \
    --machine-type e2-small \
    --disk-size 10 \
    --enable-autoscaling \
    --min-nodes 1 \
    --max-nodes 2 \
    --release-channel regular \
    --no-enable-ip-alias

##Monitoring
All logs are stored in GKE logs monitor, and load testing is done with loadtesting.js, you can monitor performance in GKE under high concurrency