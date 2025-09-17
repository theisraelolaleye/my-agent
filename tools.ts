import { tool } from "ai";
import { simpleGit } from "simple-git";
import { z } from "zod";



const fileChange = z.object({
  rootDir: z.string().min(1).describe("The root directory"),
});

type FileChange = z.infer<typeof fileChange>;

const excludeFiles = ["dist", "bun.lock"];

async function getFileChangesInDirectory({ rootDir }: FileChange) {
  const git = simpleGit(rootDir);
  const summary = await git.diffSummary();
  const diffs: { file: string; diff: string }[] = [];

  for (const file of summary.files) {
    if (excludeFiles.includes(file.file)) continue;
    const diff = await git.diff(["--", file.file]);
    diffs.push({ file: file.file, diff });
  }

  return diffs;
}

export const getFileChangesInDirectoryTool = tool({
  description: "Gets the code changes made in given directory",
  inputSchema: fileChange,
  execute: getFileChangesInDirectory,
});

/**
 * Generate a commit message based on a summary and details.
 */
export function generateCommitMessage(summary: string, details?: string): string {
  let message = summary.trim();
  if (details && details.trim()) {
    message += "\n\n" + details.trim();
  }
  return message;
}


/**
 * Write a code review to a markdown file.
 * @param review The review content
 * @param filePath The markdown file path
 */
export async function writeReviewToMarkdown(review: string, filePath: string = "code-review.md") {
  await Bun.write(filePath, `# Code Review\n\n${review}`);
}
