// Google Forms Script for Participant 001
// 24-Hour Delayed Vocabulary Test - 20 words

function createVocabularyTest() {
  // Create new form
  var form = FormApp.create('Vocabulary Test - Participant 001 - 24h Delayed');
  
  // Set form description
  form.setDescription(
    'This is your 24-hour delayed vocabulary test. You learned 20 words yesterday. ' +
    'The test has two parts: fill-in-the-blank and definitions. ' +
    'Please complete both sections honestly. This should take about 15 minutes.'
  );
  
  // Add participant ID (hidden)
  form.addTextItem()
    .setTitle('Participant ID')
    .setRequired(true)
    .setHelpText('Your participant number')
    .setDefaultAnswer('001');

  // Section 1: Contextual Fill-in-the-Blank
  form.addSectionHeaderItem()
    .setTitle('Part A: Fill in the Blank')
    .setHelpText('Complete each sentence with the correct vocabulary word from your learning session.');


  // Question 1: capitulate
  form.addTextItem()
    .setTitle('Question 1')
    .setHelpText('After weeks of resistance, the city was forced to _____ to the enemy\'s demands.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 2: ephemeral
  form.addTextItem()
    .setTitle('Question 2')
    .setHelpText('The _____ beauty of cherry blossoms makes their brief blooming season even more precious.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 3: deleterious
  form.addTextItem()
    .setTitle('Question 3')
    .setHelpText('The _____ effects of pollution on marine life became increasingly evident.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 4: quandary
  form.addTextItem()
    .setTitle('Question 4')
    .setHelpText('Faced with two equally unappealing options, she found herself in a difficult _____.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 5: hackneyed
  form.addTextItem()
    .setTitle('Question 5')
    .setHelpText('The movie\'s _____ plot failed to engage audiences looking for original storytelling.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 6: abstruse
  form.addTextItem()
    .setTitle('Question 6')
    .setHelpText('The professor\'s _____ explanation of quantum mechanics left most students confused.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 7: perfunctory
  form.addTextItem()
    .setTitle('Question 7')
    .setHelpText('Her _____ apology lacked sincerity and failed to address the real issues.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 8: garrulous
  form.addTextItem()
    .setTitle('Question 8')
    .setHelpText('The _____ passenger talked non-stop throughout the entire flight.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 9: bolster
  form.addTextItem()
    .setTitle('Question 9')
    .setHelpText('The positive reviews helped _____ confidence in the company\'s new product line.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 10: circumspect
  form.addTextItem()
    .setTitle('Question 10')
    .setHelpText('Given the sensitive nature of the negotiations, the diplomat remained _____ in his statements.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 11: austere
  form.addTextItem()
    .setTitle('Question 11')
    .setHelpText('The monastery\'s _____ living conditions reflected the monks\' commitment to simplicity.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 12: admonish
  form.addTextItem()
    .setTitle('Question 12')
    .setHelpText('The teacher had to _____ the students for their disruptive behavior during the assembly.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 13: capricious
  form.addTextItem()
    .setTitle('Question 13')
    .setHelpText('The _____ weather made it impossible to plan outdoor activities with confidence.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 14: cursory
  form.addTextItem()
    .setTitle('Question 14')
    .setHelpText('A _____ glance at the report revealed several obvious errors.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 15: conundrum
  form.addTextItem()
    .setTitle('Question 15')
    .setHelpText('The detective faced a perplexing _____ with no obvious solution in sight.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 16: vociferous
  form.addTextItem()
    .setTitle('Question 16')
    .setHelpText('The _____ protests outside the courthouse could be heard from several blocks away.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 17: candor
  form.addTextItem()
    .setTitle('Question 17')
    .setHelpText('His refreshing _____ during the interview impressed the hiring committee.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 18: cajole
  form.addTextItem()
    .setTitle('Question 18')
    .setHelpText('She tried to _____ her reluctant brother into joining the family vacation.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 19: conciliatory
  form.addTextItem()
    .setTitle('Question 19')
    .setHelpText('After the heated argument, he adopted a _____ tone to restore peace.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Question 20: cacophony
  form.addTextItem()
    .setTitle('Question 20')
    .setHelpText('The _____ of car horns and construction noise made conversation impossible.\n\nWord Bank: capitulate | ephemeral | deleterious | quandary | hackneyed | abstruse | perfunctory | garrulous | bolster | circumspect | austere | admonish | capricious | cursory | conundrum | vociferous | candor | cajole | conciliatory | cacophony')
    .setRequired(true);

  // Section 2: Definitions
  form.addSectionHeaderItem()
    .setTitle('Part B: Definitions')
    .setHelpText('Provide clear definitions for each vocabulary word.');


  // Definition 1: austere
  form.addParagraphTextItem()
    .setTitle('Define: austere')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 2: hackneyed
  form.addParagraphTextItem()
    .setTitle('Define: hackneyed')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 3: deleterious
  form.addParagraphTextItem()
    .setTitle('Define: deleterious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 4: conciliatory
  form.addParagraphTextItem()
    .setTitle('Define: conciliatory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 5: cajole
  form.addParagraphTextItem()
    .setTitle('Define: cajole')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 6: circumspect
  form.addParagraphTextItem()
    .setTitle('Define: circumspect')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 7: capricious
  form.addParagraphTextItem()
    .setTitle('Define: capricious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 8: vociferous
  form.addParagraphTextItem()
    .setTitle('Define: vociferous')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 9: candor
  form.addParagraphTextItem()
    .setTitle('Define: candor')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 10: perfunctory
  form.addParagraphTextItem()
    .setTitle('Define: perfunctory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 11: cacophony
  form.addParagraphTextItem()
    .setTitle('Define: cacophony')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 12: abstruse
  form.addParagraphTextItem()
    .setTitle('Define: abstruse')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 13: admonish
  form.addParagraphTextItem()
    .setTitle('Define: admonish')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 14: conundrum
  form.addParagraphTextItem()
    .setTitle('Define: conundrum')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 15: garrulous
  form.addParagraphTextItem()
    .setTitle('Define: garrulous')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 16: bolster
  form.addParagraphTextItem()
    .setTitle('Define: bolster')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 17: ephemeral
  form.addParagraphTextItem()
    .setTitle('Define: ephemeral')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 18: quandary
  form.addParagraphTextItem()
    .setTitle('Define: quandary')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 19: capitulate
  form.addParagraphTextItem()
    .setTitle('Define: capitulate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 20: cursory
  form.addParagraphTextItem()
    .setTitle('Define: cursory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Set up response handling
  form.setDestination(FormApp.DestinationType.SPREADSHEET);
  
  // Get form URL
  var formUrl = form.getPublishedUrl();
  console.log('Form created for Participant 001');
  console.log('Form URL: ' + formUrl);
  
  return formUrl;
}

// Run this function to create the form
createVocabularyTest();
