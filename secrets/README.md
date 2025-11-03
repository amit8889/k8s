# Kubernetes Secrets - README

## Overview

Kubernetes Secrets store sensitive data like passwords, API keys, tokens, and certificates. Secrets keep sensitive information separate from application code and container images.

## Why Use Secrets?

- **Security**: Separate sensitive data from application code
- **Flexibility**: Update secrets without rebuilding images
- **Access Control**: Use RBAC to control who can access secrets
- **Centralized Management**: Manage all secrets in one place

## Quick Start

### Create a Secret
```bash
kubectl create secret generic test-app-secrets \
  --from-literal=DB_PASSWORD=mysecretpass \
  --from-literal=API_KEY=abc123xyz
```

### Use in Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-app-deployment
spec:
  replicas: 20
  selector:
    matchLabels:
      app: test-app
  template:
    metadata:
      labels:
        app: test-app
    spec:
      containers:
      - name: test-app
        image: my-test-app:latest
        envFrom:
          - secretRef:
              name: test-app-secrets
        ports:
        - containerPort: 4000
```

## Creating Secrets

### Method 1: Command Line
```bash
kubectl create secret generic test-app-secrets \
  --from-literal=DB_PASSWORD=secret123 \
  --from-literal=API_KEY=key789
```

### Method 2: YAML File (with stringData)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: test-app-secrets
type: Opaque
stringData:
  DB_PASSWORD: "secret123"
  API_KEY: "key789"
  JWT_SECRET: "jwt-secret-key"
```

Apply:
```bash
kubectl apply -f secret.yaml
```

### Method 3: From Environment File
```bash
# Create .env.secret file
DB_PASSWORD=secret123
API_KEY=key789

# Create secret
kubectl create secret generic test-app-secrets --from-env-file=.env.secret
```

## Using Secrets

### As Environment Variables (All Keys)
```yaml
spec:
  containers:
  - name: test-app
    image: my-test-app:latest
    envFrom:
      - secretRef:
          name: test-app-secrets
```

### As Environment Variables (Specific Keys)
```yaml
spec:
  containers:
  - name: test-app
    image: my-test-app:latest
    env:
      - name: DB_PASSWORD
        valueFrom:
          secretKeyRef:
            name: test-app-secrets
            key: DB_PASSWORD
      - name: API_KEY
        valueFrom:
          secretKeyRef:
            name: test-app-secrets
            key: API_KEY
```

### As Mounted Files
```yaml
spec:
  containers:
  - name: test-app
    image: my-test-app:latest
    volumeMounts:
      - name: secrets
        mountPath: /etc/secrets
        readOnly: true
  volumes:
    - name: secrets
      secret:
        secretName: test-app-secrets
```

Access: `/etc/secrets/DB_PASSWORD`, `/etc/secrets/API_KEY`

## Common Secret Types

### Database Credentials
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
stringData:
  DB_HOST: "postgres.example.com"
  DB_PORT: "5432"
  DB_NAME: "myapp"
  DB_USER: "appuser"
  DB_PASSWORD: "secretpassword"
```

### API Keys
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-keys
type: Opaque
stringData:
  STRIPE_KEY: "sk_test_123456"
  SENDGRID_KEY: "SG.abc123xyz"
  AWS_ACCESS_KEY: "AKIAIOSFODNN7EXAMPLE"
  AWS_SECRET_KEY: "wJalrXUtnFEMI/K7MDENG"
```

### Docker Registry
```bash
kubectl create secret docker-registry regcred \
  --docker-server=myregistry.com \
  --docker-username=user \
  --docker-password=pass
```

Use in deployment:
```yaml
spec:
  imagePullSecrets:
    - name: regcred
  containers:
  - name: test-app
    image: myregistry.com/test-app:latest
```

### TLS Certificates
```bash
kubectl create secret tls tls-secret \
  --cert=server.crt \
  --key=server.key
```

## Managing Secrets

### List Secrets
```bash
kubectl get secrets
```

### View Secret Details
```bash
kubectl describe secret test-app-secrets
```

### View Secret Values (Decoded)
```bash
kubectl get secret test-app-secrets -o jsonpath='{.data.DB_PASSWORD}' | base64 --decode
```

### Update Secret
```bash
# Delete and recreate
kubectl delete secret test-app-secrets
kubectl create secret generic test-app-secrets --from-literal=DB_PASSWORD=newpass

# Or edit directly
kubectl edit secret test-app-secrets

# Or apply updated YAML
kubectl apply -f secret.yaml
```

### Delete Secret
```bash
kubectl delete secret test-app-secrets
```

## Complete Example

### secret.yaml
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: test-app-secrets
  labels:
    app: test-app
