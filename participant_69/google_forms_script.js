// Google Forms Script for Participant 69
// 24-Hour Delayed Vocabulary Test - 24 words

function createVocabularyTest() {
  // Create new form
  var form = FormApp.create('Vocabulary Test - Participant 69 - 24h Delayed');
  
  // Set form description
  form.setDescription(
    'This is your 24-hour delayed vocabulary test. You learned 24 words yesterday. ' +
    'The test has two parts: fill-in-the-blank and definitions. ' +
    'Please complete both sections honestly. This should take about 15 minutes.'
  );
  
  // Add participant ID (hidden)
  form.addTextItem()
    .setTitle('Participant ID')
    .setRequired(true)
    .setHelpText('Your participant number')
    .setDefaultAnswer('69');

  // Section 1: Contextual Fill-in-the-Blank
  form.addSectionHeaderItem()
    .setTitle('Part A: Fill in the Blank')
    .setHelpText('Complete each sentence with the correct vocabulary word from your learning session.');


  // Question 1: deleterious
  form.addTextItem()
    .setTitle('Question 1')
    .setHelpText('The _____ effects of pollution on marine life became increasingly evident.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 2: hackneyed
  form.addTextItem()
    .setTitle('Question 2')
    .setHelpText('The movie's _____ plot failed to engage audiences looking for original storytelling.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 3: obfuscate
  form.addTextItem()
    .setTitle('Question 3')
    .setHelpText('The politician tried to _____ the facts to avoid taking responsibility for the scandal.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 4: garrulous
  form.addTextItem()
    .setTitle('Question 4')
    .setHelpText('The _____ passenger talked non-stop throughout the entire flight.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 5: intractable
  form.addTextItem()
    .setTitle('Question 5')
    .setHelpText('The _____ dispute had resisted all attempts at resolution for over a decade.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 6: despot
  form.addTextItem()
    .setTitle('Question 6')
    .setHelpText('The cruel _____ ruled through fear and intimidation for decades.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 7: ephemeral
  form.addTextItem()
    .setTitle('Question 7')
    .setHelpText('The _____ beauty of cherry blossoms makes their brief blooming season even more precious.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 8: bolster
  form.addTextItem()
    .setTitle('Question 8')
    .setHelpText('The positive reviews helped _____ confidence in the company's new product line.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 9: conciliatory
  form.addTextItem()
    .setTitle('Question 9')
    .setHelpText('After the heated argument, he adopted a _____ tone to restore peace.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 10: capricious
  form.addTextItem()
    .setTitle('Question 10')
    .setHelpText('The _____ weather made it impossible to plan outdoor activities with confidence.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 11: eschew
  form.addTextItem()
    .setTitle('Question 11')
    .setHelpText('Health-conscious consumers increasingly _____ processed foods in favor of natural alternatives.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 12: disparage
  form.addTextItem()
    .setTitle('Question 12')
    .setHelpText('Rather than offer constructive criticism, he chose to _____ his opponent's achievements.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 13: cursory
  form.addTextItem()
    .setTitle('Question 13')
    .setHelpText('A _____ glance at the report revealed several obvious errors.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 14: precocious
  form.addTextItem()
    .setTitle('Question 14')
    .setHelpText('The _____ child was reading university-level texts at age ten.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 15: copious
  form.addTextItem()
    .setTitle('Question 15')
    .setHelpText('The researcher took _____ notes during the lengthy interview session.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 16: candor
  form.addTextItem()
    .setTitle('Question 16')
    .setHelpText('His refreshing _____ during the interview impressed the hiring committee.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 17: cacophony
  form.addTextItem()
    .setTitle('Question 17')
    .setHelpText('The _____ of car horns and construction noise made conversation impossible.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 18: perfunctory
  form.addTextItem()
    .setTitle('Question 18')
    .setHelpText('Her _____ apology lacked sincerity and failed to address the real issues.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 19: vociferous
  form.addTextItem()
    .setTitle('Question 19')
    .setHelpText('The _____ protests outside the courthouse could be heard from several blocks away.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 20: capitulate
  form.addTextItem()
    .setTitle('Question 20')
    .setHelpText('After weeks of resistance, the city was forced to _____ to the enemy's demands.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 21: abrogate
  form.addTextItem()
    .setTitle('Question 21')
    .setHelpText('The new government decided to _____ the controversial treaty signed by its predecessor.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 22: admonish
  form.addTextItem()
    .setTitle('Question 22')
    .setHelpText('The teacher had to _____ the students for their disruptive behavior during the assembly.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 23: circumspect
  form.addTextItem()
    .setTitle('Question 23')
    .setHelpText('Given the sensitive nature of the negotiations, the diplomat remained _____ in his statements.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Question 24: conundrum
  form.addTextItem()
    .setTitle('Question 24')
    .setHelpText('The detective faced a perplexing _____ with no obvious solution in sight.\n\nWord Bank: deleterious | hackneyed | obfuscate | garrulous | intractable | despot | ephemeral | bolster | conciliatory | capricious | eschew | disparage | cursory | precocious | copious | candor | cacophony | perfunctory | vociferous | capitulate | abrogate | admonish | circumspect | conundrum')
    .setRequired(true);

  // Section 2: Definitions
  form.addSectionHeaderItem()
    .setTitle('Part B: Definitions')
    .setHelpText('Provide clear definitions for each vocabulary word.');


  // Definition 1: capitulate
  form.addParagraphTextItem()
    .setTitle('Define: capitulate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 2: cacophony
  form.addParagraphTextItem()
    .setTitle('Define: cacophony')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 3: deleterious
  form.addParagraphTextItem()
    .setTitle('Define: deleterious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 4: vociferous
  form.addParagraphTextItem()
    .setTitle('Define: vociferous')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 5: garrulous
  form.addParagraphTextItem()
    .setTitle('Define: garrulous')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 6: precocious
  form.addParagraphTextItem()
    .setTitle('Define: precocious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 7: bolster
  form.addParagraphTextItem()
    .setTitle('Define: bolster')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 8: despot
  form.addParagraphTextItem()
    .setTitle('Define: despot')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 9: eschew
  form.addParagraphTextItem()
    .setTitle('Define: eschew')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 10: circumspect
  form.addParagraphTextItem()
    .setTitle('Define: circumspect')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 11: conciliatory
  form.addParagraphTextItem()
    .setTitle('Define: conciliatory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 12: obfuscate
  form.addParagraphTextItem()
    .setTitle('Define: obfuscate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 13: candor
  form.addParagraphTextItem()
    .setTitle('Define: candor')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 14: abrogate
  form.addParagraphTextItem()
    .setTitle('Define: abrogate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 15: copious
  form.addParagraphTextItem()
    .setTitle('Define: copious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 16: disparage
  form.addParagraphTextItem()
    .setTitle('Define: disparage')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 17: hackneyed
  form.addParagraphTextItem()
    .setTitle('Define: hackneyed')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 18: admonish
  form.addParagraphTextItem()
    .setTitle('Define: admonish')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 19: intractable
  form.addParagraphTextItem()
    .setTitle('Define: intractable')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 20: cursory
  form.addParagraphTextItem()
    .setTitle('Define: cursory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 21: perfunctory
  form.addParagraphTextItem()
    .setTitle('Define: perfunctory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 22: capricious
  form.addParagraphTextItem()
    .setTitle('Define: capricious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 23: ephemeral
  form.addParagraphTextItem()
    .setTitle('Define: ephemeral')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Set up response handling
  form.setDestination(FormApp.DestinationType.SPREADSHEET);
  
  // Get form URL
  var formUrl = form.getPublishedUrl();
  console.log('Form created for Participant 69');
  console.log('Form URL: ' + formUrl);
  
  return formUrl;
}

// Run this function to create the form
createVocabularyTest();
