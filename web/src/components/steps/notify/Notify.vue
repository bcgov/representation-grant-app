<template>
    <page-base v-on:onPrev="onPrev()" v-on:onNext="onNext()">
        <survey v-bind:survey="survey"></survey>
    </page-base>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';    

import * as SurveyVue from "survey-vue";
import surveyJson from "./forms/notify.json";
import * as surveyEnv from "@/components/survey/survey-glossary";
import {notifyPanel} from "./forms/notify-panel";

import PageBase from "../PageBase.vue";
import { stepInfoType, stepResultInfoType } from "@/types/Application";

import { namespace } from "vuex-class";   
import "@/store/modules/application";
import { stepsAndPagesNumberInfoType } from '@/types/Application/StepsAndPages';
import { courtLocationInfoType } from '@/types/Common';
const applicationState = namespace("Application");

@Component({
    components:{
        PageBase
    }
})

export default class Notify extends Vue {
        
    @Prop({required: true})
    step!: stepInfoType;

    @applicationState.State
    public stPgNo!: stepsAndPagesNumberInfoType;

    @applicationState.State
    public steps!: stepInfoType[];

    @applicationState.State
    public deceasedName!: string;

    @applicationState.State
    public applicantName!: string;

    @applicationState.State
    public applicationLocation!: courtLocationInfoType;

    @applicationState.Action
    public UpdateStepResultData!: (newStepResultData: stepResultInfoType) => void

    survey = new SurveyVue.Model(surveyJson);
    surveyJsonCopy; 
    disableNextButton = false;   
    currentPage=0;
    currentStep=0;
    // relatedPeopleInfo: string[]=[];
    listOfNotifyingPeople: string[]=[];

    beforeCreate() {
        const Survey = SurveyVue;
        surveyEnv.setCss(Survey);
        surveyEnv.loadGlossary();
    }  

    mounted(){
        this.initializeSurvey();
        this.addSurveyListener();
        this.reloadPageInformation();

        // console.log(this.step)
    }

    public initializeSurvey(){
        this.adjustSurveyForRelatedPeople();       
        this.survey = new SurveyVue.Model(this.surveyJsonCopy);
        this.survey.commentPrefix = "Comment";
        this.survey.showQuestionNumbers = "off";
        this.survey.showNavigationButtons = false;
        surveyEnv.setGlossaryMarkdown(this.survey);
    } 
    
    public adjustSurveyForRelatedPeople(){

        const relatedPeopleInfo = Vue.filter('getRelatedPeopleInfo')(this.steps[this.stPgNo.RELATIONS._StepNo], true, true, false, true, true, true);

        const firstNationsName = this.getFirstNationName();
        if(firstNationsName) relatedPeopleInfo.push(firstNationsName);

        this.listOfNotifyingPeople = relatedPeopleInfo.filter(related => !this.applicantName.includes(related))
        this.surveyJsonCopy = JSON.parse(JSON.stringify(surveyJson)); 
        for(const inx in this.listOfNotifyingPeople){            
            // console.log(notifyingPerson)
            const isFirstNation = this.isFirstNationName(this.listOfNotifyingPeople[inx])            
            const notifyPanelCopy = JSON.parse(JSON.stringify(notifyPanel).replace(/\[0\]/g,`[${inx}]`).replace(`{isfirstNation[${inx}]}`,String(isFirstNation)))
            notifyPanelCopy.elements[5]["choices"].push({"value":this.applicantName, "text":this.applicantName});
            // console.log(notifyPanelCopy)            
            this.surveyJsonCopy.pages[0].elements.push(notifyPanelCopy)
        }  
    }   
    
    public addSurveyListener(){
        this.survey.onValueChanged.add((sender, options) => {
            // console.log(this.survey.data);            
            // this.determineRequiredNotice(); 
            // this.determineNotifyCompleted();          
        })   
    }   

