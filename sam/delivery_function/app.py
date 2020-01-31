import json


def lambda_handler(event, context):

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "API Working",
        }),
        "headers": {
            'Access-Control-Allow-Origin': 'https://awsusergroup.wien',
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
    }
