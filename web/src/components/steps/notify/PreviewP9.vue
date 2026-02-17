<template>
    <div v-if="dataReady" >
        <page-base :disableNext="disableNext" v-on:onPrev="onPrev()" v-on:onNext="onNext()" >
             <survey v-if="pdfBodyReady" v-bind:survey="survey"></survey>
            <form-p9 @onPrint="onPrint"/>
        </page-base>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue} from 'vue-property-decorator';
import FormP9 from  "./pdf/FormP9.vue"
import PageBase from "@/components/steps/PageBase.vue";
import _ from 'underscore';
import moment from 'moment-timezone';

import * as SurveyVue from "survey-vue";
import surveyJson from "./forms/preview-p9.json";
import * as surveyEnv from "@/components/survey/survey-glossary"

import { namespace } from "vuex-class";   
import "@/store/modules/application";
const applicationState = namespace("Application");

import {stepsAndPagesNumberInfoType} from "@/types/Application/StepsAndPages"
import { stepInfoType } from '@/types/Application';
import { togglePages, toggleStep } from '@/components/utils/TogglePages';

@Component({
    components:{
        FormP9,
        PageBase
    }
})
export default class PreviewP9 extends Vue {

    @Prop({required: true})
    step!: stepInfoType;

    @applicationState.State
    public steps!: stepInfoType[]; 

    @applicationState.State
    public stPgNo!: stepsAndPagesNumberInfoType;
    
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
            
            if(options.name == 'notifyP9DownloadButton'){  
                this.survey.setValue("buttonSpinner",true);
                this.onPrint(this.pdfBody, true)
            }           
        })   
    }

    public reloadPageInformation() {
        //console.log(this.step.result)
        if (this.step.result && this.step.result["previewP9Survey"]){
            this.survey.data = this.step.result["previewP9Survey"].data;
        } 

        this.currentPage = this.$store.state.Application.steps[this.currentStep].currentPage;
        Vue.filter('setSurveyProgress')(this.survey, this.currentStep, this.currentPage, 50, false);

        this.calculateNoticeDeadline();
        
        this.survey.setVariable("deceasedName", Vue.filter('getFullName')(this.deceasedName));
        this.survey.setValue("buttonSpinner",false)
        this.checkErrorOnPages()
    }

    public onPrint(body, openDownload?) {
        this.pdfBody = body;
        this.pdfBodyReady = true;
        const applicationId = this.$store.state.Application.id;        
        const url = `/survey-print/${applicationId}/?name=formp9&pdf_type=formp9&version=1.0`
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
                link.download = "FormP9.pdf";
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

    public calculateNoticeDeadline(){

        const notifyDates = [];

        const notifyInfo = this.steps[this.stPgNo.NOTIFY._StepNo].result?.notifyPeopleSurvey?.data
        if(notifyInfo?.totalRecipients>0){
            for(let inx=0;inx<notifyInfo?.totalRecipients; inx++){                
                const notifyDate = notifyInfo?.[`notifyP1DeliveryDate[${inx}]`];                
                const notifyDatePlus21 = moment(notifyDate).add(22, 'days');               
                notifyDates.push(notifyDatePlus21);               
            }
        }        
        const earliestFilingDate = moment.max(notifyDates);        

        this.survey.setVariable("earliestSubmissionDate", moment(earliestFilingDate).format("MMMM DD, YYYY"));

    }

    public EnableNext(){
        Vue.filter('setSurveyProgress')(null, this.currentStep, this.currentPage, 100, false);
        toggleStep([this.stPgNo.NEXT._StepNo],true)
        togglePages([this.stPgNo.NEXT.FormP5], true, this.stPgNo.NEXT._StepNo);
        this.disableNext=false;        
    }

    public checkErrorOnPages(){
        const stepsArr = _.range(0, Object.keys(this.stPgNo).length)    
        const optionalStepNames = ["NEXT"] 
        const optionalPageNames = ["PreviewP1", "PreviewPGT", "NotifyPeople", "PreviewP9"]
        for(const stepIndex of stepsArr){
            const step = this.$store.state.Application.steps[stepIndex]
            if(step.active && optionalStepNames.indexOf(step.name) == -1){
                for(const page of step.pages){
                    if(page.active && page.progress!=100 && optionalPageNames.indexOf(page.name) == -1){ 
                        toggleStep([this.stPgNo.NEXT._StepNo],false)                  
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