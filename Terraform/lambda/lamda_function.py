import json
import boto3
import re
import math
import os
import uuid
from datetime import datetime
from collections import Counter

bedrock = boto3.client('bedrock-runtime')
s3 = boto3.client("s3")
bucket_name = os.environ.get("S3_BUCKET_NAME")

def extract_code_block(text, language=None):
    if not text:
        return ""
    match = re.search(r"Code:\s*(.*)", text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    if language:
        pattern = rf"```{language}(.*?)```"
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()
    fallback = re.search(r"```(.*?)```", text, re.DOTALL)
    if fallback:
        return fallback.group(1).strip()
    return text.strip()

def get_bedrock_response(model_id, prompt):
    if model_id.startswith("anthropic.claude"):
        body = json.dumps({
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1024,
            "temperature": 0.7,
            "anthropic_version": "bedrock-2023-05-31"
        })
    else:
        raise ValueError("Unsupported model_id")

    response = bedrock.invoke_model(
        body=body,
        modelId=model_id,
        accept="application/json",
        contentType="application/json"
    )
    result = json.loads(response['body'].read())

    try:
        return result["content"][0]["text"]
    except Exception as e:
        print("Claude model response error:", result)
        return ""

def lambda_handler(event, context):
    try:
        body = json.loads(event["body"]) if "body" in event else event

        source_code = body.get("sourceCode")
        source_lang = body.get("sourceLang", "").strip().lower()
        target_lang = body.get("targetLang", "").strip().lower()
        user_id = body.get("UserID", "").strip()
        timestamp = datetime.utcnow().isoformat()
        date_path = datetime.utcnow().strftime("%Y-%m-%d")

        if not all([source_code, source_lang, target_lang, user_id]):
            return {
                "statusCode": 400,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"message": "Missing one or more required fields."})
            }

        prompt = (
            f"Convert the following {source_lang} code to {target_lang}:\n\n"
            f"```{source_lang}\n{source_code}\n```\n\n"
            f"Please reply with only the converted code, and prefix it with 'Code:'."
        )

        model_claude = "anthropic.claude-3-sonnet-20240229-v1:0"
        response_claude = get_bedrock_response(model_claude, prompt)

        if not response_claude:
            raise ValueError("Claude response was empty.")

        converted_code = extract_code_block(response_claude, target_lang)

        # Generate key in format: user_id/yyyy-mm-dd/user_id_timestamp_targetlang_uuid.txt
        file_name = f"{user_id}_{timestamp}_{target_lang}_{uuid.uuid4().hex}.txt"
        file_key = f"{user_id}/{date_path}/{file_name}"

        file_content = (
            f"UserID: {user_id}\n"
            f"Timestamp: {timestamp}\n"
            f"TargetLang: {target_lang}\n"
            f"Code:\n{converted_code}"
        )

        s3.put_object(
            Bucket=bucket_name,
            Key=file_key,
            Body=file_content.encode("utf-8")
        )

        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({
                "converted_code": converted_code,
                "s3_key": file_key
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({
                "message": "Internal error",
                "error": str(e)
            })
        }
'''
# TEST EVENT:
{
    "sourceLang": "python",
    "targetLang": "java",
    "sourceCode": "def greet():\n    print('Hello')",
    "UserID": "user123"
}
'''
