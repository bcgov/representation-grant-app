import Vue from "vue";
import AddressInfo from "./components/AddressInfo.vue";
import ContactInfo from "./components/ContactInfo.vue";
import CustomDate from "./components/CustomDate.vue";
import HelpText from "./components/HelpText.vue";
import InfoText from "./components/InfoText.vue";
import PersonName from "./components/PersonName.vue";
import YesNo from "./components/YesNo.vue";
import FormDownloadButton from "./components/FormDownloadButton.vue";
import ReviewAnswers from "./components/ReviewAnswers.vue";
import QuestionCombiner from "./components/QuestionCombiner.vue";
import SurveyText from "./components/SurveyText.vue";
import LongestDateFromPanel from "./components/LongestDateFromPanel.vue";
import { addCustomExpressions } from "./survey-expressions";

function initHelpText(Survey: any) {
  const widget = {
    name: "HelpText",
    title: "Expanding FAQ",
    iconName: "icon-panel",
    widgetIsLoaded: function() {
      return true;
    },
    isFit: function(question: any) {
      return question.getType() === "helptext";
    },
    activatedByChanged: function(activatedBy: any) {
      Survey.JsonObject.metaData.addClass("helptext", [], null, "empty");
      Survey.JsonObject.metaData.addProperties("helptext", [
        {
          name: "body:text",
          category: "general", // move the custom property in the general category
          visibleIndex: 3 // Moves the property at index 3 within the category
        }
      ]);
    },
    htmlTemplate: "<div></div>",
    afterRender: function(question, el) {
      if (question.survey.platformName == "vue") return;
      const ComponentClass = Vue.extend(HelpText);
      const card = new ComponentClass({
        propsData: { question: question, isSurveyEditor: true }
      });
      card.$mount();
      el.appendChild(card.$el);
    }
  };
  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "type");
}

function initInfoText(Survey: any) {
  const widget = {
    name: "InfoText",
    title: "Message Text",
    iconName: "icon-panel",
    widgetIsLoaded: function() {
      return true;
    },
    isFit: function(question: any) {
      return question.getType() === "infotext";
    },
    activatedByChanged: function(activatedBy: any) {
      Survey.JsonObject.metaData.addClass("infotext", [], null, "empty");
      Survey.JsonObject.metaData.addProperties("infotext", [
        {
          name: "body:text",
          category: "general",
          visibleIndex: 3
        },
        {
          name: "messageStyle",
          default: "info",
          choices: ["info", "inline", "error"],
          category: "general",
          visibleIndex: 4
        },
        {
          name: "displayTextBasedOffArrayQuestion",
          default: "",
          category: "general",
          visibleIndex: 5
        }
      ]);
    },
    htmlTemplate: "<div></div>",
    afterRender: function(question, el) {
      if (question.survey.platformName == "vue") return;
      const ComponentClass = Vue.extend(InfoText);
      const card = new ComponentClass({
        propsData: {
          question: question,
          isSurveyEditor: true
        }
      });
      card.$mount();
      el.appendChild(card.$el);
    }
  };
  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "type");
}

function initFormDownloadButton(Survey: any) {
  const widget = {
    name: "FormDownloadButton",
    title: "Form Download/Print Button",
    iconName: "icon-radiogroup",
    isDefaultRender: true,
    widgetIsLoaded: function() {
      return true;
    },
    isFit: function(question: any) {
      return question.getType() === "formdownloadbutton";
    },
    activatedByChanged: function(activatedBy: any) {
      Survey.JsonObject.metaData.addClass("formdownloadbutton", [], null, "empty");
      Survey.JsonObject.metaData.addProperties(
        "formdownloadbutton",
        [
          {
            name: "buttonTitle",
            default: "",
            category: "general",
            visibleIndex: 2
          },
          {
            name: "pdfType",
            default: "",
            category: "general",
            visibleIndex: 3
          }
        ],
        null,
        "empty"
      );
    },
    htmlTemplate: "<div></div>",
    afterRender: function(question, el) {
      if (question.survey.platformName == "vue") return;
      const ComponentClass = Vue.extend(FormDownloadButton);
      const card = new ComponentClass({
        propsData: { question: question, isSurveyEditor: true }
      });
      card.$mount();
      el.appendChild(card.$el);
    }
  };
  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "type");
}

