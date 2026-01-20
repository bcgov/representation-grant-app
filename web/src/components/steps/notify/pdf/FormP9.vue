<template>
<div>
    <!-- <b-row class="mt-5">
        <b-button size="sm" class="mx-auto px-4" variant="primary" @click="onPrint(true)"><span class="fa fa-print btn-icon-left"/> Download the Form P9 PDF </b-button>
    </b-row> -->

    <b-card id="print-p9" style="border:1px solid; border-radius:5px;" bg-variant="white" class="mt-4 mb-4 container" no-body>

        <div style="text-align:center; margin:0rem 0 -3rem 0;">
            <div style="margin:0rem 0 0 0;font-size:14px;"><b>FORM P9</b> (RULE 25-3 (2) )</div>                        
        </div>            
        <div class="m-0 p-0 row margintop-5vue">
            
            <div style="margin:0rem 0 0 auto;">
                <div class="float-right">
                    This is the <b class="answer">1st</b> affidavit of <b class="answer">{{applicantName}}</b> in this case
                </div>
                <div class="mt-2 float-right">
                    <underline-form  textwidth="14.5rem" beforetext="and was made on" hint="Affidavit Date (dd mmm yyyy)" text=""/>
                </div>
                <div class="mt-2 float-right">
                    <b class="answer">{{courtName}}</b> Registry                
                    <underline-form  textwidth="9rem" beforetext="No." hint="File Number (leave blank for Registry)" text=""/>
                </div>
            </div>   
        </div>
        <div style="text-align:center;margin:2rem 0 1rem -1.3rem;font-size:14px;"> 
            <span>In the Matter of the Estate of </span>
            <b class="answer">{{deceasedName | getFullName}}</b>
            <span>, deceased</span>
        </div>
        <div style="text-align:center;margin:0rem 0 2rem -1.3rem;font-weight: 600;font-size:15px;">AFFIDAVIT OF DELIVERY</div>            
            
        <div style="display:inline-block; text-indent: 5px;"> I, 
            <b class="answer">{{applicantName}}</b>, of   
            <b class="answer">{{applicantMailingAddress | getFullAddress}}</b>, 
            <b class="answer">{{applicantOccupation}}</b>,
            <span style="font-size:14px;" > AFFIRM / SWEAR THAT:</span>
        </div>

        <ol style="margin:0rem 0 0 -1rem;">
    <!-- <1> -->
            <li class="mt-4 text-justify">
                <div style="display:inline;"> 
                    Attached to this affidavit and marked as Exhibit A is a copy of 
                    a notice of proposed application in Form P1 (the "notice").
                </div> 
            </li>
    <!-- <2> -->
            <li class="mt-4 text-justify">
                <div style="display:inline;"> 
                    I delivered a copy of the notice to the following persons as follows:
                </div>
    <!-- <In Person> -->
                <div v-if="notifyDeliveryInPerson.length>0" class="mt-2">
                    by handing it to and leaving it with the following persons:
                    <div style="margin-left:1rem; border-bottom:1px solid; width:100%;" 
                        v-for="notifyDelivery,inx in notifyDeliveryInPerson" :key="'notify-delivery-inperson-'+inx">                        
                        <b class="answer">{{notifyDelivery.recipientName}}</b>
                        <b class="answer float-right"><span style="font-weight:300;">on</span> {{notifyDelivery.notifyDate | beautify-full-date}}</b>                                               
                    </div>                     
                </div>
    <!-- <Mail> -->
                <div v-if="notifyDeliveryMail.length>0" class="mt-2">
                    by mailing it to the following persons by ordinary mail:
                    <div style="margin-left:1rem; border-bottom:1px solid; width:100%;" 
                        v-for="notifyDelivery,inx in notifyDeliveryMail" :key="'notify-delivery-inperson-'+inx">
                        <b class="answer">{{notifyDelivery.recipientName}}</b>
                        <b class="answer float-right"><span style="font-weight:300;">on</span> {{notifyDelivery.notifyDate | beautify-full-date}}</b>
                    </div>                    
                </div>
    <!-- <Electronic> -->
                <div v-if="notifyDeliveryElectronic.length>0" class="mt-2">
                    by sending it to the following persons by e-mail, fax or other electronic means to that person:
                    <div style="margin-left:1rem; border-bottom:1px solid; width:100%;" 
                        v-for="notifyDelivery,inx in notifyDeliveryElectronic" :key="'notify-delivery-inperson-'+inx">                    
                        <div >
                            <b class="answer">{{notifyDelivery.recipientName}}</b>
                            <b class="answer float-right"><span style="font-weight:300;">on</span> {{notifyDelivery.notifyDate | beautify-full-date}}</b>
                        </div>                        
                    </div> 
                    <div style="margin-left:1rem; width:100%;">
                        <ul>
                            <li>
                                Each of the persons who received delivery by e-mail, fax or other electronic means 
                                has, in writing, acknowledged receipt of the document(s) referred to in this section.
                            </li> 
                            <li>
                                I will retain a copy of those acknowledgements until the personal representative of 
                                the deceased is discharged and will produce those acknowledgements promptly 
                                after being requested to do so by the registrar.
                            </li>
                        </ul>
                    </div>                
                </div>
            </li>
        </ol>

        <div class=" m-0 mt-5 row">
            <div style="width:50%">  
                <div style="margin:0.5rem 0 1rem 0rem;font-weight: 300;font-size:14px;">AFFIRMED / SWORN BEFORE ME</div>
                <underline-form textwidth="12rem" beforetext="at" hint="Commissioner City" text=""/>
                <div style="margin:0.5rem 0 ; display:inline; text-indent: 5px;">, British Columbia</div>

                <underline-form style="margin:0.75rem 0 ;" textwidth="18.75rem" beforetext="on" hint="Swear/Affirm Date" text=""/>
                <underline-form style="margin:0.5rem 0 ;" textwidth="20rem" beforetext="" hint="" text=""/>
                <div style="margin:-0.75rem 0 ;font-size:10px;"><i>A commissioner for taking affidavits for British Columbia</i></div>
                

            </div>
            <div style="width:49%" class="border-left">
                <div>                        
                    <underline-form style="margin:7.3rem 0 0 1.25rem;" textwidth="18.75rem" beforetext="" hint="" text=""/>
                    <div style="margin:-0.25rem 0 0 1.25rem;">{{'Signature of '+applicantName}}</div>
                </div>
            </div>
        </div>
    </b-card>
    <form-p1 :exhibit="true" />
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';


