#!/usr/bin/env python3
import os
import subprocess
import sys
import shutil
import json
import re
from typing import List, Dict, Any, Optional

DOCS = [
    # Research
    {"id": "market_research", "type": "research", "name": "Market Research Report", "desc": "Analyze the problem space and create a market research report.", "prompt_file": "research_market.md"},
    {"id": "competitive_analysis", "type": "research", "name": "Competitive Analysis Report", "desc": "Analyze the competition and create a competitive analysis report.", "prompt_file": "research_competitive_analysis.md"},
    {"id": "tech_landscape", "type": "research", "name": "Technology Landscape Report", "desc": "Analyze the available technologies and create a technology landscape report.", "prompt_file": "research_technical_analysis.md"},
    {"id": "user_research", "type": "research", "name": "User Research Report", "desc": "Analyze potential users and create a user research report.", "prompt_file": "research_user_research.md"},
    
    # Specs
    {"id": "1_prd", "type": "spec", "name": "PRD (Product Requirements Document)", "desc": "Create a Product Requirements Document (PRD).", "prompt_file": "spec_prd.md"},
    {"id": "2_tas", "type": "spec", "name": "TAS (Technical Architecture Specification)", "desc": "Create a Technical Architecture Specification (TAS).", "prompt_file": "spec_tas.md"},
    {"id": "3_mcp_design", "type": "spec", "name": "MCP and AI Development Design", "desc": "Create an MCP and AI Development Design document.", "prompt_file": "spec_mcp_design.md"},
    {"id": "4_user_features", "type": "spec", "name": "User Features", "desc": "Create a User Features document describing user journeys and expectations.", "prompt_file": "spec_user_features.md"},
    {"id": "5_security_design", "type": "spec", "name": "Security Design", "desc": "Create a Security Design document detailing risks and security architectures.", "prompt_file": "spec_security_design.md"},
    {"id": "6_ui_ux_architecture", "type": "spec", "name": "UI/UX Architecture", "desc": "Create a UI/UX Architecture document.", "prompt_file": "spec_ui_ux_architecture.md"},
    {"id": "7_ui_ux_design", "type": "spec", "name": "UI/UX Design", "desc": "Create a UI/UX Design document.", "prompt_file": "spec_ui_ux_design.md"},
    {"id": "8_risks_mitigation", "type": "spec", "name": "Risks and Mitigation", "desc": "Create a Risks and Mitigation document.", "prompt_file": "spec_risks_mitigation.md"},
    {"id": "9_project_roadmap", "type": "spec", "name": "Project Roadmap", "desc": "Create a Project Roadmap.", "prompt_file": "spec_project_roadmap.md"}
]

class GeminiRunner:
    """Wraps the actual subprocess call for testability"""
    def run(self, cwd: str, full_prompt: str, ignore_content: str, ignore_file: str) -> subprocess.CompletedProcess:
        with open(ignore_file, "w", encoding="utf-8") as f:
            f.write(ignore_content)
        return subprocess.run(
            ["gemini", "-y"],
            input=full_prompt,
            cwd=cwd,
            capture_output=True,
            text=True
        )

