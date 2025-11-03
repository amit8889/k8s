# Kubernetes Resource Requests and Limits - README

## Overview

Resource requests and limits control how much CPU and memory your containers can use. They are essential for:
- **Scheduling**: Kubernetes uses requests to decide which node runs your pod
- **Resource Management**: Limits prevent containers from consuming too many resources
- **Stability**: Protects cluster from resource exhaustion

---

## What are Requests and Limits?

### Requests
- **Minimum** resources guaranteed to a container
- Used by scheduler to find a suitable node
- Container gets **at least** this amount
- If node has available resources, container can use more (up to limit)

### Limits
- **Maximum** resources a container can use
- Container cannot exceed this amount
- CPU: Container is throttled if it exceeds limit
- Memory: Container is killed (OOMKilled) if it exceeds limit

---

## Resource Types

### CPU
- Measured in **CPU units** (cores)
- `1` or `1000m` = 1 CPU core
- `500m` = 0.5 CPU core (half a core)
- `100m` = 0.1 CPU core (10% of a core)

### Memory
- Measured in **bytes**
- Units: `K`, `M`, `G`, `T`, `Ki`, `Mi`, `Gi`, `Ti`
- `128Mi` = 128 Mebibytes
- `1Gi` = 1 Gibibyte
- `256M` = 256 Megabytes

---

## Basic Syntax

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-app-deployment
spec:
  replicas: 3
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
        ports:
        - containerPort: 4000
        resources:
          requests:
            cpu: 100m        # Request 0.1 CPU core
            memory: 128Mi    # Request 128 MiB RAM
          limits:
            cpu: 500m        # Limit to 0.5 CPU core
            memory: 512Mi    # Limit to 512 MiB RAM
```

---

## Common Resource Configurations

### Lightweight Application
```yaml
resources:
  requests:
    cpu: 50m
    memory: 64Mi
  limits:
    cpu: 200m
    memory: 256Mi
```

### Standard Web Application
```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### API Server / Backend
```yaml
resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: 1000m
    memory: 1Gi
```

### Database / Data Processing
```yaml
resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 2000m
    memory: 4Gi
```

### High Performance Application
```yaml
resources:
  requests:
    cpu: 1000m
    memory: 2Gi
  limits:
    cpu: 4000m
    memory: 8Gi
```

---

## Quality of Service (QoS) Classes

Kubernetes assigns QoS classes based on requests and limits:

### 1. Guaranteed (Highest Priority)
- Requests = Limits for **all** resources
- Best protection from eviction
```yaml
resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### 2. Burstable (Medium Priority)
- Requests < Limits OR only requests set
- Can use extra resources when available
```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### 3. BestEffort (Lowest Priority)
- No requests or limits set
- First to be evicted under resource pressure
```yaml
# No resources defined
```

---

## Complete Example with Your Application

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
        ports:
        - containerPort: 4000
        env:
          - name: PORT
            value: "4000"
        resources:
          requests:
            cpu: 200m          # Need at least 0.2 cores
            memory: 256Mi      # Need at least 256 MiB
          limits:
            cpu: 1000m         # Can use up to 1 core
            memory: 1Gi        # Can use up to 1 GiB
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
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

---

## Multi-Container Pods

Each container must have its own resource configuration:

```yaml
spec:
  containers:
  - name: app
    image: my-app:latest
    resources:
      requests:
        cpu: 200m
        memory: 256Mi
      limits:
        cpu: 500m
        memory: 512Mi
  - name: sidecar
    image: logging-sidecar:latest
    resources:
      requests:
        cpu: 50m
        memory: 64Mi
      limits:
        cpu: 100m
        memory: 128Mi
```

**Total pod resources** = Sum of all containers

---

## Setting Default Resources

### Using LimitRange

