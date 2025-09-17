import { stepCountIs, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "./prompts";
import { getFileChangesInDirectoryTool, writeReviewToMarkdown } from "./tools";


const codeReviewAgent = async (prompt: string) => {
  const result = streamText({
    model: google("models/gemini-2.5-flash"),
    prompt,
    system: SYSTEM_PROMPT,
    tools: {
      getFileChangesInDirectoryTool: getFileChangesInDirectoryTool,
    },
    stopWhen: stepCountIs(10),
  });

  let reviewOutput = "";
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
    reviewOutput += chunk;
  }
  await writeReviewToMarkdown(reviewOutput);
};

// Specify which directory the code review agent should review changes in your prompt
await codeReviewAgent(
  "Review the code changes in '../my-agent' directory, make your reviews and suggestions file by file",
);