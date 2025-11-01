# Kubernetes Deployment Management Guide

A comprehensive guide for creating and managing Kubernetes Deployments using `kubectl` commands.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Creating a Deployment](#creating-a-deployment)
- [Viewing Deployments](#viewing-deployments)
- [Checking Deployment Logs](#checking-deployment-logs)
- [Describing Deployments](#describing-deployments)
- [Scaling Deployments](#scaling-deployments)
- [Updating Deployments](#updating-deployments)
- [Example Deployment YAML](#example-deployment-yaml)
- [Additional Commands](#additional-commands)
- [Troubleshooting](#troubleshooting)

## Overview

A Deployment provides declarative updates for Pods and ReplicaSets. It manages the deployment and scaling of a set of Pods and provides guarantees about the ordering and uniqueness of these Pods.

### Key Features
- **Rolling updates**: Update applications with zero downtime
- **Rollback**: Revert to previous versions
- **Scaling**: Easily scale up or down
- **Self-healing**: Automatically replaces failed pods

## Prerequisites

- Kubernetes cluster (local or remote)
- `kubectl` CLI tool installed and configured
- Basic understanding of YAML syntax

## Creating a Deployment

To create a deployment from a YAML configuration file:

```bash
kubectl apply -f deployment.yaml
```

### Alternative Creation Methods

```bash
# Create from a file
kubectl create -f deployment.yaml

# Create a deployment imperatively
kubectl create deployment nginx-deployment --image=nginx --replicas=3

# Create with port exposed
kubectl create deployment nginx-deployment --image=nginx --port=80 --replicas=3
```

## Viewing Deployments

To list all deployments in the current namespace:

```bash
kubectl get deployments
```

### Additional View Options

```bash
# View deployments across all namespaces
kubectl get deployments --all-namespaces

# View deployments with additional details
kubectl get deployments -o wide

# Watch deployments in real-time
kubectl get deployments -w

# View deployments with labels
kubectl get deployments --show-labels

# Filter deployments by label
kubectl get deployments -l app=nginx

# View deployment status
kubectl rollout status deployment/<deployment-name>
```

## Checking Deployment Logs

To view logs from a deployment's pods:

```bash
# View logs from all pods in deployment
kubectl logs deployment/<deployment-name>

# View logs from a specific pod
kubectl logs <pod-name>

# Follow logs in real-time
kubectl logs -f deployment/<deployment-name>

# View logs from a specific container
kubectl logs deployment/<deployment-name> -c <container-name>

# View logs with timestamps
kubectl logs deployment/<deployment-name> --timestamps

# View last 100 lines
kubectl logs deployment/<deployment-name> --tail=100
```

## Describing Deployments

To get detailed information about a specific deployment:

```bash
kubectl describe deployment <deployment-name>
```

This command provides comprehensive information including:
- Deployment strategy
- Replica status
- Pod template specifications
- Conditions and events
- Rolling update progress
- Selector information

## Scaling Deployments

### Manual Scaling

```bash
# Scale to specific number of replicas
kubectl scale deployment <deployment-name> --replicas=5

# Scale using file
kubectl scale -f deployment.yaml --replicas=3
```

### Autoscaling

```bash
# Create horizontal pod autoscaler
kubectl autoscale deployment <deployment-name> --min=2 --max=10 --cpu-percent=80

# View autoscalers
kubectl get hpa

# Describe autoscaler
kubectl describe hpa <deployment-name>
```

## Updating Deployments

### Image Updates

```bash
# Update deployment image
kubectl set image deployment/<deployment-name> nginx=nginx:1.21

# Update multiple containers
kubectl set image deployment/<deployment-name> nginx=nginx:1.21 sidecar=busybox:latest
```

### Rolling Update

```bash
# Apply changes from YAML
kubectl apply -f deployment.yaml

# Check rollout status
kubectl rollout status deployment/<deployment-name>

# Pause rollout
kubectl rollout pause deployment/<deployment-name>

# Resume rollout
kubectl rollout resume deployment/<deployment-name>
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/<deployment-name>

# Rollback to specific revision
kubectl rollout undo deployment/<deployment-name> --to-revision=2

# View rollout history
kubectl rollout history deployment/<deployment-name>

# View specific revision details
kubectl rollout history deployment/<deployment-name> --revision=3
```

## Example Deployment YAML

### Basic Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
```

### Deployment with Rolling Update Strategy

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx  # <-- This label is only for the Deployment itself
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: nginx # <-- This must match template labels
  template:
    metadata:
      labels:
        app: nginx   # <-- Must match selector
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
```

### Deployment with Environment Variables and ConfigMap

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 8080
        env:
        - name: ENVIRONMENT
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        envFrom:
        - configMapRef:
            name: app-config
```

## Additional Commands

### Deployment Lifecycle Management

```bash
# Delete a deployment
kubectl delete deployment <deployment-name>

# Delete deployment using YAML file
kubectl delete -f deployment.yaml

# Delete all deployments in namespace
kubectl delete deployments --all

# Restart deployment (recreate pods)
kubectl rollout restart deployment/<deployment-name>
```

### Deployment Information

```bash
# Get deployment YAML
kubectl get deployment <deployment-name> -o yaml

# Get deployment JSON
kubectl get deployment <deployment-name> -o json

# Get deployment events
kubectl get events --field-selector involvedObject.name=<deployment-name>

# Get pods from deployment
kubectl get pods -l app=<label-value>

# Get replicasets from deployment
kubectl get rs -l app=<label-value>
```

### Editing Deployments

```bash
# Edit deployment interactively
kubectl edit deployment <deployment-name>

# Set environment variable
kubectl set env deployment/<deployment-name> KEY=VALUE

# Add resource limits
kubectl set resources deployment <deployment-name> --limits=cpu=200m,memory=512Mi

# Add labels
kubectl label deployment <deployment-name> version=v1
```

## Troubleshooting

### Common Deployment Issues

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| **Pods not starting** | Image pull error | Check image name and registry access |
| **Rolling update stuck** | Insufficient resources | Check node resources and limits |
| **CrashLoopBackOff** | Application error | Check pod logs |
| **ImagePullBackOff** | Invalid image or credentials | Verify image and imagePullSecrets |
| **Pending pods** | Resource constraints | Scale down or add nodes |

### Debug Commands

```bash
# Check deployment status
kubectl get deployment <deployment-name>

# Check replicaset status
kubectl get rs -l app=<label>

# Check pod status
kubectl get pods -l app=<label>

# View deployment events
kubectl describe deployment <deployment-name>

# Check rollout status
kubectl rollout status deployment/<deployment-name>

# View rollout history
kubectl rollout history deployment/<deployment-name>

# Check resource usage
kubectl top pods -l app=<label>
```

### Common Troubleshooting Steps

1. **Check Deployment Status**: `kubectl get deployment <deployment-name>`
2. **View Detailed Info**: `kubectl describe deployment <deployment-name>`
3. **Check Pods**: `kubectl get pods -l app=<label>`
4. **View Logs**: `kubectl logs deployment/<deployment-name>`
5. **Check Events**: `kubectl get events --sort-by='.lastTimestamp'`
6. **Verify YAML**: `kubectl apply -f deployment.yaml --dry-run=client`

## Deployment Strategies

### Rolling Update (Default)

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # Max pods above desired count
    maxUnavailable: 1   # Max pods unavailable during update
```

### Recreate Strategy

```yaml
strategy:
  type: Recreate  # Kills all pods before creating new ones
```

## Best Practices

✅ **Always specify resource requests and limits**
✅ **Use specific image tags (avoid `latest`)**
✅ **Implement health checks (liveness and readiness probes)**
✅ **Use meaningful labels and annotations**
✅ **Set appropriate replica counts for high availability**
✅ **Test updates in staging before production**
✅ **Use ConfigMaps and Secrets for configuration**
✅ **Monitor rollout progress**
✅ **Keep rollout history for easy rollback**
✅ **Use namespaces for environment separation**

## Quick Reference

```bash
# Create
kubectl apply -f deployment.yaml

# View
kubectl get deployments
kubectl describe deployment <name>

# Scale
kubectl scale deployment <name> --replicas=5

# Update
kubectl set image deployment/<name> container=image:tag
kubectl rollout status deployment/<name>

# Rollback
kubectl rollout undo deployment/<name>
kubectl rollout history deployment/<name>

# Delete
kubectl delete deployment <name>

# Logs
kubectl logs deployment/<name>
```

## Resources

- [Official Kubernetes Deployments Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Deployment Strategies](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy)
- [Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)

---

**Note**: Replace `<deployment-name>`, `<container-name>`, `<label>`, and `<filename>` with your actual names and values.