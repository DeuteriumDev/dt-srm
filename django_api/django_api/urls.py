from kits import views as kit_views
from accounts import views as account_views
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from oauth2_provider import urls as oauth2_urls

# from organizations.backends import invitation_backend

"""
URL configuration for django_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
router = DefaultRouter()
# kits
router.register(r"kits", kit_views.KitViewSet, basename="kit")
router.register(r"questions", kit_views.QuestionViewSet, basename="question")
router.register(r"answers", kit_views.AnswerViewSet, basename="answer")
router.register(r"folders", kit_views.FolderViewSet, basename="folder")

# accounts
router.register(r"users", account_views.CustomUserViewSet, basename="user")
router.register(
    r"organizations", account_views.OrganizationViewSet, basename="organization"
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("oauth/", include(oauth2_urls)),
    path("api/v1/", include(router.urls)),
    path("api/v1/documents/", kit_views.documents_list),
]