    public reloadPageInformation() {
        //console.log(this.step.result) 

        if (this.step?.result?.notifyPeopleSurvey?.data && 
            this.isRelatedPeopleSame(this.step?.result?.notifyPeopleSurvey?.data)
        ){
            this.survey.data = this.step.result.notifyPeopleSurvey.data;
        } 
        
        this.currentStep = this.$store.state.Application.currentStep;
        this.currentPage = this.$store.state.Application.steps[this.currentStep].currentPage;        
        
        const firstNationsName = this.getFirstNationName()
        if(firstNationsName) this.survey.setVariable("firstNationInfo", this.getFirstNationInfo(firstNationsName));

        this.survey.setVariable("applicantCourthouse",this.applicationLocation.name??'');
        this.survey.setVariable("deceasedName", Vue.filter('getFullName')(this.deceasedName));
        for(const inx in this.listOfNotifyingPeople){
            const notifyingPerson = this.listOfNotifyingPeople[inx]
            this.survey.setValue(`recipientName[${inx}]`, notifyingPerson)
        } 
        this.survey.setValue("totalRecipients",this.listOfNotifyingPeople.length)
        Vue.filter('setSurveyProgress')(this.survey, this.currentStep, this.currentPage, 50, false);
        // this.determineRequiredNotice(); 
        // this.determineNotifyCompleted(); 
        // console.log(this.survey.isCurrentPageHasErrors)     
    }

    isFirstNationName(name){
        const firstNationNames = [
            "Huu-ay-aht First Nations",
            "Ka:'yu:'k't'h'/Chek'tles7et'h' First Nations (Kyuquot/Checleseht)",
            "Nisg̱a'a Nation",
            "Tla'amin Nation",
            "Toquaht Nation",
            "Tsawwassen First Nation",
            "Uchucklesaht Tribe",
            "Yuułuʔiłʔatḥ First Nation (Ucluelet)"
        ]
        return firstNationNames.includes(name)
    }

    getFirstNationName(){
        //___Deceased        
        const deceasedInfo = this.steps[this.stPgNo.DECEASED._StepNo].result?.informationAboutDeceasedSurvey?.data;
        const isFirstNation = deceasedInfo.deceasedFirstNations =='y';
        return (isFirstNation? deceasedInfo.deceasedFirstNationsName: '');
    }

    getFirstNationInfo(deceasedFirstNationsName){                       
        let firstNationInfo = `You will need to give ${deceasedFirstNationsName} a Form P1. <br><br>`
        if(deceasedFirstNationsName == "Huu-ay-aht First Nations"){        
           firstNationInfo+= `<b>In-person or physical mail, choose one of the following:</b><br><ul><li>Anacla Government Office<br>170 Nookemus Road<br>Anacla, BC<br>V0R 1B0</li></ul><ul><li>Port Alberni Government Office<br>4644 Adelaide Street<br>Port Alberni, BC<br>V9Y 6N4</li></ul><b>Email:</b><ul><li>communications@huuayaht.org</li><li>Use the subject title: \"Re: Representation Grant Application\"</li></ul>`
        }
        else if(deceasedFirstNationsName == "Ka:'yu:'k't'h'/Chek'tles7et'h' First Nations (Kyuquot/Checleseht)"){
            firstNationInfo+= `<b>Email:</b><ul><li>Cynthia Blackstone</li><li>cynthiab@kcfirstnations.com</li><li>Use the subject title: \"Re: Representation Grant Application\"</li></ul>`
        }else if(deceasedFirstNationsName == "Nisg̱a'a Nation"){
            firstNationInfo+= `<b>In-person or physical mail:</b><br><ul><li>Nisg̱a'a Lisims Government<br>PO Box 231, 2000 Lisims Drive<br>Gitlaxt'aamiks (formerly New Aiyansh), BC<br>V0J 1A0</li></ul><b>Email:</b><ul><li>info@nisgaa.net</li><li>Use the subject title: \"Re: Representation Grant Application\"</li></ul>`
        }else if(deceasedFirstNationsName == "Tla'amin Nation"){
            firstNationInfo+= `<b>In-person or physical mail:</b><br><ul><li>Tla'amin Nation<br>4779 Klahanie Rd<br>Powell River, BC<br>V8A 0C4</li></ul><b>Email:</b><ul><li>reception@tn-bc.ca</li><li>Use the subject title: \"Re: Representation Grant Application\"</li></ul>`
        }else if(deceasedFirstNationsName == "Toquaht Nation"){
            firstNationInfo+= `<b>In-person or physical mail:</b><br><ul><li>Toquaht Nation Government Administration<br>PO Box 759<br>1971 Peninsula Rd<br>Ucluelet, BC<br>V0R 3A0</li></ul><b>Email:</b><ul><li>general@toquaht.ca</li><li>Use the subject title: \"Re: Representation Grant Application\"</li></ul>`
        }else if(deceasedFirstNationsName == "Tsawwassen First Nation"){
            firstNationInfo+= `<b>In-person or physical mail:</b><br><ul><li>“Attention: General Counsel”<br>Tsawwassen First Nation<br>1926 Tsawwassen Drive<br>Tsawwassen, BC<br>V4M 4G2</li></ul><b>Email:</b><ul><li>info@tsawwassenfirstnation.com</li><li>Use the subject title: \"Attention: General Counsel Re: Representation Grant Application\"</li></ul>`
        }else if(deceasedFirstNationsName == "Uchucklesaht Tribe"){
            firstNationInfo+= `<b>In-person or physical mail:</b><br><ul><li>“Attention: Director of Operations”<br>Uchucklesaht Tribe<br>Suite A – 5251 Argyle Street<br>Port Alberni, BC<br>V9Y 1V1</li></ul><b>Email:</b><ul><li>Carla.Halvorsen@uchucklesaht.ca</li><li>Use the subject title: \"Attention: Director of Operations Re: Representation Grant Application\"</li></ul>`
        }else if(deceasedFirstNationsName == "Yuułuʔiłʔatḥ First Nation (Ucluelet)"){
            firstNationInfo+= `<b>In-person:</b><br><ul><li>Yuułuʔiłʔatḥ Government – Ucluelet First Nation<br>Cixʷatin Centre<br>700 Wya Road<br>Hitacu, BC<br>V0R 3A0</li></ul><b>Physical mail:</b><br><ul><li>Yuułuʔiłʔatḥ Government – Ucluelet First Nation<br>Cixʷatin Centre<br>PO Box 699 <br>Ucluelet, BC<br>V0R 3A0</li></ul><b>Email:</b><ul><li>communications@ufn.ca</li><li>Use the subject title: \"Re: Representation Grant Application\"</li></ul>`
        }
        return firstNationInfo
    }

