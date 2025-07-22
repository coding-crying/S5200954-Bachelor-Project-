// Google Forms Script for Participant 004
// 24-Hour Delayed Vocabulary Test - 20 words

function createVocabularyTest() {
  // Create new form
  var form = FormApp.create('Vocabulary Test - Participant 004 - 24h Delayed');
  
  // Set form description
  form.setDescription(
    'This is your 24-hour delayed vocabulary test. You learned 20 words yesterday. ' +
    'The test has two parts: multiple choice and definitions. ' +
    'All questions are optional. This should take about 10 minutes.'
  );
  
  // Add participant ID field
  form.addTextItem()
    .setTitle('Participant ID')
    .setRequired(true)
    .setHelpText('Enter your participant number: 004');

  // Section 1: Multiple Choice
  form.addSectionHeaderItem()
    .setTitle('Part A: Multiple Choice')
    .setHelpText('Choose the best word to complete each sentence.');


  // Question 1: obfuscate
  form.addMultipleChoiceItem()
    .setTitle('Question 1')
    .setHelpText('The politician tried to _____ the facts to avoid taking responsibility for the scandal.')
    .setChoiceValues(['obfuscate', 'capitulate', 'abrogate', 'disparage'])
    .setRequired(false);

  // Question 2: bolster
  form.addMultipleChoiceItem()
    .setTitle('Question 2')
    .setHelpText('The positive reviews helped _____ confidence in the company\'s new product line.')
    .setChoiceValues(['obfuscate', 'bolster', 'eschew', 'admonish'])
    .setRequired(false);

  // Question 3: precocious
  form.addMultipleChoiceItem()
    .setTitle('Question 3')
    .setHelpText('The _____ child was reading university-level texts at age ten.')
    .setChoiceValues(['austere', 'garrulous', 'precocious', 'vociferous'])
    .setRequired(false);

  // Question 4: acumen
  form.addMultipleChoiceItem()
    .setTitle('Question 4')
    .setHelpText('Her exceptional business _____ helped transform the struggling company into a market leader.')
    .setChoiceValues(['cacophony', 'candor', 'conundrum', 'acumen'])
    .setRequired(false);

  // Question 5: cajole
  form.addMultipleChoiceItem()
    .setTitle('Question 5')
    .setHelpText('She tried to _____ her reluctant brother into joining the family vacation.')
    .setChoiceValues(['cajole', 'admonish', 'abrogate', 'disparage'])
    .setRequired(false);

  // Question 6: conciliatory
  form.addMultipleChoiceItem()
    .setTitle('Question 6')
    .setHelpText('After the heated argument, he adopted a _____ tone to restore peace.')
    .setChoiceValues(['conciliatory', 'deleterious', 'hackneyed', 'perfunctory'])
    .setRequired(false);

  // Question 7: candor
  form.addMultipleChoiceItem()
    .setTitle('Question 7')
    .setHelpText('His refreshing _____ during the interview impressed the hiring committee.')
    .setChoiceValues(['cacophony', 'candor', 'conundrum', 'acumen'])
    .setRequired(false);

  // Question 8: cursory
  form.addMultipleChoiceItem()
    .setTitle('Question 8')
    .setHelpText('A _____ glance at the report revealed several obvious errors.')
    .setChoiceValues(['ephemeral', 'vociferous', 'cursory', 'copious'])
    .setRequired(false);

  // Question 9: abrogate
  form.addMultipleChoiceItem()
    .setTitle('Question 9')
    .setHelpText('The new government decided to _____ the controversial treaty signed by its predecessor.')
    .setChoiceValues(['disparage', 'bolster', 'eschew', 'abrogate'])
    .setRequired(false);

  // Question 10: disparage
  form.addMultipleChoiceItem()
    .setTitle('Question 10')
    .setHelpText('Rather than offer constructive criticism, he chose to _____ his opponent\'s achievements.')
    .setChoiceValues(['obfuscate', 'bolster', 'eschew', 'disparage'])
    .setRequired(false);

  // Question 11: capricious
  form.addMultipleChoiceItem()
    .setTitle('Question 11')
    .setHelpText('The _____ weather made it impossible to plan outdoor activities with confidence.')
    .setChoiceValues(['circumspect', 'abstruse', 'intractable', 'capricious'])
    .setRequired(false);

  // Question 12: garrulous
  form.addMultipleChoiceItem()
    .setTitle('Question 12')
    .setHelpText('The _____ passenger talked non-stop throughout the entire flight.')
    .setChoiceValues(['garrulous', 'austere', 'precocious', 'copious'])
    .setRequired(false);

  // Question 13: capitulate
  form.addMultipleChoiceItem()
    .setTitle('Question 13')
    .setHelpText('After weeks of resistance, the city was forced to _____ to the enemy\'s demands.')
    .setChoiceValues(['capitulate', 'abrogate', 'cajole', 'admonish'])
    .setRequired(false);

  // Question 14: quandary
  form.addMultipleChoiceItem()
    .setTitle('Question 14')
    .setHelpText('Faced with two equally unappealing options, she found herself in a difficult _____.')
    .setChoiceValues(['conundrum', 'acumen', 'cacophony', 'quandary'])
    .setRequired(false);

  // Question 15: admonish
  form.addMultipleChoiceItem()
    .setTitle('Question 15')
    .setHelpText('The teacher had to _____ the students for their disruptive behavior during the assembly.')
    .setChoiceValues(['capitulate', 'bolster', 'cajole', 'admonish'])
    .setRequired(false);

  // Question 16: cacophony
  form.addMultipleChoiceItem()
    .setTitle('Question 16')
    .setHelpText('The _____ of car horns and construction noise made conversation impossible.')
    .setChoiceValues(['acumen', 'cacophony', 'candor', 'quandary'])
    .setRequired(false);

  // Question 17: perfunctory
  form.addMultipleChoiceItem()
    .setTitle('Question 17')
    .setHelpText('Her _____ apology lacked sincerity and failed to address the real issues.')
    .setChoiceValues(['capricious', 'precocious', 'perfunctory', 'circumspect'])
    .setRequired(false);

  // Question 18: ephemeral
  form.addMultipleChoiceItem()
    .setTitle('Question 18')
    .setHelpText('The _____ beauty of cherry blossoms makes their brief blooming season even more precious.')
    .setChoiceValues(['ephemeral', 'copious', 'vociferous', 'cursory'])
    .setRequired(false);

  // Question 19: deleterious
  form.addMultipleChoiceItem()
    .setTitle('Question 19')
    .setHelpText('The _____ effects of pollution on marine life became increasingly evident.')
    .setChoiceValues(['deleterious', 'conciliatory', 'hackneyed', 'abstruse'])
    .setRequired(false);

  // Question 20: circumspect
  form.addMultipleChoiceItem()
    .setTitle('Question 20')
    .setHelpText('Given the sensitive nature of the negotiations, the diplomat remained _____ in his statements.')
    .setChoiceValues(['intractable', 'deleterious', 'circumspect', 'capricious'])
    .setRequired(false);

  // Section 2: Definitions
  form.addSectionHeaderItem()
    .setTitle('Part B: Definitions (Optional)')
    .setHelpText('Provide clear definitions for each vocabulary word. All questions in this section are optional.');


  // Definition 1: conciliatory
  form.addParagraphTextItem()
    .setTitle('Define: conciliatory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 2: precocious
  form.addParagraphTextItem()
    .setTitle('Define: precocious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 3: cacophony
  form.addParagraphTextItem()
    .setTitle('Define: cacophony')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 4: cajole
  form.addParagraphTextItem()
    .setTitle('Define: cajole')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 5: bolster
  form.addParagraphTextItem()
    .setTitle('Define: bolster')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 6: cursory
  form.addParagraphTextItem()
    .setTitle('Define: cursory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 7: garrulous
  form.addParagraphTextItem()
    .setTitle('Define: garrulous')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 8: ephemeral
  form.addParagraphTextItem()
    .setTitle('Define: ephemeral')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 9: disparage
  form.addParagraphTextItem()
    .setTitle('Define: disparage')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 10: obfuscate
  form.addParagraphTextItem()
    .setTitle('Define: obfuscate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 11: acumen
  form.addParagraphTextItem()
    .setTitle('Define: acumen')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 12: candor
  form.addParagraphTextItem()
    .setTitle('Define: candor')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 13: capitulate
  form.addParagraphTextItem()
    .setTitle('Define: capitulate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 14: perfunctory
  form.addParagraphTextItem()
    .setTitle('Define: perfunctory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 15: circumspect
  form.addParagraphTextItem()
    .setTitle('Define: circumspect')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 16: deleterious
  form.addParagraphTextItem()
    .setTitle('Define: deleterious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 17: quandary
  form.addParagraphTextItem()
    .setTitle('Define: quandary')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 18: admonish
  form.addParagraphTextItem()
    .setTitle('Define: admonish')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 19: abrogate
  form.addParagraphTextItem()
    .setTitle('Define: abrogate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 20: capricious
  form.addParagraphTextItem()
    .setTitle('Define: capricious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Responses will be automatically collected in form responses
  // To link to a spreadsheet, manually do so in the form editor
  
  // Get form URL
  var formUrl = form.getPublishedUrl();
  console.log('Form created for Participant 004');
  console.log('Form URL: ' + formUrl);
  
  return formUrl;
}

// To use: Click the "Run" button above or manually call createVocabularyTest()
