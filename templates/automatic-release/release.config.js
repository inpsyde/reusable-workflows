module.exports = {
  "branches": [
    "main",
    "main-built",
    "next",
    "next-built",
    {
      "name": "beta",
      "prerelease": true
    },
    {
      "name": "beta-built",
      "prerelease": true
    },
    {
      "name": "alpha",
      "prerelease": true
    },
    {
      "name": "alpha-built",
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
      "prepareCmd": "[ -f index.php ] || [ -f style.css ] && sed -i \"s/Version:.*/Version:     ${nextRelease.version.replace('-built', '')}/\" index.php style.css || true",
    }],
    "@semantic-release/github",
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package-lock.json", "package.json", "composer.json", "style.css", "index.php"],
      "message": "chore(release): \${nextRelease.version.replace('-built', '')} [skip ci]\n\n\${nextRelease.notes}"
    }]
  ],
  "preset": "angular",
  "tagFormat": '<%- version.replace("-built", "") %>'
}
