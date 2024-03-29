<template>
    <page-base v-on:onPrev="onPrev()" v-on:onNext="onNext()" v-on:onComplete="onComplete()">
        <survey v-bind:survey="survey"></survey>
    </page-base>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch} from 'vue-property-decorator';

import * as SurveyVue from "survey-vue";
import * as surveyEnv from "@/components/survey/survey-glossary";
import surveyJson from "./forms/land.json";

import PageBase from "../PageBase.vue";
import { belongingsInfoType, stepInfoType, stepResultInfoType } from "@/types/Application";

import { namespace } from "vuex-class";   
import "@/store/modules/application";
const applicationState = namespace("Application");

@Component({
    components:{
        PageBase
    }
})

export default class Land extends Vue {
    
    @Prop({required: true})
    step!: stepInfoType;

    @applicationState.State
    public steps!: stepInfoType[];

    @applicationState.State
    public currentStep!: number;

    @applicationState.State
    public deceasedName!: string;

    @applicationState.State
    public noWillNotifyStepRequired!: boolean;

    @applicationState.State
    public deceasedDateOfDeath!: string;

    @applicationState.State
    public deceasedDateOfDeathPlus4!: string;

    @applicationState.State
    public landCompleted!: boolean;

    @applicationState.State
    public vehiclesCompleted!: boolean;

    @applicationState.State
    public bankAccountsCompleted!: boolean;

    @applicationState.State
    public pensionCompleted!: boolean;

    @applicationState.State
    public personalItemsCompleted!: boolean;

    @applicationState.State
    public belongingsInfo!: belongingsInfoType;

    @applicationState.Action
    public UpdateBelongingsInfo!: (newBelongingsInfo: belongingsInfoType) => void

    @applicationState.Action
    public UpdateStepActive!: (newStepActive) => void

    @applicationState.Action
    public UpdateLandCompleted!: (newLandCompleted) => void

    @applicationState.Action
    public UpdateGotoPrevStepPage!: () => void

    @applicationState.Action
    public UpdateGotoNextStepPage!: () => void

    @applicationState.Action
    public UpdateStepResultData!: (newStepResultData: stepResultInfoType) => void

    @applicationState.Action
    public UpdateAllCompleted!: (newAllCompleted) => void

    @applicationState.Action
    public UpdateGeneratedForms!: (newGeneratedForms) => void


    survey = new SurveyVue.Model(surveyJson);  
    currentPage=0;
    thisStep = 0;
   
    @Watch('pageIndex')
    pageIndexChange(newVal) 
    {
        this.survey.currentPageNo = newVal;        
    }

    beforeCreate() {
        const Survey = SurveyVue;
        surveyEnv.setCss(Survey);
    }

    mounted(){
        this.initializeSurvey();
        this.addSurveyListener();
        this.reloadPageInformation();
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
            this.UpdateGeneratedForms([]);
            console.log(this.survey.data);
            this.determineLandCompleted();
            
        })
    }

    public determineLandCompleted(){
        if (this.survey.data.landExists && this.survey.data.landExists == "n") {
            this.UpdateLandCompleted(true);
        }else if(this.survey.data.landCompleted && this.survey.data.landCompleted == "y") {
            this.UpdateLandCompleted(true);
        }else{
            this.UpdateLandCompleted(false);
        }

        const nextStep = this.noWillNotifyStepRequired?6:7;
        
        if (this.landCompleted && 
            this.vehiclesCompleted && 
            this.bankAccountsCompleted &&
            this.pensionCompleted &&
            this.personalItemsCompleted) {
            this.toggleSteps([nextStep, 8], true);            
        } else {
            this.toggleSteps([6, 7, 8], false);
        }
    }
    
    public reloadPageInformation() {
        //console.log(this.step.result)
        if (this.step.result && this.step.result['landSurvey']) {
            this.survey.data = this.step.result['landSurvey'].data;
            Vue.filter('scrollToLocation')(this.$store.state.Application.scrollToLocationName);            
        }

        this.thisStep = this.currentStep;
      
        this.currentPage = this.$store.state.Application.steps[this.currentStep].currentPage;
        Vue.filter('setSurveyProgress')(this.survey, this.currentStep, this.currentPage, 50, false);
        this.survey.setVariable("deceasedName", Vue.filter('getFullName')(this.deceasedName));
        this.survey.setVariable("deceasedDateOfDeath", Vue.filter('beautify-date')(this.deceasedDateOfDeath));
        this.survey.setVariable("deceasedDateOfDeathPlus4", this.deceasedDateOfDeathPlus4);
        this.determineLandCompleted();   
    }

    public toggleSteps(stepArr, active) {
        for (let i = 0; i < stepArr.length; i++) {
            this.UpdateStepActive({
                currentStep: stepArr[i],
                active: active
            });
        }        
    }

    public extractBelongingInfo(){
        let belongingsInfo = this.belongingsInfo;
        belongingsInfo.land = [];
        const landInfo = (this.survey.data.landExists && this.survey.data.landExists == "y" && this.survey.data.landInfoPanel)?this.survey.data.landInfoPanel:[];
        console.log(landInfo)       
        for (const land of landInfo) {            
            belongingsInfo.land.push(land);                                   
        }        
                
        this.UpdateBelongingsInfo(belongingsInfo);
    }

    public onPrev() {
        this.UpdateGotoPrevStepPage()
    }

    public onNext() {
        if(!this.survey.isCurrentPageHasErrors) {
            this.UpdateGotoNextStepPage()
        }
    }

    public onComplete() {
        this.UpdateAllCompleted(true);
    }
  
    
    beforeDestroy() {
        this.extractBelongingInfo();
        Vue.filter('setSurveyProgress')(this.survey, this.thisStep, this.currentPage, 50, true);
        
        this.UpdateStepResultData({step:this.step, data: {landSurvey: Vue.filter('getSurveyResults')(this.survey, this.thisStep, this.currentPage)}})

    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "../../../styles/survey";
</style>
