/**
 * CropGuard AI - Cloud Storage Manager
 * Manages file uploads, downloads, and storage for AWS S3 and Azure Blob Storage
 * Version: 1.0
 */

class StorageManager {
  /**
   * Initialize Storage Manager with cloud configuration
   */
  constructor(config = {}) {
    this.config = {
      provider: config.provider || 'aws', // 'aws' or 'azure'
      bucketName: config.bucketName || 'cropguard-storage',
      region: config.region || 'us-east-1',
      accessKey: config.accessKey || localStorage.getItem('storage-access-key'),
      secretKey: config.secretKey || localStorage.getItem('storage-secret-key'),
      maxFileSize: config.maxFileSize || 50 * 1024 * 1024, // 50MB default
      uploadTimeout: config.uploadTimeout || 300000, // 5 minutes
      enableEncryption: config.enableEncryption || true,
      enableVersioning: config.enableVersioning || true,
      ...config
    };

    this.uploadQueue = [];
    this.uploadProgress = new Map();
    this.uploadListeners = [];
    this.isOnline = navigator.onLine;
    
    this.initializeStorage();
  }

  /**
   * Initialize storage and check online status
   */
  initializeStorage() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineUploads();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Upload file to cloud storage
   * @param {File} file - File to upload
   * @param {string} directory - Storage directory
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Upload result with file info
   */
  async uploadFile(file, directory = 'uploads', metadata = {}) {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.config.maxFileSize / 1024 / 1024}MB`);
    }

    const uploadId = this.generateUploadId();
    const fileKey = `${directory}/${Date.now()}-${file.name}`;
    
    try {
      // Create upload record
      const uploadRecord = {
        id: uploadId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        directory: directory,
        key: fileKey,
        status: 'uploading',
        progress: 0,
        startTime: Date.now(),
        metadata: metadata,
        retries: 0,
        maxRetries: 3
      };

      this.uploadProgress.set(uploadId, uploadRecord);
      this.notifyListeners('upload-started', uploadRecord);

      let uploadUrl;

      if (this.config.provider === 'aws') {
        uploadUrl = await this.generateS3SignedUrl(fileKey, file.type);
      } else if (this.config.provider === 'azure') {
        uploadUrl = await this.generateAzureSasUrl(fileKey, file.type);
      } else {
        throw new Error('Unsupported storage provider');
      }

      // Upload file
      await this.performUpload(file, uploadUrl, uploadId, fileKey);

      // Store file metadata
      await this.storeFileMetadata({
        ...uploadRecord,
        status: 'completed',
        completedTime: Date.now(),
        url: this.getFileUrl(fileKey)
      });

      uploadRecord.status = 'completed';
      this.notifyListeners('upload-completed', uploadRecord);

      return {
        success: true,
        uploadId: uploadId,
        fileKey: fileKey,
        fileName: file.name,
        fileSize: file.size,
        url: this.getFileUrl(fileKey),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Upload error:', error);
      
      const uploadRecord = this.uploadProgress.get(uploadId);
      if (uploadRecord) {
        uploadRecord.status = 'failed';
        uploadRecord.error = error.message;
        
        if (uploadRecord.retries < uploadRecord.maxRetries && !this.isOnline) {
          uploadRecord.status = 'queued';
          this.uploadQueue.push(uploadRecord);
          this.notifyListeners('upload-queued', uploadRecord);
        } else {
          this.notifyListeners('upload-failed', uploadRecord);
        }
      }

      throw error;
    }
  }

  /**
   * Perform the actual file upload
   */
  async performUpload(file, uploadUrl, uploadId, fileKey) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const uploadRecord = this.uploadProgress.get(uploadId);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          uploadRecord.progress = percentComplete;
          this.notifyListeners('upload-progress', uploadRecord);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.timeout = this.config.uploadTimeout;
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);

      // Add encryption headers if enabled
      if (this.config.enableEncryption) {
        xhr.setRequestHeader('x-amz-server-side-encryption', 'AES256');
      }

      // Add metadata headers
      xhr.setRequestHeader('x-amz-meta-filename', file.name);
      xhr.setRequestHeader('x-amz-meta-uploadtime', new Date().toISOString());

      xhr.send(file);
    });
  }

  /**
   * Generate AWS S3 signed URL
   */
  async generateS3SignedUrl(fileKey, contentType) {
    // In production, call backend API to generate signed URL
    // This is a simulated endpoint
    try {
      const response = await fetch('/api/storage/generate-s3-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey: fileKey,
          contentType: contentType,
          expiresIn: 3600
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate S3 signed URL');
      }

      const data = await response.json();
      return data.signedUrl;

    } catch (error) {
      // Fallback: use direct upload simulation
      return `https://cropguard-storage.s3.amazonaws.com/${fileKey}`;
    }
  }

  /**
   * Generate Azure Blob Storage SAS URL
   */
  async generateAzureSasUrl(fileKey, contentType) {
    try {
      const response = await fetch('/api/storage/generate-azure-sas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blobName: fileKey,
          contentType: contentType,
          expiresIn: 3600
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate Azure SAS URL');
      }

      const data = await response.json();
      return data.sasUrl;

    } catch (error) {
      // Fallback
      return `https://cropguardstorage.blob.core.windows.net/${fileKey}`;
    }
  }

  /**
   * Download file from storage
   */
  async downloadFile(fileKey, fileName) {
    try {
      const fileUrl = this.getFileUrl(fileKey);

      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName || fileKey.split('/').pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      return {
        success: true,
        fileName: a.download,
        size: blob.size,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileKey) {
    try {
      const response = await fetch('/api/storage/delete-file', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey: fileKey,
          provider: this.config.provider
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      return {
        success: true,
        fileKey: fileKey,
        deletedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  /**
   * List files in directory
   */
  async listFiles(directory = '', options = {}) {
    try {
      const response = await fetch('/api/storage/list-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          directory: directory,
          provider: this.config.provider,
          limit: options.limit || 100,
          continuationToken: options.continuationToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to list files');
      }

      const data = await response.json();
      return {
        files: data.files.map(f => ({
          ...f,
          url: this.getFileUrl(f.key)
        })),
        continuationToken: data.continuationToken,
        totalCount: data.totalCount
      };

    } catch (error) {
      console.error('List files error:', error);
      return { files: [], totalCount: 0 };
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileKey) {
    try {
      const response = await fetch('/api/storage/file-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey: fileKey,
          provider: this.config.provider
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get file metadata');
      }

      return await response.json();

    } catch (error) {
      console.error('Metadata error:', error);
      return null;
    }
  }

  /**
   * Store file metadata in local database
   */
  async storeFileMetadata(metadata) {
    const storageKey = 'cropguard-files';
    const files = JSON.parse(localStorage.getItem(storageKey) || '[]');
    files.push({
      ...metadata,
      storedAt: new Date().toISOString()
    });

    // Keep only last 100 files in metadata
    if (files.length > 100) {
      files.shift();
    }

    localStorage.setItem(storageKey, JSON.stringify(files));
  }

  /**
   * Get stored files metadata
   */
  getStoredFilesMetadata() {
    const storageKey = 'cropguard-files';
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  }

  /**
   * Sync offline uploads when back online
   */
  async syncOfflineUploads() {
    if (this.uploadQueue.length === 0) return;

    console.log(`Syncing ${this.uploadQueue.length} queued uploads...`);

    for (const uploadRecord of this.uploadQueue) {
      try {
        // Retry upload
        uploadRecord.status = 'uploading';
        this.notifyListeners('upload-resumed', uploadRecord);

        // Re-upload logic here
        this.uploadQueue = this.uploadQueue.filter(u => u.id !== uploadRecord.id);

      } catch (error) {
        console.error('Sync error:', error);
      }
    }
  }

  /**
   * Get download URL for file
   */
  getFileUrl(fileKey) {
    if (this.config.provider === 'aws') {
      return `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${fileKey}`;
    } else if (this.config.provider === 'azure') {
      return `https://${this.config.bucketName}.blob.core.windows.net/${fileKey}`;
    }
    return fileKey;
  }

  /**
   * Get upload progress for file
   */
  getUploadProgress(uploadId) {
    return this.uploadProgress.get(uploadId) || null;
  }

  /**
   * Get all active uploads
   */
  getActiveUploads() {
    const uploads = Array.from(this.uploadProgress.values());
    return uploads.filter(u => u.status === 'uploading');
  }

  /**
   * Get queued uploads (offline)
   */
  getQueuedUploads() {
    return this.uploadQueue;
  }

  /**
   * Calculate storage usage
   */
  async getStorageUsage() {
    try {
      const response = await fetch('/api/storage/usage', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get storage usage');
      }

      return await response.json();

    } catch (error) {
      console.error('Storage usage error:', error);
      return { used: 0, limit: 0, percentage: 0 };
    }
  }

  /**
   * Register upload event listener
   */
  onUploadEvent(callback) {
    this.uploadListeners.push(callback);
  }

  /**
   * Remove upload event listener
   */
  offUploadEvent(callback) {
    this.uploadListeners = this.uploadListeners.filter(l => l !== callback);
  }

  /**
   * Notify all listeners of upload event
   */
  notifyListeners(eventType, data) {
    this.uploadListeners.forEach(listener => {
      try {
        listener({ type: eventType, data: data });
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  /**
   * Generate unique upload ID
   */
  generateUploadId() {
    return `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all metadata
   */
  clearMetadata() {
    localStorage.removeItem('cropguard-files');
    this.uploadProgress.clear();
    this.uploadQueue = [];
  }

  /**
   * Get storage statistics
   */
  getStatistics() {
    const files = this.getStoredFilesMetadata();
    const totalSize = files.reduce((sum, f) => sum + (f.fileSize || 0), 0);

    return {
      totalFiles: files.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      activeUploads: this.getActiveUploads().length,
      queuedUploads: this.uploadQueue.length,
      failedUploads: files.filter(f => f.status === 'failed').length,
      completedUploads: files.filter(f => f.status === 'completed').length,
      averageFileSize: files.length > 0 ? (totalSize / files.length / 1024).toFixed(2) + ' KB' : '0 KB'
    };
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}

// Initialize global instance for cloud storage
const storageManager = new StorageManager({
  provider: localStorage.getItem('storage-provider') || 'aws',
  bucketName: localStorage.getItem('storage-bucket') || 'cropguard-storage',
  region: localStorage.getItem('storage-region') || 'us-east-1'
});
