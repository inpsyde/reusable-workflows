module.exports = {
  "branches": ££BRANCHES££,
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", {
      "tarballDir": "release",
      "npmPublish": false
    }],
    ["@google/semantic-release-replace-plugin", {
      "replacements": [
        {
          "files": ["££MAIN_FILENAME££"],
          "from": "Version:\(.*\)",
          "to": "Version:     \${nextRelease.version}",
          "results": [
            {
              "file": "££MAIN_FILENAME££",
              "hasChanged": true,
              "numMatches": 1,
              "numReplacements": 1
            }
          ],
          "countMatches": true
        }
      ]
    }],
    "@semantic-release/github",
    ["@semantic-release/git", {
      "assets": ££FILES_TO_COMMIT££,
      "message": "chore(release): \${nextRelease.version} [skip ci]\n\n\${nextRelease.notes}"
    }]
  ],
  "preset": "angular",
  "tagFormat": "${version}"
}
