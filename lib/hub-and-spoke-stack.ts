import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface HubStackProps extends StackProps {
  useExplicitRouting: boolean;
}

export class HubStack extends Stack {
  public readonly transitGateway: ec2.CfnTransitGateway;
  public readonly coreRouteTable?: ec2.CfnTransitGatewayRouteTable;
  public readonly workloadRouteTable?: ec2.CfnTransitGatewayRouteTable;
  public readonly useExplicitRouting: boolean;

  constructor(scope: Construct, id: string, props: HubStackProps) {
    super(scope, id, props);

    this.useExplicitRouting = props.useExplicitRouting ?? false;

    this.transitGateway = new ec2.CfnTransitGateway(this, 'TransitGateway', {
      amazonSideAsn: 64512,
      defaultRouteTableAssociation: this.useExplicitRouting ? 'disable' : 'enable',
      defaultRouteTablePropagation: this.useExplicitRouting ? 'disable' : 'enable',
    });

    // Create explicit route tables
    if (this.useExplicitRouting) {
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