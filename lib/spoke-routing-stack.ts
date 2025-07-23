import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ram from 'aws-cdk-lib/aws-ram';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface SpokeRoutingStackProps extends StackProps {
  transitGatewayId: string;
  vpcAttachmentId: string;
  spokeRouteTableId: string; // Custom TGW route table created for the spoke
  useExplicitRouting?: boolean;
}

export class SpokeRoutingStack extends Stack {
  public readonly useExplicitRouting: boolean;  
  constructor(scope: Construct, id: string, props: SpokeRoutingStackProps) {
    super(scope, id, props);

    const useExplicitRouting = this.node.tryGetContext('useExplicitRouting') === 'true';

    if (useExplicitRouting) {
      // Explicitly associate attachment with the route table
      new ec2.CfnTransitGatewayRouteTableAssociation(this, 'SpokeTgwAssociation', {
        transitGatewayAttachmentId: props.vpcAttachmentId,
        transitGatewayRouteTableId: props.spokeRouteTableId,
      });

      // Explicitly propagate routes from this attachment into the route table
      new ec2.CfnTransitGatewayRouteTablePropagation(this, 'SpokeTgwPropagation', {
        transitGatewayAttachmentId: props.vpcAttachmentId,
        transitGatewayRouteTableId: props.spokeRouteTableId,
      });
    }
  }
}