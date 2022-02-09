from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from api.models.prepared_pdf import PreparedPdf
from api.models.application import Application


class StatsView(APIView):
    permission_classes = (permissions.IsAuthenticated, permissions.IsAdminUser)

    def get(self, request: Request):
        forms = ["FormP1", "FormP9"]
        stats = []

        for app in Application.objects.all():
            row = {"ID": app.id}

            for form in forms:
                try:
                    px = PreparedPdf.objects.get(application_id=app.id, pdf_type=form)
                except:
                    px = False

                form_key = f"{form}"
                date_key = f"{form} Created Date"

                if px:
                    row.update(
                        {
                            form_key: "Yes",
                            date_key: px.created_date,
                        }
                    )

                else:
                    row.update(
                        {
                            form_key: "No",
                            date_key: None,
                        }
                    )

            stats.append(row)

        stats.append(
            {
                "Total Applications": len(stats),
                "Total FormP1s": len(
                    [True for stat in stats if stat[forms[0]] == "Yes"]
                ),
                "Total FormP9s": len(
                    [True for stat in stats if stat[forms[1]] == "Yes"]
                ),
            }
        )

        return Response(stats)
