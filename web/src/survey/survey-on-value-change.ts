//Needs to be function, otherwise this context wont work.
import { notifyP1DeliveryInfoPanel, SurveyQuestionNames } from "@/types/survey-primary";
import { addDays, format, getDay, parseISO } from "date-fns";
import { ItemValue, Survey } from "survey-vue";
import {
  getPotentialApplicants,
  getRecipients,
  setApplicants,
  setLastUpdated,
  setPotentialApplicants,
  setPrevAddresses,
  setRecipients
} from "@/state/survey-state";

enum Roles {
  spouse,
  spouseGuardian,
  spouseNominee,
  spousePersonalRep,
  child,
  childGuardian,
  childNominee,
  childPersonalRep,
  gChild,
  gChildGuardian,
  gChildNominee,
  gChildPersonalRep,
  gGChild,
  gGChildGuardian,
  gGChildNominee,
  gGChildPersonalRep,
  gGGChild,
  gGGChildGuardian,
  gGGChildNominee,
  gGGChildPersonalRep,
  descendant,
  descendantGuardian,
  descendantNominee,
  descendantPersonalRep,
  parent,
  parentGuardian,
  parentNominee,
  parentPersonalRep,
  sibling,
  siblingGuardian,
  siblingNominee,
  siblingPersonalRep,
  nibling,
  niblingGuardian,
  niblingNominee,
  niblingPersonalRep,
  gNibling,
  gNiblingGuardian,
  gNiblingNominee,
  gNiblingPersonalRep,
  gParent,
  gParentGuardian,
  gParentNominee,
  gParentPersonalRep,
  pibling,
  piblingGuardian,
  piblingNominee,
  piblingPersonalRep,
  cousin,
  cousinGuardian,
  cousinNominee,
  cousinPersonalRep,
  gGParent,
  gGParentGuardian,
  gGParentNominee,
  gGParentPersonalRep,
  gPibling,
  gPiblingGuardian,
  gPiblingNominee,
  gPiblingPersonalRep,
  firstNation,
  executor,
  beneficiary,
  creditorPerson,
  creditorPersonGuardian,
  creditorOrganization,
  foreignWillExtra,
  citor,
  pgt,
  organization,
  childWelfare,
}

//Helper function, that either grabs value from the event, or from the survey via getQuestionByName.
const getValueFromOptionsOrGetQuestion = (
  sender,
  options,
  questionName: string,
  getText?: boolean
) => {
  if (getText) {
    return getTextValue(sender, options, questionName);
  } else {
    return options.name == questionName
      ? options.value
      : sender.getQuestionByName(questionName)?.value;
  }
};

const getTextValue = (sender, options, questionName) => {
  if (options.name == questionName) {
    return options.question.choices?.find(c => c.value == options.value)?.text;
  } else {
    const base = sender.getQuestionByName(questionName);
    return base.choices?.find(c => c.value == base?.value)?.text;
  }
};

const populateApplicantInfoPanelAndP1DeliveryInfoPanel = (sender, options) => {
  const questionNamesToWatch = [
    SurveyQuestionNames.applicantChoice,
    SurveyQuestionNames.spouseInfoPanel,
    SurveyQuestionNames.childInfoPanel,
    SurveyQuestionNames.spouseExists,
    SurveyQuestionNames.childExists
  ];
  if (!questionNamesToWatch.includes(options.name)) return;
  const applicantChoice =
    sender.getQuestionByName(SurveyQuestionNames.applicantChoice)?.value || [];
  const applicants = !Array.isArray(applicantChoice) ? [applicantChoice] : applicantChoice;
  const potentialApplicants = getPotentialApplicants.value || [];
  const applicantInfoPanel = sender.getQuestionByName(SurveyQuestionNames.applicantInfoPanel);
  if (applicantInfoPanel) {
    applicantInfoPanel.value = applicants.map(a => potentialApplicants.find(pa => pa.key == a));
    applicantInfoPanel.visible = applicants.length > 0;
  }
  const p1DeliveryInfoPanel = sender.getQuestionByName(
    SurveyQuestionNames.notifyP1DeliveryInfoPanel
  );
  if (p1DeliveryInfoPanel) {
    const choices = applicants
      .map(a => potentialApplicants.find(pa => pa.key == a))
      .map(p => new ItemValue(`${p.key}`, `${p.applicantName}`));
    for (const panel of p1DeliveryInfoPanel.panels) {
      for (const question of panel.questions) {
        if (question.name != SurveyQuestionNames.notifyP1DelivererName) continue;
        question.choices = choices;
      }
    }
  }
};

