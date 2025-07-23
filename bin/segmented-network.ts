#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { HubStack } from '../lib/hub-and-spoke-stack';
import { SpokeVpcStack } from '../lib/spoke-vpc-stack';
import { SpokeRoutingStack } from '../lib/spoke-routing-stack';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

const app = new App();
const useExplicitRouting = app.node.tryGetContext('useExplicitRouting') === 'true';

const hubStack = new HubStack(app, 'HubStack', { useExplicitRouting });

// Deploy two spoke VPCs
const spokeVpcStack1 = new SpokeVpcStack(app, 'SpokeVpcStack1', {
  transitGatewayId: hubStack.transitGateway.ref,
  useExplicitRouting,
});
const spokeVpcStack2 = new SpokeVpcStack(app, 'SpokeVpcStack2', {
  transitGatewayId: hubStack.transitGateway.ref,
  useExplicitRouting,
});

// Deploy spoke routing for each spoke if explicit routing is enabled
if (useExplicitRouting && hubStack.coreRouteTable) {
  const attachment1 = spokeVpcStack1.node.tryFindChild('SpokeVpcAttachment') as ec2.CfnTransitGatewayVpcAttachment;
  new SpokeRoutingStack(app, 'SpokeRoutingStack1', {
    transitGatewayId: hubStack.transitGateway.ref,
    vpcAttachmentId: attachment1.ref,
    spokeRouteTableId: hubStack.coreRouteTable.ref,
    useExplicitRouting,
  });

  const attachment2 = spokeVpcStack2.node.tryFindChild('SpokeVpcAttachment') as ec2.CfnTransitGatewayVpcAttachment;
  new SpokeRoutingStack(app, 'SpokeRoutingStack2', {
    transitGatewayId: hubStack.transitGateway.ref,
    vpcAttachmentId: attachment2.ref,
    spokeRouteTableId: hubStack.coreRouteTable.ref,
    useExplicitRouting,
  });
}
