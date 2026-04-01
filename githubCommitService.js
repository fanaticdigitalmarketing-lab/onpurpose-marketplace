const { Octokit } = require("@octokit/rest");
const fs = require("fs");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const owner = "fanaticdigitalmarketing-lab";
const repo = "onpurpose-backend-clean";

async function commitFix(filePath, content, message) {
  try {
    const { data: file } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath
    });

    const updated = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message,
      content: Buffer.from(content).toString("base64"),
      sha: file.sha
    });

    console.log("✅ Fix committed:", message);
    return updated;

  } catch (err) {
    console.error("❌ GitHub commit failed:", err.message);
  }
}

module.exports = { commitFix };
