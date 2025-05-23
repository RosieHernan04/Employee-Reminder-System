rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isEmployee() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'employee';
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (isAdmin() || isOwner(userId));
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && isOwner(userId);
    }

    // Tasks collection (employee tasks)
    match /tasks/{taskId} {
      allow read: if isAuthenticated() && (isAdmin() || isEmployee());
      allow create: if isAuthenticated() && isAdmin();
      allow update: if isAuthenticated() && (
        isAdmin() || 
        (isEmployee() && resource.data.assignedTo == request.auth.uid)
      );
      allow delete: if isAuthenticated() && isAdmin();
    }

    // Admin tasks collection
    match /admin_tasks/{taskId} {
      allow read, write: if isAuthenticated() && isAdmin();
    }

    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && (
        isAdmin() || 
        resource.data.userId == request.auth.uid
      );
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (
        isAdmin() || 
        resource.data.userId == request.auth.uid
      );
    }

    // Notification settings collection
    match /notificationSettings/{settingId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isAdmin();
    }
  }
}