import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class HubStack extends Stack {
  public readonly transitGateway: ec2.CfnTransitGateway;
  public readonly coreRouteTable?: ec2.CfnTransitGatewayRouteTable;
  public readonly workloadRouteTable?: ec2.CfnTransitGatewayRouteTable;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Read context variable
    const useExplicitRouting = this.node.tryGetContext('useExplicitRouting') === 'true';

    this.transitGateway = new ec2.CfnTransitGateway(this, 'TransitGateway', {
      amazonSideAsn: 64512,
      defaultRouteTableAssociation: useExplicitRouting ? 'disable' : 'enable',
      defaultRouteTablePropagation: useExplicitRouting ? 'disable' : 'enable',
    });

    // Create explicit route tables
    if (useExplicitRouting) {
      this.coreRouteTable = new ec2.CfnTransitGatewayRouteTable(this, 'AftCoreRouteTable', {
        transitGatewayId: this.transitGateway.ref,
        tags: [{ key: 'Name', value: 'AftCore' }],
      });

      this.workloadRouteTable = new ec2.CfnTransitGatewayRouteTable(this, 'AftWorkloadRouteTable', {
        transitGatewayId: this.transitGateway.ref,
        tags: [{ key: 'Name', value: 'AftWorkload' }],
      });
    }
  }
}