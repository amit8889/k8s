# Kubernetes ConfigMap Guide

## What is a ConfigMap?

ConfigMap is a Kubernetes object used to store non-sensitive configuration data in key-value pairs. It decouples configuration from container images, making applications more portable.

## Creating ConfigMap

### Method 1: From Literal Values
```bash
kubectl create configmap test-app-config \
  --from-literal=PORT=4000 \
  --from-literal=NODE_ENV=production \
  --from-literal=LOG_LEVEL=info \
  --from-literal=APP_NAME=test-app
```

### Method 2: From YAML File

Create `configmap.yaml`:
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
  APP_NAME: "test-app"
  DATABASE_HOST: "db.example.com"
  CACHE_ENABLED: "true"
```

Apply it:
```bash
kubectl apply -f configmap.yaml
```

### Method 3: From Environment File

Create `.env` file:
```
PORT=4000
NODE_ENV=production
LOG_LEVEL=info
APP_NAME=test-app
```

Create ConfigMap:
```bash
kubectl create configmap test-app-config --from-env-file=.env
```

### Method 4: From File Contents

Create `app-config.json`:
```json
{
  "server": {
    "port": 4000,
    "host": "0.0.0.0"
  },
  "logging": {
    "level": "info"
  }
}
```

Create ConfigMap:
```bash
kubectl create configmap test-app-config --from-file=app-config.json
```

## Using ConfigMap in Deployment

### Option 1: Load All Keys as Environment Variables

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
        imagePullPolicy: IfNotPresent
        envFrom:
          - configMapRef:
              name: test-app-config
        ports:
        - containerPort: 4000
```

### Option 2: Load Specific Keys as Environment Variables

```yaml
spec:
  containers:
  - name: test-app
    image: my-test-app:latest
    env:
      - name: PORT
        valueFrom:
          configMapKeyRef:
            name: test-app-config
            key: PORT
      - name: NODE_ENV
        valueFrom:
          configMapKeyRef:
            name: test-app-config
            key: NODE_ENV
      - name: LOG_LEVEL
        valueFrom:
          configMapKeyRef:
            name: test-app-config
            key: LOG_LEVEL
    ports:
    - containerPort: 4000
```

### Option 3: Mount as Volume (File)

```yaml
spec:
  containers:
  - name: test-app
    image: my-test-app:latest
    volumeMounts:
      - name: config-volume
        mountPath: /etc/config
    ports:
    - containerPort: 4000
  volumes:
    - name: config-volume
      configMap:
        name: test-app-config
```

Files will be available at `/etc/config/PORT`, `/etc/config/NODE_ENV`, etc.

### Option 4: Mount Specific Keys as Files

```yaml
spec:
  containers:
  - name: test-app
    image: my-test-app:latest
    volumeMounts:
      - name: config-volume
        mountPath: /etc/config
  volumes:
    - name: config-volume
      configMap:
        name: test-app-config
        items:
          - key: PORT
            path: port.conf
          - key: NODE_ENV
            path: environment.conf
```

## Managing ConfigMaps

### View ConfigMaps
```bash
# List all ConfigMaps
kubectl get configmaps

# View specific ConfigMap
kubectl get configmap test-app-config -o yaml

# Describe ConfigMap
kubectl describe configmap test-app-config
```

### Update ConfigMap
```bash
# Edit directly
kubectl edit configmap test-app-config

# Or update from file
kubectl apply -f configmap.yaml

# Replace from literal
kubectl create configmap test-app-config \
  --from-literal=PORT=5000 \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Delete ConfigMap
```bash
kubectl delete configmap test-app-config
```

## Complete Example for Your Application

**configmap.yaml**
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
  MAX_CONNECTIONS: "100"
  TIMEOUT: "30"
```

**deployment.yaml (Updated)**
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

## Deploy with ConfigMap

```bash
# Create ConfigMap
kubectl apply -f configmap.yaml

# Create Deployment
kubectl apply -f deployment.yaml

# Verify ConfigMap is loaded
kubectl exec -it <pod-name> -- env | grep PORT
```

## Hot Reload ConfigMap Changes

**Note**: Environment variables from ConfigMaps are NOT automatically updated in running pods. You need to restart pods:

```bash
kubectl rollout restart deployment test-app-deployment
```

For automatic updates, mount ConfigMap as a volume instead of environment variables.

## Best Practices

1. **Separate ConfigMaps** - Create different ConfigMaps for different environments (dev, staging, prod)
2. **Use Secrets for Sensitive Data** - Never store passwords, API keys, or tokens in ConfigMaps
3. **Version Control** - Keep ConfigMap YAML files in git
4. **Naming Convention** - Use descriptive names like `<app-name>-config`
5. **Validate** - Always verify ConfigMap data before applying

## Troubleshooting

### ConfigMap Not Found
```bash
# Check if ConfigMap exists
kubectl get configmap test-app-config

# If not, create it first
kubectl apply -f configmap.yaml
```

### Values Not Updating
```bash
# Restart deployment to pick up changes
kubectl rollout restart deployment test-app-deployment
```

### Check ConfigMap Values in Pod
```bash
kubectl exec -it <pod-name> -- env
kubectl exec -it <pod-name> -- cat /etc/config/PORT
```