class ProjectContext:
    def __init__(self, root_dir: str, runner: Optional[GeminiRunner] = None):
        self.root_dir = root_dir
        self.sandbox_dir = os.path.join(root_dir, ".sandbox")
        self.specs_dir = os.path.join(root_dir, "specs")
        self.research_dir = os.path.join(root_dir, "research")
        self.prompts_dir = os.path.join(root_dir, "scripts", "prompts")
        self.state_file = os.path.join(root_dir, "scripts", ".gen_state.json")
        self.ignore_file = os.path.join(root_dir, ".geminiignore")
        self.backup_ignore = os.path.join(root_dir, ".geminiignore.bak")
        self.desc_file = os.path.join(root_dir, "input", "description.md")
        
        self.requirements_dir = os.path.join(root_dir, "requirements")
        
        self.runner = runner or GeminiRunner()
        
        # Ensures directories exist
        os.makedirs(self.sandbox_dir, exist_ok=True)
        os.makedirs(self.specs_dir, exist_ok=True)
        os.makedirs(self.research_dir, exist_ok=True)
        os.makedirs(self.requirements_dir, exist_ok=True)
        
        self.has_existing_ignore = os.path.exists(self.ignore_file)
        self.state = self._load_state()
        self.description_ctx = self._load_description()

    def _load_state(self) -> Dict[str, Any]:
        state = {
            "generated": [], 
            "fleshed_out": [], 
            "fleshed_out_headers": {},
            "extracted_requirements": [],
            "final_review_completed": False,
            "requirements_extracted": False,
            "requirements_merged": False,
            "requirements_ordered": False,
            "phases_completed": False,
            "tasks_completed": False,
            "tdd_completed": False
        }
        if os.path.exists(self.state_file):
            with open(self.state_file, "r") as f:
                try:
                    loaded = json.load(f)
                    state.update(loaded)
                except json.JSONDecodeError:
                    pass
        return state

    def save_state(self):
        with open(self.state_file, "w") as f:
            json.dump(self.state, f, indent=4)

    def _load_description(self) -> str:
        if not os.path.exists(self.desc_file):
            print(f"Error: {self.desc_file} not found.")
            sys.exit(1)
        with open(self.desc_file, "r", encoding="utf-8") as f:
            return f.read()

    def load_prompt(self, filename: str) -> str:
        prompt_path = os.path.join(self.prompts_dir, filename)
        if not os.path.exists(prompt_path):
            print(f"Error: Prompt template {prompt_path} not found.")
            sys.exit(1)
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read().strip()

    def format_prompt(self, tmpl: str, **kwargs) -> str:
        result = tmpl
        for k, v in kwargs.items():
            result = result.replace(f"{{{k}}}", str(v))
        return result

    def backup_ignore_file(self):
        if self.has_existing_ignore:
            shutil.copy(self.ignore_file, self.backup_ignore)

    def restore_ignore_file(self):
        if self.has_existing_ignore:
            if os.path.exists(self.backup_ignore):
                shutil.move(self.backup_ignore, self.ignore_file)
        elif os.path.exists(self.ignore_file):
            os.remove(self.ignore_file)

    def get_document_path(self, doc: dict) -> str:
        out_folder = "specs" if doc["type"] == "spec" else "research"
        return os.path.join(self.root_dir, out_folder, f"{doc['id']}.md")

    def get_target_path(self, doc: dict) -> str:
        out_folder = "specs" if doc["type"] == "spec" else "research"
        return f"{out_folder}/{doc['id']}.md"

    def get_accumulated_context(self, current_doc: dict) -> str:
        accumulated_context = ""
        for prev_doc in DOCS:
            if prev_doc == current_doc:
                break
            prev_file = self.get_document_path(prev_doc)
            if os.path.exists(prev_file):
                with open(prev_file, "r", encoding="utf-8") as f:
                    content = f.read()
                    accumulated_context += f'\n\n<previous_document name="{prev_doc["name"]}">\n{content}\n</previous_document>\n'
        return accumulated_context

    def get_workspace_snapshot(self) -> Dict[str, float]:
        snapshot = {}
        for root, dirs, files in os.walk(self.root_dir):
            if ".git" in root or ".sandbox" in root:
                continue
            for file in files:
                filepath = os.path.join(root, file)
                try:
                    snapshot[filepath] = os.path.getmtime(filepath)
                except OSError:
                    pass
        return snapshot

    def verify_changes(self, before: Dict[str, float], allowed_files: List[str]):
        after = self.get_workspace_snapshot()
        allowed_set = set(os.path.abspath(f) for f in allowed_files)
        
        # Check for new or modified files
        for path in after:
            if path not in before or after[path] > before.get(path, 0):
                abs_path = os.path.abspath(path)
                if abs_path not in allowed_set:
                    # Allow internal script files
                    if abs_path in [os.path.abspath(self.state_file), 
                                  os.path.abspath(self.ignore_file), 
                                  os.path.abspath(self.backup_ignore)]:
                        continue
                    print(f"\n[SANDBOX VIOLATION] Unauthorized change detected: {path}")
                    print(f"The agent was only allowed to modify: {allowed_files}")
                    sys.exit(1)
        
        # Check for deleted files
        for path in before:
            if path not in after:
                abs_path = os.path.abspath(path)
                if abs_path not in allowed_set:
                    print(f"\n[SANDBOX VIOLATION] Unauthorized deletion detected: {path}")
                    sys.exit(1)

    def strip_thinking_tags(self, filepath: str):
        if not os.path.exists(filepath):
            return
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        new_content = re.sub(r'<thinking>.*?</thinking>\s*', '', content, flags=re.DOTALL)
        
        if new_content != content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)

    def run_gemini(self, full_prompt: str, ignore_content: str, allowed_files: Optional[List[str]] = None) -> subprocess.CompletedProcess:
        before = self.get_workspace_snapshot()
        result = self.runner.run(self.root_dir, full_prompt, ignore_content, self.ignore_file)
        if allowed_files is not None:
            self.verify_changes(before, allowed_files)
            for f in allowed_files:
                self.strip_thinking_tags(os.path.abspath(f))
        return result

    def parse_markdown_headers(self, filepath: str) -> List[str]:
        headers = []
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                for line in f:
                    # Only want to capture h1 and h2
                    if re.match(r'^#{1,2}\s+', line):
                        headers.append(line.strip())
        return headers