const clearPanel = (sender, options) => {
  if (options.name === SurveyQuestionNames.spouseExists) {
    if (
      getValueFromOptionsOrGetQuestion(sender, options, SurveyQuestionNames.spouseExists) === "n"
    ) {
      sender.getQuestionByName(SurveyQuestionNames.spouseInfoPanel).value = [];
    }
  } else if (options.name === SurveyQuestionNames.childExists) {
    if (
      getValueFromOptionsOrGetQuestion(sender, options, SurveyQuestionNames.childExists) === "n"
    ) {
      sender.getQuestionByName(SurveyQuestionNames.childInfoPanel).value = [];
    }
  }
};

const determinePotentialApplicants = (sender, options) => {
  enum QuestionNamesToWatch {
    spouseInfoPanel = SurveyQuestionNames.spouseInfoPanel,
    spouseExists = SurveyQuestionNames.spouseExists,
    spouseIsAlive = SurveyQuestionNames.spouseIsAlive,
    spouseIsAdult = SurveyQuestionNames.spouseIsAdult,
    spouseHasGuardian = SurveyQuestionNames.spouseHasGuardian,
    
    childInfoPanel = SurveyQuestionNames.childInfoPanel,
    childExists = SurveyQuestionNames.childExists,
    childIsAlive = SurveyQuestionNames.childIsAlive,
    childIsAdult = SurveyQuestionNames.childIsAdult,
    childHasGuardian = SurveyQuestionNames.childHasGuardian,

    deceasedFirstNations = SurveyQuestionNames.deceasedFirstNations,
    deceasedFirstNationsName =  SurveyQuestionNames.deceasedFirstNationsName,
    
    creditorPersonInfoPanel = SurveyQuestionNames.creditorPersonInfoPanel,
    creditorPersonExists = SurveyQuestionNames.creditorPersonExists,
    creditorPersonIsAlive = SurveyQuestionNames.creditorPersonIsAlive,
    creditorPersonIsAdult = SurveyQuestionNames.creditorPersonIsAdult,
    creditorPersonHasGuardian = SurveyQuestionNames.creditorPersonHasGuardian,
    
    creditorOrganizationInfoPanel = SurveyQuestionNames.creditorOrganizationInfoPanel,
    creditorOrganizationExists = SurveyQuestionNames.creditorOrganizationExists,
    
    citorInfoPanel = SurveyQuestionNames.applicantCitorInfoPanel,
    cited = SurveyQuestionNames.applicantCited,
    citorNew = SurveyQuestionNames.applicantCitorNewExists,
  };

  if (!Object.values(QuestionNamesToWatch).includes(options.name)) return;

  let spousePanel = getValueFromOptionsOrGetQuestion(sender, options, QuestionNamesToWatch.spouseInfoPanel.toString()) || [];
  const spouseExists = getValueFromOptionsOrGetQuestion(sender, options, QuestionNamesToWatch.spouseExists.toString());

  let childPanel = getValueFromOptionsOrGetQuestion(sender, options, QuestionNamesToWatch.childInfoPanel.toString()) || [];
  const childExists = getValueFromOptionsOrGetQuestion(sender, options, QuestionNamesToWatch.childExists.toString());

  let isFirstNations = getValueFromOptionsOrGetQuestion(sender, options, QuestionNamesToWatch.deceasedFirstNations.toString());
  const firstNationsName = getValueFromOptionsOrGetQuestion(sender, options, QuestionNamesToWatch.deceasedFirstNationsName.toString(), true);

  let creditorPersonPanel = getValueFromOptionsOrGetQuestion(sender, options, QuestionNamesToWatch.creditorPersonInfoPanel.toString()) || [];
  const creditorPersonExists = getValueFromOptionsOrGetQuestion(sender, options, QuestionNamesToWatch.creditorPersonExists.toString());

  let creditorOrganizationPanel = getValueFromOptionsOrGetQuestion(sender, options, QuestionNamesToWatch.creditorOrganizationInfoPanel.toString()) || [];
  const creditorOrganizationExists = getValueFromOptionsOrGetQuestion(sender, options, QuestionNamesToWatch.creditorOrganizationExists.toString());

  let citorPanel = getValueFromOptionsOrGetQuestion(sender, options, QuestionNamesToWatch.citorInfoPanel.toString()) || [];
  const cited = getValueFromOptionsOrGetQuestion(sender, options, QuestionNamesToWatch.cited.toString());
  const citorNew = getValueFromOptionsOrGetQuestion(sender, options, QuestionNamesToWatch.citorNew.toString());

  let spouseGuardianPanel = spousePanel
    .filter(s => spouseExists == "y")
    .filter(s => s.spouseIsAlive == "y" && s.spouseIsAdult == "n" && s.spouseHasGuardian == "y")
    .map(s => `${s.spouseGuardianName} (guardian of ${s.spouseName})`)

  spousePanel = spousePanel
    .filter(s => spouseExists == "y")
    .filter(s => s.spouseIsAlive == "y" && s.spouseIsAdult == "y" && s.spouseIsCompetent == "y")
    .map(s => s.spouseName);

  let childGuardianPanel = childPanel
    .filter(s => childExists == "y")
    .filter(s => s.childIsAlive == "y" && s.childIsAdult == "n" && s.childHasGuardian == "y")
    .map(s => `${s.childGuardianName} (guardian of ${s.childName})`)

  childPanel = childPanel
    .filter(s => childExists == "y")
    .filter(s => s.childIsAlive == "y" && s.childIsAdult == "y" && s.childIsCompetent == "y")
    .map(s => s.childName);

  const firstNationsPanel = isFirstNations == "y" && firstNationsName ? [firstNationsName] : [];

  let creditorPersonGuardianPanel = creditorPersonPanel
    .filter(s => creditorPersonExists == "y")
    .filter(s => s.creditorPersonIsAlive == "y" && s.creditorPersonIsAdult == "n" && s.creditorPersonHasGuardian == "y")
    .map(s => `${s.creditorPersonGuardianName} (guardian of ${s.creditorPersonName})`)

  creditorPersonPanel = creditorPersonPanel
    .filter(s => creditorPersonExists == "y")
    .filter(s => s.creditorPersonIsAlive == "y" && s.creditorPersonIsAdult == "y" && s.creditorPersonIsCompetent == "y")
    .map(s => s.creditorPersonName);

  creditorOrganizationPanel = creditorOrganizationPanel
    .filter(s => creditorOrganizationExists == "y")
    .map(s => s.creditorOrganizationName);

  citorPanel = citorPanel
    .filter(s => cited == "y" && citorNew == "y")
    .filter(s => s.applicantCitorAlive == "y")
    .map(s => s.applicantCitorName);

  const potentialApplicants = [
    ...spousePanel.map((sp, index) => ({
      applicantRole: Roles[Roles.spouse],
      applicantName: sp,
      key: `s${index}`
    })),
    ...spouseGuardianPanel.map((sp, index) => ({
      applicantRole: Roles[Roles.spouseGuardian],
      applicantName: sp,
      key: `sg${index}`
    })),
    ...childPanel.map((c, index) => ({
      applicantRole: Roles[Roles.child],
      applicantName: c,
      key: `c${index}`
    })),
    ...childGuardianPanel.map((c, index) => ({
      applicantRole: Roles[Roles.childGuardian],
      applicantName: c,
      key: `cg${index}`
    })),
    ...firstNationsPanel.map((f, index) => ({
      applicantRole: Roles[Roles.firstNation],
      applicantName: f,
      key: `f${index}`
    })),
    ...creditorPersonPanel.map((cr, index) => ({
      applicantRole: Roles[Roles.creditorPerson],
      applicantName: cr,
      key: `crp${index}`
    })),
    ...creditorPersonGuardianPanel.map((cr, index) => ({
      applicantRole: Roles[Roles.creditorPersonGuardian],
      applicantName: cr,
      key: `crpg${index}`
    })),
    ...creditorOrganizationPanel.map((cr, index) => ({
      applicantRole: Roles[Roles.creditorOrganization],
      applicantName: cr,
      key: `cro${index}`
    })),
    ...citorPanel.map((ct, index) => ({
      applicantRole: Roles[Roles.citor],
      applicantName: ct,
      key: `ct${index}`
    })),
  ];

  const applicantChoice = sender.getQuestionByName(SurveyQuestionNames.applicantChoice);
  if (applicantChoice) {
    applicantChoice.choices = potentialApplicants.map(
      p => new ItemValue(`${p.key}`, `${p.applicantName}`)
    );
  }
  setPotentialApplicants(potentialApplicants);
};

