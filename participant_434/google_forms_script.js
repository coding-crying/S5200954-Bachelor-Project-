// Google Forms Script for Participant 434
// 24-Hour Delayed Vocabulary Test - 20 words

function createVocabularyTest() {
  // Create new form
  var form = FormApp.create('Vocabulary Test - Participant 434 - 24h Delayed');
  
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
    .setHelpText('Enter your participant number: 434');

  // Section 1: Multiple Choice
  form.addSectionHeaderItem()
    .setTitle('Part A: Multiple Choice')
    .setHelpText('Choose the best word to complete each sentence.');


  // Question 1: quandary
  form.addMultipleChoiceItem()
    .setTitle('Question 1')
    .setHelpText('Faced with two equally unappealing options, she found herself in a difficult _____.')
    .setChoiceValues(['acumen', 'quandary', 'conundrum', 'cacophony'])
    .setRequired(false);

  // Question 2: cursory
  form.addMultipleChoiceItem()
    .setTitle('Question 2')
    .setHelpText('A _____ glance at the report revealed several obvious errors.')
    .setChoiceValues(['vociferous', 'cursory', 'ephemeral', 'copious'])
    .setRequired(false);

  // Question 3: cajole
  form.addMultipleChoiceItem()
    .setTitle('Question 3')
    .setHelpText('She tried to _____ her reluctant brother into joining the family vacation.')
    .setChoiceValues(['cajole', 'disparage', 'admonish', 'abrogate'])
    .setRequired(false);

  // Question 4: admonish
  form.addMultipleChoiceItem()
    .setTitle('Question 4')
    .setHelpText('The teacher had to _____ the students for their disruptive behavior during the assembly.')
    .setChoiceValues(['admonish', 'bolster', 'capitulate', 'cajole'])
    .setRequired(false);

  // Question 5: conciliatory
  form.addMultipleChoiceItem()
    .setTitle('Question 5')
    .setHelpText('After the heated argument, he adopted a _____ tone to restore peace.')
    .setChoiceValues(['perfunctory', 'deleterious', 'conciliatory', 'hackneyed'])
    .setRequired(false);

  // Question 6: intractable
  form.addMultipleChoiceItem()
    .setTitle('Question 6')
    .setHelpText('The _____ dispute had resisted all attempts at resolution for over a decade.')
    .setChoiceValues(['intractable', 'conciliatory', 'hackneyed', 'abstruse'])
    .setRequired(false);

  // Question 7: conundrum
  form.addMultipleChoiceItem()
    .setTitle('Question 7')
    .setHelpText('The detective faced a perplexing _____ with no obvious solution in sight.')
    .setChoiceValues(['quandary', 'acumen', 'candor', 'conundrum'])
    .setRequired(false);

  // Question 8: capricious
  form.addMultipleChoiceItem()
    .setTitle('Question 8')
    .setHelpText('The _____ weather made it impossible to plan outdoor activities with confidence.')
    .setChoiceValues(['capricious', 'circumspect', 'intractable', 'abstruse'])
    .setRequired(false);

  // Question 9: disparage
  form.addMultipleChoiceItem()
    .setTitle('Question 9')
    .setHelpText('Rather than offer constructive criticism, he chose to _____ his opponent\'s achievements.')
    .setChoiceValues(['obfuscate', 'disparage', 'bolster', 'eschew'])
    .setRequired(false);

  // Question 10: ephemeral
  form.addMultipleChoiceItem()
    .setTitle('Question 10')
    .setHelpText('The _____ beauty of cherry blossoms makes their brief blooming season even more precious.')
    .setChoiceValues(['cursory', 'ephemeral', 'vociferous', 'copious'])
    .setRequired(false);

  // Question 11: vociferous
  form.addMultipleChoiceItem()
    .setTitle('Question 11')
    .setHelpText('The _____ protests outside the courthouse could be heard from several blocks away.')
    .setChoiceValues(['ephemeral', 'cursory', 'copious', 'vociferous'])
    .setRequired(false);

  // Question 12: capitulate
  form.addMultipleChoiceItem()
    .setTitle('Question 12')
    .setHelpText('After weeks of resistance, the city was forced to _____ to the enemy\'s demands.')
    .setChoiceValues(['abrogate', 'cajole', 'capitulate', 'admonish'])
    .setRequired(false);

  // Question 13: eschew
  form.addMultipleChoiceItem()
    .setTitle('Question 13')
    .setHelpText('Health-conscious consumers increasingly _____ processed foods in favor of natural alternatives.')
    .setChoiceValues(['obfuscate', 'bolster', 'disparage', 'eschew'])
    .setRequired(false);

  // Question 14: cacophony
  form.addMultipleChoiceItem()
    .setTitle('Question 14')
    .setHelpText('The _____ of car horns and construction noise made conversation impossible.')
    .setChoiceValues(['quandary', 'acumen', 'candor', 'cacophony'])
    .setRequired(false);

  // Question 15: precocious
  form.addMultipleChoiceItem()
    .setTitle('Question 15')
    .setHelpText('The _____ child was reading university-level texts at age ten.')
    .setChoiceValues(['precocious', 'austere', 'garrulous', 'vociferous'])
    .setRequired(false);

  // Question 16: candor
  form.addMultipleChoiceItem()
    .setTitle('Question 16')
    .setHelpText('His refreshing _____ during the interview impressed the hiring committee.')
    .setChoiceValues(['candor', 'cacophony', 'acumen', 'conundrum'])
    .setRequired(false);

  // Question 17: hackneyed
  form.addMultipleChoiceItem()
    .setTitle('Question 17')
    .setHelpText('The movie\'s _____ plot failed to engage audiences looking for original storytelling.')
    .setChoiceValues(['hackneyed', 'conciliatory', 'intractable', 'deleterious'])
    .setRequired(false);

  // Question 18: austere
  form.addMultipleChoiceItem()
    .setTitle('Question 18')
    .setHelpText('The monastery\'s _____ living conditions reflected the monks\' commitment to simplicity.')
    .setChoiceValues(['copious', 'precocious', 'garrulous', 'austere'])
    .setRequired(false);

  // Question 19: obfuscate
  form.addMultipleChoiceItem()
    .setTitle('Question 19')
    .setHelpText('The politician tried to _____ the facts to avoid taking responsibility for the scandal.')
    .setChoiceValues(['disparage', 'capitulate', 'abrogate', 'obfuscate'])
    .setRequired(false);

  // Question 20: garrulous
  form.addMultipleChoiceItem()
    .setTitle('Question 20')
    .setHelpText('The _____ passenger talked non-stop throughout the entire flight.')
    .setChoiceValues(['garrulous', 'precocious', 'copious', 'austere'])
    .setRequired(false);

  // Section 2: Definitions
  form.addSectionHeaderItem()
    .setTitle('Part B: Definitions (Optional)')
    .setHelpText('Provide clear definitions for each vocabulary word. All questions in this section are optional.');


  // Definition 1: ephemeral
  form.addParagraphTextItem()
    .setTitle('Define: ephemeral')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 2: hackneyed
  form.addParagraphTextItem()
    .setTitle('Define: hackneyed')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 3: quandary
  form.addParagraphTextItem()
    .setTitle('Define: quandary')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 4: intractable
  form.addParagraphTextItem()
    .setTitle('Define: intractable')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 5: capricious
  form.addParagraphTextItem()
    .setTitle('Define: capricious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 6: candor
  form.addParagraphTextItem()
    .setTitle('Define: candor')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 7: precocious
  form.addParagraphTextItem()
    .setTitle('Define: precocious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 8: eschew
  form.addParagraphTextItem()
    .setTitle('Define: eschew')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 9: garrulous
  form.addParagraphTextItem()
    .setTitle('Define: garrulous')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 10: obfuscate
  form.addParagraphTextItem()
    .setTitle('Define: obfuscate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 11: disparage
  form.addParagraphTextItem()
    .setTitle('Define: disparage')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 12: cajole
  form.addParagraphTextItem()
    .setTitle('Define: cajole')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 13: capitulate
  form.addParagraphTextItem()
    .setTitle('Define: capitulate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 14: conciliatory
  form.addParagraphTextItem()
    .setTitle('Define: conciliatory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 15: cursory
  form.addParagraphTextItem()
    .setTitle('Define: cursory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 16: cacophony
  form.addParagraphTextItem()
    .setTitle('Define: cacophony')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 17: conundrum
  form.addParagraphTextItem()
    .setTitle('Define: conundrum')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 18: admonish
  form.addParagraphTextItem()
    .setTitle('Define: admonish')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 19: vociferous
  form.addParagraphTextItem()
    .setTitle('Define: vociferous')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 20: austere
  form.addParagraphTextItem()
    .setTitle('Define: austere')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Responses will be automatically collected in form responses
  // To link to a spreadsheet, manually do so in the form editor
  
  // Get form URL
  var formUrl = form.getPublishedUrl();
  console.log('Form created for Participant 434');
  console.log('Form URL: ' + formUrl);
  
  return formUrl;
}

// To use: Click the "Run" button above or manually call createVocabularyTest()
