import { AllAgentConfigsType } from "@/app/types";
import frontDeskAuthentication from "./frontDeskAuthentication";
import customerServiceRetail from "./customerServiceRetail";
import simpleExample from "./simpleExample";
import vocabularyInstructor from "./vocabularyInstructor";
import languageLearning from "./languageLearning";

export const allAgentSets: AllAgentConfigsType = {
  frontDeskAuthentication,
  customerServiceRetail,
  simpleExample,
  vocabularyInstructor,
  languageLearning,
};

export const defaultAgentSetKey = "vocabularyInstructor";
