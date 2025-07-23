import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface SpokeVpcStackProps extends StackProps {
  transitGatewayId: string;
  useExplicitRouting?: boolean; // default = false
}

export class SpokeVpcStack extends Stack {
  constructor(scope: Construct, id: string, props: SpokeVpcStackProps) {
    super(scope, id, props);

    // Default to false unless prop says otherwise
    const useExplicitRouting = this.node.tryGetContext('useExplicitRouting') === 'true';
    
    const vpc = new ec2.Vpc(this, 'SpokeVpc', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
      ],
    });

    const attachment = new ec2.CfnTransitGatewayVpcAttachment(this, 'SpokeVpcAttachment', {
      transitGatewayId: props.transitGatewayId,
      vpcId: vpc.vpcId,
      subnetIds: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }).subnetIds,
      options: {
        ApplianceModeSupport: useExplicitRouting ? 'enable' : 'disable',
        DnsSupport: 'enable',
        Ipv6Support: 'disable', 
      },
    });

    new CfnOutput(this, 'VpcId', { value: vpc.vpcId });
    new CfnOutput(this, 'VpcAttachmentId', { value: attachment.ref });
  }
}