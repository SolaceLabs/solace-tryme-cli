# AWS Lambda Field Mapper Implementation Guide

## Overview

This guide provides specifications for implementing the AWS Lambda function that enhances AsyncAPI feedrules with intelligent field mappings, including **Topic Parameter Mapping** - the ability to map payload fields to topic variables.

## Feature: Topic Parameter Mapping

### Purpose

When AsyncAPI topics contain variable placeholders (e.g., `acme/orders/{orderId}/{region}`), and the message payload contains fields with matching names (e.g., `orderId`, `region`), the Lambda function should automatically create mappings to inject the payload-generated values into the topic address.

### Benefits

1. **Realistic Topics**: Topic addresses will contain actual correlated data (e.g., order ID in topic matches order ID in payload)
2. **Data Consistency**: Ensures the same value appears in both topic and payload
3. **Type Conversion**: Handles type conversions (e.g., payload number → topic string)
4. **Reduced Configuration**: Automatic detection eliminates manual mapping configuration

## Lambda Function Specification

### Input Format

```json
{
  "feedrules": [
    {
      "topic": "acmeRental/orders/created/v1/{region}/{orderId}",
      "eventName": "Order Created",
      "eventVersion": "1.0.0",
      "messageName": "Order_Created",
      "topicParameters": {
        "region": {
          "schema": {
            "type": "string",
            "enum": ["us-east", "us-west", "eu-central"]
          },
          "rule": {
            "name": "region",
            "type": "string",
            "group": "StringRules",
            "rule": "enum",
            "enum": ["us-east", "us-west", "eu-central"]
          }
        },
        "orderId": {
          "schema": {
            "type": "string"
          },
          "rule": {
            "name": "orderId",
            "type": "string",
            "group": "StringRules",
            "rule": "alpha",
            "casing": "mixed",
            "minLength": 10,
            "maxLength": 10
          }
        }
      },
      "payload": {
        "orderId": {
          "type": "number",
          "minimum": 1000,
          "maximum": 999999
        },
        "customerName": {
          "type": "string"
        },
        "amount": {
          "type": "number",
          "minimum": 0,
          "maximum": 10000
        }
      },
      "publishSettings": {
        "count": 0,
        "interval": 1000,
        "delay": 0
      }
    }
  ],
  "asyncApiSpec": { /* Full AsyncAPI document */ }
}
```

### Expected Output Format

```json
{
  "success": true,
  "enhancedFeedrules": [
    {
      "topic": "acmeRental/orders/created/v1/{region}/{orderId}",
      "eventName": "Order Created",
      "eventVersion": "1.0.0",
      "messageName": "Order_Created",
      "topicParameters": { /* Same as input */ },
      "payload": {
        "orderId": {
          "type": "number",
          "minimum": 1000,
          "maximum": 999999,
          "rule": {
            "name": "orderId",
            "type": "number",
            "group": "NumberRules",
            "rule": "int",
            "minimum": 1000,
            "maximum": 999999
          }
        },
        "customerName": {
          "type": "string",
          "rule": {
            "name": "customerName",
            "type": "string",
            "group": "PersonRules",
            "rule": "fullName"
          }
        },
        "amount": {
          "type": "number",
          "minimum": 0,
          "maximum": 10000,
          "rule": {
            "name": "amount",
            "type": "number",
            "group": "FinanceRules",
            "rule": "amount",
            "minimum": 0,
            "maximum": 10000
          }
        }
      },
      "publishSettings": { /* Same as input */ },
      "mappings": [
        {
          "type": "Topic Parameter",
          "source": {
            "type": "Payload Parameter",
            "name": "orderId",
            "fieldName": "orderId",
            "fieldType": "number"
          },
          "target": {
            "type": "Topic Parameter",
            "name": "orderId",
            "fieldName": "orderId",
            "fieldType": "string"
          }
        }
      ]
    }
  ],
  "summary": {
    "totalFields": 3,
    "improved": 3,
    "unchanged": 0,
    "improvementPercentage": 100
  },
  "context": {
    "eventName": "Order Created",
    "topic": "acmeRental/orders/created/v1/{region}/{orderId}",
    "domain": "Retail"
  }
}
```