type: Opaque
stringData:
  # Database
  DB_HOST: "postgres.example.com"
  DB_PASSWORD: "P@ssw0rd123"
  
  # APIs
  API_KEY: "sk_live_abc123"
  JWT_SECRET: "jwt-secret-key-2024"
  
  # Redis
  REDIS_PASSWORD: "redis123"
  
  # AWS
  AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7"
  AWS_SECRET_ACCESS_KEY: "wJalrXUtnFEMI"
```

### configmap.yaml
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: test-app-config
  labels:
    app: test-app
data:
  PORT: "4000"
  NODE_ENV: "production"
  LOG_LEVEL: "info"
```

### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-app-deployment
  labels:
    app: test-app
spec:
  replicas: 20
  selector:
    matchLabels:
      app: test-app
  template:
    metadata:
      labels:
        app: test-app
    spec:
      containers:
      - name: test-app
        image: my-test-app:latest
        imagePullPolicy: IfNotPresent
        envFrom:
          - configMapRef:
              name: test-app-config
          - secretRef:
              name: test-app-secrets
        ports:
        - containerPort: 4000
---
apiVersion: v1
kind: Service
metadata:
  name: test-app-loadbalancer
  labels:
    app: test-app
spec:
  type: LoadBalancer
  selector:
    app: test-app
  ports:
  - name: http
    protocol: TCP
    port: 80
    targetPort: 4000
```

### Deploy
```bash
# 1. Create secret
kubectl apply -f secret.yaml

# 2. Create configmap
kubectl apply -f configmap.yaml

# 3. Deploy application
kubectl apply -f deployment.yaml

# 4. Verify
kubectl get pods
kubectl exec -it <pod-name> -- env | grep DB_PASSWORD
```

## Security Best Practices

### 1. Never Commit Secrets to Git
```bash
# Add to .gitignore
secret.yaml
*.secret
.env.secret
```

### 2. Use Different Secrets Per Environment
```bash
kubectl create secret generic app-secrets-dev --from-literal=DB_PASSWORD=devpass
kubectl create secret generic app-secrets-prod --from-literal=DB_PASSWORD=prodpass
```

### 3. Limit Access with RBAC
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-reader
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list"]
```

### 4. Enable Encryption at Rest
Ensure your cluster encrypts secrets at rest in etcd.

### 5. Rotate Secrets Regularly
```bash
# Update secret
kubectl create secret generic test-app-secrets \
  --from-literal=DB_PASSWORD=newpassword \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart pods
kubectl rollout restart deployment test-app-deployment
```

### 6. Use External Secret Managers (Recommended for Production)
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Google Secret Manager

## Troubleshooting

### Secret Not Found Error
```bash
# Check if secret exists
kubectl get secret test-app-secrets

# If missing, create it
kubectl apply -f secret.yaml
```

### Cannot See Secret Values
```bash
# Decode base64
kubectl get secret test-app-secrets -o jsonpath='{.data.DB_PASSWORD}' | base64 -d
```

### Pods Not Starting
```bash
# Check pod events
kubectl describe pod <pod-name>

# Check if secret exists and has correct keys
kubectl get secret test-app-secrets -o yaml
```

### Secret Changes Not Reflected
```bash
# Environment variables don't auto-update, restart pods
kubectl rollout restart deployment test-app-deployment

# Or use volume mounts which update automatically
```

### Verify Secret in Pod
```bash
# Check environment variables
kubectl exec -it <pod-name> -- env | grep -i password

# Check mounted files
kubectl exec -it <pod-name> -- cat /etc/secrets/DB_PASSWORD
```

## Key Differences: Secrets vs ConfigMaps

| Feature | Secrets | ConfigMaps |
|---------|---------|------------|
| **Purpose** | Sensitive data | Configuration data |
| **Encoding** | Base64 | Plain text |
| **Security** | Can be encrypted at rest | Not encrypted |
| **Use Cases** | Passwords, keys, tokens | App settings, configs |
| **Size Limit** | 1MB | 1MB |

## Secret Limits

- Maximum size: **1MB** per secret
- For larger data, split into multiple secrets
- Consider external secret management for many secrets

## Base64 Encoding

```bash
# Encode
echo -n 'mysecret' | base64
# Output: bXlzZWNyZXQ=

# Decode  
echo 'bXlzZWNyZXQ=' | base64 -d
# Output: mysecret
```

## When to Update Pods

Secrets loaded as **environment variables** require pod restart:
```bash
kubectl rollout restart deployment test-app-deployment
```

Secrets mounted as **volumes** update automatically (may take up to 2 minutes).

## Additional Resources

- [Kubernetes Secrets Documentation](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Secret Management Best Practices](https://kubernetes.io/docs/concepts/security/secrets-good-practices/)
- [External Secrets Operator](https://external-secrets.io/)