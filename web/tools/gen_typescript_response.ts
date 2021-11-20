var path = require('path');
var BuiltinModule = require("module");
//Resolve our vue files with a blank.ts, this will allow the code to execute.
var Module = module.constructor.length > 1 ? module.constructor : BuiltinModule;
var oldResolveFilename = Module._resolveFilename;
Module._resolveFilename = function(request, parentModule, isMain, options) {
  if (request.includes(".vue"))
    return "blank.ts";
  return oldResolveFilename.call(this, request, parentModule, isMain, options);
};

import * as Survey from "survey-vue";
import { readFileSync, writeFileSync } from "fs";
import { addQuestionTypes } from "../src/components/survey/question-types/question-types";
const json = readFileSync("../src/components/steps/survey-primary.json").toString();

export const generateSurveyModels = () => {
  addQuestionTypes(Survey);
  const survey = new Survey.SurveyModel(json);
  const filePath = path.join(__dirname, "../../../src/types/survey-primary.ts");
  console.log(`Generating response, writing to file ${filePath}`);

  let data = "// This is autogenerated by tools/gen_typescript_response.ts. \n";
  data += `export interface SurveyPrimary {\n`;
  survey.getAllQuestions().forEach(function(question) {
    //survey.setValue(question.name, "test"); This is slow, but generates the correct model.
    //console.log(`${question.name}? - ${question.getType()}`);
    console.log(`${question.name}?: string`);
    if (question.name.includes("?"))
      data += `\t\"${question.name}\"?: string\n`;
    else 
      data += `\t${question.name}?: string\n`;
  });
  data += '}\n';
  writeFileSync(filePath, data, {encoding:'utf8',flag:'w'})
};

generateSurveyModels();
