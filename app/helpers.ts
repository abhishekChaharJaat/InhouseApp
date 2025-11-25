import { AppDispatch } from "@/store";
import { setShowAuthModal } from "@/store/authSlice";
import {
  setReferralDrawerDetails,
  setShowMultiPlanModal,
  setShowNotSupportedModal,
  setShowSinglePlanModal,
} from "@/store/homeSlice";
import { Clerk } from "@clerk/clerk-expo";
import { DRAWER, PLANS } from "./constants";

// For store token
export const getToken = async () => {
  return await Clerk.session?.getToken();
};

export const formatDateTime = (value: any) => {
  const d = new Date(value);
  const date = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return `on ${date} at ${time}`;
};

// showSinglePlanModal
export const showSinglePlanModal = (
  show = false,
  dispatch: any,
  planType: string | null,
  threadId?: any
) => {
  dispatch(setShowSinglePlanModal({ show, planType, threadId }));
};

// showReferralDrawer
export const showReferralDrawer = (
  show: boolean,
  dispatch: AppDispatch,
  drawerType?: string,
  threadId?: string | null,
  btnText?: string
) => {
  dispatch(setReferralDrawerDetails({ show, drawerType, threadId, btnText }));
};

export const closeReferralDrawer = (dispatch: AppDispatch) => {
  dispatch(
    setReferralDrawerDetails({
      show: false,
      drawerType: "",
      threadId: null,
      btnText: "",
    })
  );
};
// HANDLE LEGAL REVIEW BUTTON CLICKED
export const handleLegalReviewButtonClicked = (
  btn: any,
  dispatch: AppDispatch,
  userMetadata: any,
  chatId: string | null,
  isDocLocked?: boolean
) => {
  console.log("Plan ", userMetadata?.subscription_type);
  let isElegibleOffersNull =
    btn?.eligible_offers?.lawyer_finalization === null &&
    btn?.eligible_offers?.lawyer_consultation === null &&
    btn?.eligible_offers?.ai_document === null;

  if (
    btn?.eligible_offers === null ||
    isElegibleOffersNull ||
    (btn?.eligible_offers?.ai_document === "court_document" && isDocLocked)
  ) {
    dispatch(setShowNotSupportedModal(true));
    return;
  }
  // Free case
  if (btn?.eligible_offers?.lawyer_consultation === "personal_injury") {
    showReferralDrawer(true, dispatch, DRAWER.FREE, chatId, btn?.text);
    return;
  }
  // not authenticated and not free
  if (!userMetadata?.subscription_type) {
    dispatch(setShowAuthModal({ show: true, type: "signin" }));
    return;
  }

  // Consultation case
  if (
    btn?.eligible_offers?.lawyer_consultation === "default" &&
    btn?.eligible_offers?.ai_document == null &&
    btn?.eligible_offers?.lawyer_finalization === null
  ) {
    showReferralDrawer(true, dispatch, DRAWER.CONSULTATION, chatId, btn?.text);
    return;
  }

  //  ai-doc case
  if (btn?.eligible_offers?.ai_document === "court_document") {
    showSinglePlanModal(true, dispatch, PLANS.COURT_DOCUMENT);
    return;
  }
  if (
    btn?.eligible_offers?.ai_document === "default" &&
    btn?.eligible_offers?.lawyer_consultation === null &&
    btn?.eligible_offers?.lawyer_finalization === null
  ) {
    showSinglePlanModal(true, dispatch, PLANS.AI_DOC);
    return;
  }
  // show 2 plans only if the user clicked on "access document" button
  if (
    btn?.eligible_offers?.ai_document === "default" &&
    btn?.eligible_offers?.lawyer_finalization === "default" &&
    btn.text === "Access Document"
  ) {
    dispatch(setShowMultiPlanModal(true));
    return;
  }

  // Lawyer_finalization case
  if (btn?.eligible_offers?.lawyer_finalization === "default") {
    if (userMetadata?.subscription_type !== PLANS.INHOUSE_COUNSEL) {
      showSinglePlanModal(true, dispatch, PLANS.LAWYER_FINALLIZATION);
      return;
    }
    if (userMetadata?.subscription_type === PLANS.INHOUSE_COUNSEL) {
      showReferralDrawer(
        true,
        dispatch,
        DRAWER.FINALIZATION,
        chatId,
        btn?.text
      );
      return;
    }
  }
};

