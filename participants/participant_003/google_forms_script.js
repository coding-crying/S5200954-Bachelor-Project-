// Google Forms Script for Participant 003
// 24-Hour Delayed Vocabulary Test - 20 words

function createVocabularyTest() {
  // Create new form
  var form = FormApp.create('Vocabulary Test - Participant 003 - 24h Delayed');
  
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
    .setHelpText('Enter your participant number: 003');

  // Section 1: Multiple Choice
  form.addSectionHeaderItem()
    .setTitle('Part A: Multiple Choice')
    .setHelpText('Choose the best word to complete each sentence.');


  // Question 1: vociferous
  form.addMultipleChoiceItem()
    .setTitle('Question 1')
    .setHelpText('The _____ protests outside the courthouse could be heard from several blocks away.')
    .setChoiceValues(['ephemeral', 'copious', 'cursory', 'vociferous'])
    .setRequired(false);

  // Question 2: cajole
  form.addMultipleChoiceItem()
    .setTitle('Question 2')
    .setHelpText('She tried to _____ her reluctant brother into joining the family vacation.')
    .setChoiceValues(['cajole', 'abrogate', 'admonish', 'disparage'])
    .setRequired(false);

  // Question 3: eschew
  form.addMultipleChoiceItem()
    .setTitle('Question 3')
    .setHelpText('Health-conscious consumers increasingly _____ processed foods in favor of natural alternatives.')
    .setChoiceValues(['obfuscate', 'disparage', 'eschew', 'bolster'])
    .setRequired(false);

  // Question 4: austere
  form.addMultipleChoiceItem()
    .setTitle('Question 4')
    .setHelpText('The monastery\'s _____ living conditions reflected the monks\' commitment to simplicity.')
    .setChoiceValues(['precocious', 'copious', 'austere', 'garrulous'])
    .setRequired(false);

  // Question 5: capricious
  form.addMultipleChoiceItem()
    .setTitle('Question 5')
    .setHelpText('The _____ weather made it impossible to plan outdoor activities with confidence.')
    .setChoiceValues(['circumspect', 'intractable', 'abstruse', 'capricious'])
    .setRequired(false);

  // Question 6: obfuscate
  form.addMultipleChoiceItem()
    .setTitle('Question 6')
    .setHelpText('The politician tried to _____ the facts to avoid taking responsibility for the scandal.')
    .setChoiceValues(['capitulate', 'abrogate', 'obfuscate', 'disparage'])
    .setRequired(false);

  // Question 7: intractable
  form.addMultipleChoiceItem()
    .setTitle('Question 7')
    .setHelpText('The _____ dispute had resisted all attempts at resolution for over a decade.')
    .setChoiceValues(['abstruse', 'conciliatory', 'intractable', 'hackneyed'])
    .setRequired(false);

  // Question 8: conciliatory
  form.addMultipleChoiceItem()
    .setTitle('Question 8')
    .setHelpText('After the heated argument, he adopted a _____ tone to restore peace.')
    .setChoiceValues(['conciliatory', 'hackneyed', 'perfunctory', 'deleterious'])
    .setRequired(false);

  // Question 9: abstruse
  form.addMultipleChoiceItem()
    .setTitle('Question 9')
    .setHelpText('The professor\'s _____ explanation of quantum mechanics left most students confused.')
    .setChoiceValues(['abstruse', 'deleterious', 'ephemeral', 'perfunctory'])
    .setRequired(false);

  // Question 10: admonish
  form.addMultipleChoiceItem()
    .setTitle('Question 10')
    .setHelpText('The teacher had to _____ the students for their disruptive behavior during the assembly.')
    .setChoiceValues(['cajole', 'admonish', 'capitulate', 'bolster'])
    .setRequired(false);

  // Question 11: cacophony
  form.addMultipleChoiceItem()
    .setTitle('Question 11')
    .setHelpText('The _____ of car horns and construction noise made conversation impossible.')
    .setChoiceValues(['cacophony', 'candor', 'quandary', 'acumen'])
    .setRequired(false);

  // Question 12: quandary
  form.addMultipleChoiceItem()
    .setTitle('Question 12')
    .setHelpText('Faced with two equally unappealing options, she found herself in a difficult _____.')
    .setChoiceValues(['quandary', 'conundrum', 'cacophony', 'acumen'])
    .setRequired(false);

  // Question 13: deleterious
  form.addMultipleChoiceItem()
    .setTitle('Question 13')
    .setHelpText('The _____ effects of pollution on marine life became increasingly evident.')
    .setChoiceValues(['conciliatory', 'abstruse', 'hackneyed', 'deleterious'])
    .setRequired(false);

  // Question 14: garrulous
  form.addMultipleChoiceItem()
    .setTitle('Question 14')
    .setHelpText('The _____ passenger talked non-stop throughout the entire flight.')
    .setChoiceValues(['copious', 'austere', 'garrulous', 'precocious'])
    .setRequired(false);

  // Question 15: disparage
  form.addMultipleChoiceItem()
    .setTitle('Question 15')
    .setHelpText('Rather than offer constructive criticism, he chose to _____ his opponent\'s achievements.')
    .setChoiceValues(['eschew', 'bolster', 'obfuscate', 'disparage'])
    .setRequired(false);

  // Question 16: hackneyed
  form.addMultipleChoiceItem()
    .setTitle('Question 16')
    .setHelpText('The movie\'s _____ plot failed to engage audiences looking for original storytelling.')
    .setChoiceValues(['conciliatory', 'intractable', 'deleterious', 'hackneyed'])
    .setRequired(false);

  // Question 17: precocious
  form.addMultipleChoiceItem()
    .setTitle('Question 17')
    .setHelpText('The _____ child was reading university-level texts at age ten.')
    .setChoiceValues(['austere', 'garrulous', 'precocious', 'vociferous'])
    .setRequired(false);

  // Question 18: capitulate
  form.addMultipleChoiceItem()
    .setTitle('Question 18')
    .setHelpText('After weeks of resistance, the city was forced to _____ to the enemy\'s demands.')
    .setChoiceValues(['admonish', 'abrogate', 'capitulate', 'cajole'])
    .setRequired(false);

  // Question 19: circumspect
  form.addMultipleChoiceItem()
    .setTitle('Question 19')
    .setHelpText('Given the sensitive nature of the negotiations, the diplomat remained _____ in his statements.')
    .setChoiceValues(['intractable', 'deleterious', 'circumspect', 'capricious'])
    .setRequired(false);

  // Question 20: abrogate
  form.addMultipleChoiceItem()
    .setTitle('Question 20')
    .setHelpText('The new government decided to _____ the controversial treaty signed by its predecessor.')
    .setChoiceValues(['eschew', 'disparage', 'bolster', 'abrogate'])
    .setRequired(false);

  // Section 2: Definitions
  form.addSectionHeaderItem()
    .setTitle('Part B: Definitions (Optional)')
    .setHelpText('Provide clear definitions for each vocabulary word. All questions in this section are optional.');


  // Definition 1: obfuscate
  form.addParagraphTextItem()
    .setTitle('Define: obfuscate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 2: quandary
  form.addParagraphTextItem()
    .setTitle('Define: quandary')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 3: conciliatory
  form.addParagraphTextItem()
    .setTitle('Define: conciliatory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 4: austere
  form.addParagraphTextItem()
    .setTitle('Define: austere')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 5: capricious
  form.addParagraphTextItem()
    .setTitle('Define: capricious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 6: cajole
  form.addParagraphTextItem()
    .setTitle('Define: cajole')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 7: hackneyed
  form.addParagraphTextItem()
    .setTitle('Define: hackneyed')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 8: circumspect
  form.addParagraphTextItem()
    .setTitle('Define: circumspect')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 9: abstruse
  form.addParagraphTextItem()
    .setTitle('Define: abstruse')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 10: abrogate
  form.addParagraphTextItem()
    .setTitle('Define: abrogate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 11: precocious
  form.addParagraphTextItem()
    .setTitle('Define: precocious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 12: eschew
  form.addParagraphTextItem()
    .setTitle('Define: eschew')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 13: garrulous
  form.addParagraphTextItem()
    .setTitle('Define: garrulous')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 14: disparage
  form.addParagraphTextItem()
    .setTitle('Define: disparage')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 15: admonish
  form.addParagraphTextItem()
    .setTitle('Define: admonish')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 16: intractable
  form.addParagraphTextItem()
    .setTitle('Define: intractable')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 17: deleterious
  form.addParagraphTextItem()
    .setTitle('Define: deleterious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 18: cacophony
  form.addParagraphTextItem()
    .setTitle('Define: cacophony')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 19: vociferous
  form.addParagraphTextItem()
    .setTitle('Define: vociferous')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 20: capitulate
  form.addParagraphTextItem()
    .setTitle('Define: capitulate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Responses will be automatically collected in form responses
  // To link to a spreadsheet, manually do so in the form editor
  
  // Get form URL
  var formUrl = form.getPublishedUrl();
  console.log('Form created for Participant 003');
  console.log('Form URL: ' + formUrl);
  
  return formUrl;
}

// To use: Click the "Run" button above or manually call createVocabularyTest()