## Implementation Algorithm

### Step 1: Parse Topic for Variables

```python
import re

def extract_topic_variables(topic: str) -> list[str]:
    """
    Extract variable names from topic string.

    Example: "acme/{region}/orders/{orderId}" -> ["region", "orderId"]
    """
    pattern = r'\{([^}]+)\}'
    return re.findall(pattern, topic)
```

### Step 2: Build Field Inventories

```python
def build_field_inventories(feedrule: dict) -> tuple[dict, dict]:
    """
    Create inventories of topic parameters and payload fields.

    Returns:
        (topic_fields, payload_fields)
    """
    # Extract topic parameter definitions
    topic_fields = {}
    if 'topicParameters' in feedrule:
        for name, config in feedrule['topicParameters'].items():
            topic_fields[name] = {
                'name': name,
                'type': config.get('schema', {}).get('type', 'string'),
                'config': config
            }

    # Extract payload field definitions
    payload_fields = {}
    if 'payload' in feedrule:
        for name, config in feedrule['payload'].items():
            payload_fields[name] = {
                'name': name,
                'type': config.get('type', 'string'),
                'config': config
            }

    return topic_fields, payload_fields
```

### Step 3: Identify Matching Fields

```python
def find_matching_fields(topic_vars: list[str], topic_fields: dict, payload_fields: dict) -> list[dict]:
    """
    Find payload fields that match topic variable names.

    Returns list of matches with source and target information.
    """
    matches = []

    for var_name in topic_vars:
        # Check if this variable exists in both topic parameters and payload
        if var_name in payload_fields:
            payload_field = payload_fields[var_name]
            topic_field = topic_fields.get(var_name, {})

            matches.append({
                'variable_name': var_name,
                'source': {
                    'type': 'Payload Parameter',
                    'name': var_name,
                    'fieldName': var_name,
                    'fieldType': payload_field['type']
                },
                'target': {
                    'type': 'Topic Parameter',
                    'name': var_name,
                    'fieldName': var_name,
                    'fieldType': topic_field.get('type', 'string')  # Topics typically use strings
                }
            })

    return matches
```

### Step 4: Generate Mapping Entries

```python
def generate_topic_mappings(feedrule: dict) -> list[dict]:
    """
    Generate Topic Parameter mappings for a feedrule.

    Returns list of mapping objects.
    """
    topic = feedrule.get('topic', '')
    topic_vars = extract_topic_variables(topic)

    if not topic_vars:
        return []

    topic_fields, payload_fields = build_field_inventories(feedrule)
    matches = find_matching_fields(topic_vars, topic_fields, payload_fields)

    mappings = []
    for match in matches:
        mappings.append({
            'type': 'Topic Parameter',
            'source': match['source'],
            'target': match['target']
        })

    return mappings
```

### Step 5: Enhance Payload Fields

```python
def enhance_payload_fields(feedrule: dict) -> dict:
    """
    Add Faker.js rules to payload fields based on field names and types.

    This is your existing functionality - enhance it to recognize common patterns:
    - "name", "firstName", "lastName" -> PersonRules
    - "email" -> InternetRules (email)
    - "phone" -> StringRules (phoneNumber)
    - "amount", "price" -> FinanceRules (amount)
    - "date", "timestamp" -> DateRules
    - etc.
    """
    enhanced_payload = {}

    for field_name, field_config in feedrule.get('payload', {}).items():
        enhanced_field = dict(field_config)

        # Generate appropriate Faker rule based on field name and type
        faker_rule = infer_faker_rule(field_name, field_config.get('type'))
        enhanced_field['rule'] = faker_rule

        enhanced_payload[field_name] = enhanced_field

    return enhanced_payload
```

