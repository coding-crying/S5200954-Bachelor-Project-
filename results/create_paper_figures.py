#!/usr/bin/env python3
"""
Create compact, academic paper-ready visualizations for the vocabulary learning experiment results
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from pathlib import Path
import warnings
from scipy import stats
warnings.filterwarnings('ignore')

# Set up plotting style for academic papers
plt.style.use('default')
sns.set_palette("husl")
plt.rcParams['figure.figsize'] = (8, 5)  # Smaller default size
plt.rcParams['font.size'] = 11
plt.rcParams['axes.titlesize'] = 12
plt.rcParams['axes.labelsize'] = 11
plt.rcParams['xtick.labelsize'] = 10
plt.rcParams['ytick.labelsize'] = 10

def load_data():
    """Load the master results CSV"""
    return pd.read_csv('experiment_results_master.csv')

def create_simple_performance_comparison(df):
    """Create a simple learning performance comparison suitable for academic papers"""
    
    # Prepare data
    conv_data = df[df['condition'] == 'conversational']
    flash_data = df[df['condition'] == 'flashcard']
    
    # Create single figure
    fig, ax = plt.subplots(1, 1, figsize=(6, 4))
    
    # Box plot comparison
    box_data = [conv_data['mc_percentage'], flash_data['mc_percentage']]
    bp = ax.boxplot(box_data, labels=['Conversational AI', 'Flashcards'], patch_artist=True)
    bp['boxes'][0].set_facecolor('lightblue')
    bp['boxes'][1].set_facecolor('lightcoral')
    
    # Add mean markers
    means = [conv_data['mc_percentage'].mean(), flash_data['mc_percentage'].mean()]
    ax.scatter([1, 2], means, color='red', s=80, marker='D', label='Mean', zorder=10)
    
    ax.set_ylabel('Post-test Score (%)')
    ax.set_title('Learning Performance Comparison')
    ax.grid(True, alpha=0.3)
    ax.legend()
    
    # Add statistical info
    t_stat, p_val = stats.ttest_rel(conv_data['mc_percentage'], flash_data['mc_percentage'])
    ax.text(0.5, 0.95, f't({len(conv_data)-1}) = {t_stat:.3f}, p = {p_val:.3f}', 
             transform=ax.transAxes, ha='center', va='top',
             bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
    
    plt.tight_layout()
    plt.savefig('simple_performance_comparison.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("✅ Created simple_performance_comparison.png")

def create_simple_rimms_comparison(df):
    """Create a simple RIMMS comparison suitable for academic papers"""
    
    # Prepare data
    conv_data = df[df['condition'] == 'conversational']
    flash_data = df[df['condition'] == 'flashcard']
    
    rimms_dimensions = ['attention', 'relevance', 'confidence', 'satisfaction']
    
    # Create single figure with 2x2 subplots
    fig, axes = plt.subplots(2, 2, figsize=(8, 6))
    fig.suptitle('RIMMS Motivation Scores by Dimension', fontsize=12, fontweight='bold')
    
    # Flatten axes for easier iteration
    axes = axes.flatten()
    
    for i, dimension in enumerate(rimms_dimensions):
        ax = axes[i]
        
        conv_scores = conv_data[f'rimms_{dimension}']
        flash_scores = flash_data[f'rimms_{dimension}']
        
        # Box plot
        box_data = [conv_scores, flash_scores]
        bp = ax.boxplot(box_data, labels=['Conv AI', 'Flashcards'], patch_artist=True)
        bp['boxes'][0].set_facecolor('lightgreen')
        bp['boxes'][1].set_facecolor('lightsalmon')
        
        ax.set_ylabel('RIMMS Score (1-5)')
        ax.set_title(f'{dimension.title()}')
        ax.grid(True, alpha=0.3)
        ax.set_ylim(0, 6)
        
        # Add mean markers
        means = [conv_scores.mean(), flash_scores.mean()]
        ax.scatter([1, 2], means, color='red', s=60, marker='D', zorder=10)
        
        # Add p-value
        t_stat, p_val = stats.ttest_rel(conv_scores, flash_scores)
        significance = "***" if p_val < 0.001 else "**" if p_val < 0.01 else "*" if p_val < 0.05 else "ns"
        ax.text(0.5, 0.95, f'p = {p_val:.3f} {significance}', transform=ax.transAxes, 
                ha='center', va='top', fontsize=9,
                bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
    
    plt.tight_layout()
    plt.savefig('simple_rimms_comparison.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("✅ Created simple_rimms_comparison.png")

def create_individual_performance_chart(df):
    """Create individual participant performance chart"""
    
    # Prepare data
    conv_data = df[df['condition'] == 'conversational']
    flash_data = df[df['condition'] == 'flashcard']
    
    fig, ax = plt.subplots(1, 1, figsize=(8, 5))
    
    participants = conv_data['participant_id'].values
    x_pos = np.arange(len(participants))
    width = 0.35
    
    bars1 = ax.bar(x_pos - width/2, conv_data['mc_percentage'], width, 
                   label='Conversational AI', color='lightblue', alpha=0.8)
    bars2 = ax.bar(x_pos + width/2, flash_data['mc_percentage'], width,
                   label='Flashcards', color='lightcoral', alpha=0.8)
    
    ax.set_xlabel('Participant')
    ax.set_ylabel('Post-test Score (%)')
    ax.set_title('Individual Participant Performance')
    ax.set_xticks(x_pos)
    ax.set_xticklabels([f'P{p}' for p in participants])
    ax.legend()
    ax.grid(True, alpha=0.3)
    
    # Add value labels on bars (smaller font)
    for bar in bars1:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 1,
                f'{height:.0f}%', ha='center', va='bottom', fontsize=8)
    
    for bar in bars2:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 1,
                f'{height:.0f}%', ha='center', va='bottom', fontsize=8)
    
    plt.tight_layout()
    plt.savefig('individual_performance.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("✅ Created individual_performance.png")

def create_motivation_dimensions_chart(df):
    """Create motivation dimensions comparison chart"""
    
    # Prepare data
    conv_data = df[df['condition'] == 'conversational']
    flash_data = df[df['condition'] == 'flashcard']
    
    fig, ax = plt.subplots(1, 1, figsize=(7, 4))
    
    dimensions = ['Attention', 'Relevance', 'Confidence', 'Satisfaction']
    conv_means = [conv_data[f'rimms_{dim.lower()}'].mean() for dim in dimensions]
    flash_means = [flash_data[f'rimms_{dim.lower()}'].mean() for dim in dimensions]
    conv_stds = [conv_data[f'rimms_{dim.lower()}'].std() for dim in dimensions]
    flash_stds = [flash_data[f'rimms_{dim.lower()}'].std() for dim in dimensions]
    
    x_pos = np.arange(len(dimensions))
    width = 0.35
    
    bars1 = ax.bar(x_pos - width/2, conv_means, width, yerr=conv_stds, 
                   label='Conversational AI', color='forestgreen', alpha=0.8, capsize=5)
    bars2 = ax.bar(x_pos + width/2, flash_means, width, yerr=flash_stds,
                   label='Flashcards', color='indianred', alpha=0.8, capsize=5)
    
    ax.set_xlabel('RIMMS Dimension')
    ax.set_ylabel('Score (1-5)')
    ax.set_title('Motivation by Dimension')
    ax.set_xticks(x_pos)
    ax.set_xticklabels(dimensions)
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.set_ylim(0, 5)
    
    plt.tight_layout()
    plt.savefig('motivation_dimensions.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("✅ Created motivation_dimensions.png")

def create_summary_table_figure(df):
    """Create a summary statistics table as a figure"""
    
    # Prepare data
    conv_data = df[df['condition'] == 'conversational']
    flash_data = df[df['condition'] == 'flashcard']
    
    fig, ax = plt.subplots(1, 1, figsize=(10, 4))
    ax.axis('off')
    
    # Calculate effect sizes
    measures = ['Learning Performance', 'Attention', 'Relevance', 'Confidence', 'Satisfaction', 'Overall Motivation']
    columns = ['mc_percentage', 'rimms_attention', 'rimms_relevance', 'rimms_confidence', 'rimms_satisfaction', 'rimms_overall']
    
    summary_data = [['Measure', 'Conversational AI', 'Flashcards', 'p-value', "Cohen's d"]]
    
    for measure, col in zip(measures, columns):
        conv_mean = conv_data[col].mean()
        conv_std = conv_data[col].std()
        flash_mean = flash_data[col].mean()
        flash_std = flash_data[col].std()
        
        t_stat, p_val = stats.ttest_rel(conv_data[col], flash_data[col])
        
        # Calculate Cohen's d
        diff = conv_data[col].values - flash_data[col].values
        cohens_d = np.mean(diff) / np.std(diff, ddof=1)
        
        if col == 'mc_percentage':
            summary_data.append([
                measure,
                f'{conv_mean:.1f} ± {conv_std:.1f}',
                f'{flash_mean:.1f} ± {flash_std:.1f}',
                f'{p_val:.3f}',
                f'{cohens_d:.2f}'
            ])
        else:
            summary_data.append([
                measure,
                f'{conv_mean:.2f} ± {conv_std:.2f}',
                f'{flash_mean:.2f} ± {flash_std:.2f}',
                f'{p_val:.3f}',
                f'{cohens_d:.2f}'
            ])
    
    # Create table
    table = ax.table(cellText=summary_data[1:], colLabels=summary_data[0],
                     cellLoc='center', loc='center', bbox=[0, 0, 1, 1])
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 1.5)
    
    # Style the table
    for i in range(len(summary_data)):
        for j in range(len(summary_data[0])):
            if i == 0:  # Header row
                table[(i, j)].set_facecolor('#4CAF50')
                table[(i, j)].set_text_props(weight='bold', color='white')
            else:
                if j % 2 == 0:
                    table[(i, j)].set_facecolor('#f0f0f0')
    
    ax.set_title('Summary Statistics: Conversational AI vs Flashcards', 
                fontsize=12, fontweight='bold', pad=20)
    
    plt.tight_layout()
    plt.savefig('summary_statistics_table.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("✅ Created summary_statistics_table.png")

def main():
    """Create all paper-ready visualizations"""
    print("🎨 Creating academic paper-ready visualizations...")
    
    # Load data
    df = load_data()
    
    # Create focused plots suitable for academic papers
    create_simple_performance_comparison(df)
    create_simple_rimms_comparison(df)
    create_individual_performance_chart(df)
    create_motivation_dimensions_chart(df)
    create_summary_table_figure(df)
    
    print("\n✅ All paper-ready visualizations created successfully!")
    print("Files generated:")
    print("- simple_performance_comparison.png (suitable for Learning Performance section)")
    print("- simple_rimms_comparison.png (suitable for RIMMS section)")
    print("- individual_performance.png (suitable for Individual Differences section)")
    print("- motivation_dimensions.png (suitable for Motivation Analysis section)")
    print("- summary_statistics_table.png (suitable as summary table)")

if __name__ == "__main__":
    main()