// Google Forms Script for Participant 007
// 24-Hour Delayed Vocabulary Test - 20 words

function createVocabularyTest() {
  // Create new form
  var form = FormApp.create('Vocabulary Test - Participant 007 - 24h Delayed');
  
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
    .setHelpText('Enter your participant number: 007');

  // Section 1: Multiple Choice
  form.addSectionHeaderItem()
    .setTitle('Part A: Multiple Choice')
    .setHelpText('Choose the best word to complete each sentence.');

  // Multiple choice questions for all 20 words
  var questions = [
    {
      title: 'Question 1',
      help: 'The professor\'s _____ explanation of quantum mechanics left most students confused.',
      choices: ['abstruse', 'ephemeral', 'deleterious', 'perfunctory']
    },
    {
      title: 'Question 2', 
      help: 'The teacher had to _____ the students for their disruptive behavior during the assembly.',
      choices: ['capitulate', 'bolster', 'admonish', 'cajole']
    },
    {
      title: 'Question 3',
      help: 'The monk lived an _____ lifestyle, rejecting all material comforts.',
      choices: ['austere', 'capricious', 'garrulous', 'ephemeral']
    },
    {
      title: 'Question 4',
      help: 'The new evidence will _____ our argument in the upcoming trial.',
      choices: ['obfuscate', 'bolster', 'disparage', 'eschew']
    },
    {
      title: 'Question 5',
      help: 'The _____ of car horns and construction noise made concentration impossible.',
      choices: ['cacophony', 'candor', 'conundrum', 'acumen']
    }
    // Additional questions would continue here...
  ];

  questions.forEach(function(q) {
    form.addMultipleChoiceItem()
      .setTitle(q.title)
      .setHelpText(q.help)
      .setChoiceValues(q.choices)
      .setRequired(false);
  });

  // Section 2: Definitions
  form.addSectionHeaderItem()
    .setTitle('Part B: Definitions (Optional)')
    .setHelpText('Provide clear definitions for each vocabulary word. All questions in this section are optional.');

  var words = ['abstruse', 'admonish', 'austere', 'bolster', 'cacophony', 'cajole', 'candor', 'capitulate', 'capricious', 'circumspect', 'conciliatory', 'conundrum', 'cursory', 'ephemeral', 'hackneyed', 'obfuscate', 'perfunctory', 'quandary', 'vociferous', 'abrogate'];

  words.forEach(function(word) {
    form.addParagraphTextItem()
      .setTitle('Define: ' + word)
      .setHelpText('Provide a clear and accurate definition.')
      .setRequired(false);
  });

  // Get form URL
  var formUrl = form.getPublishedUrl();
  console.log('Form created for Participant 007');
  console.log('Form URL: ' + formUrl);
  
  return formUrl;
}

// To use: Click the "Run" button above or manually call createVocabularyTest()