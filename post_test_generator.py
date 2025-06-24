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
        
        # Create multiple choice questions with same part of speech distractors from vocabulary list
        contextual_questions = {
            "obfuscate": {
                "question": "The politician tried to _____ the facts to avoid taking responsibility for the scandal.",
                "options": ["obfuscate", "disparage", "capitulate", "abrogate"],
                "correct": "obfuscate"
            },
            "disparage": {
                "question": "Rather than offer constructive criticism, he chose to _____ his opponent's achievements.", 
                "options": ["disparage", "obfuscate", "bolster", "eschew"],
                "correct": "disparage"
            },
            "perfunctory": {
                "question": "Her _____ apology lacked sincerity and failed to address the real issues.",
                "options": ["perfunctory", "precocious", "circumspect", "capricious"],
                "correct": "perfunctory"
            },
            "precocious": {
                "question": "The _____ child was reading university-level texts at age ten.",
                "options": ["precocious", "austere", "garrulous", "vociferous"],
                "correct": "precocious"
            },
            "quandary": {
                "question": "Faced with two equally unappealing options, she found herself in a difficult _____.",
                "options": ["quandary", "conundrum", "acumen", "cacophony"],
                "correct": "quandary"
            },
            "circumspect": {
                "question": "Given the sensitive nature of the negotiations, the diplomat remained _____ in his statements.",
                "options": ["circumspect", "capricious", "intractable", "deleterious"],
                "correct": "circumspect"
            },
            "capitulate": {
                "question": "After weeks of resistance, the city was forced to _____ to the enemy's demands.",
                "options": ["capitulate", "abrogate", "admonish", "cajole"],
                "correct": "capitulate"
            },
            "vociferous": {
                "question": "The _____ protests outside the courthouse could be heard from several blocks away.",
                "options": ["vociferous", "copious", "cursory", "ephemeral"],
                "correct": "vociferous"
            },
            "intractable": {
                "question": "The _____ dispute had resisted all attempts at resolution for over a decade.",
                "options": ["intractable", "abstruse", "hackneyed", "conciliatory"],
                "correct": "intractable"
            },
            "abrogate": {
                "question": "The new government decided to _____ the controversial treaty signed by its predecessor.",
                "options": ["abrogate", "bolster", "eschew", "disparage"],
                "correct": "abrogate"
            },
            "abstruse": {
                "question": "The professor's _____ explanation of quantum mechanics left most students confused.",
                "options": ["abstruse", "perfunctory", "deleterious", "ephemeral"],
                "correct": "abstruse"
            },
            "acumen": {
                "question": "Her exceptional business _____ helped transform the struggling company into a market leader.",
                "options": ["acumen", "candor", "cacophony", "conundrum"],
                "correct": "acumen"
            },
            "admonish": {
                "question": "The teacher had to _____ the students for their disruptive behavior during the assembly.",
                "options": ["admonish", "cajole", "capitulate", "bolster"],
                "correct": "admonish"
            },
            "austere": {
                "question": "The monastery's _____ living conditions reflected the monks' commitment to simplicity.",
                "options": ["austere", "garrulous", "precocious", "copious"],
                "correct": "austere"
            },
            "bolster": {
                "question": "The positive reviews helped _____ confidence in the company's new product line.",
                "options": ["bolster", "obfuscate", "eschew", "admonish"],
                "correct": "bolster"
            },
            "cacophony": {
                "question": "The _____ of car horns and construction noise made conversation impossible.",
                "options": ["cacophony", "acumen", "candor", "quandary"],
                "correct": "cacophony"
            },
            "cajole": {
                "question": "She tried to _____ her reluctant brother into joining the family vacation.",
                "options": ["cajole", "admonish", "disparage", "abrogate"],
                "correct": "cajole"
            },
            "candor": {
                "question": "His refreshing _____ during the interview impressed the hiring committee.",
                "options": ["candor", "acumen", "cacophony", "conundrum"],
                "correct": "candor"
            },
            "capricious": {
                "question": "The _____ weather made it impossible to plan outdoor activities with confidence.",
                "options": ["capricious", "circumspect", "intractable", "abstruse"],
                "correct": "capricious"
            },
            "conciliatory": {
                "question": "After the heated argument, he adopted a _____ tone to restore peace.",
                "options": ["conciliatory", "perfunctory", "deleterious", "hackneyed"],
                "correct": "conciliatory"
            },
            "conundrum": {
                "question": "The detective faced a perplexing _____ with no obvious solution in sight.",
                "options": ["conundrum", "quandary", "candor", "acumen"],
                "correct": "conundrum"
            },
            "copious": {
                "question": "The researcher took _____ notes during the lengthy interview session.",
                "options": ["copious", "cursory", "vociferous", "ephemeral"],
                "correct": "copious"
            },
            "cursory": {
                "question": "A _____ glance at the report revealed several obvious errors.",
                "options": ["cursory", "copious", "ephemeral", "vociferous"],
                "correct": "cursory"
            },
            "deleterious": {
                "question": "The _____ effects of pollution on marine life became increasingly evident.",
                "options": ["deleterious", "conciliatory", "abstruse", "hackneyed"],
                "correct": "deleterious"
            },
            "ephemeral": {
                "question": "The _____ beauty of cherry blossoms makes their brief blooming season even more precious.",
                "options": ["ephemeral", "copious", "cursory", "vociferous"],
                "correct": "ephemeral"
            },
            "eschew": {
                "question": "Health-conscious consumers increasingly _____ processed foods in favor of natural alternatives.",
                "options": ["eschew", "bolster", "disparage", "obfuscate"],
                "correct": "eschew"
            },
            "garrulous": {
                "question": "The _____ passenger talked non-stop throughout the entire flight.",
                "options": ["garrulous", "austere", "precocious", "copious"],
                "correct": "garrulous"
            },
            "hackneyed": {
                "question": "The movie's _____ plot failed to engage audiences looking for original storytelling.",
                "options": ["hackneyed", "intractable", "deleterious", "conciliatory"],
                "correct": "hackneyed"
            }
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
                "contextual": "Choose the best word to complete each sentence.",
                "definition": "Provide a clear and accurate definition for each word (optional)."
            }
        }
        
        # Randomize word order for test
        randomized_words = participant_words.copy()
        random.shuffle(randomized_words)
        
        # Generate contextual questions
        for word in randomized_words:
            if word in self.question_bank["contextual_questions"]:
                # Shuffle the options so correct answer isn't always first
                options = self.question_bank["contextual_questions"][word]["options"].copy()
                random.shuffle(options)
                
                test_data["test_sections"]["contextual_questions"].append({
                    "word": word,
                    "question": self.question_bank["contextual_questions"][word]["question"],
                    "options": options,
                    "correct": self.question_bank["contextual_questions"][word]["correct"],
                    "type": "multiple_choice"
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
    'The test has two parts: multiple choice and definitions. ' +
    'All questions are optional. This should take about 10 minutes.'
  );
  
  // Add participant ID field
  form.addTextItem()
    .setTitle('Participant ID')
    .setRequired(true)
    .setHelpText('Enter your participant number: {participant_id}');

  // Section 1: Multiple Choice
  form.addSectionHeaderItem()
    .setTitle('Part A: Multiple Choice')
    .setHelpText('Choose the best word to complete each sentence.');

"""
        
        # Add contextual questions (multiple choice)
        for i, question in enumerate(test_data["test_sections"]["contextual_questions"], 1):
            word = question["word"]
            question_text = question["question"]
            options = question["options"]
            # Escape single quotes in the text for JavaScript
            escaped_question = question_text.replace("'", "\\'")
            
            script += f"""
  // Question {i}: {word}
  form.addMultipleChoiceItem()
    .setTitle('Question {i}')
    .setHelpText('{escaped_question}')
    .setChoiceValues(['{options[0]}', '{options[1]}', '{options[2]}', '{options[3]}'])
    .setRequired(false);
"""
        
        # Add definition section
        script += f"""
  // Section 2: Definitions
  form.addSectionHeaderItem()
    .setTitle('Part B: Definitions (Optional)')
    .setHelpText('Provide clear definitions for each vocabulary word. All questions in this section are optional.');

"""
        
        # Add definition questions
        for i, question in enumerate(test_data["test_sections"]["definition_questions"], 1):
            word = question["word"]
            script += f"""
  // Definition {i}: {word}
  form.addParagraphTextItem()
    .setTitle('Define: {word}')
    .setHelpText('Provide a clear and accurate definition.')
    .setRequired(false);
"""
        
        script += f"""
  // Responses will be automatically collected in form responses
  // To link to a spreadsheet, manually do so in the form editor
  
  // Get form URL
  var formUrl = form.getPublishedUrl();
  console.log('Form created for Participant {participant_id}');
  console.log('Form URL: ' + formUrl);
  
  return formUrl;
}}

// To use: Click the "Run" button above or manually call createVocabularyTest()
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
            
            file.write("PART A: MULTIPLE CHOICE\n")
            file.write("Instructions: Choose the best word to complete each sentence.\n\n")
            
            for i, question in enumerate(test_data["test_sections"]["contextual_questions"], 1):
                file.write(f"{i}. {question['question']}\n")
                for j, option in enumerate(question['options']):
                    letter = chr(ord('A') + j)
                    file.write(f"   {letter}) {option}\n")
                file.write(f"   Answer: _______ (correct: {question['correct']})\n\n")
            
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