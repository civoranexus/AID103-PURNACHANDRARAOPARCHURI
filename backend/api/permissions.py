# Custom Permissions for CropGuard AI
# File: api/permissions.py

from rest_framework import permissions
from django.contrib.auth.models import User


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object.
        return obj.user == request.user


class IsFarmer(permissions.BasePermission):
    """
    Permission to check if user is a farmer (has a profile).
    """

    def has_permission(self, request, view):
        # Allow any user to check if they're authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has a UserProfile
        from .models import UserProfile
        return hasattr(request.user, 'profile')


class CanManageFarm(permissions.BasePermission):
    """
    Permission to manage a specific farm.
    Only the farm owner can manage it.
    """

    def has_object_permission(self, request, view, obj):
        # Check if user owns the farm
        return obj.user == request.user


class CanAccessFarmData(permissions.BasePermission):
    """
    Permission to access farm data.
    Users can only access their own farm data.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Check if the user owns the farm
        return obj.farm.user == request.user or request.user.is_staff


class CanCreateFarm(permissions.BasePermission):
    """
    Permission to create a new farm.
    Only authenticated farmers can create farms.
    """

    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and
            hasattr(request.user, 'profile')
        )


class CanViewAnalytics(permissions.BasePermission):
    """
    Permission to view farm analytics.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # User can only view their own farm's analytics
        return obj.farm.user == request.user or request.user.is_staff


class CanManageAlerts(permissions.BasePermission):
    """
    Permission to manage alerts.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # User can manage alerts for their own farms
        return obj.user == request.user or request.user.is_staff


class IsAdminOrOwner(permissions.BasePermission):
    """
    Permission to allow admin or object owner to access.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user or request.user.is_staff or request.user.is_superuser


class ReadOnly(permissions.BasePermission):
    """
    Allow any access to safe methods, but deny all other access.
    """

    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS


class IsAuthenticatedAndOwner(permissions.BasePermission):
    """
    Allows access only to authenticated users who own the object.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class CanUploadPhotos(permissions.BasePermission):
    """
    Permission to upload crop photos for disease detection.
    """

    def has_permission(self, request, view):
        # Only authenticated farmers can upload
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile')
        )

    def has_object_permission(self, request, view, obj):
        # User can only upload to their own farm
        return obj.farm.user == request.user


class CanReportDisease(permissions.BasePermission):
    """
    Permission to report crop diseases.
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile')
        )

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class CanReportPest(permissions.BasePermission):
    """
    Permission to report pest infestations.
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile')
        )

    def has_object_permission(self, request, view, obj):
        return obj.farm.user == request.user


class CanManageIrrigation(permissions.BasePermission):
    """
    Permission to manage irrigation schedules.
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile')
        )

    def has_object_permission(self, request, view, obj):
        return obj.farm.user == request.user


class CanAccessMarketPrices(permissions.BasePermission):
    """
    Permission to access market price data.
    All authenticated users can view, but only admin can edit.
    """

    def has_permission(self, request, view):
        # Allow all authenticated users to view
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        # Only admin can edit
        return request.user and request.user.is_staff


class CanAccessRecommendations(permissions.BasePermission):
    """
    Permission to access farming recommendations.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Users can view recommendations for their farms
        return obj.farm.user == request.user


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Allow staff to edit, all users to read.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class RoleBasedPermission(permissions.BasePermission):
    """
    Role-based access control (RBAC) for different user types.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Get user role
        user_role = self.get_user_role(request.user)

        # Define role-based permissions
        permissions_map = {
            'admin': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            'farmer': ['GET', 'POST', 'PUT', 'PATCH'],
            'consultant': ['GET', 'POST'],
            'guest': ['GET']
        }

        allowed_methods = permissions_map.get(user_role, [])
        return request.method in allowed_methods

    def get_user_role(self, user):
        """Determine user role based on permissions and groups."""
        if user.is_superuser:
            return 'admin'
        elif user.is_staff:
            return 'consultant'
        elif hasattr(user, 'profile'):
            return 'farmer'
        else:
            return 'guest'

    def has_object_permission(self, request, view, obj):
        user_role = self.get_user_role(request.user)

        if user_role == 'admin':
            return True
        elif user_role == 'farmer':
            # Farmer can access their own data
            if hasattr(obj, 'user'):
                return obj.user == request.user
            elif hasattr(obj, 'farm'):
                return obj.farm.user == request.user
        elif user_role == 'consultant':
            # Consultant can view all data
            return request.method in permissions.SAFE_METHODS
        
        return False


class CanBulkManage(permissions.BasePermission):
    """
    Permission for bulk operations on resources.
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or hasattr(request.user, 'profile'))
        )


class APITokenPermission(permissions.BasePermission):
    """
    Check if request includes valid API token for external integrations.
    """

    def has_permission(self, request, view):
        # If user is authenticated, allow
        if request.user and request.user.is_authenticated:
            return True

        # Check for API token in header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
            # TODO: Validate token against API tokens table
            return self.validate_token(token)

        return False

    def validate_token(self, token):
        """Validate API token."""
        # TODO: Implement token validation
        return False
