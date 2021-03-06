<template>
    <page-base :disableNext="disableNextButton" v-on:onPrev="onPrev()" v-on:onNext="onNext()" v-on:onComplete="onComplete()">
        <survey v-bind:survey="survey"></survey>
    </page-base>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch} from 'vue-property-decorator';

import * as SurveyVue from "survey-vue";
import * as surveyEnv from "@/components/survey/survey-glossary";
import surveyJson from "./forms/deceased-will.json";

import PageBase from "../PageBase.vue";
import { stepInfoType, stepResultInfoType } from "@/types/Application";

import { namespace } from "vuex-class";   
import "@/store/modules/application";
const applicationState = namespace("Application");

@Component({
    components:{
        PageBase
    }
})

export default class DeceasedWill extends Vue {
    
    @Prop({required: true})
    step!: stepInfoType;

    @applicationState.State
    public steps!: stepInfoType[];

    @applicationState.State
    public currentStep!: number;

    @applicationState.State
    public deceasedName!: string;

    @applicationState.Action
    public UpdateStepActive!: (newStepActive) => void

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
    thisStep=0;
    disableNextButton = false;   
   
    @Watch('pageIndex')
    pageIndexChange(newVal) 
    {
        this.survey.currentPageNo = newVal;        
    }

    beforeCreate() {
        const Survey = SurveyVue;
        surveyEnv.setCss(Survey);
    }

    created() {
        this.disableNextButton = false;
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
            //console.log(this.survey.data);
            // console.log(options)
            if(options.name == "willCheck") {
                if (options.value == "n") {
                    this.disableNextButton = true;
                    this.toggleSteps([2, 3, 4, 5, 6, 7, 8], false)
                } else {
                    this.disableNextButton = false;
                     this.toggleSteps([2,8], true)
                }                
            }

            if(options.name == "willExists") {
                if (options.value == "y") {
                    this.disableNextButton = true;
                    this.toggleSteps([2, 3, 4, 5, 6, 7, 8], false)
                } else {
                    this.disableNextButton = false;
                     this.toggleSteps([2,8], true)
                }                
            }

            if(options.name == "willGrantExists") {
                if (options.value == "y") {
                    this.disableNextButton = true;
                     this.toggleSteps([2, 3, 4, 5, 6, 7, 8], false)
                } else {
                    this.disableNextButton = false;
                     this.toggleSteps([2,8], true)
                }                
            }


        })
    }
    
    public reloadPageInformation() {
        //console.log(this.step.result)
        if (this.step.result && this.step.result['deceasedWillSurvey']) {
            this.survey.data = this.step.result['deceasedWillSurvey'].data;
            Vue.filter('scrollToLocation')(this.$store.state.Application.scrollToLocationName);            
        }

        this.thisStep = this.currentStep;
      
        this.currentPage = this.steps[this.currentStep].currentPage;
        Vue.filter('setSurveyProgress')(this.survey, this.currentStep, this.currentPage, 50, false);

        this.survey.setVariable("deceasedName", Vue.filter('getFullName')(this.deceasedName));
    }   

    public toggleSteps(stepArr, activeIndicator) {
        for (let i = 0; i < stepArr.length; i++) {
            this.UpdateStepActive({
                currentStep: stepArr[i],
                active: activeIndicator
            });
        }
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
        Vue.filter('setSurveyProgress')(this.survey, this.thisStep, this.currentPage, 50, true);
        
        this.UpdateStepResultData({step:this.step, data: {deceasedWillSurvey: Vue.filter('getSurveyResults')(this.survey, this.thisStep, this.currentPage)}})

    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "../../../styles/survey";
</style>