const determineRecipients = (sender, options) => {
  const questionNamesToWatch = [
    SurveyQuestionNames.applicantChoice,
    SurveyQuestionNames.spouseInfoPanel,
    SurveyQuestionNames.childInfoPanel,
    SurveyQuestionNames.deceasedFirstNations,
    SurveyQuestionNames.deceasedFirstNationsName,
    SurveyQuestionNames.applicantCitorInfoPanel,
  ];
  if (!questionNamesToWatch.includes(options.name)) return;

  let selectedApplicants =
    getValueFromOptionsOrGetQuestion(sender, options, SurveyQuestionNames.applicantChoice) || [];
  const potentialApplicants = getPotentialApplicants.value;

  //Handle both Checkbox and Radiogroup cases.
  const recipients = potentialApplicants
    .filter(
      pa =>
        (Array.isArray(selectedApplicants) && !selectedApplicants.find(sa => sa == pa.key)) ||
        (!Array.isArray(selectedApplicants) && selectedApplicants != pa.key)
    )
    .map(pa => ({
      recipientRole: pa.applicantRole,
      recipientName: pa.applicantName,
      key: pa.key
    }));
  setRecipients(recipients);

  //Handle both Checkbox and Radiogroup cases.
  const applicants = potentialApplicants.filter(
    pa =>
      (Array.isArray(selectedApplicants) && selectedApplicants.find(sa => sa == pa.key)) ||
      (!Array.isArray(selectedApplicants) && selectedApplicants == pa.key)
  );
  setApplicants(applicants);

  //Going to have to combine objects here, not just replace.
  const targetPanel = sender.getQuestionByName(SurveyQuestionNames.notifyP1DeliveryInfoPanel);
  if (targetPanel) {
    targetPanel.value = recipients;
  }
};

