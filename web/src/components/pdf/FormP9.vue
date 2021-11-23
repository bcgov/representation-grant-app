<template>
  <div>
    <template v-for="applicant in applicantList">
      <b-card
        :key="applicant.fullname"
        id="print"
        style="max-width: 1100px;"
        bg-variant="white"
        class="mt-4 mb-3"
      >
        <div style="text-align:center;margin:4rem 0 0 -1.3rem;font-weight: 300;font-size:20px;">
          FORM P9 (RULE 25-3 (2))
        </div>

        <div class="mt-3 m-0 p-0 row">
          <div style="margin:0 0 0 40rem;">
            <div>
              <underline-form
                textwidth="10.6rem"
                beforetext="This is the"
                text="1st"
              />
              <div style="display:inline-block; margin:0 0 0 0.5rem; padding:0;">
                affidavit
              </div>
            </div>
            <div class="mt-2">
              <underline-form
                textwidth="12.8rem"
                beforetext="of"
                :text="applicant.fullName"
              />
              <div style="display:inline-block; margin:0 0 0 0.5rem; padding:0;">
                in this case
              </div>
            </div>
            <div class="mt-2">
              <underline-form
                textwidth="11rem"
                beforetext="and was made on"
                text=""
              />
            </div>
            <div class="mt-2">
              <underline-form
                textwidth="15rem"
                beforetext=""
                text=""
              />
              <div style="display:inline-block; margin:0 0 0 0.5rem; padding:0;">
                Registry
              </div>
            </div>
            <div class="mt-2">
              <underline-form
                textwidth="16rem"
                beforetext="No."
                text=""
              />
            </div>
          </div>
        </div>

        <div style="text-align:center;margin:1rem 0 1rem -1.3rem;font-weight: 600;font-size:24px;">
          <i>IN THE SUPREME COURT OF BRITISH COLUMBIA</i>
        </div>
        <div style="text-align:center">
          <div style="display:inline-block; text-indent: 5px;">
            <i>In the Matter of the Estate of</i>
          </div>
          <underline-form
            textwidth="17rem"
            beforetext=""
            :text="deceasedFullName"
          />
          <div style="display:inline-block; text-indent: 5px;">
            <i>, deceased</i>
          </div>
        </div>
        <div style="text-align:center;margin:2rem 0 2rem -1.3rem;font-weight: 600;font-size:20px;">
          AFFIDAVIT OF DELIVERY
        </div>

        <div style="display:inline-block; text-indent: 5px;">I</div>
        <div style="display:inline-block; margin:0.5rem 0;">
          <div style="display:inline-block; width:0.5rem;"></div>
          <underline-form
            textwidth="20rem"
            beforetext=""
            :text="applicant.fullName"
          />
          <underline-form
            textwidth="25rem"
            beforetext=", of"
            :text="applicant.address"
          />
          <underline-form
            textwidth="10.5rem"
            beforetext=", "
            :text="applicant.occupation"
          />
        </div>
        <div style="margin:0.5rem 0 1rem 0rem;font-weight: 300;font-size:18px;">
          SWEAR (OR AFFIRM) THAT:
        </div>

        <ol style="margin:0rem 0 0 -1.5rem;">
          <!-- <1> -->
          <li class="mt-4 text-justify">
            <div style="display:inline;">
              Attached to this affidavit and marked as Exhibit A is a copy of a notice of proposed
              application in Form P1 (the "notice").
            </div>
          </li>

          <!-- <2> -->
          <li v-if="mailRecipients(applicant).length > 0 || electronicRecipients(applicant).length > 0 || inPersonRecipients(applicant).length > 0" class="mt-4 text-justify ">
            <div>
              I delivered a copy of the notice to the following persons as follows:
            </div>

            <div v-if="mailRecipients(applicant).length > 0">
              <div style="text-indent: 20px;">
                by mailing it/them to the following persons by ordinary mail:
              </div>
              <template v-for="(recipient, i) of mailRecipients(applicant)">
                <div :key="i" style="display:inline-block; margin:0.5rem 0;">
                  <underline-form
                    :key="recipient.recipientName"
                    style="margin:0.5rem 0 ;display:inline-block; text-indent: 20px;"
                    textwidth="41.5rem"
                    beforetext=""
                    hint=""
                    :text="recipient.recipientName"
                  />
                  <underline-form
                    :key="recipient.p1DeliveryDate"
                    style="margin:0.5rem 0 ;display:inline-block; text-indent: 5px;"
                    textwidth="15rem"
                    beforetext="on"
                    :text="recipient.p1DeliveryDate"
                  />
                </div>
              </template>
            </div>

            <div v-if="inPersonRecipients(applicant).length > 0">
              <div style="text-indent: 20px;">
                by handing it/them to and leaving it/them with the following persons:
              </div>
              <template v-for="(recipient, i) of inPersonRecipients(applicant)">
                <div :key="i" style="display:inline-block; margin:0.5rem 0;">
                  <underline-form
                    :key="recipient.recipientName"
                    style="margin:0.5rem 0 ;display:inline-block; text-indent: 20px;"
                    textwidth="41.5rem"
                    beforetext=""
                    hint=""
                    :text="recipient.recipientName"
                  />
                  <underline-form
                    :key="recipient.p1DeliveryDate"
                    style="margin:0.5rem 0 ;display:inline-block; text-indent: 5px;"
                    textwidth="15rem"
                    beforetext="on"
                    :text="recipient.p1DeliveryDate"
                  />
                </div>
              </template>
            </div>

            <div v-if="electronicRecipients(applicant).length > 0">
              <div style="text-indent: 20px;">
                by sending it/them to the following persons by e-mail, fax or other electronic means to that person:
              </div>
              <template v-for="(recipient, i) of electronicRecipients(applicant)">
                <div :key="i" style="display:inline-block; margin:0.5rem 0;">
                  <underline-form
                    :key="recipient.recipientName"
                    style="margin:0.5rem 0 ;display:inline-block; text-indent: 20px;"
                    textwidth="41.5rem"
                    beforetext=""
                    hint=""
                    :text="recipient.recipientName"
                  />
                  <underline-form
                    :key="recipient.p1DeliveryDate"
                    style="margin:0.5rem 0 ;display:inline-block; text-indent: 5px;"
                    textwidth="15rem"
                    beforetext="on"
                    :text="recipient.p1DeliveryDate"
                  />
                </div>
              </template>

              <div style="text-indent: 40px;">
                Each of the persons who received delivery by e-mail, fax or other electronic means has, in writing, acknowledged receipt of the document(s) referred to in this section.
              </div>

              <div style="text-indent: 40px;" v-if="applicantList.length > 1 && allP1DeliveryElectronicReceiptRetain">
                We will retain a copy of those acknowledgements until the personal representative of the deceased is discharged and will produce those acknowledgements promptly after being requested to do so by the registrar.
              </div>

              <div style="text-indent: 40px;" v-if="applicantList.length === 1 && allP1DeliveryElectronicReceiptRetain">
                I will retain a copy of those acknowledgements until the personal representative of the deceased is discharged and will produce those acknowledgements promptly
              </div>
              <div style="text-indent: 40px;" v-if="applicantList.length === 1 && allP1DeliveryElectronicReceiptRetain">
                after being requested to do so by the registrar.
              </div>

              
            </div>
          </li>
        </ol>

        <div class="mt-5 row">
          <div class="col-6">
            <div style="margin:0.5rem 0 1rem 0rem;font-weight: 300;font-size:18px;">
              SWORN (OR AFFIRMED) BEFORE ME
            </div>
            <underline-form textwidth="15rem" beforetext="at" text="" hint="Commissioner City" />
            <div style="margin:0.5rem 0 ; display:inline; text-indent: 5px;">
              , British Columbia
            </div>

            <underline-form
              style="margin:0.75rem 0 ;"
              textwidth="24rem"
              beforetext="on"
              text=""
              hint="Swear/Affirm Date"
            />
            <underline-form
              style="margin:0.5rem 0 ;"
              textwidth="25rem"
              beforetext=""
              text=""
              hint="A commissioner for taking affidavits for British Columbia"
            />
            <div style="margin:0.5rem 0 ;font-size:14px; ">

            </div>
            <underline-form
              style="margin:.5rem 0 ;"
              textwidth="25rem"
              beforetext=""
              hint="[print name or affix stamp of commissioner]"
              text=""
            />
          </div>
          <div class="col-6 border-left">
            <underline-form
              :style="{ marginTop: getSignatureMargin() }"
              textwidth="29rem"
              beforetext=""
              :hint="'Signature of ' + applicant.fullName"
              text=""
            />
          </div>
        </div>
      </b-card>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { getApplicants, getRecipients } from "@/state/survey-state";
