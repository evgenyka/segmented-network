# Segmented Network: AWS CDK Hub-and-Spoke Architecture

This project deploys a segmented hub-and-spoke network architecture on AWS using the AWS Cloud Development Kit (CDK). It provisions a Transit Gateway (TGW), custom route tables, and spoke VPCs, with optional explicit routing control.

## Features

- **Transit Gateway (TGW):** Central hub for VPC connectivity.
- **Explicit Routing (optional):** Create and manage custom TGW route tables for segmented routing.
- **Spoke VPCs:** Automatically attach VPCs to the TGW.
- **Flexible Routing:** Choose between default TGW routing or explicit route table association/propagation via a context variable.

## Usage

### Prerequisites

- [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) installed
- AWS credentials configured
- Node.js and npm installed

### Install Dependencies

```sh
npm install
```

### Configure Routing Behavior

You can control routing mode via the CDK context variable `useExplicitRouting`.

**Default Routing (TGW default route table):**
```sh
cdk deploy --context useExplicitRouting=false
```

**Explicit Routing (custom TGW route tables):**
```sh
cdk deploy --context useExplicitRouting=true
```

Or set the context in `cdk.json`:
```json
{
  "context": {
    "useExplicitRouting": "true"
  }
}
```

### Deploy

```sh
cdk deploy
```

## Project Structure

- `bin/segmented-network.ts` – Entry point, orchestrates stack deployment.
- `lib/hub-and-spoke-stack.ts` – Provisions TGW and route tables.
- `lib/spoke-vpc-stack.ts` – Provisions spoke VPCs and attaches to TGW.
- `lib/spoke-routing-stack.ts` – Associates and propagates TGW attachments to route tables (if explicit routing).

## Customization

- Add more spoke VPCs by instantiating additional `SpokeVpcStack` and `SpokeRoutingStack` objects in `bin/segmented-network.ts`.
- Adjust subnet configuration and CIDR blocks in `lib/spoke-vpc-stack.ts` as needed.

## Cleanup

To remove all resources:

```sh
cdk destroy
```

##