function initQuestionCombiner(Survey: any) {
  const widget = {
    name: "QuestionCombiner",
    title: "Question Combiner",
    iconName: "icon-radiogroup",
    isDefaultRender: true,
    widgetIsLoaded: function() {
      return true;
    },
    isFit: function(question: any) {
      return question.getType() === "questioncombiner";
    },
    activatedByChanged: function(activatedBy: any) {
      Survey.JsonObject.metaData.addClass(
        "questioncombiner",
        [
          {
            name: "inputExpression1",
            category: "general"
          },
          {
            name: "inputExpression2",
            category: "general"
          },
          {
            name: "inputExpression3",
            category: "general"
          },
          {
            name: "inputExpression4",
            category: "general"
          },
          {
            name: "inputExpression5",
            category: "general"
          }
        ],
        null,
        "empty"
      );
    },
    htmlTemplate: "<div></div>",
    afterRender: function(question, el) {
      if (question.survey.platformName == "vue") return;
      const ComponentClass = Vue.extend(QuestionCombiner);
      const card = new ComponentClass({
        propsData: { question: question, isSurveyEditor: true }
      });
      card.$mount();
      el.appendChild(card.$el);
    }
  };
  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "type");
}

function initYesNo(Survey: any) {
  const widget = {
    name: "YesNo",
    title: "Yes/No",
    iconName: "icon-radiogroup",
    isDefaultRender: true,
    widgetIsLoaded: function() {
      return true;
    },
    isFit: function(question: any) {
      return question.getType() === "yesno";
    },
    activatedByChanged: function(activatedBy: any) {
      Survey.JsonObject.metaData.addClass("yesno", [], null, "empty");
    },
    htmlTemplate: "<div></div>",
    afterRender: function(question, el) {
      if (question.survey.platformName == "vue") return;
      const ComponentClass = Vue.extend(YesNo);
      const card = new ComponentClass({
        propsData: { question: question }
      });
      card.$mount();
      el.appendChild(card.$el);
    }
  };
  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "type");
}

function initAddressBlock(Survey: any) {
  const widget = {
    name: "AddressInfo",
    title: "Postal Address",
    iconName: "icon-multipletext",
    widgetIsLoaded: function() {
      return true;
    },
    isFit: function(question: any) {
      return question.getType() === "address";
    },
    activatedByChanged: function(activatedBy: any) {
      Survey.JsonObject.metaData.addClass(
        "address",
        [
          {
            name: "referLabel:text"
          }
        ],
        null,
        "empty"
      );
    },
    htmlTemplate: "<div></div>",
    afterRender: function(question, el) {
      if (question.survey.platformName == "vue") return;
      const ComponentClass = Vue.extend(AddressInfo);
      const card = new ComponentClass({
        propsData: { question: question }
      });
      card.$mount();
      el.appendChild(card.$el);
    }
  };
  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "type");
}

function initPersonName(Survey: any) {
  const widget = {
    name: "PersonName",
    title: "Person Name",
    iconName: "icon-multipletext",
    widgetIsLoaded: function() {
      return true;
    },
    isFit: function(question: any) {
      return question.getType() === "personname";
    },
    activatedByChanged: function(activatedBy: any) {
      Survey.JsonObject.metaData.addClass(
        "personname",
        [
          {
            name: "defaultSubstitution:text"
          },
          {
            name: "labelFirstName:text"
          },
          {
            name: "labelMiddleName:text"
          },
          {
            name: "labelLastName:text"
          },
          {
            name: "descFirstName:text"
          },
          {
            name: "descMiddleName:text"
          },
          {
            name: "descLastName:text"
          }
        ],
        null,
        "empty"
      );
    },
    getDisplayValue: function(question: any) {
      const name = question.value;
      if (name)
        return [name.first, name.middle, name.last]
          .map(p => p.trim())
          .filter(p => p)
          .join(" ");
      return question.defaultSubstitution;
    },
    htmlTemplate: "<div></div>",
    afterRender: function(question, el) {
      if (question.survey.platformName == "vue") return;
      const ComponentClass = Vue.extend(PersonName);
      const card = new ComponentClass({
        propsData: { question: question }
      });
      card.$mount();
      el.appendChild(card.$el);
    }
  };
  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "type");
}

