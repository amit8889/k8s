# Kubernetes Scaling - README

## Overview

Kubernetes provides multiple scaling mechanisms to handle varying workloads. Scaling ensures your application can handle increased traffic and optimize resource usage during low demand.

## Types of Scaling in Kubernetes

### 1. **Horizontal Pod Autoscaling (HPA)**
Automatically scales the number of pods based on CPU, memory, or custom metrics.

### 2. **Vertical Pod Autoscaling (VPA)**
Automatically adjusts CPU and memory requests/limits for containers.

### 3. **Cluster Autoscaling**
Automatically adds or removes nodes from the cluster based on resource demands.

### 4. **Manual Scaling**
Manually change the number of replicas using kubectl commands.

---

## 1. Horizontal Pod Autoscaling (HPA)

### What is HPA?
HPA automatically scales the number of pods in a deployment based on observed metrics like CPU utilization, memory usage, or custom metrics.

### How It Works
- Monitors metrics every 15 seconds (default)
- Scales up when metric exceeds target
- Scales down when metric is below target
- Respects min/max replica limits

### Enable Metrics Server (Required)
```bash
# Check if metrics-server is running
kubectl get deployment metrics-server -n kube-system

# Install if not present
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### Basic HPA Example

**deployment.yaml**
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
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

### Create HPA Using kubectl
```bash
# Scale based on CPU (target 50% CPU utilization)
kubectl autoscale deployment test-app-deployment \
  --cpu-percent=50 \
  --min=3 \
  --max=20
```

### Create HPA Using YAML

**hpa.yaml**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: test-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: test-app-deployment
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```

Apply:
```bash
kubectl apply -f hpa.yaml
```

### HPA with Multiple Metrics

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: test-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: test-app-deployment
  minReplicas: 3
  maxReplicas: 20
  metrics:
  # CPU-based scaling
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
  # Memory-based scaling
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70
```

### HPA with Custom Metrics

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: test-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: test-app-deployment
  minReplicas: 3
  maxReplicas: 20
  metrics:
  # Request per second
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
```

### Manage HPA
```bash
# View HPA status
kubectl get hpa

# Detailed view
kubectl describe hpa test-app-hpa

# Watch HPA in action
kubectl get hpa test-app-hpa --watch

# Delete HPA
kubectl delete hpa test-app-hpa
```

### HPA Best Practices
- Always set resource requests (CPU/memory)
- Start with conservative targets (50-70% CPU)
- Set appropriate min/max replicas
- Use multiple metrics for better scaling decisions
- Monitor scaling events: `kubectl get events --sort-by='.lastTimestamp'`

---

## 2. Vertical Pod Autoscaling (VPA)

### What is VPA?
VPA automatically adjusts CPU and memory requests and limits for containers based on historical usage.

### VPA Modes
- **Auto**: Automatically updates resources and restarts pods
- **Recreate**: Updates resources by recreating pods
- **Initial**: Sets resources only on pod creation
- **Off**: Only provides recommendations

### Install VPA
```bash
git clone https://github.com/kubernetes/autoscaler.git
cd autoscaler/vertical-pod-autoscaler
./hack/vpa-up.sh
```

### VPA Example

**vpa.yaml**
```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: test-app-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: test-app-deployment
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: test-app
      minAllowed:
        cpu: 100m
        memory: 128Mi
      maxAllowed:
        cpu: 2
        memory: 2Gi
```

Apply:
```bash
kubectl apply -f vpa.yaml
```

### View VPA Recommendations
```bash
kubectl describe vpa test-app-vpa
```

### VPA Best Practices
- Don't use VPA with HPA on CPU/memory (conflict)
- Use "Initial" or "Off" mode for production (safer)
- Set min/max limits to prevent extreme values
- VPA requires pod restarts (can cause downtime)

---

## 3. Cluster Autoscaling

### What is Cluster Autoscaler?
Automatically adjusts the number of nodes in your cluster based on resource requests.

### How It Works
- Scales up when pods can't be scheduled due to insufficient resources
- Scales down when nodes are underutilized for 10+ minutes
- Respects pod disruption budgets

### Cluster Autoscaler (Cloud Providers)

