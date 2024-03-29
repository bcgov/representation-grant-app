import { applicantCitorSurveyInfoType, applicantInfoSurveyInfoType, applicantServiceSurveyInfoType } from "./Applicant";
import { childCommonSurveyInfoType } from "./Children";
import { deceasedInfoSurveyInfoType } from "./DeceasedInfo";
import { deceasedWillSurveyInfoType } from "./DeceasedWill";
import { spouseInfoSurveyInfoType } from "./Spouse";
import { creditorOrgsSurveyInfoType, creditorsSurveyInfoType } from "./Creditor";

export interface applicationInfoType {   
    id?: string;
    type: string;
    steps: stepInfoType[];
    lastUpdate: Date;
    currentStep: number;
    allCompleted: boolean;
    lastPrinted: Date;
    userType: string;
    userName: string;
    userId: string;
    applicantName: string;
    deceasedName: string;
    deceasedDateOfDeath: string;
    deceasedDateOfDeathPlus4: string;
    dateOfWill: string;
    deceasedChildrenInfo: [];
    deceasedGrandChildrenInfo: [];
    applicationLocation: string;
    version: string;
}

export interface stepInfoType {
    id?: string;
    name?: string;
    type: string;
    label: string;
    icon: string;
    result?: resultInfoType;    
    pages?: pageInfoType[];
    currentPage?: number | string;
    active: boolean;
    lastUpdate?: Date | null;
  }

  export interface pageInfoType {
    key: string;
    label: string;
    name?: string;
    progress: number;
    active: boolean;
    clickable: boolean;
  }

  export interface stepResultInfoType {
    step: stepInfoType;
    data: any;
  }

  export interface belongingsInfoType {
    land: any[];
    vehicle: any[];
    bankAccount: any[];
    pension: any[];
    personalItem: any[];
  }

  export interface resultInfoType {

    //__Step 0 DECEASED
    informationAboutDeceasedSurvey?: deceasedInfoSurveyInfoType;

    //__Step 1 WILL
    deceasedWillSurvey?: deceasedWillSurveyInfoType;

    //__Step 2 RELATIONS
    spouseExists?: string;
    spouseSurvey?: spouseInfoSurveyInfoType;
    spouseCompleted?: string;
    childExists?: string;
    childrenSurvey?: childCommonSurveyInfoType;
    childCompleted?: string;
    creditorPersonExists?: string;
    creditorOrgExists?: string;
    creditorSurvey?: creditorsSurveyInfoType;
    creditorOrgSurvey?: creditorOrgsSurveyInfoType;
    creditorCompleted?: string;

    parentsSurvey?: any;
    grandChildrenSurvey?: any;
    greatGrandChildrenSurvey?: any;
   

    //__Step 3 APPLICANT
    applicantInfoSurvey?: applicantInfoSurveyInfoType;
    citorCompleted?: string;
    applicantCitorSurvey?: applicantCitorSurveyInfoType;
    applicantServiceSurvey?: applicantServiceSurveyInfoType;


    //__Step 4 NOTIFY
    reviewSurvey?: any;
    tellPeopleSurvey?: any;
    previewP1Survey?: any;
    notifyPeopleSurvey?: any;
    previewP9Survey?: any;

    //__Step 5 BELONGINGS
    landBuildingsSurvey?: any;
    vehiclesSurvey?: any;
    bankAccountsSurvey?: any;
    pensionsInsuranceSurvey?: any;
    personalItemsSurvey?: any;

    //__Step 6 NOWILL
    noWillNotificationSurvey?: any;

    //__Step 7 OVERVIEW
    willSearchCheckSurvey?: any;
    finalizeAssetValuesSurvey?: any;

    //__Step 8 REVIEW
    reviewYourAnswersSurvey?: any;

    //__Step 9 SUBMIT
    filingOptionsSurvey?: any;
    reviewAndPrintSurvey?: any;
    reviewAndSaveSurvey?: any;
    reviewAndSubmitSurvey?: any; 
    nextStepsSurvey?: any;

    //__Step 10 SUBMIT
    formP5Survey?: any;
    formP10Survey?: any;
    noticeWillSearchSurvey?: any;
    formP2Survey?: any;
  }