    isRelatedPeopleSame(surveyData){
        for(const inx in this.listOfNotifyingPeople){
            const notifyingPerson = this.listOfNotifyingPeople[inx]
            if(surveyData[`recipientName[${inx}]`] != notifyingPerson) return false
        }
        return true
    }
   
    public onPrev() {
        Vue.prototype.$UpdateGotoPrevStepPage()
    }

    public onNext() {
        if(!this.survey.isCurrentPageHasErrors) {
            Vue.prototype.$UpdateGotoNextStepPage()
        }
    }

    beforeDestroy() {
        Vue.filter('setSurveyProgress')(this.survey, this.currentStep, this.currentPage, 50, true);       
        this.UpdateStepResultData({step:this.step, data: {notifyPeopleSurvey: Vue.filter('getSurveyResults')(this.survey, this.currentStep, this.currentPage)}});
    }

    // public determineNotifyCompleted(){
        
    //     if (this.steps[4].result['reviewP1Survey'] && 
    //         this.steps[4].result['reviewP1Survey'].data && 
    //         this.steps[4].result['reviewP1Survey'].data.p1ReviewInfoCorrect) {            
    //         this.survey.setVariable("notifyCompleted", true);
    //         this.toggleSteps([5, 8], true);

    //         if (this.landCompleted && 
    //             this.vehiclesCompleted && 
    //             this.bankAccountsCompleted &&
    //             this.pensionCompleted &&
    //             this.personalItemsCompleted &&
    //             this.noWillNotifyStepRequired) {
    //                 this.toggleSteps([6], true);            
    //         } else if (!this.noWillNotifyStepRequired) {
    //                 this.toggleSteps([6], false); 
    //         }
    //     } else {
    //         this.survey.setVariable("notifyCompleted", false);            
    //         this.toggleSteps([5, 6, 7, 8], false);
    //     }        
        
    // }

    // public determineRequiredNotice(){

    //     if (this.relatedPeopleInfo.length>1){
    //         this.survey.setVariable("noticeRequired", true);
    //     } else {
    //         this.survey.setVariable("noticeRequired", false);
    //     }    
    // }


};
</script>

<style lang="scss">
@import "../../../styles/survey";
</style>