import { namespace } from "vuex-class";   
import "@/store/modules/application";
const applicationState = namespace("Application");
import UnderlineForm from "@/components/utils/PopulateForms/components/UnderlineForm.vue";
import CheckBox from "@/components/utils/PopulateForms/components/CheckBox.vue";
import FormP1 from "./FormP1.vue";
import { stepsAndPagesNumberInfoType } from '@/types/Application/StepsAndPages';
import moment from 'moment';
import { stepInfoType } from '@/types/Application';
import { courtLocationInfoType } from '@/types/Common';


@Component({
    components:{
        UnderlineForm,
        CheckBox,
        FormP1
    }
})

export default class FormP9 extends Vue {    

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

    applicantOccupation = '';
    courtName = '';
    deceasedAddress = {};
    applicantMailingAddress = {};
    currentDate = '';
    notifyDeliveryInPerson = [];
    notifyDeliveryMail = [];
    notifyDeliveryElectronic = [];

    dataReady=false

    public getFormData() {
        
        this.courtName = this.applicationLocation.name??''

        //___Applicant
        const applicantInfo = this.steps[this.stPgNo.APPLICANT._StepNo].result?.applicantInfoSurvey?.data;
        this.applicantMailingAddress = applicantInfo?.applicantOrdinaryAddress??{};
        this.applicantOccupation = applicantInfo?.applicantOccupation??'';

        //__Notify
        const notifyInfo = this.steps[this.stPgNo.NOTIFY._StepNo].result?.notifyPeopleSurvey?.data
        if(notifyInfo?.totalRecipients>0){
            for(let inx=0;inx<notifyInfo?.totalRecipients; inx++){
                const deliveryMethod = notifyInfo?.[`notifyP1DeliveryMethod[${inx}]`]
                const deliveryInfo = {
                    notifyDate: notifyInfo?.[`notifyP1DeliveryDate[${inx}]`],
                    recipientName: notifyInfo?.[`recipientName[${inx}]`]
                }
                if(deliveryMethod=='inperson')
                    this.notifyDeliveryInPerson.push(deliveryInfo)
                else if(deliveryMethod=='mail')
                    this.notifyDeliveryMail.push(deliveryInfo)
                else if(deliveryMethod=='electronic')
                    this.notifyDeliveryElectronic.push(deliveryInfo)
            }
        }
    }

    mounted(){
        this.dataReady=false
        this.currentDate = moment().format("MMMM DD, yyyy")
        this.getFormData();
        this.dataReady=true
        Vue.nextTick(() => this.onPrint(false));
    }

    public onPrint(openDownload) {        
        const elP9= document.getElementById("print-p9");
        const elP9Exhibit= document.getElementById("print");
        // console.log(el)        
        const bodyP9 = Vue.filter('printPdf')(elP9.innerHTML,`"Generated by “Representation Grant” on ${this.currentDate}.         "`,`"P9 "`);
        const bodyP9Exhibit = Vue.filter('printPdf')(elP9Exhibit.innerHTML,`"Generated by “Representation Grant” on ${this.currentDate}.         "`,`"P9 Exhibit A "`);
        this.$emit('onPrint',[...bodyP9 , ...bodyP9Exhibit],openDownload)
    }

}
</script>

<style scoped lang="scss" src="@/styles/_pdf.scss">
</style>
