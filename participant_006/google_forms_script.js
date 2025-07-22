// Google Forms Script for Participant 006
// 24-Hour Delayed Vocabulary Test - 20 words

function createVocabularyTest() {
  // Create new form
  var form = FormApp.create('Vocabulary Test - Participant 006 - 24h Delayed');
  
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
    .setHelpText('Enter your participant number: 006');

  // Section 1: Multiple Choice
  form.addSectionHeaderItem()
    .setTitle('Part A: Multiple Choice')
    .setHelpText('Choose the best word to complete each sentence.');


  // Question 1: eschew
  form.addMultipleChoiceItem()
    .setTitle('Question 1')
    .setHelpText('Health-conscious consumers increasingly _____ processed foods in favor of natural alternatives.')
    .setChoiceValues(['disparage', 'obfuscate', 'eschew', 'bolster'])
    .setRequired(false);

  // Question 2: conciliatory
  form.addMultipleChoiceItem()
    .setTitle('Question 2')
    .setHelpText('After the heated argument, he adopted a _____ tone to restore peace.')
    .setChoiceValues(['conciliatory', 'deleterious', 'perfunctory', 'hackneyed'])
    .setRequired(false);

  // Question 3: capricious
  form.addMultipleChoiceItem()
    .setTitle('Question 3')
    .setHelpText('The _____ weather made it impossible to plan outdoor activities with confidence.')
    .setChoiceValues(['capricious', 'abstruse', 'intractable', 'circumspect'])
    .setRequired(false);

  // Question 4: copious
  form.addMultipleChoiceItem()
    .setTitle('Question 4')
    .setHelpText('The researcher took _____ notes during the lengthy interview session.')
    .setChoiceValues(['copious', 'cursory', 'vociferous', 'ephemeral'])
    .setRequired(false);

  // Question 5: candor
  form.addMultipleChoiceItem()
    .setTitle('Question 5')
    .setHelpText('His refreshing _____ during the interview impressed the hiring committee.')
    .setChoiceValues(['cacophony', 'candor', 'conundrum', 'acumen'])
    .setRequired(false);

  // Question 6: admonish
  form.addMultipleChoiceItem()
    .setTitle('Question 6')
    .setHelpText('The teacher had to _____ the students for their disruptive behavior during the assembly.')
    .setChoiceValues(['capitulate', 'bolster', 'admonish', 'cajole'])
    .setRequired(false);

  // Question 7: obfuscate
  form.addMultipleChoiceItem()
    .setTitle('Question 7')
    .setHelpText('The politician tried to _____ the facts to avoid taking responsibility for the scandal.')
    .setChoiceValues(['capitulate', 'obfuscate', 'disparage', 'abrogate'])
    .setRequired(false);

  // Question 8: cajole
  form.addMultipleChoiceItem()
    .setTitle('Question 8')
    .setHelpText('She tried to _____ her reluctant brother into joining the family vacation.')
    .setChoiceValues(['cajole', 'disparage', 'admonish', 'abrogate'])
    .setRequired(false);

  // Question 9: hackneyed
  form.addMultipleChoiceItem()
    .setTitle('Question 9')
    .setHelpText('The movie\'s _____ plot failed to engage audiences looking for original storytelling.')
    .setChoiceValues(['hackneyed', 'deleterious', 'conciliatory', 'intractable'])
    .setRequired(false);

  // Question 10: disparage
  form.addMultipleChoiceItem()
    .setTitle('Question 10')
    .setHelpText('Rather than offer constructive criticism, he chose to _____ his opponent\'s achievements.')
    .setChoiceValues(['obfuscate', 'bolster', 'disparage', 'eschew'])
    .setRequired(false);

  // Question 11: abrogate
  form.addMultipleChoiceItem()
    .setTitle('Question 11')
    .setHelpText('The new government decided to _____ the controversial treaty signed by its predecessor.')
    .setChoiceValues(['abrogate', 'disparage', 'eschew', 'bolster'])
    .setRequired(false);

  // Question 12: abstruse
  form.addMultipleChoiceItem()
    .setTitle('Question 12')
    .setHelpText('The professor\'s _____ explanation of quantum mechanics left most students confused.')
    .setChoiceValues(['abstruse', 'ephemeral', 'deleterious', 'perfunctory'])
    .setRequired(false);

  // Question 13: circumspect
  form.addMultipleChoiceItem()
    .setTitle('Question 13')
    .setHelpText('Given the sensitive nature of the negotiations, the diplomat remained _____ in his statements.')
    .setChoiceValues(['deleterious', 'capricious', 'circumspect', 'intractable'])
    .setRequired(false);

  // Question 14: capitulate
  form.addMultipleChoiceItem()
    .setTitle('Question 14')
    .setHelpText('After weeks of resistance, the city was forced to _____ to the enemy\'s demands.')
    .setChoiceValues(['abrogate', 'admonish', 'capitulate', 'cajole'])
    .setRequired(false);

  // Question 15: perfunctory
  form.addMultipleChoiceItem()
    .setTitle('Question 15')
    .setHelpText('Her _____ apology lacked sincerity and failed to address the real issues.')
    .setChoiceValues(['precocious', 'capricious', 'perfunctory', 'circumspect'])
    .setRequired(false);

  // Question 16: conundrum
  form.addMultipleChoiceItem()
    .setTitle('Question 16')
    .setHelpText('The detective faced a perplexing _____ with no obvious solution in sight.')
    .setChoiceValues(['quandary', 'acumen', 'conundrum', 'candor'])
    .setRequired(false);

  // Question 17: vociferous
  form.addMultipleChoiceItem()
    .setTitle('Question 17')
    .setHelpText('The _____ protests outside the courthouse could be heard from several blocks away.')
    .setChoiceValues(['vociferous', 'ephemeral', 'copious', 'cursory'])
    .setRequired(false);

  // Question 18: acumen
  form.addMultipleChoiceItem()
    .setTitle('Question 18')
    .setHelpText('Her exceptional business _____ helped transform the struggling company into a market leader.')
    .setChoiceValues(['cacophony', 'conundrum', 'acumen', 'candor'])
    .setRequired(false);

  // Question 19: ephemeral
  form.addMultipleChoiceItem()
    .setTitle('Question 19')
    .setHelpText('The _____ beauty of cherry blossoms makes their brief blooming season even more precious.')
    .setChoiceValues(['ephemeral', 'copious', 'vociferous', 'cursory'])
    .setRequired(false);

  // Question 20: precocious
  form.addMultipleChoiceItem()
    .setTitle('Question 20')
    .setHelpText('The _____ child was reading university-level texts at age ten.')
    .setChoiceValues(['garrulous', 'austere', 'precocious', 'vociferous'])
    .setRequired(false);

  // Section 2: Definitions
  form.addSectionHeaderItem()
    .setTitle('Part B: Definitions (Optional)')
    .setHelpText('Provide clear definitions for each vocabulary word. All questions in this section are optional.');


  // Definition 1: cajole
  form.addParagraphTextItem()
    .setTitle('Define: cajole')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 2: hackneyed
  form.addParagraphTextItem()
    .setTitle('Define: hackneyed')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 3: perfunctory
  form.addParagraphTextItem()
    .setTitle('Define: perfunctory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 4: admonish
  form.addParagraphTextItem()
    .setTitle('Define: admonish')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 5: conciliatory
  form.addParagraphTextItem()
    .setTitle('Define: conciliatory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 6: copious
  form.addParagraphTextItem()
    .setTitle('Define: copious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 7: disparage
  form.addParagraphTextItem()
    .setTitle('Define: disparage')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 8: candor
  form.addParagraphTextItem()
    .setTitle('Define: candor')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 9: conundrum
  form.addParagraphTextItem()
    .setTitle('Define: conundrum')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 10: capricious
  form.addParagraphTextItem()
    .setTitle('Define: capricious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 11: precocious
  form.addParagraphTextItem()
    .setTitle('Define: precocious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 12: acumen
  form.addParagraphTextItem()
    .setTitle('Define: acumen')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 13: abrogate
  form.addParagraphTextItem()
    .setTitle('Define: abrogate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 14: vociferous
  form.addParagraphTextItem()
    .setTitle('Define: vociferous')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 15: eschew
  form.addParagraphTextItem()
    .setTitle('Define: eschew')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 16: obfuscate
  form.addParagraphTextItem()
    .setTitle('Define: obfuscate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 17: circumspect
  form.addParagraphTextItem()
    .setTitle('Define: circumspect')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 18: capitulate
  form.addParagraphTextItem()
    .setTitle('Define: capitulate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 19: abstruse
  form.addParagraphTextItem()
    .setTitle('Define: abstruse')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Definition 20: ephemeral
  form.addParagraphTextItem()
    .setTitle('Define: ephemeral')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);

  // Responses will be automatically collected in form responses
  // To link to a spreadsheet, manually do so in the form editor
  
  // Get form URL
  var formUrl = form.getPublishedUrl();
  console.log('Form created for Participant 006');
  console.log('Form URL: ' + formUrl);
  
  return formUrl;
}

// To use: Click the "Run" button above or manually call createVocabularyTest()