import { ApplicantInfoPanel, P1Panel } from "@/types/application";

import UnderlineForm from "@/components/pdf/components/UnderlineForm.vue";
import { format } from 'date-fns'
import axios, { AxiosRequestConfig } from "axios";
import { getApplicationId } from "@/state/application-state";
import { SurveyQuestionNames } from "@/types/survey-primary";

@Component({
  components: {
    UnderlineForm
  }
})
export default class FormP9 extends Vue {
  @Prop({ required: false })
  survey;

  applicantList = [];
  recipientList = [];
  deceasedFullName = "";

  mounted() {
    if (this.survey) {
      this.populateFromSurvey(this.survey);
    } else {
      this.populateFromFakeData();  
    }
  }

  public mailRecipients(applicant): any[] {
    return applicant.recipients.filter(r => r?.p1DeliveryMethod === "mail");;
  }

  public inPersonRecipients(applicant): any[] {
    return applicant.recipients.filter(r => r?.p1DeliveryMethod === "inperson");
  }

  public electronicRecipients(applicant): any[] {
    return applicant.recipients.filter(r => r?.p1DeliveryMethod === "electronic");
  }

  public allP1DeliveryElectronicReceipt(applicant): boolean {
    return !applicant.recipients.some(r => r?.p1DeliveryElectronicReceipt !== "y");
  }

