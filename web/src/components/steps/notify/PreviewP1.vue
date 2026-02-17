<template>
    <div v-if="dataReady" >
        <page-base :disableNext="disableNext" v-on:onPrev="onPrev()" v-on:onNext="onNext()" >
             <survey v-if="pdfBodyReady" v-bind:survey="survey"></survey>
            <form-p1 @onPrint="onPrint"/>
        </page-base>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue} from 'vue-property-decorator';
import FormP1 from  "./pdf/FormP1.vue"
import PageBase from "@/components/steps/PageBase.vue";
import _ from 'underscore';

import * as SurveyVue from "survey-vue";
import surveyJson from "./forms/preview-p1.json";
import * as surveyEnv from "@/components/survey/survey-glossary"

import { namespace } from "vuex-class";   
import "@/store/modules/application";
const applicationState = namespace("Application");

import {stepsAndPagesNumberInfoType} from "@/types/Application/StepsAndPages"
import { stepInfoType } from '@/types/Application';
import { togglePages, toggleStep } from '@/components/utils/TogglePages';

@Component({
    components:{
        FormP1,
        PageBase
    }
})
export default class PreviewP1 extends Vue {

    @Prop({required: true})
    step!: stepInfoType;

    @applicationState.State
    public steps!: stepInfoType[];

    @applicationState.State
    public stPgNo!: stepsAndPagesNumberInfoType;
    
    @applicationState.State
    public applicantName!: string;

    @applicationState.State
    public deceasedName!: string;
        
    survey = new SurveyVue.Model(surveyJson);

    currentStep = 0;
    currentPage = 0;
    disableNext = true;
    dataReady = false;
    pdfBodyReady = false;
    pdfBody

    beforeCreate() {
        const Survey = SurveyVue;
        surveyEnv.setCss(Survey);
        surveyEnv.loadGlossary();
    }

    mounted(){
        this.dataReady = false;
        this.disableNext = true;
        this.currentStep = this.$store.state.Application.currentStep;
        this.currentPage = this.$store.state.Application.steps[this.currentStep].currentPage;
        this.initializeSurvey();
        this.addSurveyListener();
        this.reloadPageInformation();
        this.dataReady = true;
        window.scrollTo(0, 0);
    }
    
    public initializeSurvey(){
        this.survey = new SurveyVue.Model(surveyJson);
        this.survey.commentPrefix = "Comment";
        this.survey.showQuestionNumbers = "off";
        this.survey.showNavigationButtons = false;
        surveyEnv.setGlossaryMarkdown(this.survey);
    }

    public addSurveyListener(){
        this.survey.onValueChanged.add((sender, options) => {            
            
            if(options.name == 'notifyP1DownloadButton'){  
                this.survey.setValue("buttonSpinner",true);
                this.onPrint(this.pdfBody, true)
            }           
        })   
    }

    public reloadPageInformation() {
        //console.log(this.step.result)
        if (this.step.result && this.step.result["previewP1Survey"]){
            this.survey.data = this.step.result["previewP1Survey"].data;
        } 

        this.currentPage = this.$store.state.Application.steps[this.currentStep].currentPage;
        Vue.filter('setSurveyProgress')(this.survey, this.currentStep, this.currentPage, 50, false);
        
        this.survey.setVariable("deceasedName", Vue.filter('getFullName')(this.deceasedName));
        this.survey.setValue("buttonSpinner",false)
        this.checkErrorOnPages()
    }

    public onPrint(body, openDownload?) {
        this.pdfBody = body;
        this.pdfBodyReady = true;
        const applicationId = this.$store.state.Application.id;        
        const url = `/survey-print/${applicationId}/?name=formp1&pdf_type=formp1&version=1.0`
        const options = {
            responseType: "blob",
            headers: {
            "Content-Type": "application/json",
            }
        }
        this.$http.post(url,body, options).then(res => {
            if(openDownload){
                const blob = res.data;
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                document.body.appendChild(link);
                link.download = "FormP1.pdf";
                link.click();
                setTimeout(() => URL.revokeObjectURL(link.href), 1000);
                this.survey.setValue("buttonSpinner",false);
            }else{
                this.EnableNext()
            }
        },err => {
            console.error(err);        
        });
    }

    public EnableNext(){
        const deceasedInfo = this.steps[this.stPgNo.DECEASED._StepNo].result?.informationAboutDeceasedSurvey?.data;
        const isFirstNation = deceasedInfo.deceasedFirstNations =='y';
        Vue.filter('setSurveyProgress')(null, this.currentStep, this.currentPage, 100, false);
        // Vue.filter('setSurveyProgress')(null, this.currentStep, this.stPgNo.NOTIFY.NotifyPeople, 50, false);       
        const relatedPeopleInfo = Vue.filter('getRelatedPeopleInfo')(this.steps[this.stPgNo.RELATIONS._StepNo], true, true, false, false, true, false);
        const listOfNotifyingPeople = relatedPeopleInfo.filter(related => related != this.applicantName)
        
        togglePages([this.stPgNo.NOTIFY.NotifyPeople, this.stPgNo.NOTIFY.PreviewP9], (listOfNotifyingPeople.length>0 || isFirstNation) , this.currentStep)
        this.disableNext=false;        
    }


    public checkErrorOnPages(){
        const stepsArr = _.range(0, Object.keys(this.stPgNo).length)    
        const optionalStepNames = ["NEXT"] 
        const optionalPageNames = ["NotifyPeople", "PreviewP1", "PreviewPGT", "PreviewP9"]
        for(const stepIndex of stepsArr){
            const step = this.$store.state.Application.steps[stepIndex]
            if(step.active && optionalStepNames.indexOf(step.name) == -1){
                for(const page of step.pages){
                    if(page.active && page.progress!=100 && optionalPageNames.indexOf(page.name) == -1){
                        this.$store.commit("Application/setCurrentStep", step.id);
                        this.$store.commit("Application/setCurrentStepPage", {currentStep: step.id, currentPage: page.key });                        
                        return false;
                    }
                }
            }
        }
        return true;        
    }



    public onPrev() {
        Vue.prototype.$UpdateGotoPrevStepPage()
    }

    public onNext() {
        Vue.prototype.$UpdateGotoNextStepPage()
    }

    beforeDestroy() {
        const progress = this.dataReady && !this.disableNext? 100: 50
        Vue.filter('setSurveyProgress')(null, this.currentStep, this.currentPage, progress, true);
    }

}
</script>