// export const handleLegalReviewButtonClick = (btn, dispatch, userMetadata, chatId) => {
//   dispatch(resetStoreReferralStatus());
//   dispatch(resetPaymentStatus());

//   // TODO: Event 85
//   trackAnalytics(
//     EVENT_NAMES.CLICKED_BUTTON,
//     {
//       [EVENT_PARAMETERS.PAGE_NAME]: getPageName(),
//       [EVENT_PARAMETERS.CURRENT_PLAN_TIER]: userMetadata?.subscription_type || "anonymous",
//       [EVENT_PARAMETERS.USER_ID]: userMetadata?.id,
//       [EVENT_PARAMETERS.THREAD_ID]: chatId,
//       [EVENT_PARAMETERS.BUTTON_TEXT]: btn.text,
//       [EVENT_PARAMETERS.BUTTON_TYPE]: BUTTON_TYPES.BUTTON_WITH_TEXT,
//       // [EVENT_PARAMETERS.BUTTON_ROLE]: BUTTON_ROLES.CONTACT_LAWYER,
//       [EVENT_PARAMETERS.BUTTON_ROLE]: btn.text ? BUTTON_ROLES.CONTACT_LAWYER : BUTTON_ROLES.REQUEST_DOCUMENT_REVIEW,
//     },
//     userMetadata
//   );
//   let isElegibleOffersNull =
//     btn?.eligible_offers?.lawyer_finalization === null &&
//     btn?.eligible_offers?.lawyer_consultation === null &&
//     btn?.eligible_offers?.ai_document === null;

//   if (
//     btn?.eligible_offers === null ||
//     isElegibleOffersNull ||
//     (btn?.eligible_offers?.ai_document === "court_document" && isDocumentUnlocked(chatId))
//   ) {
//     const { setShowNotSupportedModal } = require("./onboarding/onboardingSlice");
//     dispatch(setShowNotSupportedModal(true));
//     return;
//   }
//   // Free case
//   if (btn?.eligible_offers?.lawyer_consultation === "personal_injury") {
//     openReferralDrawer(btn, "freeConsultation", chatId, userMetadata, dispatch);
//     return;
//   }

//   // not authenticated and not free
//   if (!userMetadata?.subscription_type) {
//     localStorage.setItem("action_type", "consult_attorney");
//     dispatch(
//       setShowSignupToUpgradeModal({
//         show: true,
//         plans: PLANS_V2.subscriber_enterprise,
//         slide: "signup",
//       })
//     );
//     return;
//   }

//   // Consultation case
//   if (
//     btn?.eligible_offers?.lawyer_consultation === "default" &&
//     btn?.eligible_offers?.ai_document == null &&
//     btn?.eligible_offers?.lawyer_finalization === null
//   ) {
//     openReferralDrawer(btn, "legalConsultation", chatId, userMetadata, dispatch);
//     return;
//   }

//   //  ai-doc case
//   if (btn?.eligible_offers?.ai_document === "court_document") {
//     showSingleModal(true, dispatch, "inhouse_pro");
//     return;
//   }
//   if (
//     btn?.eligible_offers?.ai_document === "default" &&
//     btn?.eligible_offers?.lawyer_consultation === null &&
//     btn?.eligible_offers?.lawyer_finalization === null
//   ) {
//     showSingleModal(true, dispatch, "inhouse_pro");
//     return;
//   }
//   // show 2 plans only if the user clicked on "access document" button
//   if (
//     btn?.eligible_offers?.ai_document === "default" &&
//     btn?.eligible_offers?.lawyer_finalization === "default" &&
//     btn.text === "Access Document"
//   ) {
//     showMultiModal(true, dispatch, ["ai_doc", "lawyer_finalization"]);
//     return;
//   }

//   // Lawyer_finalization case
//   if (btn?.eligible_offers?.lawyer_finalization === "default") {
//     if (userMetadata?.subscription_type !== PLANS.INHOUSE_COUNSEL) {
//       showSingleModal(true, dispatch, "inhouse_counsel");
//       return;
//     }
//     if (userMetadata?.subscription_type === PLANS.INHOUSE_COUNSEL) {
//       openReferralDrawer(btn, "dedicatedLawyer", chatId, userMetadata, dispatch);
//       return;
//     }
//   }
// };
