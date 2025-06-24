// Google Forms Script for Participant 420
// 24-Hour Delayed Vocabulary Test - 20 words

function createVocabularyTest() {
  // Create new form
  var form = FormApp.create('Vocabulary Test - Participant 420 - 24h Delayed');
  
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
    .setDefaultAnswer('420');

  // Section 1: Contextual Fill-in-the-Blank
  form.addSectionHeaderItem()
    .setTitle('Part A: Fill in the Blank')
    .setHelpText('Complete each sentence with the correct vocabulary word from your learning session.');


  // Question 1: abrogate
  form.addTextItem()
    .setTitle('Question 1')
    .setHelpText('The new government decided to _____ the controversial treaty signed by its predecessor.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 2: candor
  form.addTextItem()
    .setTitle('Question 2')
    .setHelpText('His refreshing _____ during the interview impressed the hiring committee.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 3: austere
  form.addTextItem()
    .setTitle('Question 3')
    .setHelpText('The monastery's _____ living conditions reflected the monks' commitment to simplicity.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 4: abstruse
  form.addTextItem()
    .setTitle('Question 4')
    .setHelpText('The professor's _____ explanation of quantum mechanics left most students confused.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 5: deleterious
  form.addTextItem()
    .setTitle('Question 5')
    .setHelpText('The _____ effects of pollution on marine life became increasingly evident.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 6: capitulate
  form.addTextItem()
    .setTitle('Question 6')
    .setHelpText('After weeks of resistance, the city was forced to _____ to the enemy's demands.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 7: disparage
  form.addTextItem()
    .setTitle('Question 7')
    .setHelpText('Rather than offer constructive criticism, he chose to _____ his opponent's achievements.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 8: vociferous
  form.addTextItem()
    .setTitle('Question 8')
    .setHelpText('The _____ protests outside the courthouse could be heard from several blocks away.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 9: admonish
  form.addTextItem()
    .setTitle('Question 9')
    .setHelpText('The teacher had to _____ the students for their disruptive behavior during the assembly.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 10: copious
  form.addTextItem()
    .setTitle('Question 10')
    .setHelpText('The researcher took _____ notes during the lengthy interview session.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 11: conciliatory
  form.addTextItem()
    .setTitle('Question 11')
    .setHelpText('After the heated argument, he adopted a _____ tone to restore peace.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 12: hackneyed
  form.addTextItem()
    .setTitle('Question 12')
    .setHelpText('The movie's _____ plot failed to engage audiences looking for original storytelling.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 13: garrulous
  form.addTextItem()
    .setTitle('Question 13')
    .setHelpText('The _____ passenger talked non-stop throughout the entire flight.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 14: obfuscate
  form.addTextItem()
    .setTitle('Question 14')
    .setHelpText('The politician tried to _____ the facts to avoid taking responsibility for the scandal.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 15: capricious
  form.addTextItem()
    .setTitle('Question 15')
    .setHelpText('The _____ weather made it impossible to plan outdoor activities with confidence.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 16: eschew
  form.addTextItem()
    .setTitle('Question 16')
    .setHelpText('Health-conscious consumers increasingly _____ processed foods in favor of natural alternatives.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 17: ephemeral
  form.addTextItem()
    .setTitle('Question 17')
    .setHelpText('The _____ beauty of cherry blossoms makes their brief blooming season even more precious.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 18: intractable
  form.addTextItem()
    .setTitle('Question 18')
    .setHelpText('The _____ dispute had resisted all attempts at resolution for over a decade.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 19: quandary
  form.addTextItem()
    .setTitle('Question 19')
    .setHelpText('Faced with two equally unappealing options, she found herself in a difficult _____.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Question 20: circumspect
  form.addTextItem()
    .setTitle('Question 20')
    .setHelpText('Given the sensitive nature of the negotiations, the diplomat remained _____ in his statements.\n\nWord Bank: abrogate | candor | austere | abstruse | deleterious | capitulate | disparage | vociferous | admonish | copious | conciliatory | hackneyed | garrulous | obfuscate | capricious | eschew | ephemeral | intractable | quandary | circumspect')
    .setRequired(true);

  // Section 2: Definitions
  form.addSectionHeaderItem()
    .setTitle('Part B: Definitions')
    .setHelpText('Provide clear definitions for each vocabulary word.');


  // Definition 1: eschew
  form.addParagraphTextItem()
    .setTitle('Define: eschew')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 2: disparage
  form.addParagraphTextItem()
    .setTitle('Define: disparage')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 3: obfuscate
  form.addParagraphTextItem()
    .setTitle('Define: obfuscate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 4: capitulate
  form.addParagraphTextItem()
    .setTitle('Define: capitulate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 5: abstruse
  form.addParagraphTextItem()
    .setTitle('Define: abstruse')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 6: abrogate
  form.addParagraphTextItem()
    .setTitle('Define: abrogate')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 7: admonish
  form.addParagraphTextItem()
    .setTitle('Define: admonish')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 8: garrulous
  form.addParagraphTextItem()
    .setTitle('Define: garrulous')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 9: deleterious
  form.addParagraphTextItem()
    .setTitle('Define: deleterious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 10: capricious
  form.addParagraphTextItem()
    .setTitle('Define: capricious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 11: austere
  form.addParagraphTextItem()
    .setTitle('Define: austere')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 12: hackneyed
  form.addParagraphTextItem()
    .setTitle('Define: hackneyed')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 13: ephemeral
  form.addParagraphTextItem()
    .setTitle('Define: ephemeral')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 14: candor
  form.addParagraphTextItem()
    .setTitle('Define: candor')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 15: copious
  form.addParagraphTextItem()
    .setTitle('Define: copious')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 16: quandary
  form.addParagraphTextItem()
    .setTitle('Define: quandary')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 17: circumspect
  form.addParagraphTextItem()
    .setTitle('Define: circumspect')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 18: conciliatory
  form.addParagraphTextItem()
    .setTitle('Define: conciliatory')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 19: intractable
  form.addParagraphTextItem()
    .setTitle('Define: intractable')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Definition 20: vociferous
  form.addParagraphTextItem()
    .setTitle('Define: vociferous')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);

  // Set up response handling
  form.setDestination(FormApp.DestinationType.SPREADSHEET);
  
  // Get form URL
  var formUrl = form.getPublishedUrl();
  console.log('Form created for Participant 420');
  console.log('Form URL: ' + formUrl);
  
  return formUrl;
}

// Run this function to create the form
createVocabularyTest();
