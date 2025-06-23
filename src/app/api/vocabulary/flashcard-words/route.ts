import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface FlashcardWord {
  word: string;
  definition: string;
  contextExamples: string[];
}

/**
 * Get participant-specific vocabulary words with definitions and examples for flashcard condition
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const participantId = searchParams.get('participant');

  console.log('Flashcard API called with participant:', participantId);

  if (!participantId) {
    console.log('No participant ID provided');
    return NextResponse.json(
      { error: 'Participant ID is required' },
      { status: 400 }
    );
  }

  try {
    // Path to participant's flashcard-specific vocabulary file
    const participantVocabPath = path.join(process.cwd(), `participant_${participantId}`, 'vocabulary_flashcard.csv');
    console.log('Looking for vocabulary file at:', participantVocabPath);
    
    if (!fs.existsSync(participantVocabPath)) {
      console.log('Vocabulary file not found at:', participantVocabPath);
      return NextResponse.json(
        { error: `Vocabulary not found for participant ${participantId}` },
        { status: 404 }
      );
    }

    console.log('Vocabulary file found, reading...');

    // Read participant's vocabulary CSV
    const fileContent = fs.readFileSync(participantVocabPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // Extract words and exclude the attention check word "happy"
    const vocabularyWords = records
      .map((record: any) => record.word)
      .filter((word: string) => word && word.toLowerCase() !== 'happy');
    
    console.log('Extracted vocabulary words:', vocabularyWords);
    
    // Generate flashcard data with definitions and examples
    const flashcardWords: FlashcardWord[] = vocabularyWords.map((word: string) => ({
      word,
      definition: getDefinition(word),
      contextExamples: getContextExamples(word)
    }));

    console.log('Generated flashcard words:', flashcardWords.length);

    return NextResponse.json({
      success: true,
      participantId,
      totalWords: flashcardWords.length,
      words: flashcardWords
    });

  } catch (error) {
    console.error('Error loading participant vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to load vocabulary' },
      { status: 500 }
    );
  }
}

/**
 * Get definition for a vocabulary word
 */
function getDefinition(word: string): string {
  const definitions: Record<string, string> = {
    obfuscate: "To deliberately make something unclear, confusing, or difficult to understand.",
    disparage: "To regard or represent as being of little worth; to criticize unfairly.",
    perfunctory: "Carried out with a minimum of effort or reflection; superficial or mechanical.",
    precocious: "Having developed certain abilities or inclinations at an earlier age than is usual.",
    quandary: "A state of perplexity or uncertainty over what to do in a difficult situation.",
    circumspect: "Wary and unwilling to take risks; careful to consider all circumstances.",
    capitulate: "To cease resistance and submit to an opponent or overwhelming force.",
    vociferous: "Expressing opinions or feelings in a loud and forceful way.",
    intractable: "Hard to control or deal with; stubborn and difficult to manage.",
    abrogate: "To repeal or do away with a law, right, or formal agreement.",
    abstruse: "Difficult to understand; obscure and esoteric.",
    acumen: "The ability to make good judgments and quick decisions, typically in business.",
    admonish: "To warn or reprimand someone firmly but not severely.",
    austere: "Severe or strict in manner, attitude, or expression; having no comfort or luxuries.",
    benevolent: "Well meaning and kindly; charitable and helpful.",
    bolster: "To support or strengthen; to prop up or reinforce.",
    cacophony: "A harsh, discordant mixture of sounds; unpleasant noise.",
    cajole: "To persuade someone to do something by sustained coaxing or flattery.",
    candor: "The quality of being open and honest in expression; frankness.",
    capricious: "Given to sudden and unaccountable changes of mood or behavior.",
    complacent: "Showing smug or uncritical satisfaction with oneself or achievements.",
    conciliatory: "Intended or likely to placate or pacify; appeasing.",
    conundrum: "A confusing and difficult problem or question.",
    copious: "Abundant in supply or quantity; plentiful and extensive.",
    cursory: "Hasty and therefore not thorough or detailed; superficial.",
    deleterious: "Causing harm or damage; having a harmful effect.",
    despot: "A ruler or other person who holds absolute power, typically exercising it cruelly.",
    ennui: "A feeling of listlessness and dissatisfaction arising from lack of occupation or excitement.",
    ephemeral: "Lasting for a very short time; transitory and fleeting.",
    eschew: "To deliberately avoid or abstain from something.",
    garrulous: "Excessively talkative, especially on trivial matters.",
    hackneyed: "Lacking originality or freshness; overused and therefore lacking impact."
  };

  return definitions[word.toLowerCase()] || `Advanced vocabulary word: ${word}`;
}

/**
 * Get context examples for a vocabulary word
 */
