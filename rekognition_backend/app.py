import json
import os
import logging
import boto3

# import requests


def lambda_handler(event, context):
    logger = logging.getLogger()

    try:
        s3Bucket = os.environ['S3BucketInput']
    except:
        logger.error('No S3 Bucket provided in the environment')
        exit()

    bodyValue = get_image_keys(s3Bucket)

    if bodyValue:
        for content in bodyValue:
            print(content['Key'])
            labels = rekognize_image(content['Key'], s3Bucket)
            print(labels)
    else:
        exit()


def get_image_keys(s3BucketName):
    s3client = boto3.client('s3')

    response = s3client.list_objects_v2(
        Bucket=s3BucketName,
    )

    if 'Contents' in response:
        return response['Contents']
    else:
        return None


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
