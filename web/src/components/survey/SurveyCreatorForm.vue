<template>
    <div id="surveyCreatorContainer"></div> 
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';


import * as SurveyCreator from "survey-creator";
import "survey-creator/survey-creator.css"


import {addToolboxOptions, addQuestionTypes } from "./question-typesII";
import * as widgets from 'surveyjs-widgets';
import * as SurveyKO from "survey-knockout";

@Component
export default class SurveyCreatorForm extends Vue {
    editor: SurveyCreator.SurveyCreator;
    mounted()
    {
        this.initSurvey();
        widgets.inputmask(SurveyKO);
        addQuestionTypes(SurveyKO);
        const editorOptions = {
            isAutoSave: true,
            showLogicTab: true,
            // showTestSurveyTab: false,
            // showPropertyGrid: "right",
            showToolbox: "right"
        };
        const editor = (new SurveyCreator.SurveyCreator(
            "surveyCreatorContainer",
            editorOptions
        ));
            
        addToolboxOptions(editor);
    }

    initSurvey() {
        const surveyCssCls = SurveyKO.defaultBootstrapCss;
        surveyCssCls.page.root = "sv_page";
        surveyCssCls.pageDescription = "sv_page_description";
        surveyCssCls.page.description = "sv_page_description";
        surveyCssCls.pageTitle = "sv_page_title";
        surveyCssCls.page.title = "sv_page_title";
        surveyCssCls.navigationButton = "btn btn-primary";
        surveyCssCls.question.title = "sv_q_title";
        surveyCssCls.question.description = "sv_q_description";
        surveyCssCls.panel.description = "sv_p_description";
        surveyCssCls.matrixdynamic.button = "btn btn-primary";
        surveyCssCls.paneldynamic.button = "btn btn-primary";
        surveyCssCls.paneldynamic.root = "sv_p_dynamic";
        surveyCssCls.checkbox.item = "sv-checkbox";
        surveyCssCls.checkbox.controlLabel = "sv-checkbox-label";
        surveyCssCls.checkbox.materialDecorator = "";
        surveyCssCls.radiogroup.item = "sv-radio";
        surveyCssCls.radiogroup.controlLabel = "sv-checkbox-label";
        surveyCssCls.radiogroup.materialDecorator = "";

        const mainColor = "#38598a";
        const mainHoverColor = "#2d476f";
        const textColor = "#494949";
        const headerColor = "#555";
        const headerBackgroundColor = "#4a4a4a";
        const bodyContainerBackgroundColor = "#f8f8f8";
        const borderColor = "#aaa";

        const surveyThemeColors = SurveyKO.StylesManager.ThemeColors["default"];
        surveyThemeColors["$main-color"] = mainColor;
        surveyThemeColors["$main-hover-color"] = mainHoverColor;
        surveyThemeColors["$text-color"] = textColor;
        surveyThemeColors["$header-color"] = headerColor;
        surveyThemeColors["$header-background-color"] = headerBackgroundColor;
        surveyThemeColors["$body-container-background-color"] = bodyContainerBackgroundColor;

        const editorThemeColors =
        SurveyCreator.StylesManager.ThemeColors["default"];
        editorThemeColors["$primary-color"] = mainColor;
        editorThemeColors["$secondary-color"] = mainColor;
        editorThemeColors["$primary-border-color"] = borderColor;
        editorThemeColors["$secondary-border-color"] = borderColor;
        editorThemeColors["$primary-hover-color"] = mainHoverColor;
        editorThemeColors["$primary-text-color"] = textColor;
        editorThemeColors["$selection-border-color"] = mainColor;

        // SurveyCreator.StylesManager.applySurveyTheme = () => null; // disable editor's reference to survey theme
        SurveyKO.StylesManager.applyTheme("bootstrap");
        SurveyCreator.StylesManager.applyTheme("bootstrap");        
    }

}
</script>