class BasePhase:
    def execute(self, ctx: ProjectContext):
        raise NotImplementedError()

class Phase1GenerateDoc(BasePhase):
    def __init__(self, doc: dict):
        self.doc = doc

    def execute(self, ctx: ProjectContext):
        if self.doc["id"] in ctx.state.get("generated", []):
            print(f"Skipping initial generation for {self.doc['name']} (already generated).")
            return
            
        target_path = ctx.get_target_path(self.doc)
        expected_file = ctx.get_document_path(self.doc)
        out_folder = "specs" if self.doc["type"] == "spec" else "research"
        
        accumulated_context = ctx.get_accumulated_context(self.doc)
        base_prompt_template = ctx.load_prompt(self.doc["prompt_file"])
        
        base_prompt = base_prompt_template.replace("{target_path}", target_path)
        base_prompt = base_prompt.replace("{document_name}", self.doc["name"])
        base_prompt = base_prompt.replace("{document_description}", self.doc["desc"])
        
        full_prompt = (
            f"{base_prompt}\n\n"
            f"# CONTEXT (Project Description)\n"
            f"{ctx.description_ctx}\n\n"
            f"# PREVIOUS PROJECT CONTEXT\n"
            f"{accumulated_context}\n\n"
            f"# FINAL INSTRUCTIONS\n"
            f"1. Read the Context provided above carefully.\n"
            f"2. Execute the Task as described in the Persona section.\n"
            f"3. Ensure the document is written to '{target_path}'.\n"
            f"4. You MUST end your turn immediately after writing the file.\n"
        )
        
        ignore_content = f"/*\n!/.sandbox/\n!/{out_folder}/\n"
        print(f"\n=> [Phase 1: Generate] {self.doc['name']} into {out_folder}/{self.doc['id']}.md ...")
        
        allowed_files = [expected_file]
        result = ctx.run_gemini(full_prompt, ignore_content, allowed_files=allowed_files)
        
        if result.returncode != 0 or not os.path.exists(expected_file):
            print(f"\n[!] Error generating {self.doc['name']}.")
            print(result.stdout)
            print(result.stderr)
            sys.exit(1)
            
        ctx.state.setdefault("generated", []).append(self.doc["id"])
        ctx.save_state()

