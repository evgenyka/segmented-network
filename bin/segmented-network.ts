#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { HubStack } from '../lib/hub-and-spoke-stack';
import { SpokeVpcStack } from '../lib/spoke-vpc-stack';
import { SpokeRoutingStack } from '../lib/spoke-routing-stack';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

const app = new App();
const useExplicitRouting = app.node.tryGetContext('useExplicitRouting') === 'true';

// Deploy the hub (Transit Gateway and route tables)
const hubStack = new HubStack(app, 'HubStack');

// Deploy a spoke VPC
const spokeVpcStack = new SpokeVpcStack(app, 'SpokeVpcStack', {
  transitGatewayId: hubStack.transitGateway.ref,
  useExplicitRouting,
});

// Deploy spoke routing (association and propagation)
if (useExplicitRouting && hubStack.coreRouteTable) {
  const attachment = spokeVpcStack.node.tryFindChild('SpokeVpcAttachment') as ec2.CfnTransitGatewayVpcAttachment;
  new SpokeRoutingStack(app, 'SpokeRoutingStack', {
    transitGatewayId: hubStack.transitGateway.ref,
    vpcAttachmentId: attachment.ref,
    spokeRouteTableId: hubStack.coreRouteTable.ref,
    useExplicitRouting,
  });
}
