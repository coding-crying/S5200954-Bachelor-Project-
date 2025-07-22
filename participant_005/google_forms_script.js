// Google Forms Script for Participant 005
// 24-Hour Delayed Vocabulary Test - 20 words

function createVocabularyTest() {
  // Create new form
  var form = FormApp.create('Vocabulary Test - Participant 005 - 24h Delayed');
  
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
    .setHelpText('Enter your participant number: 005');

  // Section 1: Multiple Choice
  form.addSectionHeaderItem()
    .setTitle('Part A: Multiple Choice')
    .setHelpText('Choose the best word to complete each sentence.');


  // Question 1: perfunctory
  form.addMultipleChoiceItem()
    .setTitle('Question 1')
    .setHelpText('Her _____ apology lacked sincerity and failed to address the real issues.')
    .setChoiceValues(['circumspect', 'perfunctory', 'capricious', 'precocious'])
    .setRequired(false);

  // Question 2: admonish
  form.addMultipleChoiceItem()
    .setTitle('Question 2')
    .setHelpText('The teacher had to _____ the students for their disruptive behavior during the assembly.')
    .setChoiceValues(['admonish', 'cajole', 'bolster', 'capitulate'])
    .setRequired(false);

  // Question 3: precocious
  form.addMultipleChoiceItem()
    .setTitle('Question 3')
    .setHelpText('The _____ child was reading university-level texts at age ten.')
    .setChoiceValues(['precocious', 'austere', 'garrulous', 'vociferous'])
    .setRequired(false);

  // Question 4: abstruse
  form.addMultipleChoiceItem()
    .setTitle('Question 4')
    .setHelpText('The professor\'s _____ explanation of quantum mechanics left most students confused.')
    .setChoiceValues(['ephemeral', 'perfunctory', 'deleterious', 'abstruse'])
    .setRequired(false);

  // Question 5: copious
  form.addMultipleChoiceItem()
    .setTitle('Question 5')
    .setHelpText('The researcher took _____ notes during the lengthy interview session.')
    .setChoiceValues(['vociferous', 'ephemeral', 'copious', 'cursory'])
    .setRequired(false);

  // Question 6: capitulate
  form.addMultipleChoiceItem()
    .setTitle('Question 6')
    .setHelpText('After weeks of resistance, the city was forced to _____ to the enemy\'s demands.')
    .setChoiceValues(['admonish', 'capitulate', 'abrogate', 'cajole'])
    .setRequired(false);

  // Question 7: hackneyed
  form.addMultipleChoiceItem()
    .setTitle('Question 7')
    .setHelpText('The movie\'s _____ plot failed to engage audiences looking for original storytelling.')
    .setChoiceValues(['deleterious', 'intractable', 'hackneyed', 'conciliatory'])
    .setRequired(false);

  // Question 8: deleterious
  form.addMultipleChoiceItem()
    .setTitle('Question 8')
    .setHelpText('The _____ effects of pollution on marine life became increasingly evident.')
    .setChoiceValues(['deleterious', 'conciliatory', 'abstruse', 'hackneyed'])
    .setRequired(false);

  // Question 9: eschew
  form.addMultipleChoiceItem()
    .setTitle('Question 9')
    .setHelpText('Health-conscious consumers increasingly _____ processed foods in favor of natural alternatives.')
    .setChoiceValues(['bolster', 'eschew', 'disparage', 'obfuscate'])
    .setRequired(false);

  // Question 10: abrogate
  form.addMultipleChoiceItem()
    .setTitle('Question 10')
    .setHelpText('The new government decided to _____ the controversial treaty signed by its predecessor.')
    .setChoiceValues(['bolster', 'eschew', 'disparage', 'abrogate'])
    .setRequired(false);

  // Question 11: obfuscate
  form.addMultipleChoiceItem()
    .setTitle('Question 11')
    .setHelpText('The politician tried to _____ the facts to avoid taking responsibility for the scandal.')
    .setChoiceValues(['disparage', 'obfuscate', 'abrogate', 'capitulate'])
    .setRequired(false);

  // Question 12: cursory
  form.addMultipleChoiceItem()
    .setTitle('Question 12')
    .setHelpText('A _____ glance at the report revealed several obvious errors.')
    .setChoiceValues(['vociferous', 'copious', 'cursory', 'ephemeral'])
    .setRequired(false);

  // Question 13: conundrum
  form.addMultipleChoiceItem()
    .setTitle('Question 13')
    .setHelpText('The detective faced a perplexing _____ with no obvious solution in sight.')
    .setChoiceValues(['quandary', 'acumen', 'candor', 'conundrum'])
    .setRequired(false);

  // Question 14: intractable
  form.addMultipleChoiceItem()
    .setTitle('Question 14')
    .setHelpText('The _____ dispute had resisted all attempts at resolution for over a decade.')
    .setChoiceValues(['intractable', 'abstruse', 'hackneyed', 'conciliatory'])
    .setRequired(false);

  // Question 15: austere
  form.addMultipleChoiceItem()
    .setTitle('Question 15')
    .setHelpText('The monastery\'s _____ living conditions reflected the monks\' commitment to simplicity.')
    .setChoiceValues(['garrulous', 'precocious', 'austere', 'copious'])
    .setRequired(false);

  // Question 16: ephemeral
  form.addMultipleChoiceItem()
    .setTitle('Question 16')
    .setHelpText('The _____ beauty of cherry blossoms makes their brief blooming season even more precious.')
    .setChoiceValues(['ephemeral', 'vociferous', 'cursory', 'copious'])
    .setRequired(false);

  // Question 17: capricious
  form.addMultipleChoiceItem()
    .setTitle('Question 17')
    .setHelpText('The _____ weather made it impossible to plan outdoor activities with confidence.')
    .setChoiceValues(['abstruse', 'circumspect', 'intractable', 'capricious'])
    .setRequired(false);

  // Question 18: circumspect
  form.addMultipleChoiceItem()
    .setTitle('Question 18')
    .setHelpText('Given the sensitive nature of the negotiations, the diplomat remained _____ in his statements.')
    .setChoiceValues(['deleterious', 'intractable', 'circumspect', 'capricious'])
    .setRequired(false);

  // Question 19: disparage
  form.addMultipleChoiceItem()
    .setTitle('Question 19')
    .setHelpText('Rather than offer constructive criticism, he chose to _____ his opponent\'s achievements.')
    .setChoiceValues(['bolster', 'disparage', 'eschew', 'obfuscate'])
    .setRequired(false);

  // Question 20: quandary
  form.addMultipleChoiceItem()
    .setTitle('Question 20')
    .setHelpText('Faced with two equally unappealing options, she found herself in a difficult _____.')
    .setChoiceValues(['quandary', 'acumen', 'cacophony', 'conundrum'])
    .setRequired(false);

  // Section 2: Definitions
  form.addSectionHeaderItem()
    .setTitle('Part B: Definitions (Optional)')
    .setHelpText('Provide clear definitions for each vocabulary word. All questions in this section are optional.');


  // Definition 1: copious
  form.addParagraphTextItem()
    .setTitle('Define: copious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 2: abrogate
  form.addParagraphTextItem()
    .setTitle('Define: abrogate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 3: capitulate
  form.addParagraphTextItem()
    .setTitle('Define: capitulate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 4: obfuscate
  form.addParagraphTextItem()
    .setTitle('Define: obfuscate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 5: quandary
  form.addParagraphTextItem()
    .setTitle('Define: quandary')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 6: disparage
  form.addParagraphTextItem()
    .setTitle('Define: disparage')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 7: circumspect
  form.addParagraphTextItem()
    .setTitle('Define: circumspect')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 8: capricious
  form.addParagraphTextItem()
    .setTitle('Define: capricious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 9: hackneyed
  form.addParagraphTextItem()
    .setTitle('Define: hackneyed')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 10: precocious
  form.addParagraphTextItem()
    .setTitle('Define: precocious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 11: admonish
  form.addParagraphTextItem()
    .setTitle('Define: admonish')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 12: deleterious
  form.addParagraphTextItem()
    .setTitle('Define: deleterious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 13: eschew
  form.addParagraphTextItem()
    .setTitle('Define: eschew')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 14: ephemeral
  form.addParagraphTextItem()
    .setTitle('Define: ephemeral')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 15: perfunctory
  form.addParagraphTextItem()
    .setTitle('Define: perfunctory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 16: abstruse
  form.addParagraphTextItem()
    .setTitle('Define: abstruse')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 17: cursory
  form.addParagraphTextItem()
    .setTitle('Define: cursory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 18: austere
  form.addParagraphTextItem()
    .setTitle('Define: austere')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 19: conundrum
  form.addParagraphTextItem()
    .setTitle('Define: conundrum')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 20: intractable
  form.addParagraphTextItem()
    .setTitle('Define: intractable')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Responses will be automatically collected in form responses
  // To link to a spreadsheet, manually do so in the form editor
  
  // Get form URL
  var formUrl = form.getPublishedUrl();
  console.log('Form created for Participant 005');
  console.log('Form URL: ' + formUrl);
  
  return formUrl;
}

// To use: Click the "Run" button above or manually call createVocabularyTest()
