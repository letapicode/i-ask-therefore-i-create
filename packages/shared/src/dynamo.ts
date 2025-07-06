import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function putItem(table: string, item: Record<string, any>) {
  await docClient.send(new PutCommand({ TableName: table, Item: item }));
}

export async function getItem<T>(table: string, key: Record<string, any>): Promise<T | undefined> {
  const res = await docClient.send(new GetCommand({ TableName: table, Key: key }));
  return res.Item as T | undefined;
}

export async function updateItem(table: string, key: Record<string, any>, updateExp: string, values: Record<string, any>) {
  await docClient.send(
    new UpdateCommand({
      TableName: table,
      Key: key,
      UpdateExpression: updateExp,
      ExpressionAttributeValues: values,
    })
  );
}

export async function queryItems<T>(table: string, index: string, keyCondExp: string, values: Record<string, any>): Promise<T[]> {
  const res = await docClient.send(
    new QueryCommand({
      TableName: table,
      IndexName: index,
      KeyConditionExpression: keyCondExp,
      ExpressionAttributeValues: values,
    })
  );
  return (res.Items as T[]) || [];
}

export async function scanTable<T>(table: string): Promise<T[]> {
  const res = await docClient.send(new ScanCommand({ TableName: table }));
  return (res.Items as T[]) || [];
}

export async function deleteItem(table: string, key: Record<string, any>) {
  await docClient.send(new DeleteCommand({ TableName: table, Key: key }));
}
