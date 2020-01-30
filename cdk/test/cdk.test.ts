import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import Cdk = require('../lib/staticwebsite-stack');

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Cdk.StaticWebsiteStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(matchTemplate({
    "Resources": {}
  }, MatchStyle.EXACT))
});