function initContactInfoBlock(Survey: any) {
  const widget = {
    name: "ContactInfo",
    title: "Contact Info",
    iconName: "icon-multipletext",
    widgetIsLoaded: function() {
      return true;
    },
    isFit: function(question: any) {
      return question.getType() === "contactinfo";
    },
    htmlTemplate: "<div></div>",
    activatedByChanged: function(activatedBy: any) {
      Survey.JsonObject.metaData.addClass(
        "contactinfo",
        [
          {
            name: "labelEmail:text"
          },
          {
            name: "labelFax:text"
          },
          {
            name: "labelPhone:text"
          }
        ],
        null,
        "empty"
      );
    },
    afterRender: function(question, el) {
      if (question.survey.platformName == "vue") return;
      const ComponentClass = Vue.extend(ContactInfo);
      const card = new ComponentClass({
        propsData: { question: question, isSurveyEditor: true }
      });
      card.$mount();
      el.appendChild(card.$el);
    }
  };
  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "type");
}

function initCustomDate(Survey: any) {
  const widget = {
    name: "CustomDate",
    title: "Date Input",
    iconName: "icon-date",
    widgetIsLoaded: function() {
      return true;
    },
    isFit: function(question: any) {
      return question.getType() === "customdate";
    },
    htmlTemplate: "<div></div>",
    activatedByChanged: function(activatedBy: any) {
      Survey.JsonObject.metaData.addClass("customdate", [], null, "empty");
      Survey.JsonObject.metaData.addProperties("customdate", [
        {
          name: "dateYearsAhead:number",
          default: 0
        },
        {
          name: "dateYearsBehind:number",
          default: 100
        }
      ]);
    },
    afterRender: function(question, el) {
      if (question.survey.platformName == "vue") return;
      const ComponentClass = Vue.extend(CustomDate);
      const card = new ComponentClass({
        propsData: { question: question }
      });
      card.$mount();
      el.appendChild(card.$el);
    }
  };
  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "property");
}

function initReviewAnswers(Survey: any) {
  const widget = {
    name: "ReviewAnswers",
    title: "Review Answers",
    iconName: "icon-radiogroup",
    isDefaultRender: true,
    widgetIsLoaded: function() {
      return true;
    },
    isFit: function(question: any) {
      return question.getType() === "reviewanswers";
    },
    activatedByChanged: function(activatedBy: any) {
      Survey.JsonObject.metaData.addClass("reviewanswers", [], null, "empty");
      Survey.JsonObject.metaData.addProperties("reviewanswers", [
        {
          name: "reviewQuestions:text",
          category: "general",
          visibleIndex: 3
        }
      ]);
    },
    htmlTemplate: "<div></div>",
    afterRender: function(question, el) {
      const ComponentClass = Vue.extend(ReviewAnswers);
      const card = new ComponentClass({
        propsData: { question: question, isSurveyEditor: true }
      });
      card.$mount();
      el.appendChild(card.$el);
    }
  };
  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "type");
}

const initLongestDateFromPanel = (Survey: any) => {
  const widget = {
    name: "longestdatefrompanel",
    title: "Longest Date From Panel",
    iconName: "icon-radiogroup",
    isDefaultRender: true,
    widgetIsLoaded: function() {
      return true;
    },
    isFit: function(question: any) {
      return question.getType() === "longestdatefrompanel";
    },
    activatedByChanged: function(activatedBy: any) {
      Survey.JsonObject.metaData.addClass("longestdatefrompanel", [], null, "empty");
      Survey.JsonObject.metaData.addProperties("longestdatefrompanel", [
        {
          name: "panelName:string",
          category: "general",
          visibleIndex: 3
        },
        {
          name: "panelField:string",
          category: "general",
          visibleIndex: 4
        }
      ]);
    },
    htmlTemplate: "<div></div>",
    afterRender: function(question, el) {
      const ComponentClass = Vue.extend(LongestDateFromPanel);
      const card = new ComponentClass({
        propsData: { question: question, isSurveyEditor: true }
      });
      card.$mount();
      el.appendChild(card.$el);
    }
  };
  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "type");
};

