import json
import logging
import os
import boto3


def lambda_handler(event, context):
    logger = logging.getLogger()

    try:
        dynamoTable = os.environ['DynamoTable']
    except:
        logger.error('No Enviroment Setup!')
        exit()

    squirrels = query_table(dynamoTable)

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Get Squirrels Function",
            "squirrels": squirrels
        }),
        "headers": {
            'Access-Control-Allow-Origin': 'https://awsusergroup.wien',
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
    }


def query_table(tableName):
    squirrels = []

    dynamoClient = boto3.client('dynamodb')
    response = dynamoClient.query(
        TableName=tableName,
        Select='SPECIFIC_ATTRIBUTES',
        ConsistentRead=True,
        ReturnConsumedCapacity='TOTAL',
        ProjectionExpression='objectkey',
        KeyConditionExpression='category = :partval',
        ExpressionAttributeValues={
            ':partval': {
                'S': 'squirrel'
            }
        }
    )

    for item in response['Items']:
        squirrels.append({
            'objectkey': item['objectkey']['S']
        })

    return squirrels
