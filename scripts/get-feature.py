import argparse
from pathlib import Path
import sys
import os

base_project_dir = Path('D:/projects/life_manager')
default_output_dir = base_project_dir / 'scripts'

# Core files that will be included with every feature
CORE_FILES = [
    'frontend/src/App.tsx',
    'frontend/src/main.tsx',
    'frontend/src/components/layouts/AppLayout.tsx',
    'frontend/src/state/syncEngine.ts',
    'frontend/src/state/slices/taskSlice.ts',
    'frontend/src/state/slices/syncSlice.ts',
    'frontend/src/utils/types.ts',
    'frontend/src/utils/utils.ts',
    'frontend/src/utils/api.ts',
    'frontend/src/utils/displayMappings.ts',
    'frontend/src/styles/globals.css',
    'frontend/src/components/animations/animations.css',
    'frontend/tailwind.config.js',
    'docs/design_document.md',
    'docs/project_structure.md',
]

# Define features and their associated files/folders
FEATURES = {
    'weekly_plan': [
        'frontend/src/components/weekly-plan/WeeklyCalendar.tsx',
        'frontend/src/components/weekly-plan/DayColumn.tsx',
        'frontend/src/components/weekly-plan/UnscheduledTaskSidebar.tsx',
        'frontend/src/components/task/TaskCard.tsx',
        'frontend/src/components/task/Recurrence.tsx',
        'frontend/src/pages/WeeklyPlanPage.tsx',
        'docs/weekly_plan.md'
    ],
    'master_list': [
        'frontend/src/components/task/TaskTableRow.tsx',
        'frontend/src/components/task/Recurrence.tsx',
        'frontend/src/components/task/TaskTable.tsx',
        'frontend/src/components/task/AddTaskDialog.tsx',
        'frontend/src/pages/MasterListPage.tsx',
        'docs/master_list.md'
    ],
    'state_management': [
        'frontend/src/state/syncEngine.ts',
        'frontend/src/state/logger.ts',
        'frontend/src/state/slices/taskSlice.ts',
        'frontend/src/state/slices/syncSlice.ts',
        'frontend/src/utils/types.ts',
    ],
    'layouts': [
        'frontend/src/components/layouts/AppLayout.tsx',
        'frontend/src/components/layouts/TopPanel.tsx',
        'frontend/src/components/layouts/Sidebar.tsx',
        'frontend/src/App.tsx',
        'frontend/src/main.tsx',
    ]
}

# Define additional notes that will be included with every feature
ADDITIONAL_NOTES = """
Additional Notes:
1. The files in components/ui are all shadcn components. They are not included in the above codebase for brevity but are available. 

"""

def parse_arguments():
    parser = argparse.ArgumentParser(description="Capture feature-specific files from the codebase")
    parser.add_argument(
        'feature',
        type=str,
        help=f"Feature name to capture. Available features: {', '.join(FEATURES.keys())}"
    )
    return parser.parse_args()

def process_file(file_path, output_file):
    full_path = base_project_dir / file_path
    print(f"Processing: {file_path}")

    if not full_path.exists():
        print(f"Warning: File not found - {file_path}")
        output_file.write(f"\nWarning: File not found - {file_path}\n")
        output_file.write('-'*80 + '\n')
        return

    try:
        with full_path.open('r', encoding='utf-8', errors='ignore') as code_file:
            output_file.write(f"<File: {file_path}>\n")
            output_file.write(code_file.read())
            output_file.write('\n' + '-'*80 + '\n')
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        output_file.write(f"\nError reading file '{file_path}': {e}\n")
        output_file.write('-'*80 + '\n')

def main():
    args = parse_arguments()
    feature = args.feature.lower()

    if feature not in FEATURES:
        print(f"Error: Feature '{feature}' not found. Available features: {', '.join(FEATURES.keys())}")
        sys.exit(1)

    output_file = default_output_dir / f"{feature}.txt"
    
    # Display feature info
    print(f"\nCollecting files for feature: {feature}")
    print(f"Output file: {output_file}")
    print("\nIncluding core files:")
    for core_file in CORE_FILES:
        print(f"- {core_file}")

    # Set up output formatting
    header = f"Files for feature '{feature}' (including core files):\n\n"
    footer = f"\n<end feature: {feature}>\n\n"

    # Ensure output directory exists
    output_file.parent.mkdir(parents=True, exist_ok=True)

    try:
        with output_file.open('w', encoding='utf-8', errors='ignore') as f:
            f.write(header)

            # First process core files
            f.write("=== CORE FILES ===\n\n")
            for file_path in CORE_FILES:
                process_file(file_path, f)

            # Then process feature-specific files
            f.write("\n=== FEATURE-SPECIFIC FILES ===\n\n")
            for file_path in FEATURES[feature]:
                process_file(file_path, f)

            # Add additional notes
            f.write("\n=== ADDITIONAL NOTES ===\n")
            f.write(ADDITIONAL_NOTES)
            f.write("\n")

            f.write(footer)

        print(f"\nFeature '{feature}' captured successfully in '{output_file}'")
    except Exception as e:
        print(f"Error writing to output file '{output_file}': {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 