#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { StaticWebsiteStack } from '../lib/staticwebsite-stack';

const app = new cdk.App();
new StaticWebsiteStack(app, 'CdkStack', {
  env: {
    region: app.node.tryGetContext('region')
  },
  customCloudfrontDomain: app.node.tryGetContext('cloudfrontdomain'),
  customCloudfrontCertificate: app.node.tryGetContext('customcloudfrontcertificate')
});
