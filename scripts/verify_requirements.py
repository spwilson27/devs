import argparse
import os
import re
import sys

# Regex to match requirements like [REQ-123], [TAS-001], [REQ-SEC-001]
REQ_REGEX = re.compile(r"\[([A-Z][A-Z0-9]*-[A-Z0-9\-]+)\]")

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

def main():
    parser = argparse.ArgumentParser(description="Verify requirement extraction consistency.")
    parser.add_argument("--verify-doc", nargs=2, metavar=("SOURCE_FILE", "EXTRACTED_FILE"),
                        help="Verify that all requirements in SOURCE_FILE are present in EXTRACTED_FILE")
    parser.add_argument("--verify-master", action="store_true",
                        help="Verify that all requirements from the requirements/ directory are in the master requirements.md")
    
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
        
    else:
        parser.print_help()
        sys.exit(1)
        
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
