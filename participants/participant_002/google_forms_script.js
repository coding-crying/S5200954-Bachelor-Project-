// Google Forms Script for Participant 002
// 24-Hour Delayed Vocabulary Test - 20 words

function createVocabularyTest() {
  // Create new form
  var form = FormApp.create('Vocabulary Test - Participant 002 - 24h Delayed');
  
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
    .setHelpText('Enter your participant number: 002');

  // Section 1: Multiple Choice
  form.addSectionHeaderItem()
    .setTitle('Part A: Multiple Choice')
    .setHelpText('Choose the best word to complete each sentence.');


  // Question 1: disparage
  form.addMultipleChoiceItem()
    .setTitle('Question 1')
    .setHelpText('Rather than offer constructive criticism, he chose to _____ his opponent\'s achievements.')
    .setChoiceValues(['disparage', 'obfuscate', 'bolster', 'eschew'])
    .setRequired(false);

  // Question 2: austere
  form.addMultipleChoiceItem()
    .setTitle('Question 2')
    .setHelpText('The monastery\'s _____ living conditions reflected the monks\' commitment to simplicity.')
    .setChoiceValues(['austere', 'garrulous', 'precocious', 'copious'])
    .setRequired(false);

  // Question 3: perfunctory
  form.addMultipleChoiceItem()
    .setTitle('Question 3')
    .setHelpText('Her _____ apology lacked sincerity and failed to address the real issues.')
    .setChoiceValues(['perfunctory', 'precocious', 'circumspect', 'capricious'])
    .setRequired(false);

  // Question 4: ephemeral
  form.addMultipleChoiceItem()
    .setTitle('Question 4')
    .setHelpText('The _____ beauty of cherry blossoms makes their brief blooming season even more precious.')
    .setChoiceValues(['ephemeral', 'copious', 'cursory', 'vociferous'])
    .setRequired(false);

  // Question 5: hackneyed
  form.addMultipleChoiceItem()
    .setTitle('Question 5')
    .setHelpText('The movie\'s _____ plot failed to engage audiences looking for original storytelling.')
    .setChoiceValues(['hackneyed', 'intractable', 'deleterious', 'conciliatory'])
    .setRequired(false);

  // Question 6: obfuscate
  form.addMultipleChoiceItem()
    .setTitle('Question 6')
    .setHelpText('The politician tried to _____ the facts to avoid taking responsibility for the scandal.')
    .setChoiceValues(['obfuscate', 'disparage', 'capitulate', 'abrogate'])
    .setRequired(false);

  // Question 7: capricious
  form.addMultipleChoiceItem()
    .setTitle('Question 7')
    .setHelpText('The _____ weather made it impossible to plan outdoor activities with confidence.')
    .setChoiceValues(['capricious', 'circumspect', 'intractable', 'abstruse'])
    .setRequired(false);

  // Question 8: circumspect
  form.addMultipleChoiceItem()
    .setTitle('Question 8')
    .setHelpText('Given the sensitive nature of the negotiations, the diplomat remained _____ in his statements.')
    .setChoiceValues(['circumspect', 'capricious', 'intractable', 'deleterious'])
    .setRequired(false);

  // Question 9: cajole
  form.addMultipleChoiceItem()
    .setTitle('Question 9')
    .setHelpText('She tried to _____ her reluctant brother into joining the family vacation.')
    .setChoiceValues(['cajole', 'admonish', 'disparage', 'abrogate'])
    .setRequired(false);

  // Question 10: cursory
  form.addMultipleChoiceItem()
    .setTitle('Question 10')
    .setHelpText('A _____ glance at the report revealed several obvious errors.')
    .setChoiceValues(['cursory', 'copious', 'ephemeral', 'vociferous'])
    .setRequired(false);

  // Question 11: candor
  form.addMultipleChoiceItem()
    .setTitle('Question 11')
    .setHelpText('His refreshing _____ during the interview impressed the hiring committee.')
    .setChoiceValues(['candor', 'acumen', 'cacophony', 'conundrum'])
    .setRequired(false);

  // Question 12: abstruse
  form.addMultipleChoiceItem()
    .setTitle('Question 12')
    .setHelpText('The professor\'s _____ explanation of quantum mechanics left most students confused.')
    .setChoiceValues(['abstruse', 'perfunctory', 'deleterious', 'ephemeral'])
    .setRequired(false);

  // Question 13: deleterious
  form.addMultipleChoiceItem()
    .setTitle('Question 13')
    .setHelpText('The _____ effects of pollution on marine life became increasingly evident.')
    .setChoiceValues(['deleterious', 'conciliatory', 'abstruse', 'hackneyed'])
    .setRequired(false);

  // Question 14: admonish
  form.addMultipleChoiceItem()
    .setTitle('Question 14')
    .setHelpText('The teacher had to _____ the students for their disruptive behavior during the assembly.')
    .setChoiceValues(['admonish', 'cajole', 'capitulate', 'bolster'])
    .setRequired(false);

  // Question 15: intractable
  form.addMultipleChoiceItem()
    .setTitle('Question 15')
    .setHelpText('The _____ dispute had resisted all attempts at resolution for over a decade.')
    .setChoiceValues(['intractable', 'abstruse', 'hackneyed', 'conciliatory'])
    .setRequired(false);

  // Question 16: bolster
  form.addMultipleChoiceItem()
    .setTitle('Question 16')
    .setHelpText('The positive reviews helped _____ confidence in the company\'s new product line.')
    .setChoiceValues(['bolster', 'obfuscate', 'eschew', 'admonish'])
    .setRequired(false);

  // Question 17: vociferous
  form.addMultipleChoiceItem()
    .setTitle('Question 17')
    .setHelpText('The _____ protests outside the courthouse could be heard from several blocks away.')
    .setChoiceValues(['vociferous', 'copious', 'cursory', 'ephemeral'])
    .setRequired(false);

  // Question 18: garrulous
  form.addMultipleChoiceItem()
    .setTitle('Question 18')
    .setHelpText('The _____ passenger talked non-stop throughout the entire flight.')
    .setChoiceValues(['garrulous', 'austere', 'precocious', 'copious'])
    .setRequired(false);

  // Question 19: eschew
  form.addMultipleChoiceItem()
    .setTitle('Question 19')
    .setHelpText('Health-conscious consumers increasingly _____ processed foods in favor of natural alternatives.')
    .setChoiceValues(['eschew', 'bolster', 'disparage', 'obfuscate'])
    .setRequired(false);

  // Question 20: capitulate
  form.addMultipleChoiceItem()
    .setTitle('Question 20')
    .setHelpText('After weeks of resistance, the city was forced to _____ to the enemy\'s demands.')
    .setChoiceValues(['capitulate', 'abrogate', 'admonish', 'cajole'])
    .setRequired(false);

  // Section 2: Definitions
  form.addSectionHeaderItem()
    .setTitle('Part B: Definitions (Optional)')
    .setHelpText('Provide clear definitions for each vocabulary word. All questions in this section are optional.');


  // Definition 1: garrulous
  form.addParagraphTextItem()
    .setTitle('Define: garrulous')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 2: disparage
  form.addParagraphTextItem()
    .setTitle('Define: disparage')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 3: intractable
  form.addParagraphTextItem()
    .setTitle('Define: intractable')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 4: cajole
  form.addParagraphTextItem()
    .setTitle('Define: cajole')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 5: capitulate
  form.addParagraphTextItem()
    .setTitle('Define: capitulate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 6: hackneyed
  form.addParagraphTextItem()
    .setTitle('Define: hackneyed')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 7: deleterious
  form.addParagraphTextItem()
    .setTitle('Define: deleterious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 8: austere
  form.addParagraphTextItem()
    .setTitle('Define: austere')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 9: abstruse
  form.addParagraphTextItem()
    .setTitle('Define: abstruse')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 10: capricious
  form.addParagraphTextItem()
    .setTitle('Define: capricious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 11: candor
  form.addParagraphTextItem()
    .setTitle('Define: candor')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 12: vociferous
  form.addParagraphTextItem()
    .setTitle('Define: vociferous')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 13: eschew
  form.addParagraphTextItem()
    .setTitle('Define: eschew')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 14: obfuscate
  form.addParagraphTextItem()
    .setTitle('Define: obfuscate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 15: bolster
  form.addParagraphTextItem()
    .setTitle('Define: bolster')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 16: cursory
  form.addParagraphTextItem()
    .setTitle('Define: cursory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 17: perfunctory
  form.addParagraphTextItem()
    .setTitle('Define: perfunctory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 18: ephemeral
  form.addParagraphTextItem()
    .setTitle('Define: ephemeral')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 19: admonish
  form.addParagraphTextItem()
    .setTitle('Define: admonish')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 20: circumspect
  form.addParagraphTextItem()
    .setTitle('Define: circumspect')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Responses will be automatically collected in form responses
  // To link to a spreadsheet, manually do so in the form editor
  
  // Get form URL
  var formUrl = form.getPublishedUrl();
  console.log('Form created for Participant 002');
  console.log('Form URL: ' + formUrl);
  
  return formUrl;
}

// To use: Click the "Run" button above or manually call createVocabularyTest()
