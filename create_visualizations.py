#!/usr/bin/env python3
"""
Create comprehensive visualizations for the vocabulary learning experiment results
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Set up plotting style
plt.style.use('default')
sns.set_palette("husl")
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 10

def load_data():
    """Load the master results CSV"""
    return pd.read_csv('experiment_results_master.csv')

def create_learning_performance_plots(df):
    """Create plots for learning performance comparison"""
    
    # Prepare data
    conv_data = df[df['condition'] == 'conversational']
    flash_data = df[df['condition'] == 'flashcard']
    
    # Create figure with subplots
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    fig.suptitle('Vocabulary Learning Performance: Conversational AI vs Flashcards', fontsize=16, fontweight='bold')
    
    # 1. Box plot comparison
    ax1 = axes[0, 0]
    box_data = [conv_data['mc_percentage'], flash_data['mc_percentage']]
    bp = ax1.boxplot(box_data, labels=['Conversational AI', 'Flashcards'], patch_artist=True)
    bp['boxes'][0].set_facecolor('lightblue')
    bp['boxes'][1].set_facecolor('lightcoral')
    ax1.set_ylabel('Post-test Score (%)')
    ax1.set_title('Distribution of Learning Scores')
    ax1.grid(True, alpha=0.3)
    
    # Add mean markers
    means = [conv_data['mc_percentage'].mean(), flash_data['mc_percentage'].mean()]
    ax1.scatter([1, 2], means, color='red', s=100, marker='D', label='Mean', zorder=10)
    ax1.legend()
    
    # 2. Individual participant comparison
    ax2 = axes[0, 1]
    participants = conv_data['participant_id'].values
    x_pos = np.arange(len(participants))
    width = 0.35
    
    bars1 = ax2.bar(x_pos - width/2, conv_data['mc_percentage'], width, 
                   label='Conversational AI', color='lightblue', alpha=0.8)
    bars2 = ax2.bar(x_pos + width/2, flash_data['mc_percentage'], width,
                   label='Flashcards', color='lightcoral', alpha=0.8)
    
    ax2.set_xlabel('Participant')
    ax2.set_ylabel('Post-test Score (%)')
    ax2.set_title('Individual Participant Performance')
    ax2.set_xticks(x_pos)
    ax2.set_xticklabels([f'P{p}' for p in participants])
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # Add value labels on bars
    for bar in bars1:
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height + 1,
                f'{height:.0f}%', ha='center', va='bottom', fontsize=8)
    
    for bar in bars2:
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height + 1,
                f'{height:.0f}%', ha='center', va='bottom', fontsize=8)
    
    # 3. Paired comparison (before-after style)
    ax3 = axes[1, 0]
    for i, participant in enumerate(participants):
        conv_score = conv_data[conv_data['participant_id'] == participant]['mc_percentage'].iloc[0]
        flash_score = flash_data[flash_data['participant_id'] == participant]['mc_percentage'].iloc[0]
        
        ax3.plot([0, 1], [conv_score, flash_score], 'o-', linewidth=2, markersize=8, 
                label=f'P{participant}', alpha=0.7)
    
    ax3.set_xlim(-0.1, 1.1)
    ax3.set_xticks([0, 1])
    ax3.set_xticklabels(['Conversational AI', 'Flashcards'])
    ax3.set_ylabel('Post-test Score (%)')
    ax3.set_title('Paired Comparison by Participant')
    ax3.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    ax3.grid(True, alpha=0.3)
    
    # 4. Summary statistics
    ax4 = axes[1, 1]
    conditions = ['Conversational AI', 'Flashcards']
    means = [conv_data['mc_percentage'].mean(), flash_data['mc_percentage'].mean()]
    stds = [conv_data['mc_percentage'].std(), flash_data['mc_percentage'].std()]
    
    bars = ax4.bar(conditions, means, yerr=stds, capsize=10, 
                   color=['lightblue', 'lightcoral'], alpha=0.8)
    ax4.set_ylabel('Post-test Score (%)')
    ax4.set_title('Mean Performance with Standard Deviation')
    ax4.grid(True, alpha=0.3)
    
    # Add value labels
    for i, (bar, mean, std) in enumerate(zip(bars, means, stds)):
        ax4.text(bar.get_x() + bar.get_width()/2., bar.get_height() + std + 2,
                f'M={mean:.1f}%\nSD={std:.1f}', ha='center', va='bottom', fontsize=9)
    
    plt.tight_layout()
    plt.savefig('learning_performance_comparison.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("✅ Created learning_performance_comparison.png")

def create_rimms_plots(df):
    """Create plots for RIMMS motivation comparison"""
    
    # Prepare data
    conv_data = df[df['condition'] == 'conversational']
    flash_data = df[df['condition'] == 'flashcard']
    
    rimms_dimensions = ['attention', 'relevance', 'confidence', 'satisfaction', 'overall']
    
    # Create figure with subplots
    fig, axes = plt.subplots(2, 3, figsize=(18, 12))
    fig.suptitle('RIMMS Motivation Scores: Conversational AI vs Flashcards', fontsize=16, fontweight='bold')
    
    # Remove the extra subplot
    axes[1, 2].remove()
    
    # Create plots for each dimension
    for i, dimension in enumerate(rimms_dimensions):
        if i < 4:
            ax = axes[i//2, i%2]
        else:  # Overall goes in position [1,2] but we removed it, so use [1,1] and expand
            ax = plt.subplot(2, 3, 6)
        
        conv_scores = conv_data[f'rimms_{dimension}']
        flash_scores = flash_data[f'rimms_{dimension}']
        
        # Box plot
        box_data = [conv_scores, flash_scores]
        bp = ax.boxplot(box_data, labels=['Conversational AI', 'Flashcards'], patch_artist=True)
        bp['boxes'][0].set_facecolor('lightgreen')
        bp['boxes'][1].set_facecolor('lightsalmon')
        
        ax.set_ylabel('RIMMS Score (1-5)')
        ax.set_title(f'{dimension.title()} Dimension')
        ax.grid(True, alpha=0.3)
        ax.set_ylim(0, 6)
        
        # Add mean markers
        means = [conv_scores.mean(), flash_scores.mean()]
        ax.scatter([1, 2], means, color='red', s=100, marker='D', label='Mean', zorder=10)
        
        # Add statistical annotation
        from scipy import stats
        t_stat, p_val = stats.ttest_rel(conv_scores, flash_scores)
        significance = "***" if p_val < 0.001 else "**" if p_val < 0.01 else "*" if p_val < 0.05 else "ns"
        ax.text(0.5, 0.95, f'p = {p_val:.3f} {significance}', transform=ax.transAxes, 
                ha='center', va='top', bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
    
    plt.tight_layout()
    plt.savefig('rimms_motivation_comparison.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("✅ Created rimms_motivation_comparison.png")

def create_individual_profiles_plot(df):
    """Create individual participant motivation profiles"""
    
    participants = df['participant_id'].unique()
    rimms_dimensions = ['attention', 'relevance', 'confidence', 'satisfaction']
    
    fig, axes = plt.subplots(1, len(participants), figsize=(20, 6))
    fig.suptitle('Individual Participant RIMMS Motivation Profiles', fontsize=16, fontweight='bold')
    
    for i, participant in enumerate(participants):
        ax = axes[i]
        
        # Get data for this participant
        conv_data = df[(df['participant_id'] == participant) & (df['condition'] == 'conversational')]
        flash_data = df[(df['participant_id'] == participant) & (df['condition'] == 'flashcard')]
        
        conv_scores = [conv_data[f'rimms_{dim}'].iloc[0] for dim in rimms_dimensions]
        flash_scores = [flash_data[f'rimms_{dim}'].iloc[0] for dim in rimms_dimensions]
        
        x_pos = np.arange(len(rimms_dimensions))
        width = 0.35
        
        bars1 = ax.bar(x_pos - width/2, conv_scores, width, 
                      label='Conversational AI', color='lightgreen', alpha=0.8)
        bars2 = ax.bar(x_pos + width/2, flash_scores, width,
                      label='Flashcards', color='lightsalmon', alpha=0.8)
        
        ax.set_xlabel('RIMMS Dimensions')
        ax.set_ylabel('Score (1-5)')
        ax.set_title(f'Participant {participant}')
        ax.set_xticks(x_pos)
        ax.set_xticklabels([dim.title()[:4] for dim in rimms_dimensions])  # Abbreviated labels
        ax.set_ylim(0, 6)
        ax.grid(True, alpha=0.3)
        
        if i == 0:  # Only show legend on first subplot
            ax.legend()
        
        # Add value labels
        for bar in bars1:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                    f'{height:.1f}', ha='center', va='bottom', fontsize=8)
        
        for bar in bars2:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                    f'{height:.1f}', ha='center', va='bottom', fontsize=8)
    
    plt.tight_layout()
    plt.savefig('individual_motivation_profiles.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("✅ Created individual_motivation_profiles.png")

def create_correlation_matrix(df):
    """Create correlation matrix between learning performance and motivation"""
    
    # Prepare data for correlation
    conv_data = df[df['condition'] == 'conversational']
    flash_data = df[df['condition'] == 'flashcard']
    
    # Create datasets for each condition
    datasets = {
        'Conversational AI': conv_data[['mc_percentage', 'rimms_attention', 'rimms_relevance', 
                                       'rimms_confidence', 'rimms_satisfaction', 'rimms_overall']],
        'Flashcards': flash_data[['mc_percentage', 'rimms_attention', 'rimms_relevance', 
                                 'rimms_confidence', 'rimms_satisfaction', 'rimms_overall']]
    }
    
    fig, axes = plt.subplots(1, 2, figsize=(16, 6))
    fig.suptitle('Correlation Matrix: Learning Performance vs Motivation', fontsize=16, fontweight='bold')
    
    for i, (condition, data) in enumerate(datasets.items()):
        correlation_matrix = data.corr()
        
        # Create heatmap
        sns.heatmap(correlation_matrix, annot=True, cmap='RdBu_r', center=0, 
                   square=True, ax=axes[i], cbar_kws={'shrink': 0.8})
        axes[i].set_title(f'{condition}')
        
        # Improve labels
        labels = ['Learning\nPerformance', 'Attention', 'Relevance', 'Confidence', 'Satisfaction', 'Overall\nMotivation']
        axes[i].set_xticklabels(labels, rotation=45, ha='right')
        axes[i].set_yticklabels(labels, rotation=0)
    
    plt.tight_layout()
    plt.savefig('correlation_matrix.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("✅ Created correlation_matrix.png")

def create_summary_dashboard(df):
    """Create a comprehensive summary dashboard"""
    
    fig = plt.figure(figsize=(20, 16))
    gs = fig.add_gridspec(4, 4, hspace=0.3, wspace=0.3)
    
    fig.suptitle('Vocabulary Learning Experiment - Complete Results Dashboard', 
                fontsize=20, fontweight='bold', y=0.98)
    
    # 1. Learning Performance Summary (top left)
    ax1 = fig.add_subplot(gs[0, :2])
    conv_data = df[df['condition'] == 'conversational']
    flash_data = df[df['condition'] == 'flashcard']
    
    conditions = ['Conversational AI', 'Flashcards']
    means = [conv_data['mc_percentage'].mean(), flash_data['mc_percentage'].mean()]
    stds = [conv_data['mc_percentage'].std(), flash_data['mc_percentage'].std()]
    
    bars = ax1.bar(conditions, means, yerr=stds, capsize=10, 
                   color=['steelblue', 'darkorange'], alpha=0.8)
    ax1.set_ylabel('Post-test Score (%)')
    ax1.set_title('Learning Performance Comparison', fontweight='bold')
    ax1.grid(True, alpha=0.3)
    
    # Add statistical info
    from scipy import stats
    t_stat, p_val = stats.ttest_rel(conv_data['mc_percentage'], flash_data['mc_percentage'])
    ax1.text(0.5, 0.9, f't({len(conv_data)-1}) = {t_stat:.3f}, p = {p_val:.3f}', 
             transform=ax1.transAxes, ha='center', 
             bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
    
    # 2. RIMMS Overall Comparison (top right)
    ax2 = fig.add_subplot(gs[0, 2:])
    rimms_means = [conv_data['rimms_overall'].mean(), flash_data['rimms_overall'].mean()]
    rimms_stds = [conv_data['rimms_overall'].std(), flash_data['rimms_overall'].std()]
    
    bars = ax2.bar(conditions, rimms_means, yerr=rimms_stds, capsize=10,
                   color=['forestgreen', 'indianred'], alpha=0.8)
    ax2.set_ylabel('RIMMS Overall Score (1-5)')
    ax2.set_title('Overall Motivation Comparison', fontweight='bold')
    ax2.grid(True, alpha=0.3)
    
    # Add statistical info
    t_stat, p_val = stats.ttest_rel(conv_data['rimms_overall'], flash_data['rimms_overall'])
    ax2.text(0.5, 0.9, f't({len(conv_data)-1}) = {t_stat:.3f}, p = {p_val:.3f}', 
             transform=ax2.transAxes, ha='center',
             bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
    
    # 3. Individual Performance (middle left)
    ax3 = fig.add_subplot(gs[1, :2])
    participants = conv_data['participant_id'].values
    x_pos = np.arange(len(participants))
    width = 0.35
    
    bars1 = ax3.bar(x_pos - width/2, conv_data['mc_percentage'], width, 
                   label='Conversational AI', color='steelblue', alpha=0.8)
    bars2 = ax3.bar(x_pos + width/2, flash_data['mc_percentage'], width,
                   label='Flashcards', color='darkorange', alpha=0.8)
    
    ax3.set_xlabel('Participant')
    ax3.set_ylabel('Post-test Score (%)')
    ax3.set_title('Individual Learning Performance', fontweight='bold')
    ax3.set_xticks(x_pos)
    ax3.set_xticklabels([f'P{p}' for p in participants])
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    
    # 4. RIMMS Dimensions (middle right)
    ax4 = fig.add_subplot(gs[1, 2:])
    dimensions = ['Attention', 'Relevance', 'Confidence', 'Satisfaction']
    conv_dim_means = [conv_data[f'rimms_{dim.lower()}'].mean() for dim in dimensions]
    flash_dim_means = [flash_data[f'rimms_{dim.lower()}'].mean() for dim in dimensions]
    
    x_pos = np.arange(len(dimensions))
    width = 0.35
    
    ax4.bar(x_pos - width/2, conv_dim_means, width, label='Conversational AI', 
           color='forestgreen', alpha=0.8)
    ax4.bar(x_pos + width/2, flash_dim_means, width, label='Flashcards', 
           color='indianred', alpha=0.8)
    
    ax4.set_xlabel('RIMMS Dimension')
    ax4.set_ylabel('Score (1-5)')
    ax4.set_title('Motivation by Dimension', fontweight='bold')
    ax4.set_xticks(x_pos)
    ax4.set_xticklabels(dimensions)
    ax4.legend()
    ax4.grid(True, alpha=0.3)
    
    # 5. Effect Sizes (bottom left)
    ax5 = fig.add_subplot(gs[2, :2])
    
    # Calculate effect sizes
    effect_sizes = []
    measures = ['Learning Performance', 'Attention', 'Relevance', 'Confidence', 'Satisfaction', 'Overall Motivation']
    columns = ['mc_percentage', 'rimms_attention', 'rimms_relevance', 'rimms_confidence', 'rimms_satisfaction', 'rimms_overall']
    
    for col in columns:
        diff = conv_data[col].values - flash_data[col].values
        d = np.mean(diff) / np.std(diff, ddof=1)
        effect_sizes.append(d)
    
    colors = ['steelblue' if d > 0 else 'darkorange' for d in effect_sizes]
    bars = ax5.barh(measures, effect_sizes, color=colors, alpha=0.8)
    ax5.set_xlabel("Cohen's d (Effect Size)")
    ax5.set_title('Effect Sizes (Conversational AI vs Flashcards)', fontweight='bold')
    ax5.axvline(x=0, color='black', linestyle='-', alpha=0.5)
    ax5.grid(True, alpha=0.3)
    
    # Add effect size interpretation lines
    ax5.axvline(x=0.2, color='green', linestyle='--', alpha=0.5, label='Small effect')
    ax5.axvline(x=0.5, color='orange', linestyle='--', alpha=0.5, label='Medium effect')
    ax5.axvline(x=0.8, color='red', linestyle='--', alpha=0.5, label='Large effect')
    ax5.axvline(x=-0.2, color='green', linestyle='--', alpha=0.5)
    ax5.axvline(x=-0.5, color='orange', linestyle='--', alpha=0.5)
    ax5.axvline(x=-0.8, color='red', linestyle='--', alpha=0.5)
    
    # 6. Summary Statistics Table (bottom right)
    ax6 = fig.add_subplot(gs[2, 2:])
    ax6.axis('off')
    
    # Create summary table
    summary_data = [
        ['Measure', 'Conversational AI', 'Flashcards', 'p-value', "Cohen's d"],
        ['Learning (%)', f'{conv_data["mc_percentage"].mean():.1f} ± {conv_data["mc_percentage"].std():.1f}', 
         f'{flash_data["mc_percentage"].mean():.1f} ± {flash_data["mc_percentage"].std():.1f}', 
         f'{stats.ttest_rel(conv_data["mc_percentage"], flash_data["mc_percentage"])[1]:.3f}',
         f'{effect_sizes[0]:.2f}'],
        ['Attention', f'{conv_data["rimms_attention"].mean():.2f} ± {conv_data["rimms_attention"].std():.2f}',
         f'{flash_data["rimms_attention"].mean():.2f} ± {flash_data["rimms_attention"].std():.2f}',
         f'{stats.ttest_rel(conv_data["rimms_attention"], flash_data["rimms_attention"])[1]:.3f}',
         f'{effect_sizes[1]:.2f}'],
        ['Satisfaction', f'{conv_data["rimms_satisfaction"].mean():.2f} ± {conv_data["rimms_satisfaction"].std():.2f}',
         f'{flash_data["rimms_satisfaction"].mean():.2f} ± {flash_data["rimms_satisfaction"].std():.2f}',
         f'{stats.ttest_rel(conv_data["rimms_satisfaction"], flash_data["rimms_satisfaction"])[1]:.3f}',
         f'{effect_sizes[4]:.2f}'],
        ['Overall Motivation', f'{conv_data["rimms_overall"].mean():.2f} ± {conv_data["rimms_overall"].std():.2f}',
         f'{flash_data["rimms_overall"].mean():.2f} ± {flash_data["rimms_overall"].std():.2f}',
         f'{stats.ttest_rel(conv_data["rimms_overall"], flash_data["rimms_overall"])[1]:.3f}',
         f'{effect_sizes[5]:.2f}']
    ]
    
    table = ax6.table(cellText=summary_data[1:], colLabels=summary_data[0],
                     cellLoc='center', loc='center', bbox=[0, 0, 1, 1])
    table.auto_set_font_size(False)
    table.set_fontsize(9)
    table.scale(1, 2)
    ax6.set_title('Key Statistical Results', fontweight='bold', pad=20)
    
    # 7. Participant Trajectories (bottom spanning)
    ax7 = fig.add_subplot(gs[3, :])
    
    for i, participant in enumerate(participants):
        conv_perf = conv_data[conv_data['participant_id'] == participant]['mc_percentage'].iloc[0]
        flash_perf = flash_data[flash_data['participant_id'] == participant]['mc_percentage'].iloc[0]
        conv_mot = conv_data[conv_data['participant_id'] == participant]['rimms_overall'].iloc[0]
        flash_mot = flash_data[flash_data['participant_id'] == participant]['rimms_overall'].iloc[0]
        
        # Plot performance trajectory
        ax7.plot([0, 1], [conv_perf, flash_perf], 'o-', linewidth=2, markersize=8, 
                label=f'P{participant} Performance', alpha=0.7)
        
        # Plot motivation trajectory (scaled to percentage for comparison)
        ax7.plot([0, 1], [conv_mot*20, flash_mot*20], 's--', linewidth=2, markersize=6, 
                alpha=0.7, label=f'P{participant} Motivation (×20)' if i == 0 else "")
    
    ax7.set_xlim(-0.1, 1.1)
    ax7.set_xticks([0, 1])
    ax7.set_xticklabels(['Conversational AI', 'Flashcards'])
    ax7.set_ylabel('Score')
    ax7.set_title('Individual Participant Trajectories (Performance and Motivation)', fontweight='bold')
    ax7.grid(True, alpha=0.3)
    
    # Add legend explaining the scaling
    ax7.text(0.02, 0.98, 'Note: Motivation scores multiplied by 20 for visual comparison', 
             transform=ax7.transAxes, va='top', fontsize=8,
             bbox=dict(boxstyle='round', facecolor='yellow', alpha=0.3))
    
    plt.savefig('complete_results_dashboard.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("✅ Created complete_results_dashboard.png")

def main():
    """Create all visualizations"""
    print("🎨 Creating comprehensive visualizations...")
    
    # Load data
    df = load_data()
    
    # Create all plots
    create_learning_performance_plots(df)
    create_rimms_plots(df)
    create_individual_profiles_plot(df)
    create_correlation_matrix(df)
    create_summary_dashboard(df)
    
    print("\n✅ All visualizations created successfully!")
    print("Files generated:")
    print("- learning_performance_comparison.png")
    print("- rimms_motivation_comparison.png") 
    print("- individual_motivation_profiles.png")
    print("- correlation_matrix.png")
    print("- complete_results_dashboard.png")

if __name__ == "__main__":
    main()