Create namespace-level defaults:

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: default
spec:
  limits:
  - default:              # Default limits
      cpu: 500m
      memory: 512Mi
    defaultRequest:       # Default requests
      cpu: 100m
      memory: 128Mi
    max:                  # Maximum allowed
      cpu: 2000m
      memory: 2Gi
    min:                  # Minimum allowed
      cpu: 50m
      memory: 64Mi
    type: Container
```

Apply:
```bash
kubectl apply -f limitrange.yaml
```

---

## Resource Quotas

Limit total resources in a namespace:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: namespace-quota
  namespace: default
spec:
  hard:
    requests.cpu: "10"        # Total CPU requests
    requests.memory: 20Gi     # Total memory requests
    limits.cpu: "20"          # Total CPU limits
    limits.memory: 40Gi       # Total memory limits
    pods: "50"                # Maximum pods
```

Apply:
```bash
kubectl apply -f resourcequota.yaml
```

View quota usage:
```bash
kubectl describe resourcequota namespace-quota
```

---

## Monitoring Resource Usage

### View Current Usage
```bash
# Pod resource usage
kubectl top pods

# Node resource usage
kubectl top nodes

# Specific pod
kubectl top pod <pod-name>

# Namespace usage
kubectl top pods -n <namespace>
```

### View Resource Requests and Limits
```bash
# Describe pod
kubectl describe pod <pod-name>

# Get pod YAML
kubectl get pod <pod-name> -o yaml
```

### Check QoS Class
```bash
kubectl get pod <pod-name> -o jsonpath='{.status.qosClass}'
```

---

## Best Practices

### 1. Always Set Requests
```yaml
# Bad - No requests
resources:
  limits:
    cpu: 500m
    memory: 512Mi

# Good - Has requests
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### 2. Request = Typical Usage, Limit = Peak Usage
- **Request**: What your app normally uses
- **Limit**: Maximum during traffic spikes

### 3. Start Conservative, Monitor, Adjust
```bash
# Initial deployment
requests: { cpu: 100m, memory: 128Mi }
limits: { cpu: 500m, memory: 512Mi }

# Monitor for 1-2 weeks
kubectl top pods --sort-by=memory
kubectl top pods --sort-by=cpu

# Adjust based on actual usage
```

### 4. Memory Limits = Memory Requests (Often)
Prevents OOMKilled issues:
```yaml
resources:
  requests:
    memory: 512Mi
  limits:
    memory: 512Mi  # Same as request
```

### 5. CPU Can Burst, Memory Cannot
- CPU: Safe to set limit higher than request
- Memory: More dangerous, can cause OOMKills

### 6. Use Vertical Pod Autoscaler
Automatically recommends optimal values:
```bash
kubectl describe vpa <vpa-name>
```

---

## Common Issues and Solutions

### Issue 1: Pods Pending (Insufficient CPU/Memory)

**Problem:**
```bash
kubectl get pods
# NAME                    READY   STATUS    RESTARTS   AGE
# test-app-xxx            0/1     Pending   0          5m
```

**Check:**
```bash
kubectl describe pod test-app-xxx
# Events: 0/3 nodes available: insufficient cpu
```

**Solutions:**
- Reduce resource requests
- Add more nodes
- Enable cluster autoscaler
- Remove/scale down other pods

### Issue 2: OOMKilled (Out of Memory)

**Problem:**
```bash
kubectl get pods
# NAME                    READY   STATUS      RESTARTS   AGE
# test-app-xxx            0/1     OOMKilled   5          10m
```

**Solutions:**
```yaml
# Increase memory limit
resources:
  limits:
    memory: 1Gi  # Increased from 512Mi
```

### Issue 3: CPU Throttling

**Problem:**
Application is slow despite low CPU usage.

**Check:**
```bash
kubectl top pod <pod-name>
# Shows 100% CPU usage at the limit
```

**Solutions:**
```yaml
# Increase CPU limit
resources:
  limits:
    cpu: 1000m  # Increased from 500m
