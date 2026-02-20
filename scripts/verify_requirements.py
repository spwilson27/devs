import argparse
import os
import re
import sys
import json

# Regex to match requirements like [REQ-123], [TAS-001], [REQ-SEC-001], [1_PRD-REQ-001]
REQ_REGEX = re.compile(r"\[([A-Z0-9_]+-[A-Z0-9\-_]+)\]")

def parse_requirements(file_path):
    """Extracts all requirement IDs from a given file."""
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        return set()
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    return set(REQ_REGEX.findall(content))

def verify_doc(source_file, extracted_file):
    """Verifies that all requirements from source_file exist in extracted_file."""
    print(f"Verifying {source_file} against {extracted_file}...")
    source_reqs = parse_requirements(source_file)
    extracted_reqs = parse_requirements(extracted_file)
    
    missing_in_extracted = source_reqs - extracted_reqs
    missing_in_source = extracted_reqs - source_reqs
    
    success = True
    
    if missing_in_extracted:
        print(f"FAILED: The following {len(missing_in_extracted)} requirements are missing from {extracted_file}:")
        for req in sorted(missing_in_extracted):
            print(f"  - [{req}]")
        success = False
        
    if missing_in_source:
        print(f"FAILED: The following {len(missing_in_source)} requirements are missing from {source_file}:")
        for req in sorted(missing_in_source):
            print(f"  - [{req}]")
        success = False
        
    if success:
        print(f"Success: Both {source_file} and {extracted_file} perfectly match exactly the same {len(source_reqs)} requirement IDs.")
        return 0
    else:
        return 1

def verify_master(master_file, requirements_dir):
    """Verifies that all requirements from requirements_dir exist in the master_file."""
    print(f"Verifying {requirements_dir} against {master_file}...")
    
    all_extracted_reqs = set()
    if not os.path.exists(requirements_dir) or not os.path.isdir(requirements_dir):
        print(f"Error: Directory not found: {requirements_dir}")
        return 1

    for filename in os.listdir(requirements_dir):
        if filename.endswith(".md"):
            file_path = os.path.join(requirements_dir, filename)
            reqs = parse_requirements(file_path)
            all_extracted_reqs.update(reqs)
            
    master_reqs = parse_requirements(master_file)
    
    missing = all_extracted_reqs - master_reqs
    
    if not missing:
        print(f"Success: All {len(all_extracted_reqs)} extracted requirements are present in the master list ({master_file}).")
        return 0
    else:
        print(f"FAILED: The following {len(missing)} requirements are missing from the master list ({master_file}):")
        print("They must be either copied over fully or explicitly listed in the 'Removed or Modified Requirements' section.")
        for req in sorted(missing):
            print(f"  - [{req}]")
        return 1

def verify_phases(master_file, phases_dir):
    """Verifies that all requirements from the master requirements list exist in the phases directory."""
    print(f"Verifying {phases_dir} covers all requirements in {master_file}...")
    
    master_reqs = parse_requirements(master_file)
    phases_reqs = set()
    
    if not os.path.exists(phases_dir) or not os.path.isdir(phases_dir):
        print(f"Error: Directory not found or not a directory: {phases_dir}")
        return 1

    for filename in os.listdir(phases_dir):
        if filename.endswith(".md"):
            file_path = os.path.join(phases_dir, filename)
            phases_reqs.update(parse_requirements(file_path))
    
    missing = master_reqs - phases_reqs
    
    if not missing:
        print(f"Success: All {len(master_reqs)} requirements from {master_file} are mapped to a phase in {phases_dir}.")
        return 0
    else:
        print(f"FAILED: The following {len(missing)} requirements are NOT mapped to any phase in {phases_dir}:")
        for req in sorted(missing):
            print(f"  - [{req}]")
        return 1

def verify_tasks(phases_dir, tasks_dir):
    """Verifies that all requirements mapped in the phases directory exist in the tasks directory."""
    print(f"Verifying {tasks_dir} covers all requirements mapped in {phases_dir}...")
    
    phases_reqs = set()
    if not os.path.exists(phases_dir) or not os.path.isdir(phases_dir):
        print(f"Error: Directory not found or not a directory: {phases_dir}")
        return 1

    for filename in os.listdir(phases_dir):
        if filename.endswith(".md"):
            file_path = os.path.join(phases_dir, filename)
            phases_reqs.update(parse_requirements(file_path))
            
    tasks_reqs = set()
    if not os.path.exists(tasks_dir) or not os.path.isdir(tasks_dir):
        print(f"Error: Directory not found or not a directory: {tasks_dir}")
        return 1

    for filename in os.listdir(tasks_dir):
        if filename.endswith(".md"):
            file_path = os.path.join(tasks_dir, filename)
            tasks_reqs.update(parse_requirements(file_path))
        
    missing = phases_reqs - tasks_reqs
    
    if not missing:
        print(f"Success: All {len(phases_reqs)} requirements from {phases_dir} are mapped to a task in {tasks_dir}.")
        return 0
    else:
        print(f"FAILED: The following {len(missing)} requirements are NOT mapped to any task in {tasks_dir}:")
        for req in sorted(missing):
            print(f"  - [{req}]")
        return 1