  public allP1DeliveryElectronicReceiptRetain(applicant): boolean {
    return !applicant.recipients.some(r => r?.p1DeliveryElectronicReceiptRetain !== "confirmed");
  }

  public populateFromFakeData() {
    this.deceasedFullName = "Peter P. Doe";
    let fakeApplicant: ApplicantInfoPanel = {
      courthouse: "Victoria Courthouse",
      address: "123 Road St.",
      fullName: "John H. Doe",
      occupation: "Teacher",
      individual: "",
      sameMail: "",
      differentMail: "",
      differentAddress: "",
      recipients: []
    }

    const fakeRecipient: P1Panel = {
      recipientName: "Jane P. Doe",
      p1DelivererName: "John H. Doe",
      p1DeliveryMethod: "inperson",
      p1DeliveryDate: "January 11, 2021",
      p1DeliveryElectronicReceipt: "",
      p1DeliveryElectronicReceiptRetain: "",
    }

    fakeApplicant.recipients.push(fakeRecipient);
    this.applicantList.push(fakeApplicant);
  }

  public getSignatureMargin() {
    let margin = Number(10 / this.applicantList.length);
    if (margin < 1.0) margin = 1;
    return margin + "rem";
  }

  public onPrint() {
    const el = document.getElementById("print");
    console.log(el);
    const applicationId = getApplicationId.value;

    const url = "/survey-print/" + applicationId + "/?name=representation-grant";
    const body = Vue.filter("printPdf")(el.innerHTML, `"SCCRPF  02/2021 \a         Form P9";`);
    const options = {
      responseType: "blob",
      headers: {
        "Content-Type": "application/json"
      }
    } as AxiosRequestConfig;
    console.log(body);
    axios.post(url, body, options).then(
      res => {
        const blob = res.data;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.download = "FormP9.pdf";
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      },
      err => {
        console.error(err);
      }
    );
  }

  // TODO: make this more generic 
  private getChoiceFromValue(target, questions) {
    for (const question of questions) {
      if (question.name === "p1DelivererName") {
        const choices = question.choices;
        for (const choice of choices) {
          if (target === choice.value) {
            return choice.text;
          }
        }
      }
    }
  }

  private buildApplicantList(allQuestions) {
    let resultList = [];
    const applicants = getApplicants.value;
    const applicantQuestion = allQuestions.find(q => q.name === SurveyQuestionNames.applicantInfoPanel);

    for (const i in applicants) {
      let applicant: ApplicantInfoPanel = {
        courthouse: "",
        address: "",
        fullName: applicants[i].applicantName,
        occupation: "",
        individual: "",
        sameMail: "",
        differentMail: "",
        differentAddress: "",
        recipients: []
      }

      if (applicantQuestion) {
        const base = applicantQuestion.value[i]?.applicantOrdinaryAddress;

        const street = base.street || "";
        const city = base.city || "";
        const state = base.state || "";
        const country = base.country || "";
        const postcode = base.postcode || "";

        applicant.address = `${street}, ${city}, ${state}, ${country} ${postcode}`;
        applicant.occupation = applicantQuestion.value[i].applicantOccupation || "";
      }

      resultList.push(applicant);
    }
    return resultList;
  }

