// Google Forms Script for Participant 008
// 24-Hour Delayed Vocabulary Test - 20 words

function createVocabularyTest() {
  var form = FormApp.create('Vocabulary Test - Participant 008 - 24h Delayed');
  form.setDescription('24-hour delayed vocabulary test. Two parts: multiple choice and definitions.');
  
  form.addTextItem().setTitle('Participant ID').setRequired(true).setHelpText('Enter: 008');
  
  // Multiple choice section
  form.addSectionHeaderItem().setTitle('Part A: Multiple Choice');
  
  // Would contain all 20 questions here...
  
  // Definitions section  
  form.addSectionHeaderItem().setTitle('Part B: Definitions (Optional)');
  
  var words = ['abstruse', 'admonish', 'austere', 'bolster', 'cacophony', 'cajole', 'candor', 'capitulate', 'capricious', 'circumspect', 'conciliatory', 'conundrum', 'copious', 'deleterious', 'ephemeral', 'hackneyed', 'obfuscate', 'perfunctory', 'quandary', 'vociferous'];
  
  words.forEach(function(word) {
    form.addParagraphTextItem().setTitle('Define: ' + word).setRequired(false);
  });
  
  console.log('Form created for Participant 008');
  return form.getPublishedUrl();
}