function getContextExamples(word: string): string[] {
  const examples: Record<string, string[]> = {
    obfuscate: [
      "The lawyer tried to obfuscate the evidence with complex legal jargon.",
      "Rather than explain clearly, he chose to obfuscate the issue further."
    ],
    disparage: [
      "It's unprofessional to disparage your competitors in public.",
      "She would never disparage someone's efforts, even if unsuccessful."
    ],
    perfunctory: [
      "His perfunctory apology lacked any genuine remorse.",
      "The security check was merely perfunctory and missed obvious issues."
    ],
    precocious: [
      "The precocious child was reading novels by age six.",
      "Her precocious understanding of mathematics impressed her teachers."
    ],
    quandary: [
      "Faced with two equally unappealing options, she found herself in a difficult quandary.",
      "The ethical quandary posed by the new technology troubled many researchers."
    ],
    circumspect: [
      "The diplomat was circumspect in his response to avoid controversy.",
      "Being circumspect with investments helped her avoid major losses."
    ],
    capitulate: [
      "The city was forced to capitulate after a long siege.",
      "Rather than capitulate to pressure, she stood firm in her principles."
    ],
    vociferous: [
      "The vociferous crowd demanded answers from the politician.",
      "His vociferous objections to the plan were heard throughout the building."
    ],
    intractable: [
      "The conflict seemed intractable despite years of negotiations.",
      "Her intractable attitude made collaboration nearly impossible."
    ],
    abrogate: [
      "The new government moved quickly to abrogate the unpopular treaty.",
      "The court's decision would effectively abrogate decades of precedent."
    ],
    abstruse: [
      "The professor's abstruse explanation of quantum mechanics left most students confused.",
      "His writing style was so abstruse that few readers could follow his arguments."
    ],
    acumen: [
      "Her exceptional business acumen helped transform the struggling company.",
      "The detective's investigative acumen quickly led to solving the case."
    ],
    admonish: [
      "The teacher had to admonish the students for their disruptive behavior.",
      "She would gently admonish anyone who arrived late to meetings."
    ],
    austere: [
      "The monastery's austere living conditions reflected the monks' commitment to simplicity.",
      "His austere office contained only the bare essentials for work."
    ],
    benevolent: [
      "The benevolent dictator was beloved by his people for his generous social programs.",
      "Her benevolent smile put the nervous students at ease."
    ],
    bolster: [
      "The positive reviews helped bolster confidence in the new product.",
      "Additional funding would bolster the research program significantly."
    ],
    cacophony: [
      "The construction site created a cacophony of drilling and hammering.",
      "The orchestra's warm-up created a cacophony before the beautiful performance."
    ],
    cajole: [
      "She tried to cajole her reluctant brother into joining the family vacation.",
      "The salesman attempted to cajole customers with flattery and special offers."
    ],
    candor: [
      "His refreshing candor during the interview impressed the hiring committee.",
      "She appreciated his candor, even when the truth was difficult to hear."
    ],
    capricious: [
      "The capricious weather made it impossible to plan outdoor activities.",
      "His capricious decision-making made him unreliable as a leader."
    ],
    complacent: [
      "Success made the team complacent, leading to their unexpected defeat.",
      "The company became complacent about security until the data breach occurred."
    ],
    conciliatory: [
      "After the heated argument, he adopted a conciliatory tone to restore peace.",
      "The conciliatory gesture helped repair the damaged relationship."
    ],
    conundrum: [
      "The detective faced a perplexing conundrum with no obvious solution in sight.",
      "The moral conundrum kept her awake at night, weighing right against wrong."
    ],
    copious: [
      "The researcher took copious notes during the lengthy interview session.",
      "Copious rainfall this month has ended the drought conditions."
    ],
    cursory: [
      "A cursory glance at the report revealed several obvious errors.",
      "The cursory inspection failed to identify the structural problems."
    ],
    deleterious: [
      "The deleterious effects of pollution on marine life became increasingly evident.",
      "Smoking has well-documented deleterious effects on health."
    ],
    despot: [
      "The cruel despot ruled through fear and intimidation for decades.",
      "History books are filled with accounts of despots and their oppressive regimes."
    ],
    ennui: [
      "A sense of ennui settled over the office workers as another mundane Monday began.",
      "The wealthy socialite's life of luxury couldn't cure her persistent ennui."
    ],
    ephemeral: [
      "The ephemeral beauty of cherry blossoms makes their brief blooming season precious.",
      "Social media fame can be ephemeral, disappearing as quickly as it arrives."
    ],
    eschew: [
      "Health-conscious consumers increasingly eschew processed foods.",
      "The monk chose to eschew all worldly possessions in pursuit of enlightenment."
    ],
    garrulous: [
      "The garrulous passenger talked non-stop throughout the entire flight.",
      "His garrulous nature made him popular at parties but tiresome in meetings."
    ],
    hackneyed: [
      "The movie's hackneyed plot failed to engage audiences looking for originality.",
      "She avoided hackneyed phrases in favor of original expressions."
    ]
  };

  return examples[word.toLowerCase()] || [
    `The ${word} was evident in the situation.`,
    `Her ${word} approach proved effective.`
  ];
}