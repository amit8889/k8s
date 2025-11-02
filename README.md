# Kubernetes Learning Path - Step by Step Guide

A structured, beginner-friendly guide to learning Kubernetes from scratch. Follow this guide in order to build a solid foundation.

## 📚 Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Learning Path Structure](#learning-path-structure)
- [Step-by-Step Learning Guide](#step-by-step-learning-guide)
- [Quick Reference](#quick-reference)
- [Common Commands](#common-commands)
- [Next Steps](#next-steps)

## Overview

This guide takes you from zero to deploying a full Kubernetes application. Each folder builds on the previous one, teaching you core concepts progressively.

**Total Learning Time:** 4-6 hours (hands-on practice included)

**Skill Level:** Beginner to Intermediate

## Prerequisites

Before starting, ensure you have:

✅ **Linux/macOS/Windows** with WSL2
✅ **Docker** installed and running
✅ **kubectl** CLI tool installed
✅ **Kind** (Kubernetes in Docker) installed
✅ **Basic terminal/command-line** knowledge
✅ **Text editor** (VS Code, nano, vim, etc.)

### Quick Installation Check

```bash
# Check Docker
docker --version

# Check kubectl
kubectl version --client

# Check Kind
kind --version

# If not installed, see installation guide below
```

### Installation Links
- Docker: https://docs.docker.com/get-docker/
- kubectl: https://kubernetes.io/docs/tasks/tools/
- Kind: https://kind.sigs.k8s.io/docs/user/quick-start/#installation

---

## Learning Path Structure

```
k8s-learning/
│
├── 1-init/                    # ⏱️  15 min - Initial setup
│   ├── README.md
│   └── verify-installation.sh
│
├── 2-kind-cluster/            # ⏱️  30 min - Create your cluster
│   ├── README.md
│   ├── create-cluster.sh
│   └── kind-config.yaml
│
├── 3-pods/                    # ⏱️  45 min - Basic building blocks
│   ├── README.md
│   ├── simple-pod.yaml
│   ├── multi-container-pod.yaml
│   └── pod-with-resources.yaml
│
├── 4-deployments/             # ⏱️  60 min - Production workloads
│   ├── README.md
│   ├── nginx-deployment.yaml
│   ├── rolling-update-deployment.yaml
│   └── deployment-commands.md
│
├── 5-services/                # ⏱️  60 min - Networking & exposure
│   ├── README.md
│   ├── clusterip-service.yaml
│   ├── nodeport-service.yaml
│   ├── loadbalancer-service.yaml
│   └── metallb-setup/
│       ├── metallb-config.yaml
│       └── installation-guide.md
│
└── 6-mini-project/            # ⏱️  90 min - Full application
    ├── README.md
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── database-deployment.yaml
    ├── database-service.yaml
    └── deploy-all.sh
```

---

## Step-by-Step Learning Guide

### 🚀 Step 1: Initial Setup (`1-init/`)

**Goal:** Verify your environment is ready for Kubernetes

**What You'll Learn:**
- Check if all tools are installed correctly
- Understand the Kubernetes ecosystem
- Set up your workspace

**Time Required:** 15 minutes

**Actions:**
```bash
# Navigate to init folder
cd 1-init/

# Read the README
cat README.md

# Run verification script
chmod +x verify-installation.sh
./verify-installation.sh
```

**Expected Outcome:**
- ✅ Docker running
- ✅ kubectl installed
- ✅ Kind installed
- ✅ Ready to create cluster

**Key Concepts:**
- Container runtime (Docker)
- Kubernetes CLI (kubectl)
- Local cluster tool (Kind)

---

### 🎯 Step 2: Create Kind Cluster (`2-kind-cluster/`)

**Goal:** Create your first local Kubernetes cluster

**What You'll Learn:**
- What is a Kubernetes cluster
- Cluster components (control plane, worker nodes)
- How to create and manage clusters
- Basic cluster operations

**Time Required:** 30 minutes

**Actions:**
```bash
# Navigate to kind-cluster folder
cd ../2-kind-cluster/

# Read the README thoroughly
cat README.md

# Review cluster configuration
cat kind-config.yaml

# Create the cluster
kind create cluster --name my-learning-cluster --config kind-config.yaml

# Verify cluster is running
kubectl cluster-info
kubectl get nodes
```

**Expected Outcome:**
```
NAME                            STATUS   ROLES           AGE
my-learning-cluster-control-plane   Ready    control-plane   1m
my-learning-cluster-worker          Ready    <none>          1m
```

**Key Concepts:**
- Control plane vs Worker nodes
- Cluster architecture
- Node roles and responsibilities
- Cluster contexts

**Troubleshooting:**
If cluster creation fails:
```bash
# Delete existing cluster
kind delete cluster --name my-learning-cluster

# Try again
kind create cluster --name my-learning-cluster
```

---

### 📦 Step 3: Pods (`3-pods/`)

**Goal:** Understand and create Kubernetes Pods

**What You'll Learn:**
- What are Pods (smallest deployable unit)
- Pod lifecycle
- Single and multi-container Pods
- Resource limits and requests
- Pod networking basics

**Time Required:** 45 minutes

**Actions:**
```bash
# Navigate to pods folder
cd ../3-pods/

# Read the comprehensive README
cat README.md

# Create a simple pod
kubectl apply -f simple-pod.yaml

# Check pod status
kubectl get pods
kubectl get pods -o wide

# View pod details
kubectl describe pod <pod-name>

# Check pod logs
kubectl logs <pod-name>

# Execute command in pod
kubectl exec -it <pod-name> -- sh

# Create multi-container pod
kubectl apply -f multi-container-pod.yaml

# Create pod with resource limits
kubectl apply -f pod-with-resources.yaml

# Clean up
kubectl delete pod --all
```

**Expected Outcome:**
- Understand Pod anatomy
- Can create and inspect Pods
- Know how to debug Pods
- Understand resource management

**Key Concepts:**
- Pod definition structure
- Container specifications
- Labels and selectors
- Resource requests and limits
- Init containers and sidecars

**Practice Exercises:**
1. Create a pod running busybox
2. Execute `ls /` inside the pod
3. Create a pod with memory limit of 128Mi
4. Create a multi-container pod with nginx + busybox

---

### 🚢 Step 4: Deployments (`4-deployments/`)

**Goal:** Create production-ready, scalable workloads

**What You'll Learn:**
- Why Deployments over Pods
- Replica management
- Rolling updates and rollbacks
- Scaling applications
- Self-healing capabilities
- Update strategies

**Time Required:** 60 minutes

**Actions:**
```bash
# Navigate to deployments folder
cd ../4-deployments/

# Read the deployment guide
cat README.md
cat deployment-commands.md

# Create your first deployment
kubectl apply -f nginx-deployment.yaml

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get replicasets

# Describe deployment
kubectl describe deployment nginx-deployment

# Scale deployment
kubectl scale deployment nginx-deployment --replicas=5
kubectl get pods -w

# Update deployment (rolling update)
kubectl set image deployment/nginx-deployment nginx=nginx:1.21
kubectl rollout status deployment/nginx-deployment

# Check rollout history
kubectl rollout history deployment/nginx-deployment

# Rollback deployment
kubectl rollout undo deployment/nginx-deployment

# Apply rolling update deployment
kubectl apply -f rolling-update-deployment.yaml

# Clean up
kubectl delete deployment --all
```

**Expected Outcome:**
- Understand Deployment benefits
- Can scale applications up/down
- Can perform rolling updates
- Can rollback deployments
- Understand ReplicaSets

**Key Concepts:**
- Deployment strategies (RollingUpdate, Recreate)
- ReplicaSets and their relationship to Deployments
- Desired state vs Current state
- Rolling update parameters (maxSurge, maxUnavailable)
- Revision history

**Practice Exercises:**
1. Create deployment with 3 replicas
2. Scale to 10 replicas
3. Update nginx image to version 1.22
4. Rollback to previous version
5. Set resource limits on deployment

**Common Issues:**
- **ImagePullBackOff**: Wrong image name
- **CrashLoopBackOff**: Application error
- **Pending**: Insufficient resources

---

### 🌐 Step 5: Services (`5-services/`)

**Goal:** Expose and access your applications

**What You'll Learn:**
- Service types (ClusterIP, NodePort, LoadBalancer)
- Service discovery and DNS
- Load balancing across Pods
- Port forwarding
- MetalLB for local LoadBalancers
- Networking fundamentals

**Time Required:** 60 minutes

**Actions:**
```bash
# Navigate to services folder
cd ../5-services/

# Read the comprehensive service guide
cat README.md

# First, create a deployment to expose
kubectl create deployment nginx --image=nginx --replicas=3

# Create ClusterIP service (internal only)
kubectl apply -f clusterip-service.yaml
kubectl get svc
kubectl describe svc my-learning-service

# Test from within cluster
kubectl run test --image=busybox -it --rm -- wget -O- http://my-learning-service

# Create NodePort service (external access)
kubectl apply -f nodeport-service.yaml
kubectl get svc nginx-nodeport

# Get node IP and access
kubectl get nodes -o wide
curl http://<node-ip>:<nodeport>

# Port forwarding for local access
kubectl port-forward svc/my-learning-service 8080:80
# Open browser: http://localhost:8080

# Set up MetalLB for LoadBalancer
cd metallb-setup/
cat installation-guide.md

# Install MetalLB
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.10/config/manifests/metallb-native.yaml

# Wait for MetalLB to be ready
kubectl wait --namespace metallb-system \
  --for=condition=ready pod \
  --selector=app=metallb \
  --timeout=90s

# Configure MetalLB IP pool
kubectl apply -f metallb-config.yaml

# Create LoadBalancer service
cd ..
kubectl apply -f loadbalancer-service.yaml

# Check external IP assignment
kubectl get svc nginx-loadbalancer -w

# Test LoadBalancer
EXTERNAL_IP=$(kubectl get svc nginx-loadbalancer -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl http://$EXTERNAL_IP

# Clean up
kubectl delete svc --all
```

**Expected Outcome:**
- Understand all service types
- Can expose applications internally and externally
- MetalLB configured for local LoadBalancer
- Can debug service connectivity issues

**Key Concepts:**
- Service types and when to use each
- Selectors and endpoint discovery
- DNS resolution in Kubernetes
- Port, TargetPort, NodePort differences
- LoadBalancer implementation
- Layer 4 vs Layer 7 load balancing

**Practice Exercises:**
1. Create ClusterIP service for nginx deployment
2. Test service from another pod
3. Create NodePort service and access from host
4. Set up LoadBalancer with MetalLB
5. Use port-forward to access service locally

**Service Type Decision Tree:**
```
Need external access?
├─ No → Use ClusterIP
└─ Yes
    ├─ Development/Testing → Use NodePort or Port-Forward
    ├─ Production (Cloud) → Use LoadBalancer
    └─ Production (On-prem) → Use LoadBalancer + MetalLB or Ingress
```

---

### 🏗️ Step 6: Mini Full Project (`6-mini-project/`)

**Goal:** Deploy a complete multi-tier application

**What You'll Learn:**
- Application architecture in Kubernetes
- Multi-service deployment
- Service communication
- Environment variables and ConfigMaps
- Secrets management
- Complete deployment workflow
- Troubleshooting real applications

**Time Required:** 90 minutes

**Project Architecture:**
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ (HTTP)
┌──────▼──────────┐
│  LoadBalancer   │
│   (Frontend)    │
└──────┬──────────┘
       │
┌──────▼──────────┐     ┌──────────────┐
│    Frontend     │────▶│   Backend    │
│   (React/Vue)   │     │  (Node/Java) │
└─────────────────┘     └──────┬───────┘
                               │
                        ┌──────▼────────┐
                        │   Database    │
                        │  (PostgreSQL) │
                        └───────────────┘
```

**Actions:**
```bash
# Navigate to mini-project folder
cd ../6-mini-project/

# Read the project README
cat README.md

# Review all YAML files
ls -la

# Option 1: Deploy everything at once
chmod +x deploy-all.sh
./deploy-all.sh

# Option 2: Deploy step by step (recommended for learning)

# 1. Deploy Database first
kubectl apply -f database-deployment.yaml
kubectl apply -f database-service.yaml

# Verify database is running
kubectl get pods -l app=database
kubectl logs -l app=database

# 2. Deploy Backend
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# Verify backend can connect to database
kubectl get pods -l app=backend
kubectl logs -l app=backend

# 3. Deploy Frontend
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# Verify frontend is running
kubectl get pods -l app=frontend

# Check all resources
kubectl get all

# Get service URLs
kubectl get svc

# Access the application
FRONTEND_IP=$(kubectl get svc frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Access application at: http://$FRONTEND_IP"

# Test the full stack
curl http://$FRONTEND_IP
curl http://$FRONTEND_IP/api/health

# Check logs of all components
kubectl logs -l app=frontend --tail=20
kubectl logs -l app=backend --tail=20
kubectl logs -l app=database --tail=20

# Scale components
kubectl scale deployment frontend --replicas=3
kubectl scale deployment backend --replicas=2

# Monitor the application
kubectl get pods -w

# Troubleshoot if issues
kubectl describe pod <pod-name>
kubectl get events --sort-by='.lastTimestamp'
```

**Expected Outcome:**
- ✅ Full 3-tier application running
- ✅ Frontend accessible via LoadBalancer
- ✅ Backend communicating with database
- ✅ Services discovering each other via DNS
- ✅ Application scaled across multiple pods

**Key Concepts:**
- Multi-tier architecture
- Service mesh basics
- Environment configuration
- Secrets for sensitive data
- Persistent storage (if using StatefulSets)
- Health checks and readiness probes
- Application monitoring

**Testing the Application:**

```bash
# 1. Check all pods are running
kubectl get pods

# 2. Test database connectivity
kubectl exec -it <backend-pod> -- nc -zv database-service 5432

# 3. Test backend API
kubectl port-forward svc/backend-service 8080:80
curl http://localhost:8080/api/health

# 4. Test frontend
FRONTEND_IP=$(kubectl get svc frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl -I http://$FRONTEND_IP

# 5. End-to-end test
# Open browser and access: http://<FRONTEND_IP>
```

**Troubleshooting Guide:**

| Issue | Check | Solution |
|-------|-------|----------|
| **Pod not starting** | `kubectl describe pod <name>` | Check image, resources, dependencies |
| **Service not accessible** | `kubectl get endpoints <svc>` | Verify selector matches pod labels |
| **Backend can't reach DB** | `kubectl logs <backend-pod>` | Check service name, port, credentials |
| **503 Service Unavailable** | `kubectl get pods` | Ensure backend pods are ready |
| **ImagePullBackOff** | Image name in YAML | Verify image exists and is accessible |

**Clean Up Project:**
```bash
# Delete all project resources
kubectl delete -f .

# Or delete by label
kubectl delete all -l project=mini-fullstack

# Verify cleanup
kubectl get all
```

---

## Quick Reference

### Essential Commands by Stage

#### Init & Cluster
```bash
docker ps                                      # Check Docker is running
kind create cluster --name my-cluster          # Create cluster
kubectl cluster-info                           # Verify cluster
kubectl get nodes                              # Check nodes
```

#### Pods
```bash
kubectl apply -f pod.yaml                      # Create pod
kubectl get pods                               # List pods
kubectl describe pod <name>                    # Pod details
kubectl logs <name>                            # View logs
kubectl exec -it <name> -- sh                  # Enter pod
kubectl delete pod <name>                      # Delete pod
```

#### Deployments
```bash
kubectl apply -f deployment.yaml               # Create deployment
kubectl get deployments                        # List deployments
kubectl scale deployment <name> --replicas=5   # Scale
kubectl set image deployment/<name> <container>=<image>:<tag>  # Update
kubectl rollout status deployment/<name>       # Check rollout
kubectl rollout undo deployment/<name>         # Rollback
kubectl rollout history deployment/<name>      # View history
```

#### Services
```bash
kubectl apply -f service.yaml                  # Create service
kubectl get svc                                # List services
kubectl describe svc <name>                    # Service details
kubectl get endpoints <name>                   # Check endpoints
kubectl port-forward svc/<name> 8080:80        # Port forward
```

#### Debugging
```bash
kubectl get events --sort-by='.lastTimestamp'  # Recent events
kubectl get all                                # All resources
kubectl describe <resource> <name>             # Detailed info
kubectl logs -f <pod-name>                     # Stream logs
kubectl top nodes                              # Node metrics
kubectl top pods                               # Pod metrics
```

### YAML Template Quick Reference

#### Pod Template
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  labels:
    app: myapp
spec:
  containers:
  - name: container-name
    image: nginx:latest
    ports:
    - containerPort: 80
```

#### Deployment Template
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: container-name
        image: nginx:latest
        ports:
        - containerPort: 80
```

#### Service Template
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ClusterIP  # or NodePort, LoadBalancer
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
```

---

## Common Commands Summary

```bash
# Cluster Management
kind create cluster --name <name>
kind delete cluster --name <name>
kubectl cluster-info
kubectl get nodes

# Resource Operations
kubectl apply -f <file.yaml>
kubectl get <resource>
kubectl describe <resource> <name>
kubectl delete <resource> <name>
kubectl edit <resource> <name>

# Deployment Operations
kubectl create deployment <name> --image=<image>
kubectl scale deployment <name> --replicas=<n>
kubectl expose deployment <name> --port=80 --type=LoadBalancer

# Debugging
kubectl logs <pod-name>
kubectl logs -f <pod-name>
kubectl exec -it <pod-name> -- sh
kubectl port-forward <pod-name> 8080:80
kubectl top pods

# Cleanup
kubectl delete all --all
kind delete cluster --name <name>
```

---

## Learning Checkpoints

### After Step 1 (Init) ✅
- [ ] Docker is running
- [ ] kubectl is installed
- [ ] Kind is installed
- [ ] Can run basic commands

### After Step 2 (Cluster) ✅
- [ ] Created Kind cluster
- [ ] Understand cluster architecture
- [ ] Can view nodes and cluster info
- [ ] Know how to delete cluster

### After Step 3 (Pods) ✅
- [ ] Created and inspected Pods
- [ ] Understand Pod lifecycle
- [ ] Can view logs and execute commands
- [ ] Know resource limits

### After Step 4 (Deployments) ✅
- [ ] Created Deployments
- [ ] Scaled applications
- [ ] Performed rolling updates
- [ ] Rolled back deployments
- [ ] Understand ReplicaSets

### After Step 5 (Services) ✅
- [ ] Created all service types
- [ ] Understand service discovery
- [ ] Configured MetalLB
- [ ] Can expose applications externally
- [ ] Used port-forwarding

### After Step 6 (Mini Project) ✅
- [ ] Deployed full-stack application
- [ ] Understand multi-tier architecture
- [ ] Services communicate correctly
- [ ] Can troubleshoot issues
- [ ] Application is accessible

---

## Next Steps

### 🎓 Advanced Topics to Learn Next

1. **ConfigMaps and Secrets**
   - Manage configuration data
   - Handle sensitive information
   - Environment variable management

2. **Persistent Storage**
   - PersistentVolumes (PV)
   - PersistentVolumeClaims (PVC)
   - StatefulSets for stateful applications

3. **Ingress Controllers**
   - HTTP/HTTPS routing
   - SSL/TLS termination
   - Path-based routing

4. **Namespaces**
   - Resource isolation
   - Multi-tenant clusters
   - Resource quotas

5. **Monitoring and Logging**
   - Prometheus for metrics
   - Grafana for visualization
   - ELK/EFK stack for logging

6. **CI/CD Integration**
   - GitHub Actions with Kubernetes
   - GitOps with ArgoCD/Flux
   - Automated deployments

7. **Security**
   - RBAC (Role-Based Access Control)
   - Network Policies
   - Pod Security Policies
   - Security best practices

8. **Helm Charts**
   - Package management for Kubernetes
   - Creating and using Helm charts
   - Application templating

### 📚 Additional Resources

- **Official Docs**: https://kubernetes.io/docs/
- **Interactive Tutorial**: https://kubernetes.io/docs/tutorials/
- **Practice Labs**: https://labs.play-with-k8s.com/
- **Kubernetes Patterns**: https://k8spatterns.io/
- **CNCF Landscape**: https://landscape.cncf.io/

### 🎯 Certification Path

1. **CKAD** - Certified Kubernetes Application Developer
2. **CKA** - Certified Kubernetes Administrator
3. **CKS** - Certified Kubernetes Security Specialist

---

## Troubleshooting Common Issues

### Issue: Kind cluster won't start
```bash
# Solution: Restart Docker
sudo systemctl restart docker

# Or reset Docker
docker system prune -a
```

### Issue: kubectl commands not working
```bash
# Solution: Check context
kubectl config get-contexts
kubectl config use-context kind-my-learning-cluster
```

### Issue: Pods stuck in Pending
```bash
# Solution: Check node resources
kubectl describe nodes
kubectl top nodes

# Check pod events
kubectl describe pod <name>
```

### Issue: Service not accessible
```bash
# Solution: Check endpoints
kubectl get endpoints <service-name>

# Verify pod labels match service selector
kubectl get pods --show-labels
kubectl describe svc <service-name>
```

### Issue: MetalLB not assigning IP
```bash
# Solution: Check MetalLB configuration
kubectl get ipaddresspool -n metallb-system
kubectl describe ipaddresspool -n metallb-system

# Check MetalLB logs
kubectl logs -n metallb-system -l component=controller
```

---

## Tips for Success

💡 **Take your time** - Don't rush through the folders
💡 **Practice each command** - Type them out, don't copy-paste
💡 **Read error messages** - They're usually helpful
💡 **Use kubectl describe** - It shows events and errors
💡 **Check logs frequently** - `kubectl logs` is your friend
💡 **Clean up resources** - Delete after each exercise to save resources
💡 **Experiment** - Try modifying YAML files
💡 **Take notes** - Document what you learn
💡 **Join communities** - Kubernetes Slack, Reddit, forums

---

## Summary

You've learned:
✅ How to set up a local Kubernetes environment
✅ Understanding of Pods, Deployments, and Services
✅ How to expose applications externally
✅ Setting up LoadBalancers with MetalLB
✅ Deploying a full multi-tier application
✅ Debugging and troubleshooting skills

**Congratulations!** You now have a solid foundation in Kubernetes. Keep practicing and exploring more advanced topics!

---

**Created by:** Your Name  
**Last Updated:** November 2025  
**License:** MIT

**Need help?** Open an issue in the repository or reach out to the community!

Happy Learning! 🚀