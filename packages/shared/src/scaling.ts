import {
  ApplicationAutoScalingClient,
  RegisterScalableTargetCommand,
  PutScalingPolicyCommand,
} from '@aws-sdk/client-application-auto-scaling';

const client = new ApplicationAutoScalingClient({});

export async function updateEdgeScaling(
  functionName: string,
  version: string,
  min: number,
  max: number,
  targetUtilization = 0.75
) {
  const resourceId = `function:${functionName}:${version}`;
  await client.send(
    new RegisterScalableTargetCommand({
      ServiceNamespace: 'lambda',
      ResourceId: resourceId,
      ScalableDimension: 'lambda:function:ProvisionedConcurrency',
      MinCapacity: min,
      MaxCapacity: max,
    })
  );
  await client.send(
    new PutScalingPolicyCommand({
      PolicyName: `${functionName}-tracking`,
      ServiceNamespace: 'lambda',
      ResourceId: resourceId,
      ScalableDimension: 'lambda:function:ProvisionedConcurrency',
      PolicyType: 'TargetTrackingScaling',
      TargetTrackingScalingPolicyConfiguration: {
        TargetValue: targetUtilization,
        PredefinedMetricSpecification: {
          PredefinedMetricType: 'LambdaProvisionedConcurrencyUtilization',
        },
      },
    })
  );
}