### Step 6: Complete Enhancement Pipeline

```python
def enhance_feedrule(feedrule: dict, asyncapi_spec: dict) -> dict:
    """
    Complete enhancement pipeline for a single feedrule.
    """
    enhanced = dict(feedrule)

    # 1. Enhance payload fields with Faker rules
    enhanced['payload'] = enhance_payload_fields(feedrule)

    # 2. Generate topic parameter mappings
    topic_mappings = generate_topic_mappings(feedrule)

    # 3. Add or merge mappings array
    if 'mappings' not in enhanced:
        enhanced['mappings'] = []

    enhanced['mappings'].extend(topic_mappings)

    return enhanced

def lambda_handler(event, context):
    """
    Main Lambda handler.
    """
    try:
        feedrules = event['feedrules']
        asyncapi_spec = event['asyncApiSpec']

        enhanced_feedrules = []
        total_fields = 0
        improved_fields = 0

        for feedrule in feedrules:
            enhanced = enhance_feedrule(feedrule, asyncapi_spec)
            enhanced_feedrules.append(enhanced)

            # Count statistics
            payload_count = len(feedrule.get('payload', {}))
            total_fields += payload_count

            # Check how many fields got rules
            enhanced_payload_count = sum(
                1 for field in enhanced.get('payload', {}).values()
                if 'rule' in field
            )
            improved_fields += enhanced_payload_count

        improvement_percentage = (
            int((improved_fields / total_fields) * 100) if total_fields > 0 else 0
        )

        return {
            'success': True,
            'enhancedFeedrules': enhanced_feedrules,
            'summary': {
                'totalFields': total_fields,
                'improved': improved_fields,
                'unchanged': total_fields - improved_fields,
                'improvementPercentage': improvement_percentage
            },
            'context': {
                'eventName': feedrules[0].get('eventName', 'Unknown'),
                'topic': feedrules[0].get('topic', ''),
                'domain': asyncapi_spec.get('info', {}).get('x-application-domain', 'Unknown')
            }
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'errorType': type(e).__name__
        }
```

## Example Test Cases

### Test Case 1: Simple Topic Variable Match

**Input:**
```json
{
  "topic": "orders/{orderId}",
  "topicParameters": {
    "orderId": { "schema": { "type": "string" } }
  },
  "payload": {
    "orderId": { "type": "number", "minimum": 1000, "maximum": 9999 }
  }
}
```

**Expected Mapping:**
```json
{
  "type": "Topic Parameter",
  "source": {
    "type": "Payload Parameter",
    "name": "orderId",
    "fieldName": "orderId",
    "fieldType": "number"
  },
  "target": {
    "type": "Topic Parameter",
    "name": "orderId",
    "fieldName": "orderId",
    "fieldType": "string"
  }
}
```

### Test Case 2: Multiple Matching Variables

**Input:**
```json
{
  "topic": "acme/{region}/{storeId}/sales/{transactionId}",
  "topicParameters": {
    "region": { "schema": { "type": "string" } },
    "storeId": { "schema": { "type": "string" } },
    "transactionId": { "schema": { "type": "string" } }
  },
  "payload": {
    "transactionId": { "type": "number" },
    "storeId": { "type": "number" },
    "amount": { "type": "number" },
    "region": { "type": "string" }
  }
}
```

**Expected Mappings:** 3 mappings (region, storeId, transactionId)

### Test Case 3: No Matching Fields

**Input:**
```json
{
  "topic": "orders/{orderId}",
  "topicParameters": {
    "orderId": { "schema": { "type": "string" } }
  },
  "payload": {
    "customerName": { "type": "string" },
    "amount": { "type": "number" }
  }
}
```

**Expected Mappings:** Empty array (no matches)

### Test Case 4: Partial Match

**Input:**
```json
{
  "topic": "store/{storeId}/employee/{employeeId}",
  "topicParameters": {
    "storeId": { "schema": { "type": "string" } },
    "employeeId": { "schema": { "type": "string" } }
  },
  "payload": {
    "employeeId": { "type": "number" },
    "shiftHours": { "type": "number" }
  }
}
```

