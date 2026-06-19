import os
import subprocess
import time

def run_git(args):
    result = subprocess.run(["git"] + args, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running git {' '.join(args)}:")
        print(result.stderr)
    return result.returncode == 0, result.stdout

def main():
    base_dir = r"d:\Suzume-Game"
    os.chdir(base_dir)

    # 1. Collect all source files to commit one-by-one
    files_to_commit = []
    
    # Check if there are modified files
    _, status_out = run_git(["status", "--porcelain"])
    for line in status_out.splitlines():
        if line.strip():
            filepath = line[3:].strip()
            if filepath.startswith('"') and filepath.endswith('"'):
                filepath = filepath[1:-1]
            if os.path.exists(filepath) and not os.path.isdir(filepath):
                files_to_commit.append(filepath)

    # Walk through the android folder
    for root, dirs, files in os.walk('android'):
        if '.gradle' in root or 'build' in root:
            continue
        for f in files:
            path = os.path.join(root, f)
            if path not in files_to_commit:
                files_to_commit.append(path)

    # Add other untracked files
    for root_file in ['Suzume Doors.exe', 'Suzume.apk', 'launcher.py', 'suzume.spec', 'package.json']:
        if os.path.exists(root_file) and root_file not in files_to_commit:
            files_to_commit.append(root_file)

    print(f"Total source files to commit: {len(files_to_commit)}")

    commit_count = 0
    target_commits = 560

    # 2. Commit each source file one by one
    for filepath in files_to_commit:
        if commit_count >= target_commits:
            break
        print(f"[{commit_count + 1}/{target_commits}] Adding & committing: {filepath}")
        run_git(["add", filepath])
        run_git(["commit", "-m", f"feat: Add/Update {os.path.basename(filepath)}"])
        commit_count += 1

    # 3. Create synthetic commits on commit_history.txt to reach exactly target_commits
    history_file = "commit_history.txt"
    while commit_count < target_commits:
        commit_count += 1
        print(f"[{commit_count}/{target_commits}] Creating contribution log commit...")
        with open(history_file, "a") as f:
            f.write(f"Commit #{commit_count} - {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        run_git(["add", history_file])
        run_git(["commit", "-m", f"docs: update contribution log entry #{commit_count}"])

    # 4. Push all commits in one batch
    print("Pushing all 560 commits to remote GitHub repository...")
    success, push_out = run_git(["push", "origin", "main"])
    if success:
        print("Successfully pushed all commits!")
        print(push_out)
    else:
        print("Push failed!")

if __name__ == "__main__":
    main()
