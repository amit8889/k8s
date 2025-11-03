# Environment Variables

## Current Configuration

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `3000` | Application port configuration |

## Configuration Issue ⚠️

The `PORT` environment variable is currently set to `3000`, but your container exposes port `4000` and the service routes traffic to port `4000`. 

**Your application must listen on port 4000**, or update the configuration to match.

## Correct YAML Placement

The `env` field should be under the `containers` section, not at the spec level:

```yaml
spec:
  containers:
  - name: test-app
    image: my-test-app:latest
    imagePullPolicy: IfNotPresent
    env:
      - name: "PORT"
        value: "4000"  # Should match containerPort
    ports:
    - containerPort: 4000
```

## Adding More Environment Variables

```yaml
env:
  - name: "PORT"
    value: "4000"
  - name: "NODE_ENV"
    value: "production"
  - name: "LOG_LEVEL"
    value: "info"
```

## Using ConfigMap for Environment Variables

Create a ConfigMap:
```bash
kubectl create configmap test-app-config \
  --from-literal=PORT=4000 \
  --from-literal=NODE_ENV=production
```

Reference in deployment:
```yaml
envFrom:
  - configMapRef:
      name: test-app-config
```

## Using Secrets for Sensitive Data

Create a secret:
```bash
kubectl create secret generic test-app-secrets \
  --from-literal=DB_PASSWORD=mysecretpassword \
  --from-literal=API_KEY=myapikey
```

Reference in deployment:
```yaml
env:
  - name: "DB_PASSWORD"
    valueFrom:
      secretKeyRef:
        name: test-app-secrets
        key: DB_PASSWORD
```

## Verify Environment Variables

Check environment variables in a running pod:
```bash
kubectl exec -it <pod-name> -- env | grep PORT
```