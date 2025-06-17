#!/usr/bin/env python3
"""
Post-Test Generator for Vocabulary Learning Experiment

Generates Google Forms-compatible assessment questions for all vocabulary words,
then creates participant-specific tests based on their selected vocabulary.
Includes both contextual fill-in-the-blank and definition production tasks.
"""

import csv
import json
import random
from pathlib import Path
from typing import Dict, List, Tuple

class PostTestGenerator:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.vocabulary_file = self.base_dir / 'vocabulary.csv'
        self.questions_file = self.base_dir / 'post_test_questions.json'
        
        # Load vocabulary and create question bank
        self.vocabulary = self.load_vocabulary()
        self.question_bank = self.create_question_bank()
        
    def load_vocabulary(self) -> List[Dict]:
        """Load all vocabulary words from CSV"""
        vocabulary = []
        if self.vocabulary_file.exists():
            with open(self.vocabulary_file, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                vocabulary = list(reader)
        return vocabulary
    
    def create_question_bank(self) -> Dict:
        """Create comprehensive question bank for all vocabulary words"""
        question_bank = {
            "contextual_questions": {},
            "definition_questions": {},
            "metadata": {
                "total_words": len(self.vocabulary),
                "created_date": "2025-01-17",
                "version": "1.0"
            }
        }
        
        # Create contextual fill-in-the-blank questions
        contextual_questions = {
            "obfuscate": "The politician tried to _____ the facts to avoid taking responsibility for the scandal.",
            "disparage": "Rather than offer constructive criticism, he chose to _____ his opponent's achievements.",
            "perfunctory": "Her _____ apology lacked sincerity and failed to address the real issues.",
            "precocious": "The _____ child was reading university-level texts at age ten.",
            "quandary": "Faced with two equally unappealing options, she found herself in a difficult _____.",
            "circumspect": "Given the sensitive nature of the negotiations, the diplomat remained _____ in his statements.",
            "capitulate": "After weeks of resistance, the city was forced to _____ to the enemy's demands.",
            "vociferous": "The _____ protests outside the courthouse could be heard from several blocks away.",
            "intractable": "The _____ dispute had resisted all attempts at resolution for over a decade.",
            "abrogate": "The new government decided to _____ the controversial treaty signed by its predecessor.",
            "abstruse": "The professor's _____ explanation of quantum mechanics left most students confused.",
            "acumen": "Her exceptional business _____ helped transform the struggling company into a market leader.",
            "admonish": "The teacher had to _____ the students for their disruptive behavior during the assembly.",
            "austere": "The monastery's _____ living conditions reflected the monks' commitment to simplicity.",
            "benevolent": "The _____ dictator was beloved by his people for his generous social programs.",
            "bolster": "The positive reviews helped _____ confidence in the company's new product line.",
            "cacophony": "The _____ of car horns and construction noise made conversation impossible.",
            "cajole": "She tried to _____ her reluctant brother into joining the family vacation.",
            "candor": "His refreshing _____ during the interview impressed the hiring committee.",
            "capricious": "The _____ weather made it impossible to plan outdoor activities with confidence.",
            "complacent": "Success made the team _____, leading to their unexpected defeat in the championship.",
            "conciliatory": "After the heated argument, he adopted a _____ tone to restore peace.",
            "conundrum": "The detective faced a perplexing _____ with no obvious solution in sight.",
            "copious": "The researcher took _____ notes during the lengthy interview session.",
            "cursory": "A _____ glance at the report revealed several obvious errors.",
            "deleterious": "The _____ effects of pollution on marine life became increasingly evident.",
            "despot": "The cruel _____ ruled through fear and intimidation for decades.",
            "ennui": "A sense of _____ settled over the office workers as another mundane Monday began.",
            "ephemeral": "The _____ beauty of cherry blossoms makes their brief blooming season even more precious.",
            "eschew": "Health-conscious consumers increasingly _____ processed foods in favor of natural alternatives.",
            "garrulous": "The _____ passenger talked non-stop throughout the entire flight.",
            "hackneyed": "The movie's _____ plot failed to engage audiences looking for original storytelling.",
            "happy": "The children were _____ to receive unexpected gifts on their birthday."
        }
        
        # Create definition questions (straightforward)
        definition_questions = {}
        for word_data in self.vocabulary:
            word = word_data['word']
            definition_questions[word] = f"Define: {word}"
        
        question_bank["contextual_questions"] = contextual_questions
        question_bank["definition_questions"] = definition_questions
        
        # Save question bank to file
        with open(self.questions_file, 'w', encoding='utf-8') as file:
            json.dump(question_bank, file, indent=2, ensure_ascii=False)
            
        return question_bank
    
    def generate_participant_test(self, participant_id: str) -> Dict:
        """Generate participant-specific test based on their vocabulary selection"""
        participant_dir = self.base_dir / f"participant_{participant_id}"
        participant_vocab_file = participant_dir / "vocabulary.csv"
        
        if not participant_vocab_file.exists():
            raise FileNotFoundError(f"Participant {participant_id} vocabulary file not found")
        
        # Load participant's vocabulary
        participant_words = []
        with open(participant_vocab_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            participant_words = [row['word'] for row in reader]
        
        # Create test structure
        test_data = {
            "participant_id": participant_id,
            "total_words": len(participant_words),
            "test_sections": {
                "contextual_questions": [],
                "definition_questions": []
            },
            "google_forms_script": "",
            "instructions": {
                "contextual": "Fill in the blank with the correct vocabulary word from your learning session.",
                "definition": "Provide a clear and accurate definition for each word."
            }
        }
        
        # Randomize word order for test
        randomized_words = participant_words.copy()
        random.shuffle(randomized_words)
        
        # Generate contextual questions
        for word in randomized_words:
            if word in self.question_bank["contextual_questions"]:
                test_data["test_sections"]["contextual_questions"].append({
                    "word": word,
                    "question": self.question_bank["contextual_questions"][word],
                    "type": "fill_in_blank"
                })
        
        # Generate definition questions
        random.shuffle(randomized_words)  # Re-randomize for definition section
        for word in randomized_words:
            if word in self.question_bank["definition_questions"]:
                test_data["test_sections"]["definition_questions"].append({
                    "word": word,
                    "question": self.question_bank["definition_questions"][word],
                    "type": "short_answer"
                })
        
        # Generate Google Forms script
        test_data["google_forms_script"] = self.generate_google_forms_script(test_data)
        
        # Save participant test
        test_file = participant_dir / "post_test.json"
        with open(test_file, 'w', encoding='utf-8') as file:
            json.dump(test_data, file, indent=2, ensure_ascii=False)
        
        # Also save as readable text format
        self.save_readable_test(test_data, participant_dir)
        
        return test_data
    
    def generate_google_forms_script(self, test_data: Dict) -> str:
        """Generate Google Forms creation script"""
        participant_id = test_data["participant_id"]
        total_words = test_data["total_words"]
        
        script = f"""// Google Forms Script for Participant {participant_id}
// 24-Hour Delayed Vocabulary Test - {total_words} words

function createVocabularyTest() {{
  // Create new form
  var form = FormApp.create('Vocabulary Test - Participant {participant_id} - 24h Delayed');
  
  // Set form description
  form.setDescription(
    'This is your 24-hour delayed vocabulary test. You learned {total_words} words yesterday. ' +
    'The test has two parts: fill-in-the-blank and definitions. ' +
    'Please complete both sections honestly. This should take about 15 minutes.'
  );
  
  // Add participant ID (hidden)
  form.addTextItem()
    .setTitle('Participant ID')
    .setRequired(true)
    .setHelpText('Your participant number')
    .setDefaultAnswer('{participant_id}');

  // Section 1: Contextual Fill-in-the-Blank
  form.addSectionHeaderItem()
    .setTitle('Part A: Fill in the Blank')
    .setHelpText('Complete each sentence with the correct vocabulary word from your learning session.');

"""
        
        # Create word bank for contextual questions
        contextual_words = [q["word"] for q in test_data["test_sections"]["contextual_questions"]]
        word_bank_text = "Word Bank: " + " | ".join(contextual_words)
        
        # Add contextual questions
        for i, question in enumerate(test_data["test_sections"]["contextual_questions"], 1):
            word = question["word"]
            question_text = question["question"]
            script += f"""
  // Question {i}: {word}
  form.addTextItem()
    .setTitle('Question {i}')
    .setHelpText('{question_text}\\n\\n{word_bank_text}')
    .setRequired(true);
"""
        
        # Add definition section
        script += f"""
  // Section 2: Definitions
  form.addSectionHeaderItem()
    .setTitle('Part B: Definitions')
    .setHelpText('Provide clear definitions for each vocabulary word.');

"""
        
        # Add definition questions
        for i, question in enumerate(test_data["test_sections"]["definition_questions"], 1):
            word = question["word"]
            script += f"""
  // Definition {i}: {word}
  form.addParagraphTextItem()
    .setTitle('Define: {word}')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(true);
"""
        
        script += f"""
  // Set up response handling
  form.setDestination(FormApp.DestinationType.SPREADSHEET);
  
  // Get form URL
  var formUrl = form.getPublishedUrl();
  console.log('Form created for Participant {participant_id}');
  console.log('Form URL: ' + formUrl);
  
  return formUrl;
}}

// Run this function to create the form
createVocabularyTest();
"""
        
        return script
    
    def save_readable_test(self, test_data: Dict, participant_dir: Path):
        """Save human-readable version of the test"""
        participant_id = test_data["participant_id"]
        readable_file = participant_dir / "post_test_readable.txt"
        
        with open(readable_file, 'w', encoding='utf-8') as file:
            file.write(f"24-Hour Delayed Vocabulary Test\n")
            file.write(f"Participant {participant_id}\n")
            file.write(f"Total Words: {test_data['total_words']}\n")
            file.write("=" * 50 + "\n\n")
            
            file.write("PART A: FILL IN THE BLANK\n")
            file.write("Instructions: " + test_data["instructions"]["contextual"] + "\n\n")
            
            # Add word bank to readable version
            contextual_words = [q["word"] for q in test_data["test_sections"]["contextual_questions"]]
            word_bank = " | ".join(contextual_words)
            file.write(f"WORD BANK: {word_bank}\n\n")
            
            for i, question in enumerate(test_data["test_sections"]["contextual_questions"], 1):
                file.write(f"{i}. {question['question']}\n")
                file.write(f"   Answer: _______ (correct: {question['word']})\n\n")
            
            file.write("\n" + "=" * 50 + "\n\n")
            file.write("PART B: DEFINITIONS\n")
            file.write("Instructions: " + test_data["instructions"]["definition"] + "\n\n")
            
            for i, question in enumerate(test_data["test_sections"]["definition_questions"], 1):
                file.write(f"{i}. {question['question']}\n")
                file.write("   Answer: \n\n")
    
    def create_forms_script_file(self, participant_id: str):
        """Create standalone Google Apps Script file"""
        test_data = self.generate_participant_test(participant_id)
        participant_dir = self.base_dir / f"participant_{participant_id}"
        
        script_file = participant_dir / "google_forms_script.js"
        with open(script_file, 'w', encoding='utf-8') as file:
            file.write(test_data["google_forms_script"])
        
        print(f"Google Forms script created: {script_file}")
        print(f"Instructions:")
        print(f"1. Go to script.google.com")
        print(f"2. Create new project")
        print(f"3. Copy contents from {script_file}")
        print(f"4. Run createVocabularyTest() function")
        print(f"5. Copy the form URL from the logs")
        print(f"6. Send URL to participant {participant_id}")
    
    def generate_all_participant_tests(self):
        """Generate tests for all existing participants"""
        participant_dirs = [d for d in self.base_dir.glob("participant_*") if d.is_dir()]
        
        for participant_dir in participant_dirs:
            participant_id = participant_dir.name.replace("participant_", "")
            try:
                print(f"Generating test for participant {participant_id}...")
                self.generate_participant_test(participant_id)
                print(f"✓ Test generated for participant {participant_id}")
            except Exception as e:
                print(f"✗ Error generating test for participant {participant_id}: {e}")

def main():
    """Command line interface"""
    import sys
    
    generator = PostTestGenerator()
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python post_test_generator.py <participant_id>  # Generate test for specific participant")
        print("  python post_test_generator.py all              # Generate tests for all participants")
        print("  python post_test_generator.py questions        # Regenerate question bank only")
        return
    
    command = sys.argv[1]
    
    if command == "all":
        generator.generate_all_participant_tests()
    elif command == "questions":
        print("Regenerating question bank...")
        generator.create_question_bank()
        print("✓ Question bank updated")
    elif command.isdigit():
        participant_id = command
        try:
            generator.create_forms_script_file(participant_id)
            print(f"✓ Google Forms script ready for participant {participant_id}")
        except Exception as e:
            print(f"✗ Error: {e}")
    else:
        print(f"Invalid command: {command}")

if __name__ == "__main__":
    main()