**AWS EKS**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cluster-autoscaler
  template:
    metadata:
      labels:
        app: cluster-autoscaler
    spec:
      serviceAccountName: cluster-autoscaler
      containers:
      - image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.21.0
        name: cluster-autoscaler
        command:
        - ./cluster-autoscaler
        - --v=4
        - --stderrthreshold=info
        - --cloud-provider=aws
        - --skip-nodes-with-local-storage=false
        - --nodes=1:10:my-node-group
```

**GKE (Google)**
```bash
gcloud container clusters update my-cluster \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=10
```

**AKS (Azure)**
```bash
az aks update \
  --resource-group myResourceGroup \
  --name myAKSCluster \
  --enable-cluster-autoscaler \
  --min-count 1 \
  --max-count 10
```

### Cluster Autoscaler Best Practices
- Set appropriate min/max node counts
- Use pod disruption budgets
- Configure node affinity/anti-affinity
- Monitor node scaling events

---

## 4. Manual Scaling

### Scale Deployment
```bash
# Scale to specific number of replicas
kubectl scale deployment test-app-deployment --replicas=10

# Scale using deployment file
kubectl apply -f deployment.yaml  # After changing replicas in YAML
```

### Scale ReplicaSet
```bash
kubectl scale replicaset test-app-rs --replicas=5
```

### Scale StatefulSet
```bash
kubectl scale statefulset test-app-sts --replicas=3
```

---

## Complete Scaling Example

### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-app-deployment
  labels:
    app: test-app
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
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 4000
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
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

### hpa.yaml
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: test-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: test-app-deployment
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 15
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
```

### Deploy with Autoscaling
```bash
# 1. Deploy application
kubectl apply -f deployment.yaml

# 2. Enable HPA
kubectl apply -f hpa.yaml

# 3. Monitor scaling
kubectl get hpa --watch

# 4. Generate load (test scaling)
kubectl run -i --tty load-generator --rm --image=busybox --restart=Never -- /bin/sh
# Inside the pod:
while true; do wget -q -O- http://test-app-loadbalancer; done
```

---

## Scaling Comparison

| Type | When to Use | Pros | Cons |
|------|-------------|------|------|
| **HPA** | Variable traffic patterns | Handles traffic spikes, cost-effective | Requires metrics server |
| **VPA** | Unknown resource requirements | Optimizes resource usage | Causes pod restarts |
| **Cluster Autoscaler** | Node capacity issues | Adds compute resources | Cloud-provider specific, slower |
| **Manual** | Predictable workloads | Simple, full control | Requires manual intervention |

---

## Monitoring Scaling

### View Current Replicas
```bash
kubectl get deployment test-app-deployment
```

### View HPA Status
```bash
kubectl get hpa
kubectl describe hpa test-app-hpa
```

### View Scaling Events
```bash
kubectl get events --sort-by='.lastTimestamp' | grep -i scale
```

### View Pod Metrics
```bash
kubectl top pods
kubectl top nodes
```

---

## Scaling Best Practices

### 1. Set Resource Requests and Limits
```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### 2. Configure Pod Disruption Budgets
```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: test-app-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: test-app
```

### 3. Use Health Checks
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 4000
readinessProbe:
  httpGet:
    path: /ready
    port: 4000
```

### 4. Configure HPA Behavior (Scaling Policies)
Control how fast scaling happens to prevent thrashing.

### 5. Monitor and Alert
- Set up monitoring (Prometheus, Grafana)
- Alert on scaling events
- Track resource utilization

---

## Troubleshooting

### HPA Not Scaling
```bash
# Check metrics server
kubectl get apiservice v1beta1.metrics.k8s.io -o yaml

# Check pod resource requests
kubectl describe deployment test-app-deployment

# View HPA events
kubectl describe hpa test-app-hpa
```

### Pods Pending (Cannot Schedule)
```bash
# Check node resources
kubectl top nodes

# Check pending pods
kubectl get pods --field-selector=status.phase=Pending

# Enable cluster autoscaler if available
```

### Scaling Too Slow/Fast
Adjust HPA behavior policies and stabilization windows.

---

## Load Testing Tools

### Apache Bench
```bash
ab -n 10000 -c 100 http://<service-ip>/
```

### Hey
```bash
hey -z 60s -c 50 http://<service-ip>/
```

### K6
```bash
k6 run load-test.js
```

---

## Additional Resources

- [HPA Documentation](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [VPA Documentation](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler)
- [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler)
- [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)