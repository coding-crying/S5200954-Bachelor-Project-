# Conversational AI Vocabulary Learning System

This is a comprehensive vocabulary learning application featuring conversational AI tutors with an integrated experimental research platform. The system includes:

## Features
- **Conversational AI Tutor**: Interactive dialogue-based vocabulary learning with real-time feedback
- **Traditional Flashcard System**: Control condition for experimental comparisons
- **Spaced Repetition Algorithm**: SM-2 implementation for optimized vocabulary retention
- **Experimental Controller**: Automated ABAB/BABA counterbalanced study management
- **Comprehensive Analytics**: Statistical analysis and visualization tools
- **RIMMS Motivation Assessment**: Validated survey for measuring learning motivation

## Experimental Research Platform

This system was designed to conduct within-subjects experiments comparing conversational AI tutoring with traditional flashcard learning. Key findings from our completed study:

### Study Results (N=12 participants)
- **Learning Performance**: Equivalent outcomes between conditions (Conversational AI: 60%, Flashcards: 62%)
- **Motivation**: Conversational AI significantly outperformed flashcards in:
  - Attention capture (Cohen's d = 0.97, large effect)
  - Learning satisfaction (Cohen's d = 1.12, large effect)
  - Overall motivation (approaching significance, p = 0.092)

### Generated Research Outputs
- `COMPLETE_EXPERIMENTAL_RESULTS.md` - Comprehensive 12-page research report
- `experiment_results_master.csv` - Complete dataset with all participants
- Visualization suite (5 publication-ready graphs)
- Individual participant analysis files
- Statistical analysis scripts

![Screenshot of the Conversational Tutor](/public/screenshot.png)

## Quick Start

### Basic Setup
- This is a Next.js TypeScript application with Python backend components
- Install dependencies: `npm install`
- Add your `OPENAI_API_KEY` to `.env` file
- Start development server: `npm run dev`
- Open [http://localhost:3000](http://localhost:3000)

### Running Experiments
- **Start experiment**: `python experimental_controller.py --participant-id 001 --start-experiment`
- **Resume session**: `python experimental_controller.py --participant-id 001 --resume-block 3`
- **Analyze results**: `python comprehensive_results_analysis.py`
- **Generate visualizations**: `python create_visualizations.py`

### Testing Components
```bash
# Test vocabulary system
python test_vocab.py
python test_srs.py

# Test conversation processing
node test_conversation_pipeline.js
node test_batch_processing.js

# Reset vocabulary for testing
node reset_vocabulary_for_testing.js
```

## Configuring Agents
Configuration in `src/app/agentConfigs/simpleExample.ts`
```javascript
import { AgentConfig } from "@/app/types";
import { injectTransferTools } from "./utils";

// Define agents
const haikuWriter: AgentConfig = {
  name: "haikuWriter",
  publicDescription: "Agent that writes haikus.", // Context for the agent_transfer tool
  instructions:
    "Ask the user for a topic, then reply with a haiku about that topic.",
  tools: [],
};

const greeter: AgentConfig = {
  name: "greeter",
  publicDescription: "Agent that greets the user.",
  instructions:
    "Please greet the user and ask them if they'd like a Haiku. If yes, transfer them to the 'haiku' agent.",
  tools: [],
  downstreamAgents: [haikuWriter],
};

// add the transfer tool to point to downstreamAgents
const agents = injectTransferTools([greeter, haikuWriter]);

export default agents;
```

This fully specifies the agent set that was used in the interaction shown in the screenshot above.

### Next steps
- Check out the configs in `src/app/agentConfigs`. The example above is a minimal demo that illustrates the core concepts.
- [frontDeskAuthentication](src/app/agentConfigs/frontDeskAuthentication) Guides the user through a step-by-step authentication flow, confirming each value character-by-character, authenticates the user with a tool call, and then transfers to another agent. Note that the second agent is intentionally "bored" to show how to prompt for personality and tone.
- [customerServiceRetail](src/app/agentConfigs/customerServiceRetail) Also guides through an authentication flow, reads a long offer from a canned script verbatim, and then walks through a complex return flow which requires looking up orders and policies, gathering user context, and checking with `o1-mini` to ensure the return is eligible. To test this flow, say that you'd like to return your snowboard and go through the necessary prompts!

### Defining your own agents
- You can copy these to make your own multi-agent voice app! Once you make a new agent set config, add it to `src/app/agentConfigs/index.ts` and you should be able to select it in the UI in the "Scenario" dropdown menu.
- To see how to define tools and toolLogic, including a background LLM call, see [src/app/agentConfigs/customerServiceRetail/returns.ts](src/app/agentConfigs/customerServiceRetail/returns.ts)
- To see how to define a detailed personality and tone, and use a prompt state machine to collect user information step by step, see [src/app/agentConfigs/frontDeskAuthentication/authentication.ts](src/app/agentConfigs/frontDeskAuthentication/authentication.ts)
- To see how to wire up Agents into a single Agent Set, see [src/app/agentConfigs/frontDeskAuthentication/index.ts](src/app/agentConfigs/frontDeskAuthentication/index.ts)
- If you want help creating your own prompt using these conventions, we've included a metaprompt [here](src/app/agentConfigs/voiceAgentMetaprompt.txt), or you can use our [Voice Agent Metaprompter GPT](https://chatgpt.com/g/g-678865c9fb5c81918fa28699735dd08e-voice-agent-metaprompt-gpt)

### Customizing Output Guardrails
Assistant messages are checked for safety and compliance using a guardrail function before being finalized in the transcript. This is implemented in [`src/app/hooks/useHandleServerEvent.ts`](src/app/hooks/useHandleServerEvent.ts) as the `processGuardrail` function, which is invoked on each assistant message to run a moderation/classification check. You can review or customize this logic by editing the `processGuardrail` function definition and its invocation inside `useHandleServerEvent`.

## UI
- You can select agent scenarios in the Scenario dropdown, and automatically switch to a specific agent with the Agent dropdown.
- The conversation transcript is on the left, including tool calls, tool call responses, and agent changes. Click to expand non-message elements.
- The event log is on the right, showing both client and server events. Click to see the full payload.
- On the bottom, you can disconnect, toggle between automated voice-activity detection or PTT, turn off audio playback, and toggle logs.

## Research Architecture

### Vocabulary Learning System
- **CSV-based Memory**: Persistent storage with SM-2 spaced repetition algorithm
- **Word Effectiveness Analysis**: Real-time GPT-4.1-mini powered conversation analysis
- **Batch Processing**: 3-second inactivity timer with 10-message buffer limits
- **Condition Isolation**: Separate vocabulary sets prevent cross-condition contamination

### Experimental Design
- **Within-subjects**: ABAB/BABA counterbalanced design
- **5-minute learning blocks** with 30-second breaks (manual progression available)
- **24-hour delayed testing** via automated Google Forms generation
- **RIMMS motivation assessment** after each condition's second exposure

### Statistical Analysis
- **Paired t-tests** for within-subjects comparisons
- **Cohen's d effect sizes** for practical significance
- **Individual participant profiling** with trajectory analysis
- **Correlation matrices** between learning and motivation measures

### File Structure
```
├── participant_XXX/               # Individual participant data
│   ├── vocabulary_conversational.csv
│   ├── vocabulary_flashcard.csv
│   ├── rimms_conversational.json
│   ├── rimms_flashcard.json
│   └── participant_XXX_results.csv
├── experiment_results_master.csv  # Complete dataset
├── COMPLETE_EXPERIMENTAL_RESULTS.md  # Full research report
└── *.png                         # Visualization outputs
```

## Core Contributors
- Noah MacCallum - [noahmacca](https://x.com/noahmacca)
- Ilan Bigio - [ibigio](https://github.com/ibigio)

## Research Citation
This system demonstrated that conversational AI tutoring achieves equivalent learning outcomes to traditional flashcards while providing significantly higher motivation and engagement, suggesting promising applications for educational technology development.