**Expected Mappings:** 1 mapping (employeeId only)

## Deployment Configuration

### Environment Variables

- `LOG_LEVEL`: Set to `DEBUG` for detailed logging
- `ENABLE_TOPIC_MAPPING`: Feature flag (default: `true`)
- `CASE_SENSITIVE_MATCHING`: Whether field matching is case-sensitive (default: `false`)

### Lambda Configuration

- **Runtime**: Python 3.11+ or Node.js 18+
- **Memory**: 512 MB (adjust based on AsyncAPI document size)
- **Timeout**: 30 seconds
- **Concurrency**: 10 (adjust based on expected load)

### API Gateway Setup

```yaml
Path: /field-mapper
Method: POST
Authorization: API Key or IAM
CORS: Enabled
Content-Type: application/json
```

## Error Handling

```python
class FieldMapperError(Exception):
    """Base exception for field mapper errors."""
    pass

class InvalidInputError(FieldMapperError):
    """Invalid input format."""
    pass

class ProcessingError(FieldMapperError):
    """Error during field processing."""
    pass

def lambda_handler(event, context):
    try:
        # Validate input
        if 'feedrules' not in event:
            raise InvalidInputError('Missing required field: feedrules')

        if 'asyncApiSpec' not in event:
            raise InvalidInputError('Missing required field: asyncApiSpec')

        # Process feedrules
        # ...

    except InvalidInputError as e:
        return {
            'success': False,
            'error': str(e),
            'errorType': 'INVALID_INPUT',
            'details': ['feedrules and asyncApiSpec are required']
        }

    except ProcessingError as e:
        return {
            'success': False,
            'error': str(e),
            'errorType': 'PROCESSING_ERROR',
            'details': [str(e)]
        }

    except Exception as e:
        return {
            'success': False,
            'error': 'Internal server error',
            'errorType': 'INTERNAL_ERROR',
            'details': [str(e)]
        }
```

## Testing

### Unit Tests

```python
import unittest

class TestTopicVariableExtraction(unittest.TestCase):
    def test_single_variable(self):
        topic = "orders/{orderId}"
        result = extract_topic_variables(topic)
        self.assertEqual(result, ["orderId"])

    def test_multiple_variables(self):
        topic = "acme/{region}/store/{storeId}/orders/{orderId}"
        result = extract_topic_variables(topic)
        self.assertEqual(result, ["region", "storeId", "orderId"])

    def test_no_variables(self):
        topic = "orders/created/v1"
        result = extract_topic_variables(topic)
        self.assertEqual(result, [])

class TestFieldMatching(unittest.TestCase):
    def test_exact_match(self):
        topic_vars = ["orderId"]
        topic_fields = {"orderId": {"name": "orderId", "type": "string"}}
        payload_fields = {"orderId": {"name": "orderId", "type": "number"}}

        matches = find_matching_fields(topic_vars, topic_fields, payload_fields)
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]['variable_name'], 'orderId')
```

### Integration Test

```bash
curl -X POST https://your-lambda-url.amazonaws.com/field-mapper \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

## Performance Considerations

1. **Caching**: Cache AsyncAPI parsing results for repeated calls
2. **Batch Processing**: Process multiple feedrules in parallel
3. **Lazy Loading**: Only parse relevant sections of large AsyncAPI documents
4. **Memory Management**: Stream process very large payload definitions

## Future Enhancements

1. **Fuzzy Matching**: Match fields with similar names (e.g., "order_id" vs "orderId")
2. **Custom Mapping Rules**: Allow users to define custom mapping preferences
3. **Type Coercion Warnings**: Warn about potential data loss in type conversions
4. **Nested Field Support**: Support nested payload fields (e.g., "order.id")
5. **Array Field Handling**: Map array elements to topic variables
