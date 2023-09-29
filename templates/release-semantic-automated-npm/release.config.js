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
      "prepareCmd": "test -f index.php && sed -i \"s/Version:.*/Version:     ${nextRelease.version}/\" index.php || true; test -f style.css && sed -i \"s/Version:.*/Version:     ${nextRelease.version}/\" style.css || true",
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
