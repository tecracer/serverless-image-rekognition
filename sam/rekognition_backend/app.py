import os
import logging
import time
import boto3


def lambda_handler(event, context):
    logger = logging.getLogger()

    try:
        s3OutputBucket = os.environ['S3BucketOutput']
        dynamoTable = os.environ['DynamoTable']
    except:
        logger.error('No Enviroment Setup!')
        exit()

    s3Details = get_image_keys(event)

    response = rekognize_image(s3Details['objectKey'], s3Details['bucket'])

    identified_prefix = identify_prefix(response['Labels'])

    move_object_to_output(
        s3Details['objectKey'],
        s3Details['bucket'],
        s3OutputBucket,
        identified_prefix,
        dynamoTable
    )


def get_image_keys(s3Event):
    s3Record = s3Event['Records'][0]

    response = {
        'bucket': s3Record['s3']['bucket']['name'],
        'objectKey': s3Record['s3']['object']['key']
    }

    return response


def rekognize_image(objectKey, s3BucketName):
    rekogClient = boto3.client('rekognition', region_name='eu-central-1')

    response = rekogClient.detect_labels(
        Image={
            'S3Object': {
                'Bucket': s3BucketName,
                'Name': objectKey,
            },
        },
        MaxLabels=3
    )

    return response


def identify_prefix(labels):
    for label in labels:
        if 'Cat' in label['Name']:
            return 'cat'
        elif 'Dog' in label['Name']:
            return 'dog'
        elif 'Squirrel' in label['Name']:
            return 'squirrel'

    return 'other'


def move_object_to_output(objectKey, s3OriginBucket,  s3OutputBucket, identified_prefix, dynamoTable):
    s3client = boto3.client('s3')
    dynamoClient = boto3.client('dynamodb')

    response = s3client.copy_object(
        Bucket=s3OutputBucket,
        Key=f'{identified_prefix}/{objectKey}',
        CopySource={
            'Bucket': s3OriginBucket,
            'Key': objectKey
        },
        StorageClass='ONEZONE_IA'
    )

    timestamp = time.time()

    dynamoClient.update_item(
        TableName=dynamoTable,
        Key={
            'category': {
                'S': identified_prefix
            },
            'timestamp': {
                'N': str(timestamp)
            }
        },
        UpdateExpression='SET objectkey = :val',
        ExpressionAttributeValues={
            ':val': {
                'S': f'{identified_prefix}/{objectKey}'
            }
        },
    )

    if response['ResponseMetadata']['HTTPStatusCode'] == 200:
        response = s3client.delete_object(
            Bucket=s3OriginBucket,
            Key=objectKey
        )

    return response
