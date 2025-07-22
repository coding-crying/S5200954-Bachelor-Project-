#!/usr/bin/env python3
"""
Comprehensive Results Analysis for Vocabulary Learning Experiment
Analyzes post-test performance and RIMMS motivation scores across conditions
"""

import pandas as pd
import numpy as np
import json
import csv
from pathlib import Path
from scipy import stats
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')

class ExperimentAnalyzer:
    def __init__(self):
        self.participants = ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011', '012']
        self.post_test_questions = self._load_answer_key()
        self.results = {}
        
    def _load_answer_key(self) -> Dict:
        """Load the post-test answer key"""
        with open('post_test_questions.json', 'r') as f:
            return json.load(f)
    
    def _load_condition_assignments(self, participant_id: str) -> Dict[str, List[str]]:
        """Load word assignments for each condition"""
        assignment_file = Path(f"participant_{participant_id}/condition_word_assignments.txt")
        
        assignments = {'conversational': [], 'flashcard': []}
        current_condition = None
        
        with open(assignment_file, 'r') as f:
            for line in f:
                line = line.strip()
                if 'Conversational Condition Words' in line:
                    current_condition = 'conversational'
                elif 'Flashcard Condition Words' in line:
                    current_condition = 'flashcard'
                elif line.startswith('- ') and current_condition:
                    word = line[2:]  # Remove '- '
                    assignments[current_condition].append(word)
        
        return assignments
    
    def _load_post_test_responses(self, participant_id: str) -> pd.DataFrame:
        """Load post-test responses from CSV"""
        csv_file = Path(f"participant_{participant_id}/Vocabulary Test - Participant {participant_id} - 24h Delayed.csv")
        
        df = pd.read_csv(csv_file)
        return df
    
    def _load_rimms_scores(self, participant_id: str) -> Dict:
        """Load RIMMS scores for both conditions"""
        rimms_scores = {}
        
        for condition in ['conversational', 'flashcard']:
            rimms_file = Path(f"participant_{participant_id}/rimms_{condition}.json")
            
            with open(rimms_file, 'r') as f:
                data = json.load(f)
                rimms_scores[condition] = data['scores']
        
        return rimms_scores
    
    def _grade_multiple_choice(self, participant_responses: pd.DataFrame, word_assignments: Dict) -> Dict:
        """Grade multiple choice questions and separate by condition"""
        
        # Map question numbers to words based on post_test.json structure
        question_mapping = {}
        
        # Load participant's specific post test to get question order
        participant_id = str(participant_responses.iloc[0]['Participant ID'])
        # Handle both '001' and '1' formats
        if len(participant_id) == 1:
            participant_id = f"00{participant_id}"
        elif len(participant_id) == 2:
            participant_id = f"0{participant_id}"
        post_test_file = Path(f"participant_{participant_id}/post_test.json")
        with open(post_test_file, 'r') as f:
            post_test_data = json.load(f)
        
        # Extract question order from the post test
        for i, question_data in enumerate(post_test_data['test_sections']['contextual_questions']):
            question_mapping[f"Question {i+1}"] = question_data['word']
        
        scores = {'conversational': [], 'flashcard': []}
        detailed_results = {'conversational': {}, 'flashcard': {}}
        
        # Grade each question
        for question_col, word in question_mapping.items():
            if question_col in participant_responses.columns:
                participant_answer = participant_responses.iloc[0][question_col]
                correct_answer = self.post_test_questions['contextual_questions'][word]['correct']
                
                is_correct = 1 if participant_answer == correct_answer else 0
                
                # Determine which condition this word belongs to
                if word in word_assignments['conversational']:
                    scores['conversational'].append(is_correct)
                    detailed_results['conversational'][word] = {
                        'answer': participant_answer,
                        'correct': correct_answer,
                        'score': is_correct
                    }
                elif word in word_assignments['flashcard']:
                    scores['flashcard'].append(is_correct)
                    detailed_results['flashcard'][word] = {
                        'answer': participant_answer,
                        'correct': correct_answer,
                        'score': is_correct
                    }
        
        return {
            'scores': scores,
            'detailed': detailed_results,
            'conversational_total': sum(scores['conversational']),
            'conversational_count': len(scores['conversational']),
            'flashcard_total': sum(scores['flashcard']),
            'flashcard_count': len(scores['flashcard']),
            'conversational_percentage': (sum(scores['conversational']) / len(scores['conversational'])) * 100 if scores['conversational'] else 0,
            'flashcard_percentage': (sum(scores['flashcard']) / len(scores['flashcard'])) * 100 if scores['flashcard'] else 0
        }
    
    def _grade_definition_questions(self, participant_responses: pd.DataFrame, word_assignments: Dict) -> Dict:
        """Grade definition questions (these are free text, so we'll just collect responses)"""
        
        definition_responses = {'conversational': {}, 'flashcard': {}}
        
        # Get all definition columns
        definition_cols = [col for col in participant_responses.columns if col.startswith('Define: ')]
        
        for col in definition_cols:
            word = col.replace('Define: ', '')
            response = participant_responses.iloc[0][col]
            
            if word in word_assignments['conversational']:
                definition_responses['conversational'][word] = response
            elif word in word_assignments['flashcard']:
                definition_responses['flashcard'][word] = response
        
        return definition_responses
    
    def analyze_participant(self, participant_id: str) -> Dict:
        """Analyze all data for a single participant"""
        print(f"Analyzing participant {participant_id}...")
        
        try:
            # Load all data
            word_assignments = self._load_condition_assignments(participant_id)
            post_test_responses = self._load_post_test_responses(participant_id)
            rimms_scores = self._load_rimms_scores(participant_id)
        except Exception as e:
            print(f"  Error loading data: {e}")
            raise
        
        # Grade post-test
        mc_results = self._grade_multiple_choice(post_test_responses, word_assignments)
        definition_responses = self._grade_definition_questions(post_test_responses, word_assignments)
        
        participant_results = {
            'participant_id': participant_id,
            'word_assignments': word_assignments,
            'multiple_choice': mc_results,
            'definitions': definition_responses,
            'rimms': rimms_scores
        }
        
        return participant_results
    
    def analyze_all_participants(self) -> Dict:
        """Analyze all participants and compile results"""
        all_results = {}
        
        for participant_id in self.participants:
            try:
                all_results[participant_id] = self.analyze_participant(participant_id)
            except Exception as e:
                print(f"Error analyzing participant {participant_id}: {e}")
                continue
        
        return all_results
    
    def create_individual_csv(self, participant_id: str, results: Dict):
        """Create individual CSV file for participant"""
        
        # Create comprehensive individual results
        rows = []
        
        # Multiple choice results by condition
        for condition in ['conversational', 'flashcard']:
            mc_data = results['multiple_choice']
            rimms_data = results['rimms'][condition]
            
            row = {
                'participant_id': participant_id,
                'condition': condition,
                'mc_score': mc_data[f'{condition}_total'],
                'mc_total': mc_data[f'{condition}_count'],
                'mc_percentage': mc_data[f'{condition}_percentage'],
                'rimms_attention': rimms_data['attention'],
                'rimms_relevance': rimms_data['relevance'],
                'rimms_confidence': rimms_data['confidence'],
                'rimms_satisfaction': rimms_data['satisfaction'],
                'rimms_overall': np.mean([rimms_data['attention'], rimms_data['relevance'], 
                                        rimms_data['confidence'], rimms_data['satisfaction']])
            }
            rows.append(row)
        
        # Save individual CSV
        df = pd.DataFrame(rows)
        df.to_csv(f"participant_{participant_id}/participant_{participant_id}_results.csv", index=False)
        print(f"✅ Created participant_{participant_id}_results.csv")
    
    def create_master_csv(self, all_results: Dict):
        """Create master CSV with all participants"""
        
        master_rows = []
        
        for participant_id, results in all_results.items():
            for condition in ['conversational', 'flashcard']:
                mc_data = results['multiple_choice']
                rimms_data = results['rimms'][condition]
                
                row = {
                    'participant_id': participant_id,
                    'condition': condition,
                    'mc_score': mc_data[f'{condition}_total'],
                    'mc_total': mc_data[f'{condition}_count'],
                    'mc_percentage': mc_data[f'{condition}_percentage'],
                    'rimms_attention': rimms_data['attention'],
                    'rimms_relevance': rimms_data['relevance'],
                    'rimms_confidence': rimms_data['confidence'],
                    'rimms_satisfaction': rimms_data['satisfaction'],
                    'rimms_overall': np.mean([rimms_data['attention'], rimms_data['relevance'], 
                                            rimms_data['confidence'], rimms_data['satisfaction']])
                }
                master_rows.append(row)
        
        df = pd.DataFrame(master_rows)
        df.to_csv("experiment_results_master.csv", index=False)
        print("✅ Created experiment_results_master.csv")
        
        return df
    
    def perform_statistical_analysis(self, master_df: pd.DataFrame):
        """Perform within-subjects statistical tests"""
        
        print("\n" + "="*60)
        print("STATISTICAL ANALYSIS RESULTS")
        print("="*60)
        
        # Prepare data for paired tests
        conv_data = master_df[master_df['condition'] == 'conversational']
        flash_data = master_df[master_df['condition'] == 'flashcard']
        
        # Ensure same order for paired tests
        conv_data = conv_data.sort_values('participant_id')
        flash_data = flash_data.sort_values('participant_id')
        
        print(f"\\nAnalyzing {len(conv_data)} participants with within-subjects design\\n")
        
        # 1. Multiple Choice Performance
        print("1. MULTIPLE CHOICE PERFORMANCE")
        print("-" * 40)
        
        mc_conv = conv_data['mc_percentage'].values
        mc_flash = flash_data['mc_percentage'].values
        
        # Paired t-test for MC performance
        t_stat, p_val = stats.ttest_rel(mc_conv, mc_flash)
        
        print(f"Conversational condition: M = {np.mean(mc_conv):.2f}%, SD = {np.std(mc_conv, ddof=1):.2f}")
        print(f"Flashcard condition:      M = {np.mean(mc_flash):.2f}%, SD = {np.std(mc_flash, ddof=1):.2f}")
        print(f"Paired t-test: t({len(mc_conv)-1}) = {t_stat:.3f}, p = {p_val:.3f}")
        
        if p_val < 0.05:
            print("*** SIGNIFICANT DIFFERENCE ***")
        else:
            print("No significant difference")
        
        # Effect size (Cohen's d for paired samples)
        diff = mc_conv - mc_flash
        d = np.mean(diff) / np.std(diff, ddof=1)
        print(f"Effect size (Cohen's d): {d:.3f}")
        
        # 2. RIMMS Analysis
        print("\\n2. RIMMS MOTIVATION SCORES")
        print("-" * 40)
        
        rimms_dimensions = ['attention', 'relevance', 'confidence', 'satisfaction', 'overall']
        
        for dimension in rimms_dimensions:
            rimms_conv = conv_data[f'rimms_{dimension}'].values
            rimms_flash = flash_data[f'rimms_{dimension}'].values
            
            t_stat, p_val = stats.ttest_rel(rimms_conv, rimms_flash)
            
            print(f"\\n{dimension.upper()}:")
            print(f"  Conversational: M = {np.mean(rimms_conv):.3f}, SD = {np.std(rimms_conv, ddof=1):.3f}")
            print(f"  Flashcard:      M = {np.mean(rimms_flash):.3f}, SD = {np.std(rimms_flash, ddof=1):.3f}")
            print(f"  Paired t-test: t({len(rimms_conv)-1}) = {t_stat:.3f}, p = {p_val:.3f}")
            
            if p_val < 0.05:
                print("  *** SIGNIFICANT DIFFERENCE ***")
            
            # Effect size
            diff = rimms_conv - rimms_flash
            d = np.mean(diff) / np.std(diff, ddof=1)
            print(f"  Effect size (Cohen's d): {d:.3f}")
        
        # 3. Summary Statistics
        print("\\n3. SUMMARY STATISTICS")
        print("-" * 40)
        print("\\nDescriptive Statistics by Condition:")
        print(master_df.groupby('condition')[['mc_percentage', 'rimms_attention', 'rimms_relevance', 
                                             'rimms_confidence', 'rimms_satisfaction', 'rimms_overall']].describe())
        
        # 4. Individual Participant Results
        print("\\n4. INDIVIDUAL PARTICIPANT RESULTS")
        print("-" * 40)
        print("\\nMultiple Choice Performance by Participant:")
        
        participant_summary = []
        for pid in conv_data['participant_id'].values:
            conv_score = conv_data[conv_data['participant_id'] == pid]['mc_percentage'].iloc[0]
            flash_score = flash_data[flash_data['participant_id'] == pid]['mc_percentage'].iloc[0]
            difference = conv_score - flash_score
            
            participant_summary.append({
                'Participant': pid,
                'Conversational': f"{conv_score:.1f}%",
                'Flashcard': f"{flash_score:.1f}%", 
                'Difference': f"{difference:+.1f}%"
            })
            
            print(f"P{pid}: Conv={conv_score:.1f}%, Flash={flash_score:.1f}%, Diff={difference:+.1f}%")
        
        return {
            'mc_results': {'t_stat': t_stat, 'p_val': p_val, 'effect_size': d},
            'participant_summary': participant_summary
        }
    
    def run_complete_analysis(self):
        """Run the complete analysis pipeline"""
        print("🧪 Starting Comprehensive Experiment Analysis")
        print("=" * 60)
        
        # Analyze all participants
        all_results = self.analyze_all_participants()
        
        # Create individual CSV files
        print("\\n📊 Creating individual participant CSV files...")
        for participant_id, results in all_results.items():
            self.create_individual_csv(participant_id, results)
        
        # Create master CSV
        print("\\n📈 Creating master results CSV...")
        master_df = self.create_master_csv(all_results)
        
        # Perform statistical analysis
        stats_results = self.perform_statistical_analysis(master_df)
        
        print("\\n🎉 Analysis Complete!")
        print("=" * 60)
        print("Files created:")
        print("- experiment_results_master.csv (main results)")
        print("- participant_XXX/participant_XXX_results.csv (individual results)")
        
        return all_results, master_df, stats_results

def main():
    analyzer = ExperimentAnalyzer()
    results, master_df, stats = analyzer.run_complete_analysis()

if __name__ == "__main__":
    main()