def verify_ordered(master_file, ordered_file):
    """Verifies that all ACTIVE requirements from the master list exist in the ordered document."""
    print(f"Verifying {ordered_file} covers all active requirements in {master_file}...")
    
    with open(master_file, 'r', encoding='utf-8') as f:
        master_content = f.read()
        
    # Split to find active vs removed
    parts = re.split(r'(?i)#+\s*Removed or Modified Requirements', master_content)
    active_content = parts[0]
    
    active_reqs = set(REQ_REGEX.findall(active_content))
    ordered_reqs = parse_requirements(ordered_file)
    
    missing = active_reqs - ordered_reqs
    extra = ordered_reqs - active_reqs
    
    success = True
    if missing:
        print(f"FAILED: The following {len(missing)} active requirements are missing from {ordered_file}:")
        for req in sorted(missing):
            print(f"  - [{req}]")
        success = False
        
    if extra:
        print(f"FAILED: The following {len(extra)} requirements in {ordered_file} are invalid or were supposed to be removed:")
        for req in sorted(extra):
            print(f"  - [{req}]")
        success = False
        
    if success:
        print(f"Success: {ordered_file} contains exactly the {len(active_reqs)} active requirements from {master_file}.")
        return 0
    else:
        return 1

def verify_json_grouping(phase_file, json_file):
    """Verifies that the JSON grouping file perfectly matches the requirements in the phase file."""
    print(f"Verifying {json_file} groups all requirements in {phase_file}...")
    
    phase_reqs = parse_requirements(phase_file)
    
    if not os.path.exists(json_file):
        print(f"Error: JSON file not found: {json_file}")
        return 1
        
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            groupings = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format in {json_file}: {e}")
        return 1
        
    json_reqs = set()
    for _, req_list in groupings.items():
        if isinstance(req_list, list):
            json_reqs.update(req_list)
            
    missing = phase_reqs - json_reqs
    extra = json_reqs - phase_reqs
    
    success = True
    if missing:
        print(f"FAILED: The grouping JSON missed the following {len(missing)} requirements from {phase_file}:")
        for req in sorted(missing):
            print(f"  - [{req}]")
        success = False
        
    if extra:
        print(f"FAILED: The grouping JSON added the following {len(extra)} hallucinated requirements not in {phase_file}:")
        for req in sorted(extra):
            print(f"  - [{req}]")
        success = False
        
    if success:
        print(f"Success: The JSON mapping accurately groups exactly the {len(phase_reqs)} requirements from {phase_file}.")
        return 0
    else:
        return 1

def main():
    parser = argparse.ArgumentParser(description="Verify requirement extraction consistency.")
    parser.add_argument("--verify-doc", nargs=2, metavar=("SOURCE_FILE", "EXTRACTED_FILE"),
                        help="Verify that all requirements in SOURCE_FILE are present in EXTRACTED_FILE")
    parser.add_argument("--verify-master", action="store_true",
                        help="Verify that all requirements from the requirements/ directory are in the master requirements.md")
    parser.add_argument("--verify-phases", nargs=2, metavar=("MASTER_FILE", "PHASES_DIR"),
                        help="Verify that all requirements in MASTER_FILE are mapped within PHASES_DIR")
    parser.add_argument("--verify-ordered", nargs=2, metavar=("MASTER_FILE", "ORDERED_FILE"),
                        help="Verify that all ACTIVE requirements in MASTER_FILE are mapped within ORDERED_FILE")
    parser.add_argument("--verify-json", nargs=2, metavar=("PHASE_FILE", "JSON_FILE"),
                        help="Verify that the JSON_FILE sub-epic mappings perfectly match the PHASE_FILE requirements")
    parser.add_argument("--verify-tasks", nargs=2, metavar=("PHASES_DIR", "TASKS_DIR"),
                        help="Verify that all requirements in PHASES_DIR are mapped within TASKS_DIR")
    
    args = parser.parse_args()
    
    exit_code = 0
    if args.verify_doc:
        source_file, extracted_file = args.verify_doc
        exit_code = verify_doc(source_file, extracted_file)
        
    elif args.verify_master:
        # Default paths relative to project root
        master_file = "requirements.md"
        requirements_dir = "requirements"
        
        # Check if we are inside scripts/ folder and adjust paths if needed
        if os.path.basename(os.getcwd()) == "scripts":
            master_file = "../requirements.md"
            requirements_dir = "../requirements"
            
        exit_code = verify_master(master_file, requirements_dir)
        
    elif args.verify_phases:
        master_file, phases_dir = args.verify_phases
        exit_code = verify_phases(master_file, phases_dir)
        
    elif args.verify_ordered:
        master_file, ordered_file = args.verify_ordered
        exit_code = verify_ordered(master_file, ordered_file)
        
    elif args.verify_json:
        phase_file, json_file = args.verify_json
        exit_code = verify_json_grouping(phase_file, json_file)
        
    elif args.verify_tasks:
        phases_dir, tasks_dir = args.verify_tasks
        exit_code = verify_tasks(phases_dir, tasks_dir)
        
    else:
        parser.print_help()
        sys.exit(1)
        
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