```

### Issue 4: Pods Not Scheduled Evenly

**Problem:**
All pods on one node.

**Solution:**
Set pod anti-affinity:
```yaml
spec:
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          topologyKey: kubernetes.io/hostname
          labelSelector:
            matchLabels:
              app: test-app
```

---

## How to Determine Right Values

### Step 1: Start with Estimates
```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### Step 2: Deploy and Monitor
```bash
# Watch resource usage
kubectl top pods --watch

# Check for 1-2 weeks under normal load
kubectl top pods --sort-by=memory
```

### Step 3: Load Test
```bash
# Generate load
kubectl run -i --tty load-generator --rm --image=busybox --restart=Never -- /bin/sh
while true; do wget -q -O- http://test-app-loadbalancer; done

# Monitor during load
kubectl top pods --watch
```

### Step 4: Adjust Based on Data
```yaml
# If typically using 150m CPU and 200Mi memory:
resources:
  requests:
    cpu: 200m      # Typical + 30% buffer
    memory: 256Mi  # Typical + 30% buffer
  limits:
    cpu: 800m      # Peak usage + buffer
    memory: 768Mi  # Peak usage + buffer
```

---

## Resource Calculation Example

### Single Pod
```yaml
resources:
  requests:
    cpu: 200m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### 20 Replicas
- **Total Requests**: 4000m CPU (4 cores), 5120Mi memory (5Gi)
- **Total Limits**: 10000m CPU (10 cores), 10240Mi memory (10Gi)

### Node Requirements
If using nodes with 4 CPU and 8Gi RAM:
- **Minimum nodes**: 2 (for requests)
- **Recommended nodes**: 3-4 (for limits + overhead)

---

## Useful Commands

```bash
# View pod resources
kubectl get pods -o custom-columns=NAME:.metadata.name,CPU_REQ:.spec.containers[*].resources.requests.cpu,MEM_REQ:.spec.containers[*].resources.requests.memory,CPU_LIM:.spec.containers[*].resources.limits.cpu,MEM_LIM:.spec.containers[*].resources.limits.memory

# Describe node capacity
kubectl describe node <node-name> | grep -A 5 "Allocated resources"

# View namespace resource usage
kubectl describe resourcequota -n <namespace>

# Find pods without resource requests
kubectl get pods -o json | jq '.items[] | select(.spec.containers[].resources.requests == null) | .metadata.name'

# Sort pods by memory usage
kubectl top pods --sort-by=memory

# Sort pods by CPU usage
kubectl top pods --sort-by=cpu
```

---

## Resource Units Conversion

### CPU
```
1 CPU = 1000m (millicores)
500m = 0.5 CPU
250m = 0.25 CPU (quarter core)
100m = 0.1 CPU (10% of core)
```

### Memory
```
1 Ki = 1024 bytes
1 Mi = 1024 Ki = 1,048,576 bytes
1 Gi = 1024 Mi = 1,073,741,824 bytes

128Mi ≈ 134 MB
256Mi ≈ 268 MB
512Mi ≈ 536 MB
1Gi ≈ 1.07 GB
```

---

## Summary

| Aspect | Requests | Limits |
|--------|----------|--------|
| **Definition** | Minimum guaranteed | Maximum allowed |
| **Scheduling** | Used by scheduler | Not used |
| **CPU Behavior** | Guaranteed baseline | Throttled if exceeded |
| **Memory Behavior** | Guaranteed allocation | OOMKilled if exceeded |
| **When to Set** | Always | Always recommended |
| **Best Practice** | Set to typical usage | Set to peak usage |

---

## Additional Resources

- [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [LimitRange Documentation](https://kubernetes.io/docs/concepts/policy/limit-range/)
- [Resource Quotas](https://kubernetes.io/docs/concepts/policy/resource-quotas/)
- [QoS Classes](https://kubernetes.io/docs/tasks/configure-pod-container/quality-service-pod/)