// This hijacks the text, which we've copied over from SurveyLibrary/src/vue.
// These text improvements, allow for default Substitution.
const addToInputText = Survey => {
  Survey.JsonObject.metaData.addProperties("text", [
    {
      name: "defaultSubstitution:text",
      category: "general",
      visibleIndex: 3
    }
  ]);

  Survey.CustomWidgetCollection.Instance.addCustomWidget(
    {
      name: "textImprovements",
      isDefaultRender: true,
      isFit: question => {
        return question.getType() === "text";
      },
      widgetIsLoaded: function() {
        return true;
      },
      htmlTemplate: "<div></div>",
      afterRender: function(question, el) {
        if (question.survey.platformName == "vue") return;
        const ComponentClass = Vue.extend(SurveyText);
        const card = new ComponentClass({
          propsData: { question: question }
        });
        card.$mount();
        el.parentNode.appendChild(card.$el);
        el.parentNode.removeChild(el);
      }
    },
    "type"
  );
};

export function addQuestionTypes(Survey: any) {
  // fixCheckboxes(Survey);
  addToInputText(Survey);
  initReviewAnswers(Survey);
  initFormDownloadButton(Survey);
  initYesNo(Survey);
  initInfoText(Survey);
  initHelpText(Survey);
  initPersonName(Survey);
  initAddressBlock(Survey);
  initContactInfoBlock(Survey);
  initCustomDate(Survey);
  initQuestionCombiner(Survey);
  initLongestDateFromPanel(Survey);
  addCustomExpressions(Survey);
}

export function addToolboxOptions(editor: any) {
  editor.toolbox.addItem({
    title: "---Custom---"
  });
  editor.toolbox.addItem({
    name: "yesno",
    title: "Yes/No Choice",
    isCopied: true,
    iconName: "icon-radiogroup",
    json: {
      type: "yesno"
    }
  });
  editor.toolbox.addItem({
    name: "helptext",
    title: "Expanding FAQ",
    isCopied: true,
    iconName: "icon-panel",
    json: {
      type: "helptext",
      titleLocation: "hidden"
    }
  });
  editor.toolbox.addItem({
    name: "infotext",
    title: "Message Text",
    isCopied: true,
    iconName: "icon-panel",
    json: {
      type: "infotext",
      titleLocation: "hidden"
    }
  });
  editor.toolbox.addItem({
    name: "personname",
    title: "Name Input",
    isCopied: true,
    iconName: "icon-multipletext",
    json: {
      type: "personname"
    }
  });
  editor.toolbox.addItem({
    name: "address",
    title: "Postal Address",
    isCopied: true,
    iconName: "icon-multipletext",
    json: {
      type: "address"
    }
  });
  editor.toolbox.addItem({
    name: "contactinfo",
    title: "Contact Information",
    isCopied: true,
    iconName: "icon-multipletext",
    json: {
      type: "contactinfo"
    }
  });
  editor.toolbox.addItem({
    name: "formdownloadbutton",
    title: "Form Download/Print button",
    isCopied: true,
    iconName: "icon-multipletext",
    json: {
      type: "formdownloadbutton"
    }
  });
  editor.toolbox.addItem({
    name: "reviewanswers",
    title: "Review Answers",
    isCopied: true,
    iconName: "icon-checkbox",
    json: {
      type: "reviewanswers"
    }
  });
  editor.toolbox.addItem({
    name: "questioncombiner",
    title: "Question Combiner",
    isCopied: true,
    iconName: "icon-multipletext",
    json: {
      type: "questioncombiner"
    }
  });
  editor.toolbox.addItem({
    name: "longestdatefrompanel",
    title: "Longest Date from Panel",
    isCopied: true,
    iconName: "icon-multipletext",
    json: {
      type: "longestdatefrompanel"
    }
  });
  editor.toolbox.addItem({
    name: "customdate",
    title: "Custom Date",
    isCopied: true,
    iconName: "icon-multipletext",
    json: {
      type: "customdate"
    }
  });
}