export const determineEarliestSubmissionDate = (sender, options) => {
  const questionNamesToWatch = [SurveyQuestionNames.notifyP1DeliveryInfoPanel];
  if (!questionNamesToWatch.includes(options.name)) return;
  const p1DeliveryInfoPanelValue = options.value || [];
  const calculatedDates = [];
  p1DeliveryInfoPanelValue.forEach((value: notifyP1DeliveryInfoPanel) => {
    const method = value?.notifyP1DeliveryMethod;
    let dateServed = parseISO(value?.notifyP1DeliveryDate);
    if (!method || isNaN(dateServed.getTime())) return;
    dateServed = addDays(dateServed, 21);
    calculatedDates.push(dateServed);
  });

  const earliestSubmissionDateQuestion = sender.getQuestionByName(
    SurveyQuestionNames.notifyEarliestSubmissionDate
  );
  if (!earliestSubmissionDateQuestion) return;
  if (calculatedDates.length == 0) {
    earliestSubmissionDateQuestion.visible = false;
  } else {
    const earliestSubmissionDate = new Date(Math.max.apply(null, calculatedDates));
    sender.setVariable("earliestSubmissionDate", format(earliestSubmissionDate, "MMMM d, yyyy"));
    earliestSubmissionDateQuestion.visible = true;
    //Have to give it a kick to re-render.
    earliestSubmissionDateQuestion.title = earliestSubmissionDateQuestion.title + " ";
  }
};

