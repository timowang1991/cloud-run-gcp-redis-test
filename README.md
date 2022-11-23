```bash
docker build . -t cloud-run-gcp-redis-test:local
# or
docker buildx build . --platform=linux/amd64 -t cloud-run-gcp-redis-test:local

docker push cloud-run-gcp-redis-test:local
```

```
gcloud run deploy cloud-run-gcp-redis-test \
    --image cloud-run-gcp-redis-test:local \
    --service-account <service-account> \
    --platform managed \
    --allow-unauthenticated \
    --region asia-east1 \
    --vpc-connector default-connector \
    --set-env-vars REDISHOST=<redis-ip> \
    --update-secrets REDISAUTH=<redis-auth-secret>:latest,REDISCA=<redis-ca-cert-secret>:latest
```
