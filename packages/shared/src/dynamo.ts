import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function putItem(table: string, item: Record<string, any>) {
  await docClient.send(new PutCommand({ TableName: table, Item: item }));
}

export async function getItem<T>(table: string, key: Record<string, any>): Promise<T | undefined> {
  const res = await docClient.send(new GetCommand({ TableName: table, Key: key }));
  return res.Item as T | undefined;
}
