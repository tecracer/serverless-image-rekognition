import json
import logging
import uuid
import os
import base64
import boto3


def lambda_handler(event, context):
    logger = logging.getLogger()
    eventBody = json.loads(event['body'])
    encodedContent = eventBody['encoded_image']

    try:
        s3InputBucket = os.environ['S3BucketInput']
    except:
        logger.error('No Enviroment Setup!')
        exit()

    upload_image(encodedContent, s3InputBucket)

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Post Images Function"
        }),
        "headers": {
            'Access-Control-Allow-Origin': 'https://awsusergroup.wien',
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
    }


def upload_image(encoded_image, bucket):
    decoded_image = base64.b64decode(encoded_image)
    s3Client = boto3.client('s3')

    fileuuid = str(uuid.uuid4())

    filekey = f'{fileuuid}.jpg'

    response = s3Client.put_object(
        ACL='bucket-owner-full-control',
        Body=decoded_image,
        Bucket=bucket,
        Key=filekey,
        ServerSideEncryption='AES256',
        StorageClass='STANDARD'
    )

    return response
