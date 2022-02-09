import json
import logging

from django.conf import settings
from django.http import HttpResponse, HttpResponseNotFound
from django.http.response import HttpResponseBadRequest, HttpResponseForbidden
from django.template.loader import get_template
from django.utils import timezone

from rest_framework import permissions
from rest_framework import generics

from core.pdf import render as render_pdf
from api.models.application import Application
from api.models.prepared_pdf import PreparedPdf
from api.utils import get_application_for_user

LOGGER = logging.getLogger(__name__)
no_record_found = "No record found."


class SurveyPdfView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def generate_pdf(self, data):
        html_content = data
        pdf_content = render_pdf(html_content)
        return pdf_content

    def get_pdf_by_application_id_and_type(self, id, pdf_type):
        try:
            pdf_result = PreparedPdf.objects.get(application_id=id, pdf_type=pdf_type)
            return pdf_result
        except (PreparedPdf.DoesNotExist, Application.DoesNotExist):
            LOGGER.debug(no_record_found)
            return

    def create_download_response(self, pdf_content):
        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="report.pdf"'
        response.write(pdf_content)
        return response

    def get(self, request, application_id):
        user_id = request.user.id
        app = get_application_for_user(application_id, user_id)
        if not app:
            return HttpResponseNotFound(no_record_found)
        pdf_type = request.query_params.get("pdf_type")
        if pdf_type is None:
            return HttpResponseBadRequest("Missing parameters.")
        prepared_pdf = self.get_pdf_by_application_id_and_type(application_id, pdf_type)
        if prepared_pdf is None:
            return HttpResponseNotFound(no_record_found)
        pdf_content = settings.ENCRYPTOR.decrypt(prepared_pdf.key_id, prepared_pdf.data)
        return self.create_download_response(pdf_content)

    # Testing purposes only.
    def put(self, request, application_id):
        if not request.user.is_staff and not request.user.is_superuser:
            return HttpResponseForbidden()
        html = request.data["html"]
        pdf_content = self.generate_pdf(html)
        return self.create_download_response(pdf_content)

    def post(self, request, application_id):
        html = request.data["html"]
        json_data = request.data["json_data"]
        user_id = request.user.id
        app = get_application_for_user(application_id, user_id)
        if not app:
            return HttpResponseNotFound(no_record_found)

        pdf_type = request.query_params.get("pdf_type")
        version = request.query_params.get("version")
        if None in [pdf_type, version]:
            return HttpResponseBadRequest("Missing parameters.")

        try:
            pdf_result = self.get_pdf_by_application_id_and_type(
                application_id, pdf_type
            )
            pdf_content = self.generate_pdf(html)
            (pdf_key_id, pdf_content_enc) = settings.ENCRYPTOR.encrypt(pdf_content)
            (pdf_key_id, json_enc) = settings.ENCRYPTOR.encrypt(
                json.dumps(json_data).encode("utf-8")
            )
            if pdf_result:
                pdf_result.data = pdf_content_enc
                pdf_result.json_data = json_enc
                pdf_result.key_id = pdf_key_id
                pdf_result.pdf_type = pdf_type
                pdf_result.version = version
            else:
                pdf_result = PreparedPdf(
                    application_id=application_id,
                    data=pdf_content_enc,
                    json_data=json_enc,
                    key_id=pdf_key_id,
                    pdf_type=pdf_type,
                    version=version,
                )
            pdf_result.save()

            app.last_printed = timezone.now()
            app.save()
        except Exception as ex:
            LOGGER.error("ERROR: Pdf generation failed %s", ex)
            raise

        if request.query_params.get("noDownload"):
            return HttpResponse(status=204)
        else:
            return self.create_download_response(pdf_content)
