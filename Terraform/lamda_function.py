import json
import boto3
import re
import math
from collections import Counter

bedrock = boto3.client('bedrock-runtime')

def extract_java_code(text):
    match = re.search(r'```java(.*?)```', text, re.DOTALL)
    if match:
        return match.group(1).strip()
    match = re.search(r'```(.*?)```', text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()

def cosine_sim(text1, text2):
    vec1 = Counter(text1.split())
    vec2 = Counter(text2.split())
    dot = sum(vec1[x] * vec2[x] for x in vec1 & vec2)
    mag1 = math.sqrt(sum(v**2 for v in vec1.values()))
    mag2 = math.sqrt(sum(v**2 for v in vec2.values()))
    return dot / (mag1 * mag2) if mag1 and mag2 else 0.0

def get_bedrock_response(model_id, prompt):
    if model_id.startswith("anthropic.claude"):
        body = json.dumps({
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 800,
            "temperature": 0.7,
            "anthropic_version": "bedrock-2023-05-31"
        })
    elif model_id.startswith("meta.llama3"):
        body = json.dumps({
            "prompt": prompt,
            "max_gen_len": 800,
            "temperature": 0.7,
            "top_p": 0.9
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

    if model_id.startswith("anthropic.claude"):
        return result["content"][0]["text"]
    elif model_id.startswith("meta.llama3"):
        return result.get("generation", "")
    return ""

def lambda_handler(event, context):
    source_code = event.get("source_code")
    if not source_code:
        return {
            "statusCode": 400,
            "message": "Missing 'source_code' in request"
        }

    prompt = f"Convert the following Python code to Java:\n\n```python\n{source_code}\n```"

    model_claude = "anthropic.claude-3-sonnet-20240229-v1:0"
    model_llama = "meta.llama3-70b-instruct-v1:0" 

    response_claude = get_bedrock_response(model_claude, prompt)
    response_llama = get_bedrock_response(model_llama, prompt)

    java_claude = extract_java_code(response_claude)
    java_llama = extract_java_code(response_llama)

    similarity = cosine_sim(java_claude, java_llama)

    if similarity > 0.8:
        return {
            "statusCode": 200,
            "similarity": similarity,
            "java_code": java_claude
        }
    else:
        return {
            "statusCode": 400,
            "message": "Similarity too low",
            "similarity": similarity,
            "java_claude": java_claude,
            "java_llama": java_llama
        }
