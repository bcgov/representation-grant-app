import showdown from "showdown";
import { ExpressionRunner } from "survey-vue";
import { convertCodeMarkupToToolTip } from "@/utils/utils";
//This is the regular instance, not SurveyKO module.
export function addCustomTemplating(surveyRuntime: any) {
  surveyRuntime.onProcessTextValue.add(function(sender, options) {
    // Note: I tried displayIf here, but since one of the parameters can be a question,
    // it didn't seem to handle nested {{}} inside of functions.

    //Description: Print bulleted list from array.
    //Usage: bullets(<panel>.<fieldname>)
    if (options.name?.includes("bullets(")) {
      const data = `${options.name.replace("bullets(", "").replace(")", "")}`;
      const targetName = data.split(".")[0];
      const key = data.split(".")[1];
      const question = sender.getQuestionByName(targetName)?.value;
      if (question) {
        const bullets = [];
        question.forEach(function(element) {
          const value = `${key?.length > 0 ? element[key] : element}`;
          if (value) bullets.push(`<li>${value}</li>`);
        });
        options.value = bullets.join("\r\n");
      } else {
        options.value = "";
      }
      options.isExists = true;
    }
    //Description: Print out entire panel content.
    //Usage: printPanel(panelName)
    if (options.name?.includes("printPanel(")) {
      const targetName = `${options.name.replace("printPanel(", "").replace(")", "")}`;
      const panelData = sender.getQuestionByName(targetName).value;
      options.value = JSON.stringify(panelData);
      options.isExists = true;
    }
  });

  //This templates HTML in the TestSurvey.
  //Also fills in displayIf.
  surveyRuntime.onTextMarkdown.add(function(survey, options) {
    if (options.text.includes("displayIf(")) {
      const split = options.text.match(/displayIf/g);
      for (let i = 0; i < split.length; i++) {
        const startIndex = options.text.indexOf("displayIf(");
        const endIndex = options.text.indexOf(")}");
        const displayIfLength = "displayIf(".length;
        const targetString = `${options.text.substring(startIndex + displayIfLength, endIndex)}`;
        const index = targetString.indexOf(",");
        const params = [targetString.slice(0, index), targetString.slice(index + 1)];
        const value = new ExpressionRunner(params[0]).run({});
        options.text =
          options.text.slice(0, startIndex - 1) +
          (value !== false ? params[1] : "") +
          options.text.substring(endIndex + 2, options.text.length);
      }
    }
    let str = new showdown.Converter().makeHtml(options.text);
    //Remove <p> tags.
    const m = str.match(/^<p>(.*)<\/p>$/);
    str = str.substring(3);
    if (m) {
      str = m[1];
    }
    if (survey.platformName === "vue") {
      str = convertCodeMarkupToToolTip(str);
    }
    // Sometimes if there is no text, it will display the default.
    options.html = str;
  });
}