export const collectPrevAddresses = sender => {
  let addressQuestions = [];
  const keys = ["street", "city", "country", "state", "postalCode", "phone", "fax", "email"];

  const validEntry = (question) => {
    let hasAllValues = true;
    for (const key of keys) {
      if (question[key] && !question.value[key]) {
        hasAllValues = false;
      }
    }

    if (hasAllValues) {
      addressQuestions.push(question.value);
    }
  };

  const validPanel = (panels) => {
    for (const panel of panels) {
      for (const question of panel.questions) {
        if (question.getType() === "address" && question.value) {
          validEntry(question);
        }
      }
    }
  };

  for (const page of sender.pages) {
    for (const question of page.questions) {
      if (question.getType() === "paneldynamic") {
        validPanel(question.panels);
      } else if (question.getType() === "address" && question.value) {
        validEntry(question);
      }
    }
  }

  const uniqueAddressQuestions = addressQuestions.filter(
    (value, index, self) =>
      index ===
      self.findIndex(
        check =>
          check.street === value.street &&
          check.city === value.city &&
          check.state === value.state &&
          check.country === value.country &&
          check.postalCode === value.postalCode &&
          check.email === value.email &&
          check.phone === value.phone &&
          check.fax === value.fax
      )
  );

  setPrevAddresses(uniqueAddressQuestions);
};

export const toNextQuestion = options => {
  const typesToSkip = [
    "address",
    "comment",
    "contactinfo",
    "expression",
    "helptext",
    "matrix",
    "matrixdropdown",
    "matrixdynamic",
    "multipletext",
    "personname",
    "ranking",
    "text"
  ];

  if (!options.question || typesToSkip.includes(options.question.getType())) return;
  if (options.question.survey.platformName != "vue") return; //Disable this for editor mode.

  const filterQuestions = questions => {
    return questions.filter(
      q => q.isVisible && q.getType() !== "helptext" && q.getType() !== "expression"
    );
  };

  const currQuestion = options.question;
  let filtered;
  let nextQuestion;

  if (currQuestion.getType() === "paneldynamic") {
    // avoid scrolling on dynamic panels until 
    return;
    
    // const panels = currQuestion?.panels;

    // for (let panel of panels) {
    //   filtered = filterQuestions(panel.questions);
    //   nextQuestion = filtered.find(q => !q.value);

    //   if (nextQuestion) {
    //     // check if question in panel is usable
    //     const currQuestionInPanel = filtered[filtered.indexOf(nextQuestion) - 1];
    //     if (currQuestionInPanel && typesToSkip.includes(currQuestionInPanel.getType())) {
    //       nextQuestion = null;
    //     }
    //     break;
    //   }
    // }
  }

  // if we are at the end of the panel, we get the next question the usual way
  if (!nextQuestion) {
    let questions = [];
    currQuestion.page.addQuestionsToList(questions, true);
    filtered = filterQuestions(questions);
    const indexOfNextQuestion = filtered.indexOf(currQuestion) + 1;
    nextQuestion = filtered[indexOfNextQuestion];
  }

  if (nextQuestion) {
    setTimeout(() => {
      const element = document.getElementById(nextQuestion.id);
      if (element) {
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY - 110, // leave room for the header
          behavior: "smooth"
        });
      }
    }, 1);
  }
};

export function onValueChanged(sender, options) {
  clearPanel(sender, options);
  determinePotentialApplicants(sender, options);
  determineRecipients(sender, options);
  populateApplicantInfoPanelAndP1DeliveryInfoPanel(sender, options);
  determineEarliestSubmissionDate(sender, options);
  setLastUpdated(new Date());
  collectPrevAddresses(sender);
  toNextQuestion(options);
}
