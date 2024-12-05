from kits import views
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
router.register(r"kits", views.KitViewSet, basename="kit")
router.register(r"questions", views.QuestionViewSet, basename="question")
router.register(r"answers", views.AnswerViewSet, basename="answer")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("oauth/", include(oauth2_urls)),
    path("", include(router.urls)),
]
