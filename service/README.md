# Kubernetes Service Management Guide

A comprehensive guide for creating and managing Kubernetes Services using `kubectl` commands.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Service Types](#service-types)
- [Creating a Service](#creating-a-service)
- [Viewing Services](#viewing-services)
- [Describing Services](#describing-services)
- [Testing Services](#testing-services)
- [Example Service YAML](#example-service-yaml)
- [Additional Commands](#additional-commands)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

A Service in Kubernetes is an abstraction that defines a logical set of Pods and a policy to access them. Services enable loose coupling between dependent Pods and provide stable networking for your applications.

### Key Features
- **Stable IP address**: Provides a consistent endpoint for Pod access
- **Load balancing**: Distributes traffic across multiple Pods
- **Service discovery**: Automatic DNS entries for services
- **Port mapping**: Maps external ports to container ports
- **Multiple service types**: ClusterIP, NodePort, LoadBalancer, ExternalName

## Prerequisites

- Kubernetes cluster (local or remote)
- `kubectl` CLI tool installed and configured
- Running Pods with matching labels
- Basic understanding of YAML syntax

## Service Types

### 1. ClusterIP (Default)
Exposes the Service on an internal IP in the cluster. Only reachable from within the cluster.

**Use case**: Internal microservices communication

### 2. NodePort
Exposes the Service on each Node's IP at a static port (30000-32767).

**Use case**: Development/testing, external access without load balancer

### 3. LoadBalancer
Exposes the Service externally using a cloud provider's load balancer.

**Use case**: Production external access with cloud providers

### 4. ExternalName
Maps a Service to a DNS name.

**Use case**: Connecting to external services outside the cluster

## Creating a Service

### From YAML File

```bash
kubectl apply -f service.yaml
```

### Imperative Commands

```bash
# Create ClusterIP service
kubectl create service clusterip my-service --tcp=80:80

# Expose a deployment as a service
kubectl expose deployment nginx-deployment --port=80 --target-port=80 --name=nginx-service

# Create NodePort service
kubectl create service nodeport my-service --tcp=80:80 --node-port=30080

# Create LoadBalancer service
kubectl create service loadbalancer my-service --tcp=80:80
```

## Viewing Services

### Basic Commands

```bash
# List all services in current namespace
kubectl get services
kubectl get svc  # Short form

# List services in all namespaces
kubectl get services --all-namespaces

# View with additional details
kubectl get services -o wide

# Watch services in real-time
kubectl get services -w

# View services with labels
kubectl get services --show-labels

# Filter services by label
kubectl get services -l app=nginx

# Get service endpoints
kubectl get endpoints
kubectl get endpoints <service-name>
```

## Describing Services

Get detailed information about a specific service:

```bash
kubectl describe service <service-name>
kubectl describe svc <service-name>  # Short form
```

This command provides:
- Service type and IP addresses
- Port configurations
- Selector information
- Endpoints (backend Pods)
- Session affinity settings
- Events

## Testing Services

### From Within the Cluster

```bash
# Run a temporary pod for testing
kubectl run test-pod --image=busybox --rm -it --restart=Never -- sh

# Inside the pod, test the service
wget -O- http://<service-name>.<namespace>.svc.cluster.local
curl http://<service-name>:80

# Test using service DNS
nslookup <service-name>
```

## Port Forwarding

Port forwarding allows you to access a Service from your local machine without exposing it externally. This is extremely useful for debugging, testing, and development.

### Basic Port Forwarding

```bash
# Forward local port to service
kubectl port-forward service/<service-name> 8080:80

# Short form
kubectl port-forward svc/<service-name> 8080:80

# Access from local machine
curl http://localhost:8080
```

### Port Forwarding Options

```bash
# Forward to specific pod
kubectl port-forward pod/<pod-name> 8080:80

# Forward to deployment
kubectl port-forward deployment/<deployment-name> 8080:80

# Forward multiple ports
kubectl port-forward service/<service-name> 8080:80 8443:443

# Use same port locally and remotely
kubectl port-forward service/<service-name> 80:80

# Listen on all addresses (accessible from other machines)
kubectl port-forward --address 0.0.0.0 service/<service-name> 8080:80

# Listen on specific address
kubectl port-forward --address 192.168.1.100 service/<service-name> 8080:80

# Forward in background (add & at end)
kubectl port-forward service/<service-name> 8080:80 &

# Specify namespace
kubectl port-forward -n <namespace> service/<service-name> 8080:80
```

### Port Forwarding Use Cases

#### 1. Database Access
```bash
# Forward MySQL database
kubectl port-forward service/mysql 3306:3306

# Connect using MySQL client
mysql -h 127.0.0.1 -P 3306 -u root -p
```

#### 2. Web Application Testing
```bash
# Forward web application
kubectl port-forward service/webapp 8080:80

# Open in browser
# http://localhost:8080
```

#### 3. API Development
```bash
# Forward API service
kubectl port-forward service/api-service 9000:8080

# Test API endpoints
curl http://localhost:9000/api/health
```

#### 4. Debugging Internal Services
```bash
# Forward metrics endpoint
kubectl port-forward service/prometheus 9090:9090

# Access Prometheus UI
# http://localhost:9090
```

### Port Forwarding Best Practices

✅ **Use for development/debugging only** (not for production access)
✅ **Choose available local ports** (avoid conflicts)
✅ **Kill port-forward when done** (Ctrl+C or `kill` process)
✅ **Use specific pod names** for troubleshooting specific instances
✅ **Document port mappings** for team members
✅ **Consider kubectl proxy** for API server access
✅ **Use Ingress/LoadBalancer** for permanent external access

### Managing Port Forward Sessions

```bash
# Find port-forward processes
ps aux | grep port-forward

# Kill specific port-forward
kill <process-id>

# Kill all kubectl port-forward processes
pkill -f "kubectl port-forward"

# Check if port is in use
netstat -an | grep 8080
lsof -i :8080  # On macOS/Linux
```

### Port Forwarding Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port already in use** | Use different local port or kill conflicting process |
| **Connection refused** | Check if service/pod is running |
| **Lost connection** | Restart port-forward, check pod health |
| **Cannot connect** | Verify service selector matches pods |
| **Permission denied** | Use port > 1024 or run with sudo |

### Alternative: kubectl proxy

```bash
# Start kubectl proxy (access K8s API)
kubectl proxy --port=8080

# Access service through proxy
# http://localhost:8080/api/v1/namespaces/<namespace>/services/<service-name>/proxy/

# Example
curl http://localhost:8080/api/v1/namespaces/default/services/my-service/proxy/
```

### Testing NodePort Services

```bash
# Get node IP
kubectl get nodes -o wide

# Access service (if NodePort is 30080)
curl http://<node-ip>:30080
```

## LoadBalancer Setup for Local Clusters (MetalLB)

When running Kubernetes locally (Kind, bare-metal, or self-hosted clusters), LoadBalancer services remain in `<pending>` state because there's no cloud provider to assign external IPs. **MetalLB** solves this by providing LoadBalancer functionality for on-premise clusters.

### What is MetalLB?

MetalLB is a load-balancer implementation for bare-metal Kubernetes clusters that:
- Assigns external IPs to LoadBalancer services
- Works in Layer 2 (ARP) or BGP mode
- Provides cloud-like LoadBalancer experience locally

### Supported Environments

✅ **Kind** (Kubernetes in Docker)
✅ **Bare-metal** Kubernetes clusters
✅ **Self-hosted** clusters (on-premise)
✅ **Local development** environments
❌ **Not needed** for: EKS, GKE, AKS, or other managed cloud Kubernetes

### Prerequisites

- Kubernetes cluster running (Kind, kubeadm, etc.)
- `kubectl` configured and working
- Admin access to the cluster

### Step-by-Step MetalLB Installation

#### Step 1: Install MetalLB

Install MetalLB using the official manifest:

```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.10/config/manifests/metallb-native.yaml
```

**Expected Output:**
```
namespace/metallb-system created
customresourcedefinition.apiextensions.k8s.io/addresspools.metallb.io created
customresourcedefinition.apiextensions.k8s.io/ipaddresspools.metallb.io created
customresourcedefinition.apiextensions.k8s.io/l2advertisements.metallb.io created
serviceaccount/controller created
serviceaccount/speaker created
deployment.apps/controller created
daemonset.apps/speaker created
```

#### Step 2: Verify MetalLB Installation

Wait for MetalLB pods to be ready:

```bash
# Check MetalLB namespace
kubectl get namespaces | grep metallb

# Check MetalLB pods
kubectl get pods -n metallb-system

# Expected output:
# NAME                          READY   STATUS    RESTARTS   AGE
# controller-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
# speaker-xxxxx                 1/1     Running   0          2m
# speaker-xxxxx                 1/1     Running   0          2m
```

Wait until all pods show `Running` status:

```bash
kubectl wait --namespace metallb-system \
  --for=condition=ready pod \
  --selector=app=metallb \
  --timeout=90s
```

#### Step 3: Determine Your IP Address Range

Before configuring MetalLB, you need to find the correct IP range for your cluster.

##### For Kind Clusters:

```bash
# Get node internal IPs
kubectl get nodes -o wide

# Example output:
# NAME                            INTERNAL-IP   EXTERNAL-IP
# my-cluster-control-plane        172.20.0.4    <none>
# my-cluster-worker               172.20.0.3    <none>
```

**Analysis:**
- Nodes use IPs: `172.20.0.3` and `172.20.0.4`
- Available range: `172.20.0.10-172.20.0.50` (safe range, avoiding node IPs)

##### For Bare-Metal Clusters:

```bash
# Check your network configuration
ip addr show

# Find subnet of your cluster network
# Example: 192.168.1.0/24
```

Choose a range that:
- Is in the same subnet as your nodes
- Doesn't conflict with existing IPs (DHCP range, static IPs)
- Has enough IPs for your LoadBalancer services

#### Step 4: Create MetalLB IP Address Pool

Create a file called `metallb-config.yaml`:

```yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: default-address-pool
  namespace: metallb-system
spec:
  addresses:
    - 172.20.0.10-172.20.0.50   # Adjust to match YOUR network
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: default
  namespace: metallb-system
spec:
  ipAddressPools:
    - default-address-pool
```

**Important Configuration Notes:**

| Environment | IP Range Example | Notes |
|-------------|------------------|-------|
| **Kind** | `172.20.0.10-172.20.0.50` | Use same subnet as node IPs |
| **Bare-metal** | `192.168.1.200-192.168.1.250` | Match your LAN subnet |
| **Custom network** | Check with `kubectl get nodes -o wide` | Use cluster network range |

#### Step 5: Apply MetalLB Configuration

```bash
kubectl apply -f metallb-config.yaml
```

**Expected Output:**
```
ipaddresspool.metallb.io/default-address-pool created
l2advertisement.metallb.io/default created
```

**Verify configuration:**

```bash
# Check IPAddressPool
kubectl get ipaddresspool -n metallb-system

# Check L2Advertisement
kubectl get l2advertisement -n metallb-system

# Describe the pool
kubectl describe ipaddresspool default-address-pool -n metallb-system
```

#### Step 6: Create LoadBalancer Service

Create your LoadBalancer service YAML (`loadbalancer-service.yaml`):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-loadbalancer
  labels:
    app: nginx
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

Apply the service:

```bash
kubectl apply -f loadbalancer-service.yaml
```

#### Step 7: Verify LoadBalancer Assignment

```bash
# Check service status
kubectl get svc nginx-loadbalancer

# Expected output:
# NAME                 TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
# nginx-loadbalancer   LoadBalancer   10.96.93.61     172.20.0.10   80:31093/TCP   10s
```

**Status Meanings:**
- `<pending>` = MetalLB not configured or no IPs available
- `172.20.0.10` = ✅ IP successfully assigned!

If still `<pending>`, check troubleshooting section below.

#### Step 8: Test LoadBalancer Access

```bash
# Get the external IP
EXTERNAL_IP=$(kubectl get svc nginx-loadbalancer -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test connectivity
curl http://$EXTERNAL_IP

# Or specify directly
curl http://172.20.0.10
```

**Expected Response:**
```html
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
...
```

**Alternative Testing Methods:**

```bash
# Using wget
wget -O- http://172.20.0.10

# Check from within cluster
kubectl run test --image=busybox -it --rm --restart=Never -- wget -O- http://172.20.0.10

# Open in browser (if on local machine)
xdg-open http://172.20.0.10  # Linux
open http://172.20.0.10      # macOS
```

### Accessing LoadBalancer from Outside Host

The MetalLB IP (e.g., `172.20.0.10`) is accessible from:
- ✅ The host machine running the cluster
- ✅ Containers within the Docker network (for Kind)
- ❌ External networks (internet/other machines) by default

#### Option 1: Port Forwarding (Simple)

```bash
# Forward host port to LoadBalancer service
kubectl port-forward svc/nginx-loadbalancer 8080:80

# Now accessible from anywhere that can reach your host
curl http://<your-host-ip>:8080
```

#### Option 2: Host Network Access (Kind)

For Kind clusters, you can expose ports directly:

```bash
# Create Kind cluster with extra port mappings
kind create cluster --config kind-config.yaml
```

`kind-config.yaml`:
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 8080
    protocol: TCP
```

#### Option 3: Reverse Proxy (Production)

Install Nginx on host machine:

```bash
# Install Nginx on host
sudo apt update && sudo apt install nginx -y

# Configure reverse proxy
sudo nano /etc/nginx/sites-available/k8s-app
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://172.20.0.10;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/k8s-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### MetalLB Troubleshooting

#### Problem 1: Service Stuck in `<pending>`

```bash
# Check service status
kubectl describe svc nginx-loadbalancer

# Look for events like:
# Warning  AllocationFailed  Failed to allocate IP: no available IPs
```

**Solutions:**

```bash
# 1. Verify IPAddressPool exists
kubectl get ipaddresspool -n metallb-system

# 2. Check if IPs are available
kubectl describe ipaddresspool default-address-pool -n metallb-system

# 3. Verify L2Advertisement
kubectl get l2advertisement -n metallb-system

# 4. Check MetalLB controller logs
kubectl logs -n metallb-system -l component=controller

# 5. Recreate the service
kubectl delete svc nginx-loadbalancer
kubectl apply -f loadbalancer-service.yaml
```

#### Problem 2: "AllocationFailed: no available IPs"

**Cause:** IP pool exhausted or wrong range configured.

**Solution:**
```bash
# Edit the IPAddressPool to expand range
kubectl edit ipaddresspool default-address-pool -n metallb-system

# Or delete and recreate with larger range
kubectl delete ipaddresspool default-address-pool -n metallb-system
kubectl apply -f metallb-config.yaml
```

#### Problem 3: Wrong IP Range Error

```bash
# Error: ["192.168.1.100"] is not allowed in config
```

**Cause:** Service has `loadBalancerIP` that's not in the pool.

**Solution:**
```bash
# Edit service and remove loadBalancerIP field
kubectl edit svc nginx-loadbalancer

# Or update YAML and reapply
kubectl apply -f loadbalancer-service.yaml
```

#### Problem 4: Cannot Access External IP

```bash
# Check if pods are running
kubectl get pods -l app=nginx

# Check endpoints
kubectl get endpoints nginx-loadbalancer

# Test from within cluster
kubectl run test --image=busybox -it --rm -- wget -O- http://172.20.0.10

# Check node connectivity
ping 172.20.0.10
```

#### Problem 5: MetalLB Pods Not Running

```bash
# Check pod status
kubectl get pods -n metallb-system

# Check logs
kubectl logs -n metallb-system -l app=metallb

# Restart MetalLB
kubectl rollout restart deployment controller -n metallb-system
kubectl rollout restart daemonset speaker -n metallb-system
```

### Complete Working Example

Here's a complete, tested workflow:

```bash
# 1. Install MetalLB
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.10/config/manifests/metallb-native.yaml

# 2. Wait for pods
kubectl wait --namespace metallb-system \
  --for=condition=ready pod \
  --selector=app=metallb \
  --timeout=90s

# 3. Check your network
kubectl get nodes -o wide
# Note the INTERNAL-IP range (e.g., 172.20.0.x)

# 4. Create config (adjust IP range!)
cat <<EOF | kubectl apply -f -
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: default-address-pool
  namespace: metallb-system
spec:
  addresses:
    - 172.20.0.10-172.20.0.50
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: default
  namespace: metallb-system
spec:
  ipAddressPools:
    - default-address-pool
EOF

# 5. Create deployment (if not exists)
kubectl create deployment nginx --image=nginx --replicas=3

# 6. Expose as LoadBalancer
kubectl expose deployment nginx --type=LoadBalancer --port=80 --name=nginx-lb

# 7. Get external IP
kubectl get svc nginx-lb -w

# 8. Test (wait for EXTERNAL-IP to appear)
EXTERNAL_IP=$(kubectl get svc nginx-lb -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl http://$EXTERNAL_IP
```

### Environment-Specific Access Guide

| Environment | How to Access | Command |
|-------------|---------------|---------|
| **Cloud (EKS/GKE/AKS)** | Direct EXTERNAL-IP | `curl http://<EXTERNAL-IP>` |
| **Minikube** | Minikube tunnel | `minikube service <name>` |
| **Kind + MetalLB** | Host machine only | `curl http://172.20.0.10` |
| **Bare-metal + MetalLB** | LAN access | `curl http://192.168.1.200` |
| **Any + Port Forward** | Local machine | `kubectl port-forward svc/<name> 8080:80` |

### MetalLB Best Practices

✅ **Use Layer 2 mode** for simple setups (default)
✅ **Reserve IP ranges** outside DHCP scope
✅ **Document IP assignments** for your team
✅ **Use namespaced pools** for multi-tenant clusters
✅ **Monitor IP pool usage** regularly
✅ **Test connectivity** after configuration changes
✅ **Use annotations** for specific IP assignments
✅ **Keep MetalLB updated** to latest stable version
✅ **Backup configurations** before changes

### Uninstalling MetalLB

If you need to remove MetalLB:

```bash
# Delete configuration
kubectl delete ipaddresspool default-address-pool -n metallb-system
kubectl delete l2advertisement default -n metallb-system

# Uninstall MetalLB
kubectl delete -f https://raw.githubusercontent.com/metallb/metallb/v0.13.10/config/manifests/metallb-native.yaml

# Verify removal
kubectl get namespaces | grep metallb
```

## Example Service YAML

### 1. ClusterIP Service (Internal Access)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-learning-service
  labels:
    app: nginx
spec:
  type: ClusterIP
  selector:
    app: nginx  # Must match Pod labels
  ports:
    - protocol: TCP
      port: 80        # Service port
      targetPort: 80  # Container port
```

### 2. NodePort Service (External Access)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
  labels:
    app: nginx
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      nodePort: 30080  # Optional: Specify port (30000-32767)
```

### 3. LoadBalancer Service (Cloud Provider)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-loadbalancer
  labels:
    app: nginx
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  # Optional: Specify load balancer IP
  loadBalancerIP: 192.168.1.100
```

### 4. Multi-Port Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: multi-port-service
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 8080
    - name: https
      protocol: TCP
      port: 443
      targetPort: 8443
    - name: metrics
      protocol: TCP
      port: 9090
      targetPort: 9090
```

### 5. Headless Service (No Load Balancing)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: headless-service
spec:
  clusterIP: None  # Makes it headless
  selector:
    app: stateful-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

### 6. Service with Session Affinity

```yaml
apiVersion: v1
kind: Service
metadata:
  name: sticky-service
spec:
  type: ClusterIP
  selector:
    app: nginx
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 3600
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

### 7. ExternalName Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-database
spec:
  type: ExternalName
  externalName: database.example.com
```

### 8. Service with Named Target Ports

```yaml
apiVersion: v1
kind: Service
metadata:
  name: named-port-service
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
    - protocol: TCP
      port: 80
      targetPort: http  # References named port in Pod
```

## Additional Commands

### Service Lifecycle Management

```bash
# Delete a service
kubectl delete service <service-name>
kubectl delete svc <service-name>  # Short form

# Delete service using YAML file
kubectl delete -f service.yaml

# Delete all services in namespace
kubectl delete services --all

# Delete services with specific label
kubectl delete services -l app=nginx
```

### Service Information

```bash
# Get service YAML
kubectl get service <service-name> -o yaml

# Get service JSON
kubectl get service <service-name> -o json

# Get service endpoints
kubectl get endpoints <service-name>

# Get service events
kubectl get events --field-selector involvedObject.name=<service-name>

# Check which pods are backing the service
kubectl get pods -l app=<label-value>
```

### Editing Services

```bash
# Edit service interactively
kubectl edit service <service-name>

# Update service type
kubectl patch service <service-name> -p '{"spec":{"type":"NodePort"}}'

# Add labels
kubectl label service <service-name> environment=production

# Remove labels
kubectl label service <service-name> environment-
```

### Service Discovery

```bash
# Get cluster DNS information
kubectl get services -n kube-system kube-dns

# Test DNS resolution from a pod
kubectl run test --image=busybox -it --rm --restart=Never -- nslookup <service-name>

# Full DNS name format
<service-name>.<namespace>.svc.cluster.local
```

## Troubleshooting

### Common Service Issues

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| **Service not accessible** | Selector mismatch | Verify service selector matches Pod labels |
| **No endpoints** | No matching Pods running | Check Pod status and labels |
| **Connection timeout** | Wrong port configuration | Verify port and targetPort settings |
| **LoadBalancer pending** | Cloud provider issue | Check cloud provider configuration |
| **DNS not resolving** | CoreDNS issue | Check kube-dns/CoreDNS pods |

### Debug Commands

```bash
# Check service status
kubectl get service <service-name>

# Check endpoints
kubectl get endpoints <service-name>

# Verify selector matches pods
kubectl get pods -l app=<label> --show-labels

# Check service details
kubectl describe service <service-name>

# Test connectivity from within cluster
kubectl run test --image=busybox -it --rm --restart=Never -- wget -O- http://<service-name>

# Check service events
kubectl describe service <service-name> | grep Events -A 10

# Verify network policies
kubectl get networkpolicies
```

### Troubleshooting Steps

1. **Verify Service Exists**: `kubectl get service <service-name>`
2. **Check Endpoints**: `kubectl get endpoints <service-name>`
3. **Verify Pod Labels**: `kubectl get pods --show-labels`
4. **Check Selector**: `kubectl describe service <service-name> | grep Selector`
5. **Test DNS**: `kubectl run test --image=busybox -it --rm -- nslookup <service-name>`
6. **Check Firewall Rules**: Verify network policies and security groups
7. **Verify Port Configuration**: Ensure port and targetPort are correct

### Common Selector Issues

```bash
# Check service selector
kubectl get service <service-name> -o jsonpath='{.spec.selector}'

# Check pod labels
kubectl get pods -l app=<label> --show-labels

# If no match, update pod labels or service selector
kubectl label pod <pod-name> app=nginx
```

## Service Networking

### DNS Resolution

Services are automatically assigned DNS names:

```
# Format
<service-name>.<namespace>.svc.cluster.local

# Examples
my-service.default.svc.cluster.local
nginx-service.production.svc.cluster.local

# Short forms (within same namespace)
my-service
my-service.default
```

### Service IP Ranges

```bash
# Get service CIDR range
kubectl cluster-info dump | grep -m 1 service-cluster-ip-range

# View allocated service IPs
kubectl get services --all-namespaces -o wide
```

## Best Practices

✅ **Use meaningful service names** (lowercase, hyphens)
✅ **Always define selector** to match Pod labels
✅ **Use ClusterIP for internal services**
✅ **Use LoadBalancer for production external access**
✅ **Avoid NodePort in production** (use LoadBalancer or Ingress instead)
✅ **Name your ports** for better readability
✅ **Use session affinity when needed** (sticky sessions)
✅ **Implement health checks** in your Pods
✅ **Use namespaces** for environment separation
✅ **Document port mappings** in metadata annotations
✅ **Use Ingress** for HTTP/HTTPS routing instead of multiple LoadBalancers
✅ **Test service connectivity** before deploying to production

## Service vs Ingress

| Feature | Service | Ingress |
|---------|---------|---------|
| **Layer** | Layer 4 (TCP/UDP) | Layer 7 (HTTP/HTTPS) |
| **Cost** | One LoadBalancer per service | One LoadBalancer for multiple services |
| **Routing** | Port-based | Path/host-based routing |
| **SSL/TLS** | Limited support | Native SSL/TLS termination |
| **Use Case** | Single service exposure | Multiple HTTP services |

## Quick Reference

```bash
# Create
kubectl apply -f service.yaml
kubectl expose deployment <name> --port=80

# View
kubectl get services
kubectl get svc <name>
kubectl describe svc <name>
kubectl get endpoints <name>

# Test
kubectl port-forward svc/<name> 8080:80
kubectl run test --image=busybox -it --rm -- wget -O- http://<service-name>

# Edit
kubectl edit service <name>
kubectl patch svc <name> -p '{"spec":{"type":"NodePort"}}'

# Delete
kubectl delete service <name>
kubectl delete svc <name>

# Debug
kubectl get endpoints <name>
kubectl get pods -l app=<label>
```

## Service YAML Validation

```bash
# Validate YAML syntax
kubectl apply -f service.yaml --dry-run=client

# Validate and show what would be created
kubectl apply -f service.yaml --dry-run=server

# Diff before applying
kubectl diff -f service.yaml
```

## Resources

- [Official Kubernetes Services Documentation](https://kubernetes.io/docs/concepts/services-networking/service/)
- [Service Networking](https://kubernetes.io/docs/concepts/services-networking/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [DNS for Services](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
- [Ingress Documentation](https://kubernetes.io/docs/concepts/services-networking/ingress/)

---

**Note**: Replace `<service-name>`, `<namespace>`, `<label>`, and `<filename>` with your actual names and values.

**Your Service Configuration Analysis**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-learning-service
spec:
  type: ClusterIP          # Internal cluster access only
  selector:
    app: nginx             # Connects to Pods with label app=nginx
  ports:
    - protocol: TCP
      port: 80             # Service accessible on port 80
      targetPort: 80       # Forwards to container port 80
```

✅ This is a properly configured ClusterIP service for internal communication!