class Phase2FleshOutDoc(BasePhase):
    def __init__(self, doc: dict):
        self.doc = doc

    def execute(self, ctx: ProjectContext):
        if self.doc["type"] != "spec":
            return
            
        if self.doc["id"] in ctx.state.get("fleshed_out", []):
            print(f"Skipping fleshing out for {self.doc['name']} (already fleshed out).")
            return
            
        expected_file = ctx.get_document_path(self.doc)
        target_path = ctx.get_target_path(self.doc)
        out_folder = "specs"
        accumulated_context = ctx.get_accumulated_context(self.doc)
        
        headers = ctx.parse_markdown_headers(expected_file)
        flesh_prompt_tmpl = ctx.load_prompt("flesh_out.md")
        
        ctx.state.setdefault("fleshed_out_headers", {})
        ctx.state["fleshed_out_headers"].setdefault(self.doc["id"], [])
        
        for header in headers:
            header_clean = header.strip()
            if header_clean == "":
                continue
                
            if header_clean in ctx.state["fleshed_out_headers"][self.doc["id"]]:
                print(f"   -> [Phase 2: Flesh Out Section] Skipping '{header_clean}' in {self.doc['name']} (already fleshed out).")
                continue
                
            print(f"   -> [Phase 2: Flesh Out Section] {header_clean} in {self.doc['name']} ...")
            flesh_prompt = ctx.format_prompt(flesh_prompt_tmpl,
                header=header_clean,
                target_path=target_path,
                description_ctx=ctx.description_ctx,
                accumulated_context=accumulated_context
            )
            
            ignore_content = f"/*\n!/.sandbox/\n!/{out_folder}/\n"
            allowed_files = [expected_file]
            result = ctx.run_gemini(flesh_prompt, ignore_content, allowed_files=allowed_files)
            
            if result.returncode != 0:
                print(f"\n[!] Error fleshing out section {header_clean} in {self.doc['name']}.")
                print(result.stdout)
                print(result.stderr)
                sys.exit(1)
            
            ctx.state["fleshed_out_headers"][self.doc["id"]].append(header_clean)
            ctx.save_state()
        
        ctx.state.setdefault("fleshed_out", []).append(self.doc["id"])
        ctx.save_state()

class Phase3FinalReview(BasePhase):
    def execute(self, ctx: ProjectContext):
        if ctx.state.get("final_review_completed", False):
            print("Final alignment review already completed.")
            return
            
        print("\n=> [Phase 3: Final Alignment Review] Reviewing all documents for consistency...")
        final_prompt_tmpl = ctx.load_prompt("final_review.md")
        final_prompt = ctx.format_prompt(final_prompt_tmpl, description_ctx=ctx.description_ctx)
        ignore_content = "/*\n!/.sandbox/\n!/specs/\n!/research/\n"
        
        # Final review can modify all existing specs and research files
        allowed_files = [ctx.get_document_path(d) for d in DOCS]
        result = ctx.run_gemini(final_prompt, ignore_content, allowed_files=allowed_files)
        
        if result.returncode != 0:
            print("\n[!] Error during final alignment review.")
            print(result.stdout)
            print(result.stderr)
            sys.exit(1)
            
        ctx.state["final_review_completed"] = True
        ctx.save_state()
        print("Successfully completed the Final Alignment Review.")

class Phase4AExtractRequirements(BasePhase):
    def execute(self, ctx: ProjectContext):
        if ctx.state.get("requirements_extracted", False):
            print("Requirements extraction already completed.")
            return
            
        print("\n=> [Phase 4A: Extract Requirements] Extracting requirements from each document...")
        prompt_tmpl = ctx.load_prompt("extract_requirements.md")
        
        for doc in DOCS:
            if doc["id"] in ctx.state.get("extracted_requirements", []):
                continue
                
            doc_path = ctx.get_document_path(doc)
            if not os.path.exists(doc_path):
                continue
                
            target_path = f"requirements/{doc['id']}.md"
            expected_file = os.path.join(ctx.requirements_dir, f"{doc['id']}.md")
            
            print(f"   -> Extracting from {doc['name']}...")
            prompt = ctx.format_prompt(prompt_tmpl,
                description_ctx=ctx.description_ctx,
                document_name=doc['name'],
                document_path=f"{'specs' if doc['type'] == 'spec' else 'research'}/{doc['id']}.md",
                target_path=target_path
            )
            
            ignore_content = "/*\n!/.sandbox/\n!/requirements/\n!/scripts/verify_requirements.py\n"
            allowed_files = [expected_file]
            result = ctx.run_gemini(prompt, ignore_content, allowed_files=allowed_files)
            
            if result.returncode != 0:
                print(f"\n[!] Error extracting requirements from {doc['name']}.")
                sys.exit(1)
            
            print(f"   -> Verifying extraction for {doc['name']}...")
            verify_res = subprocess.run(
                [sys.executable, "scripts/verify_requirements.py", "--verify-doc", doc_path, expected_file],
                capture_output=True, text=True, cwd=ctx.root_dir
            )
            if verify_res.returncode != 0:
                print(f"\n[!] Automated verification failed for {doc['name']}:")
                print(verify_res.stdout)
                sys.exit(1)
            
            ctx.state.setdefault("extracted_requirements", []).append(doc["id"])
            ctx.save_state()
            
        ctx.state["requirements_extracted"] = True
        ctx.save_state()

