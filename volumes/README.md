# Kubernetes Volumes - Complete Guide

## Table of Contents
- [Introduction](#introduction)
- [emptyDir Volume](#emptydir-volume)
- [Direct Volume (hostPath)](#direct-volume-hostpath)
- [Persistent Volume (PV)](#persistent-volume-pv)
- [Persistent Volume Claim (PVC)](#persistent-volume-claim-pvc)
- [Access Modes](#access-modes)
- [Static vs Dynamic Provisioning](#static-vs-dynamic-provisioning)
- [Reclaim Policy](#reclaim-policy)
- [Storage Class](#storage-class)
- [Best Practices](#best-practices)

---

## Introduction

Kubernetes volumes provide persistent storage for containers. Unlike container filesystems that are ephemeral, volumes persist data beyond the container lifecycle.

---

## emptyDir Volume

An `emptyDir` volume is created when a Pod is assigned to a node and exists as long as the Pod runs on that node. It starts empty and is deleted when the Pod is removed.

### Use Cases
- Temporary scratch space
- Sharing data between containers in the same Pod
- Caching intermediate data

### Example
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: emptydir-pod
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: cache-volume
      mountPath: /cache
  volumes:
  - name: cache-volume
    emptyDir: {}
```

### Key Points
- ✅ Shared between containers in same Pod
- ✅ Temporary storage
- ❌ Data lost when Pod is deleted
- ❌ Not suitable for persistent data

---

## Direct Volume (hostPath)

A `hostPath` volume mounts a file or directory from the host node's filesystem into the Pod.

### Use Cases
- Accessing Docker internals (use with caution)
- Running cAdvisor in a container
- Testing and development

### Example
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hostpath-pod
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: host-volume
      mountPath: /data
  volumes:
  - name: host-volume
    hostPath:
      path: /mnt/data
      type: DirectoryOrCreate
```

### ⚠️ Security Warning
- Provides access to host filesystem
- Pod tied to specific node
- Not recommended for production workloads
- Can pose security risks

---

## Persistent Volume (PV)

A Persistent Volume is a piece of storage in the cluster provisioned by an administrator or dynamically using Storage Classes.

### PV Lifecycle
1. **Provisioning** - Static or Dynamic
2. **Binding** - PVC binds to PV
3. **Using** - Pod uses PVC
4. **Reclaiming** - What happens after PVC deletion

### Example
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: standard
  hostPath:
    path: /mnt/data
```

### Key Characteristics
- Cluster-level resource
- Independent lifecycle from Pods
- Can be provisioned statically or dynamically
- Supports various storage backends (NFS, iSCSI, Cloud Storage, etc.)

---

## Persistent Volume Claim (PVC)

A PVC is a request for storage by a user. It's similar to a Pod requesting CPU and memory resources.

### Example
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard
```

### Using PVC in Pod
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pvc-pod
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: persistent-storage
      mountPath: /data
  volumes:
  - name: persistent-storage
    persistentVolumeClaim:
      claimName: my-pvc
```

### Key Points
- Namespace-scoped resource
- Requests specific storage size and access mode
- Automatically binds to matching PV
- Can be reused by multiple Pods (depending on access mode)

---

## Access Modes

Access modes define how a volume can be mounted by nodes.

| Mode | CLI | Description | Use Case |
|------|-----|-------------|----------|
| **ReadWriteOnce** | RWO | Volume mounted as read-write by single node | Single instance databases |
| **ReadOnlyMany** | ROX | Volume mounted as read-only by many nodes | Shared configuration files |
| **ReadWriteMany** | RWX | Volume mounted as read-write by many nodes | Shared application data |
| **ReadWriteOncePod** | RWOP | Volume mounted as read-write by single Pod | Exclusive Pod access |

### Important Notes
- Not all storage types support all access modes
- RWX requires network-attached storage (NFS, CephFS, etc.)
- Cloud provider block storage typically supports only RWO

### Example with Different Access Modes
```yaml
# RWO - Single node
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: database-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
---
# RWX - Multiple nodes
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: shared-data-pvc
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 50Gi
  storageClassName: nfs-storage
```

---

## Static vs Dynamic Provisioning

### Static Provisioning

Administrator manually creates PVs before users create PVCs.

**Workflow:**
```
Admin creates PV → User creates PVC → Kubernetes binds PVC to PV
```

**Example:**
```yaml
# Admin creates PV
apiVersion: v1
kind: PersistentVolume
metadata:
  name: static-pv
spec:
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  nfs:
    server: nfs-server.example.com
    path: /exports/data
```

**Pros:**
- ✅ Full control over storage
- ✅ Predictable costs
- ✅ Specific storage configuration

**Cons:**
- ❌ Manual provisioning overhead
- ❌ Not scalable
- ❌ Requires admin intervention

### Dynamic Provisioning

Storage is automatically provisioned when users create PVCs using Storage Classes.

**Workflow:**
```
User creates PVC with StorageClass → Kubernetes automatically provisions PV → Binds PVC to PV
```

**Example:**
```yaml
# PVC with dynamic provisioning
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: dynamic-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 50Gi
```

**Pros:**
- ✅ Automatic provisioning
- ✅ Scalable
- ✅ On-demand storage
- ✅ No admin bottleneck

**Cons:**
- ❌ Less control over specific storage
- ❌ Potential cost overruns

---

## Reclaim Policy

Defines what happens to a PV after its PVC is deleted.

### Retain (Default for manually created PVs)

PV is not deleted when PVC is removed. Data remains intact for manual recovery.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-retain
spec:
  persistentVolumeReclaimPolicy: Retain
  # ... other specs
```

**Behavior:**
- PV status becomes "Released"
- Data preserved
- Manual cleanup required
- PV cannot be reused until manually reclaimed

**Use Case:** Production databases, critical data

### Delete (Default for dynamically provisioned PVs)

PV and underlying storage are automatically deleted when PVC is removed.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-delete
spec:
  persistentVolumeReclaimPolicy: Delete
  # ... other specs
```

**Behavior:**
- PV deleted automatically
- Underlying storage deleted
- Data permanently lost

**Use Case:** Temporary data, development environments

### Recycle (Deprecated)

Performs basic scrub (`rm -rf /volume/*`) on the volume, making it available again.

**Status:** Deprecated - use dynamic provisioning with Delete policy instead

### Comparison Table

| Policy | Data After PVC Delete | PV Status | Use Case |
|--------|----------------------|-----------|----------|
| **Retain** | Preserved | Released | Production, critical data |
| **Delete** | Deleted | Deleted | Dev/test, temporary data |
| **Recycle** | Deleted | Available | Deprecated |

---

## Storage Class

StorageClass provides a way to describe different "classes" of storage with different performance characteristics, backup policies, or arbitrary policies.

### Key Features
- Enables dynamic provisioning
- Abstracts storage details from users
- Allows different storage tiers (fast SSD, standard HDD, etc.)
- Cloud provider-specific

### Basic Example
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
  fsType: ext4
reclaimPolicy: Delete
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
```

### Common Provisioners

| Provisioner | Description |
|-------------|-------------|
| `kubernetes.io/aws-ebs` | AWS Elastic Block Store |
| `kubernetes.io/gce-pd` | Google Compute Engine Persistent Disk |
| `kubernetes.io/azure-disk` | Azure Disk |
| `kubernetes.io/cinder` | OpenStack Cinder |
| `kubernetes.io/nfs` | NFS |
| `kubernetes.io/csi-*` | Container Storage Interface drivers |

### AWS EBS Example
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: io1
  iopsPerGB: "50"
  fsType: ext4
  encrypted: "true"
reclaimPolicy: Delete
allowVolumeExpansion: true
```

### GCP PD Example
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ssd-storage
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-ssd
  replication-type: regional-pd
reclaimPolicy: Retain
volumeBindingMode: Immediate
```

### Volume Binding Modes

**Immediate:**
- PV created immediately when PVC is created
- May result in PV being created in wrong zone

**WaitForFirstConsumer:**
- PV creation delayed until Pod using PVC is created
- Ensures PV is created in correct zone for Pod
- Recommended for most use cases

### Storage Class Parameters

Parameters vary by provisioner. Common examples:

```yaml
# NFS Storage Class
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: nfs
provisioner: example.com/nfs
parameters:
  server: nfs-server.example.com
  path: /exports
  readOnly: "false"
---
# Local Storage Class
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
```

### Default Storage Class

Mark a StorageClass as default:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: kubernetes.io/aws-ebs
```

PVCs without a `storageClassName` will use the default StorageClass.

---

## Best Practices

### Security
- ⚠️ Avoid `hostPath` in production
- 🔒 Use appropriate access modes
- 🔐 Enable encryption for sensitive data
- 👤 Use RBAC to control PVC access

### Performance
- 🚀 Choose appropriate storage class for workload
- 📊 Use SSD for databases and I/O intensive apps
- 💾 Use HDD for archival and backup data
- ⚡ Consider volume binding mode for multi-zone clusters

### Cost Optimization
- 💰 Use dynamic provisioning with Delete policy for dev/test
- 📦 Right-size storage requests
- 🗑️ Clean up unused PVCs regularly
- 📈 Monitor storage usage

### Reliability
- 🔄 Use Retain policy for production databases
- 💾 Implement regular backups
- 🌍 Use regional replication for critical data
- 📝 Document reclaim policies clearly

### Operations
- 🏷️ Use meaningful names and labels
- 📋 Document storage requirements
- 🔍 Monitor PV/PVC status
- 🧹 Implement PVC cleanup procedures

---

## Quick Reference Commands

```bash
# List PVs
kubectl get pv

# List PVCs
kubectl get pvc

# List Storage Classes
kubectl get sc

# Describe PV
kubectl describe pv <pv-name>

# Describe PVC
kubectl describe pvc <pvc-name>

# Delete PVC
kubectl delete pvc <pvc-name>

# Watch PVC status
kubectl get pvc -w

# Get PVC in all namespaces
kubectl get pvc --all-namespaces
```

---

## Troubleshooting

### PVC Stuck in Pending
- Check if matching PV exists (static provisioning)
- Verify StorageClass exists and is correct
- Check provisioner logs (dynamic provisioning)
- Ensure requested size is available

### PVC Cannot Bind to PV
- Verify access modes match
- Check storage size (PV must be >= PVC request)
- Ensure StorageClass names match
- Check volume selectors and labels

### Pod Cannot Mount Volume
- Verify PVC is bound
- Check node has required volume plugin
- Ensure access mode allows Pod's node to mount
- Review node and kubelet logs

---

## Summary

| Feature | Description | When to Use |
|---------|-------------|-------------|
| **emptyDir** | Temporary Pod storage | Scratch space, caching |
| **hostPath** | Direct host filesystem | Testing, special cases |
| **PV/PVC** | Persistent storage abstraction | Production workloads |
| **StorageClass** | Dynamic provisioning template | Scalable environments |
| **Static** | Admin pre-provisions PVs | Controlled environments |
| **Dynamic** | Automatic provisioning | Self-service environments |
| **Retain** | Keep data after PVC delete | Production data |
| **Delete** | Auto-delete with PVC | Temporary data |

---

**Created for Kubernetes Storage Management**
*Last Updated: November 2025*