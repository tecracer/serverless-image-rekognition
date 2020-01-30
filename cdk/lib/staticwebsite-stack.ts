import * as cdk from '@aws-cdk/core';
import { Bucket, BlockPublicAccess, BucketAccessControl, BucketEncryption } from "@aws-cdk/aws-s3";
import { BucketDeployment, Source } from "@aws-cdk/aws-s3-deployment";
import { CloudFrontWebDistribution, OriginAccessIdentity, HttpVersion, PriceClass, ViewerProtocolPolicy } from "@aws-cdk/aws-cloudfront";
import { PolicyStatement, Effect, CanonicalUserPrincipal } from "@aws-cdk/aws-iam";
import { RemovalPolicy } from '@aws-cdk/core';
import { RecordSet, RecordType, RecordTarget, HostedZone } from "@aws-cdk/aws-route53";
import { CloudFrontTarget } from "@aws-cdk/aws-route53-targets";

export interface StaticWebsiteStackProps extends cdk.StackProps {
  customCloudfrontDomain: string,
  customCloudfrontHostedZone: string,
  customCloudfrontCertificate: string
}

export class StaticWebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: StaticWebsiteStackProps) {
    super(scope, id, props);

    const staticWebsiteBucket = new Bucket(this, 'StaticWebsiteBucket', {
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const staticWebsiteOai = new OriginAccessIdentity(this, 'StaticWebsiteOai', {
      comment: 'Identity to reach the StaticWebsiteBucket from CloudFront'
    });

    const staticWebsiteBucketPolicyStatement = new PolicyStatement({
      actions: ['s3:GetObject'],
      effect: Effect.ALLOW,
      resources: [`${staticWebsiteBucket.bucketArn}/*`],
      principals: [
        new CanonicalUserPrincipal(staticWebsiteOai.cloudFrontOriginAccessIdentityS3CanonicalUserId)
      ]
    });

    staticWebsiteBucket.addToResourcePolicy(staticWebsiteBucketPolicyStatement)

    const cloudfrontDistribution = new CloudFrontWebDistribution(this, 'StaticWebsiteCloudFront', {
      originConfigs: [
        {
          behaviors: [{
            isDefaultBehavior: true,
          }],
          s3OriginSource: {
            s3BucketSource: staticWebsiteBucket,
            originAccessIdentity: staticWebsiteOai
          }
        }
      ],
      defaultRootObject: 'index.html',
      httpVersion: HttpVersion.HTTP2,
      priceClass: PriceClass.PRICE_CLASS_100,
      viewerCertificate: {
        aliases: [props.customCloudfrontDomain],
        props: {
          acmCertificateArn: props.customCloudfrontCertificate,
          minimumProtocolVersion: 'TLSv1.2_2018',
          sslSupportMethod: 'sni-only'
        }
      },
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
    });



    new RecordSet(this, 'CloudFrontCustomDomainRecordsSet', {
      recordType: RecordType.A,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudfrontDistribution)),
      zone: HostedZone.fromLookup(this, 'HostedZoneLookup', {
        domainName: props.customCloudfrontDomain,
        privateZone: false
      }),
      recordName: props.customCloudfrontDomain
    })

    new BucketDeployment(this, 'StaticWebsiteDeployment', {
      destinationBucket: staticWebsiteBucket,
      sources: [
        Source.asset('assets')
      ],
      distribution: cloudfrontDistribution,
      retainOnDelete: false
    })
  }
}
