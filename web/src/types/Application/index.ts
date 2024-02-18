import { applicantSurveyInfoType } from "./Applicant";
import { childCommonSurveyInfoType } from "./Children";
import { deceasedInfoSurveyInfoType } from "./DeceasedInfo";
import { deceasedWillSurveyInfoType } from "./DeceasedWill";
import { spouseInfoSurveyInfoType } from "./Spouse";

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

    parentsSurvey?: any;
    grandChildrenSurvey?: any;
    greatGrandChildrenSurvey?: any;
    creditorsSurvey?: any;    

    //__Step 3 APPLICANT
    informationAboutApplicantSurvey?: applicantSurveyInfoType;

    //__Step 4 NOTIFY
    confirmDebtSurvey?: any;
    reviewSurvey?: any;
    notifyPeopleSurvey?: any;

    //__Step 5 BELONGINGS
    LandBuildingsSurvey?: any;
    VehiclesSurvey?: any;
    BankAccountsSurvey?: any;
    PensionsInsuranceSurvey?: any;
    PersonalItemsSurvey?: any;

    //__Step 6 NOWILL
    NoWillNotificationSurvey?: any;

    //__Step 7 OVERVIEW
    WillSearchCheckSurvey?: any;
    FinalizeAssetValuesSurvey?: any;

    //__Step 8 REVIEW
    ReviewYourAnswersSurvey?: any;

    //__Step 9 SUBMIT
    FilingOptionsSurvey?: any;
    ReviewAndPrintSurvey?: any;
    ReviewAndSaveSurvey?: any;
    ReviewAndSubmitSurvey?: any; 
    NextStepsSurvey?: any;

  }