module.exports = {
  "branches": [
    "main",
    "next",
    {
      "name": "beta",
      "prerelease": true
    },
    {
      "name": "alpha",
      "prerelease": true
    }
  ],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", {
      "tarballDir": "release",
      "npmPublish": false
    }],
    ["@semantic-release/exec", {
      "prepareCmd": "sed -i \"s/Version:.*/Version:     ${nextRelease.version}/\" index.php style.css 2> /dev/null",
    }],
    "@semantic-release/github",
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package-lock.json", "package.json", "composer.json", "style.css", "index.php"],
      "message": "chore(release): \${nextRelease.version} [skip ci]\n\n\${nextRelease.notes}"
    }]
  ],
  "preset": "angular",
  "tagFormat": "${version}"
}
