<template>
    <page-base v-on:onPrev="onPrev()" v-on:onNext="onNext()" v-on:onComplete="onComplete()">
        <h2 class="mt-4">Review Your Answers</h2>
        <b-card bg-variant="primary" border-variant="primary" text-variant="white">
            <b-icon-exclamation-circle-fill variant="info" scale="1.5" class="mr-2"></b-icon-exclamation-circle-fill>
            Please review your answers to ensure all your information is correct.  
            To make changes, select the edit icon to the right of the section you wish to make changes to.  
            You will be taken back to that step in the service to make your edits.  
            Depending on the type of edits you make, you may be required to navigate through other steps again to 
            confirm your answers are still correct or to make other edits to related answers.

        </b-card>        
        
        <b-card
            v-for="section in questionResults"
            v-bind:key="section.name"
            :header="beautifyQuestion(section.pageName)"
            header-class="h2"
            header-bg-variant="info"
            class="my-5">
                <b-table                    
                    :items="section.questions" 
                    :fields="fields"
                    small
                    head-variant="dark" 
                    striped
                    bordered
                    fixed>                    
                        <template v-slot:table-colgroup>
                            <col style="width:35rem"> 
                            <col style="width:25rem"> 
                            <col style="width:2.5rem">                       
                        </template>
                        <template v-slot:cell(title)="data" >                            
                            <b v-html="beautifyQuestion(data.value)"></b>
                        </template>
                        <template v-slot:cell(value)="data" >
                            <div 
                                style="white-space: pre-line;" 
                                :class="beautifyResponse(data.value, data.item)!='REQUIRED'?'':'bg-danger text-white px-2'"
                                v-html="beautifyResponse(data.value, data.item)"
                            ></div>
                        </template>
                        <template v-slot:cell(edit)="data" > 
                            <b-button style="border:white;" size="sm" variant="transparent" v-b-tooltip.hover.noninteractive title="Edit"  @click="edit(section,data)"><b-icon icon="pencil-square" font-scale="1.25" variant="primary"/></b-button>
                        </template>

                </b-table>
        </b-card>
    </page-base>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import * as _ from 'underscore';

import { stepInfoType, stepResultInfoType } from "@/types/Application";
import PageBase from "../PageBase.vue";

import { namespace } from "vuex-class";   
import "@/store/modules/application";
import { stepsAndPagesNumberInfoType } from '@/types/Application/StepsAndPages';
const applicationState = namespace("Application");

@Component({
    components:{
        PageBase
    }
})

export default class ReviewYourAnswers extends Vue {
    
    @Prop({required: true})
    step!: stepInfoType;

    @applicationState.State
    public stPgNo!: stepsAndPagesNumberInfoType;

    @applicationState.Action
    public UpdateGotoPrevStepPage!: () => void

    @applicationState.Action
    public UpdateGotoNextStepPage!: () => void

    @applicationState.Action
    public UpdateStepResultData!: (newStepResultData: stepResultInfoType) => void

    @applicationState.Action
    public UpdateRequiredDocuments!: (newRequiredDocuments: string[]) => void

    fields =[
        {key:'title', label:'Question', thClass:'border-right', tdClass:'border-top border-right ', thStyle:''},
        {key:'value', label:'Response', thClass:'', tdClass:'border-top border-right', thStyle:''},
        {key:'edit',  label:'',         thClass:'', tdClass:'border-top ', thStyle:''}
    ]

    questionResults = [];
    currentStep=0;
    currentPage=0;
    pageHasError = false;
    reviewed = false;
    errorQuestionNames = [];
    bankNamesIndex: Number[] = [];

    mounted(){  

        this.reloadPageInformation();
        this.determineHiddenErrors();
        window.scrollTo(0, 0);
        //// console.log(this.step)
    }