  private buildRecipientList(allQuestions) {
    let resultList = [];
    const recipients = getRecipients.value;
    const recipientQuestion = allQuestions.find(q => q.name === SurveyQuestionNames.p1DeliveryInfoPanel);

    for (const i in recipients) {
      let recipient: P1Panel = {
        recipientName: recipients[i].recipientName,
        p1DelivererName: "",
        p1DeliveryMethod: "",
        p1DeliveryDate: "",
        p1DeliveryElectronicReceipt: "",
        p1DeliveryElectronicReceiptRetain: "",
      }

      if (recipientQuestion) {
        const base = recipientQuestion.value[i];

        recipient.p1DelivererName = this.getChoiceFromValue(base.p1DelivererName, recipientQuestion.panels[i].questions);
        recipient.p1DeliveryMethod = base.p1DeliveryMethod || "";

        const deliveryDate = base.p1DeliveryDate || "";
        if (deliveryDate) {
          recipient.p1DeliveryDate = format(new Date(base.p1DeliveryDate.replace(/-/g, '\/')), "MMMM d, yyyy");
        }
        recipient.p1DeliveryElectronicReceipt = base?.p1DeliveryElectronicReceipt || "";
        recipient.p1DeliveryElectronicReceiptRetain = base?.p1DeliveryElectronicReceiptRetain ? base.p1DeliveryElectronicReceiptRetain[0] : "";
      }
      
      resultList.push(recipient);
    }
    return resultList;
  }

  private getDeceasedName(allQuestions) {
    const deceasedQuestion = allQuestions.find(q => q.name === SurveyQuestionNames.deceasedName);

    if (deceasedQuestion) {
      const first = deceasedQuestion.value.first || "";
      const middle = deceasedQuestion.value.middle || "";
      const last = deceasedQuestion.value.last || "";
      return `${first} ${middle} ${last}`;
    }

    return "";
  }

  private matchApplicantsAndRecipients(applicants, recipients) {
    for (const applicant of applicants) {
      for (const recipient of recipients) {
        if (applicant.fullName === recipient.p1DelivererName) {
          applicant.recipients.push(recipient);
        }
      }
    }
    return applicants;
  }

  /* 
  Fields of interest from surveyJS:
  These fields will have to be put together from a bunch of different places. 
  They will need to be transformed I believe.. as an applicantPanel doesn't exist (it takes it from different places).
  The responsbility of this component isn't to transform the data, it's simply to display the data.

  applicantInfoPanel:
    applicantCourthouse
    applicantOrdinaryAddress
    applicantOccupation

  p1DeliveryInfoPanel
    p1DelivererName
    p1DeliveryMethod
    p1DeliveryDate
    p1DeliveryElectronicReceipt
    p1DeliveryElectronicReceiptRetain

  deceasedName
  */
  public populateFromSurvey(survey) {
    this.applicantList = [];
    const allQuestions = survey.getAllQuestions();
    const applicants = this.buildApplicantList(allQuestions);
    const recipients = this.buildRecipientList(allQuestions);
    this.deceasedFullName = this.getDeceasedName(allQuestions);
    this.applicantList = this.matchApplicantsAndRecipients(applicants, recipients);
  }
}

</script>
<style scoped>
.table >>> th.border-dark {
  border: 1px solid #000;
}
.table >>> td.border-dark {
  border: 1px solid #000;
}

section {
  counter-increment: question-counter;
  float: left;
  text-indent: -20px;
  text-align: justify;
  text-justify: inter-word;
  margin: 1rem 0.5rem 0.5rem 0rem;
}

section:before {
  font-weight: bolder;
  content: counter(question-counter) ".";
}

dsection:after {
  float: none;
  white-space: pre;
}

section.resetquestion {
  counter-reset: question-counter;
}

ol.resetcounter {
  list-style: none;
  counter-reset: bracket-counter;
}
ol li.bracketnumber {
  text-indent: -25px;
  text-align: justify;
  text-justify: inter-word;
  margin: 1rem 0;
  counter-increment: bracket-counter;
}
ol li.bracketnumber:before {
  content: "(" counter(bracket-counter) ") ";
  font-weight: bold;
}

ol.resetlist {
  list-style: none;
  counter-reset: list-counter;
}
ol li.listnumber {
  text-indent: -25px;
  text-align: justify;
  text-justify: inter-word;
  margin: 1rem 0;
  counter-increment: list-counter;
}
ol li.listnumber:before {
  content: counter(list-counter) ". ";
  font-weight: bold;
}
</style>