class Phase4BMergeRequirements(BasePhase):
    def execute(self, ctx: ProjectContext):
        if ctx.state.get("requirements_merged", False):
            print("Requirements merging already completed.")
            return
            
        print("\n=> [Phase 4B: Merge and Resolve Conflicts] Consolidating all requirements...")
        prompt_tmpl = ctx.load_prompt("merge_requirements.md")
        prompt = ctx.format_prompt(prompt_tmpl, description_ctx=ctx.description_ctx)
        
        # This phase can modify requirements.md AND any source doc in specs/ or research/
        ignore_content = "/*\n!/.sandbox/\n!/requirements/\n!/requirements.md\n!/specs/\n!/research/\n!/scripts/verify_requirements.py\n"
        
        # Allowed files include the final requirements.md and ALL source docs for potential conflict resolution
        allowed_files = [os.path.join(ctx.root_dir, "requirements.md")]
        allowed_files.extend([ctx.get_document_path(d) for d in DOCS])
        
        result = ctx.run_gemini(prompt, ignore_content, allowed_files=allowed_files)
        
        if result.returncode != 0:
            print("\n[!] Error merging requirements.")
            sys.exit(1)
            
        print("\n   -> Verifying merged requirements.md...")
        verify_res = subprocess.run(
            [sys.executable, "scripts/verify_requirements.py", "--verify-master"],
            capture_output=True, text=True, cwd=ctx.root_dir
        )
        if verify_res.returncode != 0:
            print("\n[!] Automated verification failed after merging requirements:")
            print(verify_res.stdout)
            sys.exit(1)
            
        ctx.state["requirements_merged"] = True
        ctx.save_state()

class Phase4COrderRequirements(BasePhase):
    def execute(self, ctx: ProjectContext):
        if ctx.state.get("requirements_ordered", False):
            print("Requirements ordering already completed.")
            return
            
        print("\n=> [Phase 4C: Order Requirements] Sequencing requirements and capturing dependencies...")
        prompt_tmpl = ctx.load_prompt("order_requirements.md")
        prompt = ctx.format_prompt(prompt_tmpl, description_ctx=ctx.description_ctx)
        
        ignore_content = "/*\n!/.sandbox/\n!/requirements.md\n"
        allowed_files = [os.path.join(ctx.root_dir, "requirements.md")]
        
        result = ctx.run_gemini(prompt, ignore_content, allowed_files=allowed_files)
        
        if result.returncode != 0:
            print("\n[!] Error ordering requirements.")
            sys.exit(1)
            
        ctx.state["requirements_ordered"] = True
        ctx.save_state()

class Phase5GenerateEpics(BasePhase):
    def execute(self, ctx: ProjectContext):
        if ctx.state.get("phases_completed", False):
            print("Phase generation already completed.")
            return
            
        print("\n=> [Phase 5: Generate Epics] Generating phases.md...")
        phases_prompt_tmpl = ctx.load_prompt("phases.md")
        phases_prompt = ctx.format_prompt(phases_prompt_tmpl, description_ctx=ctx.description_ctx)
        ignore_content = "/*\n!/.sandbox/\n!/requirements.md\n!/phases.md\n"
        
        allowed_files = [os.path.join(ctx.root_dir, "phases.md")]
        result = ctx.run_gemini(phases_prompt, ignore_content, allowed_files=allowed_files)
        
        if result.returncode != 0:
            print("\n[!] Error generating phases.")
            print(result.stdout)
            print(result.stderr)
            sys.exit(1)
            
        ctx.state["phases_completed"] = True
        ctx.save_state()
        print("Successfully generated project phases.")