    public beautifyQuestion(question){
        //// console.log(question)        
        let adjQuestion = question
        adjQuestion = adjQuestion.replace(/{applicantName}/g, (this.$store.state.Application.applicantName));
        adjQuestion = adjQuestion.replace(/{deceasedName}/g, Vue.filter('getFullName')(this.$store.state.Application.deceasedName));
        adjQuestion = adjQuestion.replace(/<br>/g,'');
        adjQuestion = adjQuestion.replace(/`/g,'');
        adjQuestion = adjQuestion.replace(/<br\/>/g,'');
        //adjQuestion = adjQuestion.replace("{panel.bankName}", this.tempBankName);
        return adjQuestion
    }

    public beautifyResponse(value, dataItem){
        // console.log(value)
        // console.log(dataItem)
        const inputType = dataItem?dataItem['inputType']:""
        const inputName = dataItem?dataItem['name']:""

        if(!value){
            this.pageHasError = true;
            this.reviewed = false;
            return "REQUIRED";
        }
        else if(this.errorQuestionNames.includes(inputName))
        {
            this.pageHasError = true;
            this.reviewed = false;
            return "REQUIRED";
        }
        else if(Array.isArray(value))
        {
            // // console.log(value)
            if((typeof value[0] =='string' || value[0] instanceof String) && value[0].includes('relatedPerson[')) return this.getRelatedPeopleNames(value)
            if(value[0].spouseName)return this.getSpouseInfo(value)
            if(value[0].childName)return this.getChildrenInfo(value)
            if(value[0].accountType)return this.getBankAccountInfo(value)
            if(typeof value[0] === 'string' || value[0] instanceof String)
                return value.join(", \n ");
            else{
                this.pageHasError = true;
                this.reviewed = false;
                return "REQUIRED";
            } 
        }
        else if(value=='y')
            return 'Yes';
        else if(value=='n')
            return 'No';
        else if(value.first)
            return Vue.filter('getFullName')(value)
        else if(value.street)
            return Vue.filter('getFullAddress')(value)
        else if(value.phone)
            return Vue.filter('getFullContactInfo')(value)
        else if(inputType=="date")
            return Vue.filter('beautify-date')(value)
        else 
            return value;    
    }

    public getBankAccountInfo(accounts){
        // // console.log(accounts)
        let resultString = "";
        for(const account of accounts ){            
            resultString +="Type: " + (account['accountType'].slice(0,-7)).toUpperCase() +"\n";
            resultString +="Number: " + account['accountNumber'] +"\n";
            resultString +="Balance: " + account['accountValueComment'] +"\n";
            resultString +="Joint: " + (account['accountJoint']=='y'?'Yes':'No') +"\n";
            if(account['accountJoint']=='y'){
                resultString +="Joint Alive: " + (account['accountJointAlive']=='y'?'Yes':'No') +"\n";
                resultString +="Joint Died After: " + (account['accountJointDied5DaysAfter']=='y'?'Yes':'No') +"\n";
            }
            resultString +="Interest Accrued: " + account['interestAccrued'] +"\n";
            resultString +="Registered Loan: " + (account['registeredLoan']=='y'?'Yes':'No') +"\n\n";            
        }
        return resultString;
    }

    public getSpouseInfo(spouses){
        let resultString = "";
        for(const spouse of spouses ){            
            resultString +="Name: " + Vue.filter('getFullName')(spouse['spouseName']) +"\n";
            resultString +="Adult: " + (spouse['spouseIsAdult']=='y'?'Yes':'No') +"\n";
            resultString +="Alive: " + (spouse['spouseIsAlive']=='y'?'Yes':'No') +"\n";
            resultString +="Competent: " + (spouse['spouseIsCompetent']=='y'?'Yes':'No') +"\n\n";
        }
        return resultString;
    }

    public getChildrenInfo(children){
        let resultString = "";
        for(const child of children ){            
            resultString +="Name: " + Vue.filter('getFullName')(child['childName']) +"\n";
            resultString +="Adult: " + (child['childIsAdult']=='y'?'Yes':'No') +"\n";
            resultString +="Alive: " + (child['childIsAlive']=='y'?'Yes':'No') +"\n";
            resultString +="Competent: " + (child['childIsCompetent']=='y'?'Yes':'No') +"\n\n";
        }
        return resultString;
    }

    public getRelatedPeopleNames(relatedPeople){
        const relatedPeopleNames = this.$store.state.Application.steps[3].result['applicantInfoSurvey'].data.relatedPeopleNames
        // // console.log(relatedPeopleNames)
        // // console.log(relatedPeople)
        let resultString = "";
        for(const relatedPerson of relatedPeople ){
            const name = relatedPeopleNames[relatedPerson.match(/\d/g)]
            if(name) resultString +=name +"\n";            
        } 
        return resultString;
    }

    public edit(section, data){
        // // console.log(data)
        // // console.log(section)
        //// console.log(data.index)
        //// console.log(this.bankNamesIndex)
        
        //change scroll element Index if Bank Account
        let elementIndex = 0;
        if(this.bankNamesIndex.length>1 && section.pageName == 'About Bank Accounts')
            for(const inxString in this.bankNamesIndex.reverse()){
                const inx = Number(inxString);
                const bankinx = this.bankNamesIndex[inx]
                // console.log(bankinx+' '+inx+' '+(this.bankNamesIndex.length-1-inx))
                if(data.index>=bankinx){
                    elementIndex = this.bankNamesIndex.length-1-inx
                    break
                }                
            }

        this.$store.commit("Application/setScrollToLocationName", elementIndex>0?('_'+elementIndex+'_'+data.item.name):data.item.name);
        this.$store.commit("Application/setCurrentStep", section.currentStep);
        this.$store.commit("Application/setCurrentStepPage", {currentStep: section.currentStep, currentPage: section.currentPage });
        const currPage = document.getElementById(this.getStepPageId(section.currentStep, section.currentPage));
        currPage.className="current";
    }

    public reloadPageInformation() {
        this.reviewed = false;
        this.pageHasError = false;        
        for(const [appStepKey, appStepValue] of Object.entries(this.stPgNo)){
            // if(i==4)continue;//step is "notify" 
            const step = this.$store.state.Application.steps[appStepValue._StepNo]
            const stepResult = step.result
            // console.log(step)
            // console.log(stepResult);
            if(!step?.active || !stepResult)continue;
            for (const [key, value] of Object.entries(stepResult))
            {
                // console.error("____________")
                // console.log(key)
                // console.log(value)
                if(value && value['data'] && value['data'].length == 0){
                    const isPageActive = step.pages[value['currentPage']]? step.pages[value['currentPage']].active : false; 
                    value['questions'][0]= {name: "require", value: "", title: value['pageName'], inputType: ""}                 
                    if(isPageActive){
                        this.questionResults.push(value);
                    }
                }
                else if(value && (value['currentPage'] || value['currentPage']==0)){ 
                    const isPageActive = step.pages[value['currentPage']]? step.pages[value['currentPage']].active : false; 
                    //// console.log(isPageActive)
                    //value['sortOrder']=  (value['currentStep']*100+value['currentPage']);                   
                    if(value['questions'] && isPageActive){
                        this.questionResults.push(value);
                    }
                }
                
                // if(key=='bankAccountsSurvey' && value && value['questions']){

                //     for (const inx in value['questions']){
                //         const question = value['questions'][inx]
                //         //// console.log(inx)
                //         //// console.log(question.name=="bankName")
                //         if(question.name=="bankName")
                //             this.bankNamesIndex.push(Number(inx))
                //     }
                //     //// console.warn(key)
                //     //// console.log(value['questions'])

                // }
            }
        }
        // console.log(this.questionResults)

        this.questionResults = _.sortBy(this.questionResults,function(questionResult){ return (Number(questionResult['currentStep'])*100+Number(questionResult['currentPage'])); });
        // console.log(this.questionResults)
       
        //let progress = 100;
        // if(Object.keys(this.survey.data).length)
        //     progress = this.survey.isCurrentPageHasErrors? 50 : 100;

        this.currentStep = this.$store.state.Application.currentStep;
        this.currentPage = this.$store.state.Application.steps[this.currentStep].currentPage;
        Vue.filter('setSurveyProgress')(null, this.currentStep, this.currentPage, this.pageHasError? 50: 100, false);
        //this.$store.commit("Application/setPageProgress", { currentStep: this.currentStep, currentPage:this.currentPage, progress:progress })
        // this.togglePages([0,1], true);
    }

    public determineHiddenErrors(){        
        this.errorQuestionNames.push(this.coOccurrence("Protection from whom?","childPO","y",  "Background","PartiesHasOtherChilderen","Are {DeceasedDateOfDeath} and {DeceasedName} a parent, step-parent or guardian to a child:", "PartiesHasOtherChilderen"));
        this.errorQuestionNames.push(this.coOccurrence("Protection from whom?","childPO","n",  "Background","PartiesHasOtherChilderen","Are {DeceasedDateOfDeath} and {DeceasedName} a parent, step-parent or guardian to a child that is not already identified in the list", "PartiesHasOtherChilderen"));        
    }

    // public getRepGrantResultData() {  
        
    //     var result = this.$store.state.Application.steps[0].result; 
    //     for(var i=1;i<9; i++){
    //         const stepResults = this.$store.state.Application.steps[i].result
    //         for(const stepResult in stepResults){
    //             // console.log(stepResults[stepResult])
    //             // console.log(stepResults[stepResult].data)
    //             result[stepResult]=stepResults[stepResult].data;                
    //         }
    //     }            
    //     // console.log(result)
    //     return result;
    // }

    public coOccurrence(pageName1,question1,value1,  pageName2,question2,title2:string, response){
        for(const questionResult of this.questionResults)
        {
            if(questionResult.pageName == pageName1)
            {
                for(const question of questionResult.questions)
                {
                    if(question.name == question1 && question.value == value1)
                    {
                        for(const questionResult of this.questionResults)
                        {
                            if(questionResult.pageName == pageName2)
                            {
                                for(const question of questionResult.questions){
                                    if(question.name == question2 && question.title.trim()==title2.trim())
                                    {
                                        // // console.log(question.title)
                                        // // console.log(title2)
                                        // // console.log(question.title.trim()==title2.trim())
                                        return response
                                    }
                                }
                            }
                        }
                        break
                    }
                }
                break;
            }
        }
        return ""
    }

    public togglePages(pageArr, activeIndicator) {
        //this.activateStep(activeIndicator);
        for (let i = 0; i < pageArr.length; i++) {
            this.$store.commit("Application/setPageActive", {
                currentStep: this.step.id,
                currentPage: pageArr[i],
                active: activeIndicator
            });
        }
    }
    
    public onPrev() {
        this.UpdateGotoPrevStepPage()
    }

    public onNext() {
       //// console.log(this.pageHasError)
        this.UpdateGotoNextStepPage()       
    }

    public onComplete() {
        this.$store.commit("Application/setAllCompleted", true);
    }

    public getStepId(stepIndex) {
        return "step-" + stepIndex;
    }

    public getStepPageId(stepIndex, pageIndex) {
        return this.getStepId(stepIndex) + "-page-" + pageIndex;
    }

    beforeDestroy() {

        Vue.filter('setSurveyProgress')(null, this.currentStep, this.currentPage, this.pageHasError? 50: 100, true);
        // this.$store.commit("Application/setPageProgress", { currentStep: this.currentStep, currentPage:this.currentPage, progress:progress })
        // const currPage = document.getElementById("step-" + this.currentStep+"-page-" + this.currentPage);
        // if(currPage) currPage.style.color=this.survey.isCurrentPageHasErrors?"red":"";

        //this.UpdateStepResultData({step:this.step, data: {filingOptions: this.survey.data}})
    }
}
</script>

<style scoped>

</style>