import { injectTransferTools } from "../utils";
import introductionAgent from "./introduction";
import aiTutorAgent from "./aiTutor";

// Streamlined agent relationships: Introduction -> Tutor (with all capabilities)
introductionAgent.downstreamAgents = [aiTutorAgent];
aiTutorAgent.downstreamAgents = [introductionAgent]; // Can go back to intro if needed

// Inject the transfer tools
const agents = injectTransferTools([
  introductionAgent,
  aiTutorAgent
]);

export default agents;
