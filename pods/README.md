# Kubernetes Pod Management Guide

A comprehensive guide for creating and managing Kubernetes Pods using `kubectl` commands.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Creating a Pod](#creating-a-pod)
- [Viewing Pods](#viewing-pods)
- [Checking Pod Logs](#checking-pod-logs)
- [Describing Pods](#describing-pods)
- [Example Pod YAML](#example-pod-yaml)
- [Additional Commands](#additional-commands)
- [Troubleshooting](#troubleshooting)

## Overview

Pods are the smallest deployable units in Kubernetes that can be created and managed. A Pod represents a single instance of a running process in your cluster and can contain one or more containers.

## Prerequisites

- Kubernetes cluster (local or remote)
- `kubectl` CLI tool installed and configured
- Basic understanding of YAML syntax

## Creating a Pod

To create a pod from a YAML configuration file:

```bash
kubectl apply -f pod.yaml
```

This command applies the configuration defined in your `pod.yaml` file to create the pod in your Kubernetes cluster.

### Alternative Creation Methods

```bash
# Create from a file
kubectl create -f pod.yaml

# Create a pod imperatively (without YAML)
kubectl run nginx-pod --image=nginx --port=80
```

## Viewing Pods

To list all pods in the current namespace:

```bash
kubectl get pods
```

### Additional View Options

```bash
# View pods across all namespaces
kubectl get pods --all-namespaces

# View pods with additional details (node, IP)
kubectl get pods -o wide

# Watch pods in real-time
kubectl get pods -w

# View pods with labels
kubectl get pods --show-labels

# Filter pods by label
kubectl get pods -l app=nginx
```

## Checking Pod Logs

To view logs from a specific pod:

```bash
kubectl logs <pod-name>
```

### Log Options

```bash
# Follow logs in real-time
kubectl logs -f <pod-name>

# View logs from a specific container in a multi-container pod
kubectl logs <pod-name> -c <container-name>

# View previous container logs (if restarted)
kubectl logs <pod-name> --previous

# View last 100 lines
kubectl logs <pod-name> --tail=100

# View logs with timestamps
kubectl logs <pod-name> --timestamps
```

## Describing Pods

To get detailed information about a specific pod:

```bash
kubectl describe pod <pod-name>
```

This command provides comprehensive information including:
- Pod status and conditions
- Container information
- Events and troubleshooting details
- Resource usage and limits
- Network configuration
- Volume mounts

## Example Pod YAML

Here's a basic example of a `pod.yaml` file:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
    environment: production
spec:
  containers:
  - name: nginx
    image: nginx:latest
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

### Multi-Container Pod Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-pod
spec:
  containers:
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80
  - name: sidecar
    image: busybox
    command: ['sh', '-c', 'while true; do echo "Sidecar running"; sleep 30; done']
```

## Additional Commands

### Pod Lifecycle Management

```bash
# Delete a pod by name
kubectl delete pod <pod-name>

# Delete a pod using the YAML file
kubectl delete -f pod.yaml

# Force delete a pod
kubectl delete pod <pod-name> --grace-period=0 --force

# Delete all pods in current namespace
kubectl delete pods --all
```

### Pod Interaction

```bash
# Execute a command in a running pod
kubectl exec <pod-name> -- ls /app

# Get an interactive shell in a pod
kubectl exec -it <pod-name> -- /bin/bash

# Execute command in specific container
kubectl exec <pod-name> -c <container-name> -- ls

# Copy files to/from a pod
kubectl cp <pod-name>:/path/to/file ./local-file
kubectl cp ./local-file <pod-name>:/path/to/file
```

### Pod Information

```bash
# Get pod YAML configuration
kubectl get pod <pod-name> -o yaml

# Get pod JSON configuration
kubectl get pod <pod-name> -o json

# Get pod resource usage
kubectl top pod <pod-name>

# Get pod events
kubectl get events --field-selector involvedObject.name=<pod-name>
```

## Troubleshooting

### Common Pod States and Issues

| Status | Description | Solution |
|--------|-------------|----------|
| **Pending** | Pod cannot be scheduled | Check events with `kubectl describe pod` |
| **CrashLoopBackOff** | Container keeps crashing | Review logs with `kubectl logs` |
| **ImagePullBackOff** | Cannot pull container image | Verify image name and registry access |
| **Error** | Pod terminated with error | Check logs and describe pod |
| **Evicted** | Pod evicted due to resource constraints | Check node resources |

### Debug Commands

```bash
# Check pod events
kubectl describe pod <pod-name> | grep -A 10 Events

# Check node resources
kubectl describe node <node-name>

# Check if image exists
kubectl describe pod <pod-name> | grep Image

# View all pod statuses
kubectl get pods --all-namespaces -o wide
```

### Common Troubleshooting Steps

1. **Check Pod Status**: `kubectl get pods`
2. **View Detailed Information**: `kubectl describe pod <pod-name>`
3. **Check Logs**: `kubectl logs <pod-name>`
4. **Verify YAML Syntax**: `kubectl apply -f pod.yaml --dry-run=client`
5. **Check Resource Availability**: `kubectl describe nodes`

## Best Practices

- Always specify resource requests and limits
- Use meaningful labels for organization
- Implement health checks (liveness and readiness probes)
- Use specific image tags instead of `latest`
- Store sensitive data in Secrets, not in Pod definitions
- Use namespaces to organize pods

## Resources

- [Official Kubernetes Pods Documentation](https://kubernetes.io/docs/concepts/workloads/pods/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)

---

**Note**: Replace `<pod-name>`, `<container-name>`, and `<filename>` with your actual pod names, container names, and file names.