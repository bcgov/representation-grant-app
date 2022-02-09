import logging
import urllib
import requests

from rest_framework.request import Request
from django.conf import settings
from django.urls.exceptions import NoReverseMatch

from rest_framework.reverse import reverse

from oidc_rp.models import OIDCUser

LOGGER = logging.getLogger(__name__)


def get_login_uri(request: Request = None, next: str = None) -> str:
    uri = None
    if request:
        query_dictionary = {"next": next, "kc_idp_hint": settings.OIDC_RP_KC_IDP_HINT}
        query_dictionary = {k: v for k, v in query_dictionary.items() if v is not None}
        try:
            uri = "{base_url}?{querystring}".format(
                base_url=reverse("oidc_auth_request", request=request),
                querystring=urllib.parse.urlencode(query_dictionary),
            )
        except NoReverseMatch:
            pass
    return uri


def get_logout_uri(request: Request = None) -> str:
    uri = None
    if request:
        try:
            uri = (
                settings.SITEMINDER_LOGOFF_URL
                + "?returl={end_session}&retnow=1".format(
                    end_session=reverse("oidc_end_session", request=request)
                )
            )
        except NoReverseMatch:
            pass
    return uri


def sync_keycloak_user(oidc_user: OIDCUser, claims: dict):
    """Copy attributes from JWT claims."""
    oidc_user.user.universal_id = claims.get("universal-id")
    oidc_user.user.authorization_id = claims.get("sub")
    oidc_user.user.first_name = claims.get("given_name") or ""
    oidc_user.user.last_name = claims.get("family_name") or ""
    oidc_user.user.display_name = claims.get("display_name") or ""
    oidc_user.user.email = claims.get("email")
    oidc_user.user.save()


def build_get_user_object(logged_in, request):
    return {
        "accepted_terms_at": logged_in and request.user.accepted_terms_at or None,
        "user_id": logged_in and request.user.authorization_id or None,
        "email": logged_in and request.user.email or None,
        "first_name": logged_in and request.user.first_name or None,
        "last_name": logged_in and request.user.last_name or None,
        "display_name": logged_in and request.user.display_name or None,
        "is_staff": logged_in and request.user.is_staff,
        "universal_id": logged_in and request.user.universal_id,
        "login_uri": get_login_uri(request),
        "logout_uri": get_logout_uri(request),
    }


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


def grecaptcha_site_key() -> str:
    return settings.RECAPTCHA_SITE_KEY


def grecaptcha_secret_key() -> str:
    return settings.RECAPTCHA_SECRET_KEY


def grecaptcha_verify(request) -> dict:
    secret_key = grecaptcha_secret_key()

    if not secret_key:
        return {"status": True}
    captcha_rs = request.META.get("HTTP_X_CAPTCHA_RESPONSE")

    if not captcha_rs:
        return {"status": False, "message": "Captcha response not provided"}
    url = "https://www.google.com/recaptcha/api/siteverify"
    params = {
        "secret": secret_key,
        "response": captcha_rs,
        "remoteip": get_client_ip(request),
    }
    verify_rs = requests.get(url, params=params, verify=True)
    verify_rs = verify_rs.json()

    return {
        "status": verify_rs.get("success", False),
        "message": verify_rs.get("error-codes", None) or "Unspecified error.",
    }
