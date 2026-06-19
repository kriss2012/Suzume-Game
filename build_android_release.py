import os
import shutil
import subprocess
import time

def run_cmd(cmd_str, cwd=None):
    print(f"Running: {cmd_str}")
    result = subprocess.run(cmd_str, capture_output=True, text=True, cwd=cwd, shell=True)
    if result.returncode != 0:
        print(f"Error running cmd: {cmd_str}")
        print("STDERR:")
        print(result.stderr)
        print("STDOUT:")
        print(result.stdout)
        return False, result.stdout
    return True, result.stdout

def main():
    base_dir = r"d:\Suzume-Game"
    os.chdir(base_dir)

    # 1. Generate the signing key if it doesn't exist
    keystore_path = os.path.join("android", "app", "release.jks")
    if not os.path.exists(keystore_path):
        print("Generating release signing key...")
        cmd = (
            f'keytool -genkeypair -v '
            f'-keystore "{keystore_path}" '
            f'-keyalg RSA -keysize 2048 -validity 10000 '
            f'-alias suzume -storepass suzume123 -keypass suzume123 '
            f'-dname "CN=Suzume, O=SuzumeGame, C=US"'
        )
        success, out = run_cmd(cmd)
        if not success:
            print("Failed to generate keystore!")
            return
        print("Successfully generated release signing key.")
    else:
        print("Release signing key already exists.")

    # 2. Sync web assets to android/app/src/main/assets/
    print("Syncing web assets to Android project assets...")
    dest_assets = os.path.join("android", "app", "src", "main", "assets")
    
    # Clean dest_assets directories
    for sub in ["css", "js", "assets"]:
        p = os.path.join(dest_assets, sub)
        if os.path.exists(p):
            shutil.rmtree(p)
    
    # Copy files and folders
    shutil.copy2("Suzume Doors.html", os.path.join(dest_assets, "Suzume Doors.html"))
    shutil.copytree("css", os.path.join(dest_assets, "css"))
    shutil.copytree("js", os.path.join(dest_assets, "js"))
    shutil.copytree("assets", os.path.join(dest_assets, "assets"))
    print("Web assets synced successfully.")

    # 3. Clean and build the release APK
    print("Building release APK using Gradle...")
    android_dir = os.path.join(base_dir, "android")
    # Clean first
    run_cmd("gradle clean", cwd=android_dir)
    # Assemble release
    success, build_out = run_cmd("gradle assembleRelease", cwd=android_dir)
    if not success:
        print("Gradle build failed!")
        return
    print("Gradle build completed successfully.")

    # 4. Copy built APK to root
    built_apk = os.path.join(android_dir, "app", "build", "outputs", "apk", "release", "app-release.apk")
    target_apk = os.path.join(base_dir, "Suzume.apk")
    if os.path.exists(built_apk):
        shutil.copy2(built_apk, target_apk)
        print(f"Copied built APK to {target_apk}")
    else:
        print("Built APK not found at expected location!")
        return

    # 5. Git Commit Phase
    print("Starting Git Commit Phase...")

    # Identify modified files that should be committed first
    _, status_out = run_cmd("git status --porcelain")
    files_to_commit = []
    for line in status_out.splitlines():
        if line.strip():
            filepath = line[3:].strip()
            if filepath.startswith('"') and filepath.endswith('"'):
                filepath = filepath[1:-1]
            if "android/app/build/" in filepath or "android/build/" in filepath or ".gradle/" in filepath:
                continue
            if filepath == "commit_history.txt":
                continue
            if os.path.exists(filepath) and not os.path.isdir(filepath):
                files_to_commit.append(filepath)

    print(f"Source/config files to commit first: {files_to_commit}")
    for fp in files_to_commit:
        print(f"Committing source file: {fp}")
        run_cmd(f'git add "{fp}"')
        run_cmd(f'git commit -m "feat: update {os.path.basename(fp)}"')

    # Determine start commit number from commit_history.txt
    start_num = 0
    history_file = "commit_history.txt"
    if os.path.exists(history_file):
        with open(history_file, "r") as f:
            lines = [l.strip() for l in f.readlines() if l.strip()]
            for line in reversed(lines):
                if line.startswith("Commit #"):
                    try:
                        parts = line.split(" - ")[0]
                        start_num = int(parts.replace("Commit #", "").strip())
                        break
                    except ValueError:
                        continue

    print(f"Detected last commit number in history: {start_num}")
    
    # We want 500+ commits. Let's add exactly 540 commits, reaching a target of 1100 commits.
    target_commits = 1100
    if start_num >= target_commits:
        target_commits = start_num + 500
        
    print(f"Target total commits: {target_commits} (Creating {target_commits - start_num} commits)")

    commit_count = start_num
    while commit_count < target_commits:
        commit_count += 1
        print(f"[{commit_count}/{target_commits}] Creating contribution log commit...")
        with open(history_file, "a") as f:
            f.write(f"Commit #{commit_count} - {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        run_cmd(f'git add "{history_file}"')
        run_cmd(f'git commit -m "docs: update contribution log entry #{commit_count}"')

    # Push all commits in one batch
    print(f"Pushing all commits to remote GitHub repository...")
    success, push_out = run_cmd("git push origin main")
    if success:
        print("Successfully pushed all commits!")
    else:
        print("Push failed!")

if __name__ == "__main__":
    main()
