import { injectTransferTools } from "../utils";
import introductionAgent from "./introduction";
import newLanguageIntroAgent from "./newLanguageIntro";
import existingLanguageIntroAgent from "./existingLanguageIntro";

// Set up the agent relationships
introductionAgent.downstreamAgents = [newLanguageIntroAgent, existingLanguageIntroAgent];
newLanguageIntroAgent.downstreamAgents = [introductionAgent];
existingLanguageIntroAgent.downstreamAgents = [introductionAgent];

// Inject the transfer tools
const agents = injectTransferTools([
  introductionAgent,
  newLanguageIntroAgent,
  existingLanguageIntroAgent
]);

export default agents;
