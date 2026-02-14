# 13|7 FRAMEWORKS - INTERNAL DOCUMENTS

**CONFIDENTIAL - DO NOT SHARE WITH CLIENTS**

This folder contains internal business documents including:

- `/bom/` - Bill of Materials with cost and margin data
- `/rfp/` - Request for Proposals to send to distributors
- `/reports/` - Internal financial and margin reports

## Safety Rules

1. **NEVER** email BOM files to client email addresses
2. **NEVER** share documents from this folder via client-facing channels
3. RFP files are safe to send to **distributors only** (not clients)
4. All files are marked INTERNAL and contain proprietary pricing

## Email Validation

The BOM generator includes email validation that blocks:
- Consumer email domains (gmail, yahoo, hotmail, etc.)
- Any external domain not on the approved list

Approved internal domains:
- 137frameworks.com
- mingma.io

## n8n Workflow Integration

Files in this folder can be picked up by n8n workflows for:
- Automatic PDF generation from BOM Excel files
- RFP distribution to approved distributor contacts
- Internal reporting and analytics

---
*13|7 FrameWorks - Internal Use Only*
