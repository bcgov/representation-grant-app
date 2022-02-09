"""
Definition of urls for the application.
"""
import os
from oidc_rp.models import OIDCUser
from django.contrib import admin
from django.conf.urls import include
from django.urls import path
from django.views.generic import RedirectView
from . import views

urlpatterns = [
    path("", RedirectView.as_view(url="api/v1/user-info/"), name=""),
    path("health/", views.health),
    path("api/v1/logout/", views.logout),
    path("admin/", admin.site.urls),
]

# this has to be done here unfortunately, due to load order.
# admin.site.unregister(OIDCUser)

if os.getenv("DJANGO_SETTINGS_MODULE") == "api.settings":
    urlpatterns.append(path("api/v1/", include("api.urls")))
