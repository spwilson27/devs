import os
import re

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    req_file = os.path.join(root_dir, 'requirements.md')
    phases_dir = os.path.join(root_dir, 'phases')
    
    if not os.path.exists(phases_dir):
        os.makedirs(phases_dir)
        
    with open(req_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split phases
    phases = re.split(r'\n## Phase (\d+): (.*?)\n', content)
    
    req_regex = re.compile(r"\[([A-Z][A-Z0-9]*-[A-Z0-9\-]+)\]")
    
    for i in range(1, len(phases), 3):
        phase_num = phases[i]
        phase_title = phases[i+1].strip()
        phase_content = phases[i+2]
        
        # Split epics
        epics = re.split(r'\n### \*\*\[(.*?)\]\*\* (.*?)\n', phase_content)
        
        md_lines = []
        md_lines.append(f"# Phase {phase_num}: {phase_title}\n")
        md_lines.append("## Objective")
        md_lines.append(f"Implement all requirements and definitions for {phase_title}.\n")
        
        md_lines.append("## Requirements Covered")
        
        deliverables = []
        
        for j in range(1, len(epics), 3):
            epic_id = epics[j]
            epic_title = epics[j+1].strip()
            epic_content = epics[j+2]
            
            # Find all requirements in this epic
            reqs = req_regex.findall(f"[{epic_id}] " + epic_content)
            
            # Write requirements
            for r in reqs:
                md_lines.append(f"- [{r}]: {epic_title}")
                
            # Parse descriptions
            desc_match = re.search(r'- \*\*Description:\*\* (.*?)\n', epic_content)
            desc = desc_match.group(1).split('[')[0].strip() if desc_match else "Implementation details"
            
            deliverables.append((epic_title, desc))
            
        md_lines.append("\n## Detailed Deliverables & Components")
        for title, desc in deliverables:
            md_lines.append(f"### {title}")
            md_lines.append(f"- {desc}")
            md_lines.append(f"- Expected behavior: {title} is fully integrated and functioning.\n")
            
        md_lines.append("## Technical Considerations")
        md_lines.append("- Ensure rigorous unit and integration testing.")
        md_lines.append("- Refer to TAS and Security documentation for cross-phase limitations.")
        
        out_path = os.path.join(phases_dir, f"phase_{phase_num}.md")
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(md_lines) + "\n")
            
    print(f"Generated {len(phases)//3} phases in {phases_dir}.")

if __name__ == '__main__':
    main()
