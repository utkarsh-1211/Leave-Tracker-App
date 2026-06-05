# Leave Tracker App

This repository contains a Salesforce Leave Tracker application.

## Project Contents

- `force-app/main/default/classes` - Apex classes for leave requests and sample data.
- `force-app/main/default/lwc` - Lightning Web Components for leave submission, tracking, and viewing.
- `force-app/main/default/objects` - Custom object and fields for `LeaveRequest__c`.
- `sfdx-project.json` - Salesforce DX project configuration.

## Salesforce Deployment

This project was deployed to the authenticated org alias `liveProjects` using the Salesforce CLI.

To deploy locally:

```bash
sf project deploy start --source-dir force-app/main/default --target-org liveProjects --wait 10
```

## GitHub

Remote repository:

`https://github.com/utkarsh-1211/Leave-Tracker-App.git`

The local `main` branch is tracking `origin/main`.

## Notes

- The project is configured for Salesforce DX source format.
- The README was generated and committed automatically to document the repository.
