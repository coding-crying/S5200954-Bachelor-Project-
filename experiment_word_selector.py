#!/usr/bin/env python3
"""
Vocabulary Experiment Word Selector

A GUI tool for participants to review and exclude familiar vocabulary words
before starting the experiment. Participants can click on words they already
know to remove them from their personalized vocabulary set.
"""

import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
import csv
import os
import shutil
from pathlib import Path

class VocabularySelector:
    def __init__(self):
        self.root = tk.Tk()
        self.root.withdraw()  # Hide main window initially
        
        # Get participant number first
        self.participant_id = self.get_participant_id()
        if not self.participant_id:
            self.root.quit()
            return
            
        self.root.deiconify()  # Show main window
        self.root.title(f"Vocabulary Experiment - Participant {self.participant_id}")
        self.root.geometry("800x600")
        self.root.configure(bg='#f0f0f0')
        
        # Vocabulary data
        self.words = []
        self.selected_words = set()  # Words to REMOVE from experiment
        self.word_buttons = {}
        self.test_word = "happy"  # Test word to check if user is paying attention
        
        # File paths
        self.base_dir = Path(__file__).parent
        self.participant_dir = self.base_dir / f"participant_{self.participant_id}"
        self.participant_dir.mkdir(exist_ok=True)
        
        self.setup_ui()
        self.load_vocabulary()
        
    def setup_ui(self):
        """Create the user interface"""
        # Main title
        title_frame = tk.Frame(self.root, bg='#f0f0f0')
        title_frame.pack(pady=20)
        
        title_label = tk.Label(
            title_frame,
            text=f"Vocabulary Experiment - Participant {self.participant_id}",
            font=('Arial', 18, 'bold'),
            bg='#f0f0f0'
        )
        title_label.pack()
        
        # Instructions
        instructions_frame = tk.Frame(self.root, bg='#f0f0f0')
        instructions_frame.pack(pady=10, padx=20)
        
        instructions_text = """Instructions: Please review the vocabulary words below. 

Click on any words that you have seen before and could infer the meaning 
when used in a low-context sentence. These words will be excluded from your experiment.

Words you click will turn RED and be removed from your learning session."""
        
        instructions_label = tk.Label(
            instructions_frame,
            text=instructions_text,
            font=('Arial', 11),
            bg='#f0f0f0',
            justify='left',
            wraplength=750
        )
        instructions_label.pack()
        
        # Scrollable word grid
        self.create_word_grid()
        
        # Control buttons
        control_frame = tk.Frame(self.root, bg='#f0f0f0')
        control_frame.pack(pady=20)
        
        # Selected count label
        self.count_label = tk.Label(
            control_frame,
            text="Words selected for removal: 0",
            font=('Arial', 10),
            bg='#f0f0f0'
        )
        self.count_label.pack(pady=5)
        
        # Buttons
        button_frame = tk.Frame(control_frame, bg='#f0f0f0')
        button_frame.pack()
        
        clear_button = tk.Button(
            button_frame,
            text="Clear All Selections",
            command=self.clear_selections,
            font=('Arial', 10),
            bg='#e0e0e0',
            padx=20
        )
        clear_button.pack(side='left', padx=10)
        
        start_button = tk.Button(
            button_frame,
            text="Start Experiment",
            command=self.start_experiment,
            font=('Arial', 12, 'bold'),
            bg='#4CAF50',
            fg='white',
            padx=30
        )
        start_button.pack(side='left', padx=10)
        
    def create_word_grid(self):
        """Create scrollable grid of word buttons"""
        # Frame for scrollable content
        canvas_frame = tk.Frame(self.root, bg='#f0f0f0')
        canvas_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        # Canvas and scrollbar
        canvas = tk.Canvas(canvas_frame, bg='white', highlightthickness=1, highlightbackground='#ccc')
        scrollbar = ttk.Scrollbar(canvas_frame, orient='vertical', command=canvas.yview)
        self.scrollable_frame = tk.Frame(canvas, bg='white')
        
        self.scrollable_frame.bind(
            '<Configure>',
            lambda e: canvas.configure(scrollregion=canvas.bbox('all'))
        )
        
        canvas.create_window((0, 0), window=self.scrollable_frame, anchor='nw')
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')
        
        # Store canvas reference for scrolling
        self.canvas = canvas
        
        # Bind mousewheel to canvas
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        canvas.bind_all("<MouseWheel>", _on_mousewheel)
        
    def get_participant_id(self):
        """Get participant ID from user input"""
        while True:
            participant_id = simpledialog.askstring(
                "Participant ID",
                "Please enter the participant number:",
                parent=self.root
            )
            
            if participant_id is None:  # User cancelled
                return None
                
            # Validate participant ID
            participant_id = participant_id.strip()
            if participant_id and participant_id.isdigit():
                return participant_id
            else:
                messagebox.showerror(
                    "Invalid Input",
                    "Please enter a valid participant number (digits only)."
                )
        
    def load_vocabulary(self):
        """Load vocabulary words from CSV"""
        csv_path = self.base_dir / 'vocabulary.csv'
        
        if not csv_path.exists():
            messagebox.showerror("Error", "vocabulary.csv file not found!")
            self.root.quit()
            return
            
        try:
            with open(csv_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                self.words = [row['word'] for row in reader]
                
            self.create_word_buttons()
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load vocabulary: {str(e)}")
            self.root.quit()
            
    def create_word_buttons(self):
        """Create clickable buttons for each word"""
        # Configure grid weights
        for i in range(6):  # 6 columns
            self.scrollable_frame.columnconfigure(i, weight=1)
            
        # Create buttons in grid layout
        for i, word in enumerate(self.words):
            row = i // 6
            col = i % 6
            
            button = tk.Button(
                self.scrollable_frame,
                text=word,
                command=lambda w=word: self.toggle_word(w),
                font=('Arial', 14, 'bold'),
                bg='#ffffff',
                relief='solid',
                borderwidth=1,
                padx=15,
                pady=12,
                width=12,
                wraplength=120
            )
            
            button.grid(row=row, column=col, padx=5, pady=5, sticky='ew')
            self.word_buttons[word] = button
            
    def toggle_word(self, word):
        """Toggle word selection (for removal)"""
        if word in self.selected_words:
            # Deselect - remove from removal list
            self.selected_words.remove(word)
            self.word_buttons[word].configure(
                bg='#ffffff',
                fg='black',
                relief='solid'
            )
        else:
            # Select - add to removal list
            self.selected_words.add(word)
            self.word_buttons[word].configure(
                bg='#ff4444',
                fg='white',
                relief='sunken'
            )
            
        self.update_count_label()
        
    def update_count_label(self):
        """Update the count of selected words"""
        count = len(self.selected_words)
        remaining = len(self.words) - count
        self.count_label.configure(
            text=f"Words selected for removal: {count} | Remaining for experiment: {remaining}"
        )
        
    def clear_selections(self):
        """Clear all selected words"""
        for word in list(self.selected_words):
            self.toggle_word(word)
            
    def start_experiment(self):
        """Save selections and prepare for experiment"""
        if len(self.selected_words) == len(self.words):
            messagebox.showwarning(
                "Warning", 
                "You have selected all words for removal. At least some words are needed for the experiment."
            )
            return
        
        # Check if test word was selected (attention check)
        test_word_selected = self.test_word in self.selected_words
        if not test_word_selected:
            messagebox.showwarning(
                "Attention Check", 
                f"Please note: You did not select the word '{self.test_word}' for removal.\n\n"
                f"This suggests you may not have carefully reviewed all words. "
                f"This has been logged for the researcher."
            )
            
        remaining_words = [word for word in self.words if word not in self.selected_words]
        
        # Remove test word from final list regardless of selection
        if self.test_word in remaining_words:
            remaining_words.remove(self.test_word)
        
        # Randomly trim to exactly 24 words if more than 24
        import random
        if len(remaining_words) > 24:
            remaining_words = random.sample(remaining_words, 24)
        
        # Confirm selection
        message = f"""You have selected {len(self.selected_words)} words for removal.
        
Final words for experiment: {len(remaining_words)} (trimmed to 24 max)

Selected words will be removed from your vocabulary learning session.

Continue with experiment?"""
        
        if messagebox.askyesno("Confirm Selection", message):
            self.save_personalized_vocabulary(remaining_words, test_word_selected)
            
    def save_personalized_vocabulary(self, remaining_words, test_word_selected):
        """Save personalized vocabulary and close"""
        try:
            # File paths
            original_csv = self.base_dir / 'vocabulary.csv'
            participant_csv = self.participant_dir / 'vocabulary.csv'
            participant_selections = self.participant_dir / 'word_selections.txt'
            
            # Read original CSV structure
            with open(original_csv, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                headers = reader.fieldnames
                all_rows = list(reader)
            
            # Filter to remaining words
            personalized_rows = [row for row in all_rows if row['word'] in remaining_words]
            
            # Write participant's personalized vocabulary
            with open(participant_csv, 'w', newline='', encoding='utf-8') as file:
                writer = csv.DictWriter(file, fieldnames=headers)
                writer.writeheader()
                writer.writerows(personalized_rows)
            
            # Save selection log
            with open(participant_selections, 'w', encoding='utf-8') as file:
                file.write(f"Participant {self.participant_id} - Word Selection Log\n")
                file.write(f"Total words available: {len(self.words)}\n")
                file.write(f"Words selected for removal: {len(self.selected_words)}\n")
                file.write(f"Words remaining for experiment: {len(remaining_words)}\n")
                file.write(f"Test word '{self.test_word}' selected: {'YES' if test_word_selected else 'NO (ATTENTION FLAG)'}\n\n")
                
                if not test_word_selected:
                    file.write("⚠️  ATTENTION CHECK FAILED - Participant did not select obvious test word\n\n")
                
                if self.selected_words:
                    file.write("Words removed (already known):\n")
                    for word in sorted(self.selected_words):
                        if word == self.test_word:
                            file.write(f"- {word} (TEST WORD)\n")
                        else:
                            file.write(f"- {word}\n")
                    file.write("\n")
                
                file.write("Words included in experiment (final 24):\n")
                for word in sorted(remaining_words):
                    file.write(f"- {word}\n")
            
            # Update the main vocabulary.csv to point to participant's version
            # This ensures the experiment system uses the personalized vocabulary
            shutil.copy2(participant_csv, original_csv)
            
            # Success message
            messagebox.showinfo(
                "Success", 
                f"Participant {self.participant_id} vocabulary personalized successfully!\n\n"
                f"Words in your experiment: {len(remaining_words)}\n"
                f"Words removed: {len(self.selected_words)}\n\n"
                f"Files saved in: participant_{self.participant_id}/\n\n"
                f"You can now start the vocabulary learning experiment."
            )
            
            self.root.quit()
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save personalized vocabulary: {str(e)}")

def main():
    """Run the vocabulary selector"""
    app = VocabularySelector()
    app.root.mainloop()

if __name__ == "__main__":
    main()