class Phase6BreakDownTasks(BasePhase):
    def execute(self, ctx: ProjectContext):
        if ctx.state.get("tasks_completed", False):
            print("Task generation already completed.")
            return
            
        print("\n=> [Phase 6: Break Down Tasks] Generating tasks.md...")
        tasks_prompt_tmpl = ctx.load_prompt("tasks.md")
        tasks_prompt = ctx.format_prompt(tasks_prompt_tmpl, description_ctx=ctx.description_ctx)
        ignore_content = "/*\n!/.sandbox/\n!/requirements.md\n!/phases.md\n!/tasks.md\n"
        
        allowed_files = [os.path.join(ctx.root_dir, "tasks.md")]
        result = ctx.run_gemini(tasks_prompt, ignore_content, allowed_files=allowed_files)
        
        if result.returncode != 0:
            print("\n[!] Error generating tasks.")
            print(result.stdout)
            print(result.stderr)
            sys.exit(1)
            
        ctx.state["tasks_completed"] = True
        ctx.save_state()
        print("Successfully generated atomic tasks.")

class Phase7TDDLoop(BasePhase):
    def execute(self, ctx: ProjectContext):
        if ctx.state.get("tdd_completed", False):
            return
            
        print("\n=> [Phase 7: TDD Implementation Loop] Launching implementation agents...")
        print("   (Press Ctrl+C to interrupt the loop at any time)")
        while not ctx.state.get("tdd_completed", False):
            tasks_file = os.path.join(ctx.root_dir, "tasks.md")
            if os.path.exists(tasks_file):
                with open(tasks_file, "r", encoding="utf-8") as f:
                    content = f.read()
                    if "- [ ]" not in content and "* [ ]" not in content:
                        print("\n=> All tasks completed! TDD loop finished.")
                        ctx.state["tdd_completed"] = True
                        ctx.save_state()
                        break
            
            tdd_prompt_tmpl = ctx.load_prompt("tdd_loop.md")
            tdd_prompt = ctx.format_prompt(tdd_prompt_tmpl, description_ctx=ctx.description_ctx)
            ignore_content = ".sandbox/\n"
            
            print(f"\n   -> Invoking Developer Agent for the next task...")
            # TDD loop is more permissive but should still be constrained
            # For now, we'll allow it to modify anything but it should really be limited to the current task scope
            # To properly sandbox this, we'd need to know which files the current task is allowed to touch.
            result = ctx.run_gemini(tdd_prompt, ignore_content)
            
            if result.returncode != 0:
                print("\n[!] Error in TDD loop execution.")
                print(result.stdout)
                print(result.stderr)
                print("\nReview the output. You may retry by running the script again.")
                sys.exit(1)
                
            print("   -> Agent completed a cycle. Checking status...")

class Orchestrator:
    def __init__(self, ctx: ProjectContext):
        self.ctx = ctx

    def run(self):
        print("Beginning multi-phase document generation and lifecycle orchestration...")
        self.ctx.backup_ignore_file()
        try:
            # Phase 1 and 2 for each document
            for doc in DOCS:
                Phase1GenerateDoc(doc).execute(self.ctx)
                Phase2FleshOutDoc(doc).execute(self.ctx)

            Phase3FinalReview().execute(self.ctx)
            Phase4AExtractRequirements().execute(self.ctx)
            Phase4BMergeRequirements().execute(self.ctx)
            Phase4COrderRequirements().execute(self.ctx)
            Phase5GenerateEpics().execute(self.ctx)
            Phase6BreakDownTasks().execute(self.ctx)
            #Phase7TDDLoop().execute(self.ctx)
        finally:
            self.ctx.restore_ignore_file()
        print("\nProject generation orchestration complete.")

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ctx = ProjectContext(root_dir)
    orchestrator = Orchestrator(ctx)
    orchestrator.run()

if __name__ == "__main__":
    main()
