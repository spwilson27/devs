import os
import sys
sys.path.insert(0, os.path.abspath('scripts'))
import run_workflow
import subprocess
import shutil

# Mock run_agent
def mock_run_agent(*args, **kwargs):
    print("MOCKED run_agent")
    return True
run_workflow.run_agent = mock_run_agent

# Run process_task
print("Running process_task mock...")
res = run_workflow.process_task(os.path.abspath('.'), "phase_1/01_project_infrastructure_monorepo_setup/01_setup_pnpm_monorepo", "echo 'presubmit passed'")
print(f"Result: {res}")
