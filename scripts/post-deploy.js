const request = require('request');
const utils = require('./utils');
const config = require('./config');
const log = require('./log');
module.exports = function postDeploy() {
  const app = utils.readAppJSON();
  log('app', app);
  const expUrl = `https://expo.io/@${config.expUsername}/${app.expo.name}?release-channel=${utils.getExpChannelName()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${expUrl}`;

  log('Exponent URL', expUrl);
  log('QR Code URL ', qrUrl);

  const body = `
  :shipit:

  Download the [Expo](https://expo.io/) app and scan this QR code to see what this PR looks like!

  ![QR Code](${qrUrl})

  ${expUrl}
  `;

  if (config.githubPullRequestId) {
    const issueUrl = `https://${config.githubUsername}:${config.githubToken}@api.github.com/repos/${config.githubOrg}/${config.githubRepo}/issues/${config.githubPullRequestId}/comments`;
    log('GitHub Issue URL', issueUrl);
    request.post(
      {
        url: issueUrl,
        headers: { 'User-Agent': 'ci' },
        body: JSON.stringify({ body })
      },
      (error, response) => {
        if (error) {
          console.error('Failed to post comment to GitHub, an error occurred', error);
        } else if (response.statusCode >= 400) {
          console.error('Failed to post comment to GitHub, request failed with', response);
        } else {
          console.log(`Posted message to GitHub PR #${config.githubPullRequestId}`);
        }
      }
    );
  }
};
