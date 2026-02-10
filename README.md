# MyByte

[![master](https://github.com/ugahacks/ugahacks-backend/actions/workflows/cicd_master.yaml/badge.svg)](https://github.com/ugahacks/ugahacks-backend/actions/workflows/cicd_master.yaml) [![release](https://github.com/ugahacks/ugahacks-backend/actions/workflows/cicd_release.yaml/badge.svg?branch=release)](https://github.com/ugahacks/ugahacks-backend/actions/workflows/cicd_release.yaml)

This repository hosts the Full-Stack registration systems that powers UGAHacks.
If you have a question, please reach out to us at [tech@ugahacks.com](mailto:tech@ugahacks.com)
## Run Locally

Clone the project

```bash
  git clone https://github.com/ugahacks/ugahacks-backend.git
```

Go to the project directory

```bash
  cd ugahacks-backend
```
Install dependencies & start the server
```bash
  yarn install
  yarn workspace mybyte run dev
```
## Documentation

Comprehensive documentation for the MyByte system is available in the [`projects/mybyte/docs`](./projects/mybyte/docs) directory:

- **[QR Scanning System](./projects/mybyte/docs/qr-scanning.md)** - QR code scanning implementation, workflow, and troubleshooting
- **[Roles and Permissions](./projects/mybyte/docs/roles-and-permissions.md)** - User roles, access control, and authorization
- **[Points System](./projects/mybyte/docs/points-system.md)** - How points are calculated dynamically and the point economy
- **[Firebase Collections](./projects/mybyte/docs/firebase-collections.md)** - Database schema, collection structure, and data flows
- **[Registration Flows](./projects/mybyte/docs/registration-flows.md)** - Account creation, event registration, and data flow
- **[Troubleshooting Guide](./projects/mybyte/docs/troubleshooting.md)** - Common issues and solutions
- **[Security Posture](./projects/mybyte/docs/security.md)** - Authentication, authorization, and security best practices

For a complete overview, see the [Documentation Index](./projects/mybyte/docs/README.md).

## QR Code High-Level Diagram
<img src="https://raw.githubusercontent.com/ugahacks/ugahacks/47c660a3aa3ec8998eef829f2a55a2c8e787377f/docs/QrFlow.drawio.svg"/>


