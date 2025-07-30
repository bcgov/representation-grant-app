<template>
    <page-base :disableNext="disableNextButton" v-on:onPrev="onPrev()" v-on:onNext="onNext()">
        <survey v-bind:survey="survey"></survey>
    </page-base>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';    

import * as SurveyVue from "survey-vue";
import surveyJson from "./forms/applicant-service.json";
import * as surveyEnv from "@/components/survey/survey-glossary"

import PageBase from "../PageBase.vue";
import { stepInfoType, stepResultInfoType } from "@/types/Application";

import { namespace } from "vuex-class";   
import "@/store/modules/application";
const applicationState = namespace("Application");

import "@/store/modules/common";
import { stepsAndPagesNumberInfoType } from '@/types/Application/StepsAndPages';
const commonState = namespace("Common");

@Component({
    components:{
        PageBase
    }
})
export default class ApplicantService extends Vue {
        
    @Prop({required: true})
    step!: stepInfoType;

    @applicationState.State
    public stPgNo!: stepsAndPagesNumberInfoType;

    @commonState.State
    public locationsInfo!: any[];

    @applicationState.State
    public steps!: stepInfoType[];    

    @applicationState.State
    public deceasedName!: string;    

    @applicationState.Action
    public UpdateStepResultData!: (newStepResultData: stepResultInfoType) => void

    @applicationState.Action
    UpdateApplicationLocation!: (newApplicationLocation) => void

    @applicationState.Action
    public UpdateGeneratedForms!: (newGeneratedForms) => void

    survey = new SurveyVue.Model(surveyJson);
    surveyJsonCopy; 
    disableNextButton = false;   
    currentStep =0;
    currentPage =0;   
    relatedPeopleInfo: string[]=[];

    @Watch('pageIndex')
    pageIndexChange(newVal) 
    {
        this.survey.currentPageNo = newVal;        
    }

    beforeCreate() {
        const Survey = SurveyVue;
        surveyEnv.setCss(Survey);
        surveyEnv.loadGlossary();
    }

    created() {
        this.disableNextButton = false
        if (this.step.result?.applicantServiceSurvey) { 
            this.disableNextButton = false;
        }
    }

    mounted(){        
        
        this.initializeSurvey();
        this.addSurveyListener();
        this.reloadPageInformation();
    }

    public initializeSurvey(){        
        this.adjustSurveyForLocations();
        this.survey = new SurveyVue.Model(this.surveyJsonCopy);
        this.survey.commentPrefix = "Comment";
        this.survey.showQuestionNumbers = "off";
        this.survey.showNavigationButtons = false;
        surveyEnv.setGlossaryMarkdown(this.survey);
    } 
    
    // public adjustSurveyForRelatedPeople(){

    //     this.relatedPeopleInfo = Vue.filter('getRelatedPeopleInfo')(this.step);
    //     this.surveyJsonCopy = JSON.parse(JSON.stringify(surveyJson));
     
    //     this.surveyJsonCopy.pages[0].elements[1].elements[0]["choices"]=[];      
        
    //     for(const relatedPerson of this.relatedPeopleInfo){
    //         this.surveyJsonCopy.pages[0].elements[1].elements[0]["choices"].push(relatedPerson)
    //     }        
       
    // }

    public adjustSurveyForLocations(){ 

        this.surveyJsonCopy = JSON.parse(JSON.stringify(surveyJson));
        
        this.surveyJsonCopy.pages[0].elements[8]["choices"] = [];
        
        for(const location of this.locationsInfo){            
            this.surveyJsonCopy.pages[0].elements[8]["choices"].push({value:location["name"]+" ("+location["id"]+")", text: location["name"]})
        }
        
        // Manually add Port Coquitlam Law Courts option
        this.surveyJsonCopy.pages[0].elements[8]["choices"].push({
            value: "Port Coquitlam Law Courts (9999)", 
            text: "Port Coquitlam Law Courts"
        });
    }
    
    public addSurveyListener(){
        this.survey.onValueChanged.add((sender, options) => {
                        
            if(this.survey?.data?.applicantHasLawyer == 'y'){
                this.disableNextButton = true;
            }else if(this.survey?.data?.applicantHasLawyer == 'n'){
                this.disableNextButton = false;
            }

            if(options.name=='applicantCourthouse'){                                
                const courtLocation = this.locationsInfo.find(location => location["name"]+" ("+location["id"]+")" == options.value);                
                this.UpdateApplicationLocation(courtLocation)
            }            
        })   
    }

    public reloadPageInformation() {
        
        if (this.step.result?.applicantServiceSurvey?.data){
            this.survey.data = this.step.result.applicantServiceSurvey.data;
        }        
        
        this.currentStep = this.$store.state.Application.currentStep;
        this.currentPage = this.$store.state.Application.steps[this.currentStep].currentPage;
        Vue.filter('setSurveyProgress')(this.survey, this.currentStep, this.currentPage, 50, false);
        
        this.survey.setVariable("deceasedName", Vue.filter('getFullName')(this.deceasedName));       
    }

    public onPrev() {
        Vue.prototype.$UpdateGotoPrevStepPage()
    }

    public onNext() {
        if(!this.survey.isCurrentPageHasErrors)    
            Vue.prototype.$UpdateGotoNextStepPage()
    }

    beforeDestroy() {
        Vue.filter('setSurveyProgress')(this.survey, this.currentStep, this.currentPage, 50, true);
        this.UpdateStepResultData({step:this.step, data: {applicantServiceSurvey: Vue.filter('getSurveyResults')(this.survey, this.currentStep, this.currentPage)}});
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "../../../styles/survey";
</style>
