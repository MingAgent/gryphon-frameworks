# Standard Operating Procedure: Construction Plan Generation

**13|7 FrameWorks Metal Building Estimator**

---

## 1. Purpose

This Standard Operating Procedure (SOP) establishes the process for generating construction plans from customer building configurations entered through the 13|7 FrameWorks estimator application. It defines the handoff between the automated plan generator system and the senior engineering team responsible for reviewing and approving plans before customer delivery.

---

## 2. Scope

This procedure covers the automated generation of six-sheet construction plan sets from customer building configurations. It applies to all construction plans generated through the estimator application, including both standalone plan downloads and plans embedded within customer contracts.

---

## 3. Roles and Responsibilities

### Plan Generator (Automated System)
- Reads customer building data from the Zustand estimator store
- Generates PDF construction plans in multi-sheet format
- Applies validation rules to plan data before output
- Triggers plan generation on contract download or standalone request
- Ensures consistent formatting and professional presentation

### Senior Engineer
- Reviews generated plans for accuracy and completeness
- Validates all dimensions against customer selections
- Verifies door placement, sizing, and compliance with spacing rules
- Approves plans for customer delivery
- Documents any discrepancies or required corrections
- Ensures quality control checklist is satisfied before approval

### Customer
- Provides building selections through the estimator wizard (8 steps)
- Confirms building specifications and configurations
- Reviews generated plans as part of contract documentation
- Requests modifications if needed through change order process

---

## 4. Data Flow

```
Customer fills estimator wizard (8 steps)
    ↓
Building configuration data stored in Zustand store (localStorage)
    ↓
User clicks "Proceed to Contract" or "Download Construction Plan"
    ↓
Contract wizard opens (if contract path)
    ↓
Construction plan PDF auto-generated on contract download
    ↓
Also available as standalone "Construction Plan" download option
    ↓
Senior Engineer reviews and approves
    ↓
Plan delivered to customer
```

---

## 5. Input Data Requirements

The plan generator reads configuration data from the following Zustand store objects:

### BuildingConfig
- **width** (feet): Building width, 20–60 feet
- **length** (feet): Building length, 20–120 feet
- **height/eave** (feet): Eave height, 8–16 feet
- **buildingType** (enum): `'pole-barn'` | `'carport'` | `'bolt-up'`
- **legType** (enum): `'standard'` | `'certified'`

### AccessoriesConfig

**Walk Doors** (`walkDoors[]`):
- `id`: Unique identifier
- `type`: `'walk'`
- `size`: Standard size identifier (3070)
- `width`: 3 feet
- `height`: 7 feet
- `wall`: Wall location (`'front'` | `'rear'` | `'left'` | `'right'`)
- `position`: Distance from corner (feet)
- `quantity`: Number of doors

**Roll-Up/Overhead Doors** (`rollUpDoors[]`):
- `id`: Unique identifier
- `type`: `'rollUp'`
- `size`: Door size (8, 10, 12, or 14 feet)
- `width`: Door width (feet)
- `height`: Door height (feet)
- `wall`: Wall location (`'front'` | `'rear'` | `'left'` | `'right'`)
- `position`: Distance from corner (feet)
- `quantity`: Number of doors

**Windows** (`windows[]`):
- `id`: Unique identifier
- `size`: Window size (`'3x3'` | `'4x4'`)
- `wall`: Wall location (`'front'` | `'rear'` | `'left'` | `'right'`)
- `quantity`: Number of windows

**Additional Accessories**:
- `insulation` (enum): `'none'` | `'wall'` | `'ceiling'` | `'full'`
- `ventilation` (boolean): Ridge vent or cupola included
- `gutters` (boolean): Gutter and downspout system included

### ConcreteConfig
- **type** (enum): `'none'` | `'piers'` | `'slab'` | `'turnkey'`
- **thickness** (inches): 4 | 5 | 6
- **existingPad** (boolean): Using existing concrete pad

### ColorConfig
- **roof**: Hex color code for roof panels
- **walls**: Hex color code for wall panels
- **trim**: Hex color code for trim and accents
- **doors**: Hex color code for door panels

### CustomerInfo
- **name**: Customer/company name
- **email**: Customer email address
- **phone**: Customer phone number
- **constructionAddress**: Full address where building will be constructed

---

## 6. Output Specifications

Each construction plan set is delivered as a multi-page PDF document with the following characteristics:

### Format and Layout
- **Page size**: Letter (8.5" × 11")
- **Orientation**: Portrait
- **Total sheets**: 6 numbered sheets (S-1 through S-6)
- **Color**: Full color including building color selections

### Required Sheets

**Sheet S-1: Aerial/Site Plan**
- Top-down view of building footprint
- Door and window locations marked
- Concrete pad extent shown (if applicable)
- Dimensions labeled
- Compass rose or orientation indicator

**Sheet S-2: Front & Rear Elevations**
- Front elevation showing door placement and sizing
- Rear elevation showing door placement and sizing
- Eave height, peak height dimensions
- Color scheme applied
- Door and window schedules referenced

**Sheet S-3: Left & Right Elevations**
- Left side elevation showing door and window placement
- Right side elevation showing door and window placement
- Gutter detail (if applicable)
- All dimensions clearly labeled

**Sheet S-4: Roof Plan**
- Top-down roof view
- Ridge direction indicated
- Roof pitch notation (3:12 standard)
- Gutter locations (if applicable)
- Ventilation locations (if applicable)

**Sheet S-5: Foundation/Concrete Plan**
- Concrete pad or pier layout (if applicable)
- Concrete thickness specified
- Pad dimensions and extension beyond building footprint
- Pier spacing and location details
- Notes regarding existing pad (if applicable)

**Sheet S-6: Door Schedule & Construction Notes**
- Door schedule table: type, quantity, size, location, position
- Window schedule table: type, quantity, size, location
- Accessories list: insulation, ventilation, gutters
- General construction notes
- Color specifications

### Required Elements on Every Sheet

- **Title Block**: Located in lower right corner, includes:
  - 13|7 FrameWorks company name and logo
  - Client/customer name
  - Building specifications (width, length, eave height)
  - Building type
  - Document date
  - Project address

- **Sheet Identifier**: Sheet number (S-1, S-2, etc.) and title

- **Disclaimers and Notes**:
  - "All dimensions in feet unless otherwise noted"
  - Roof pitch specification
  - Any applicable builder notes

- **Scale Indication**:
  - Graphical scale bar showing distance
  - Notation of scale ratio (e.g., 1/4" = 1')

- **Company Footer**:
  - Company name
  - Document generation timestamp
  - Page number indicator

---

## 7. Validation Rules

The plan generator enforces the following validation rules before PDF generation. Any rule violation must be flagged for senior engineer review.

### Door Placement Rules

- All doors must be positioned at least 2.5 feet from wall corners
- Door position plus door width must not exceed wall length minus 2.5 feet
- No two doors may overlap on the same wall
- Door positions are measured from the left corner (front/rear) or bottom corner (side walls) per industry standard

### Door Sizing Rules

- **Walk doors**: Fixed at 3 feet wide × 7 feet tall (3070 standard)
- **Overhead doors (width)**: 8, 10, 12, or 14 feet
- **Overhead doors (height)**: 8, 10, 12, or 14 feet
- **Height constraint**: Door height must be at least 2 feet less than eave height

### Roof Specifications

- **Roof pitch**: 3:12 (standard for all metal buildings)
- **Peak rise calculation**: (width ÷ 2) × (3 ÷ 12)
- **Peak height**: Eave height + calculated peak rise

### Concrete/Foundation Rules

- **Slab extension**: Concrete pad extends 1 foot beyond building footprint on all sides
- **Pier spacing**: Approximately 10 feet on center around building perimeter
- **Thickness**: As specified by customer (4, 5, or 6 inches)

### Dimension Verification

- All dimension chains must sum correctly to total wall lengths
- Width and length values must match customer selections
- Eave height must match customer selection
- All dimensions must display without overlapping text

---

## 8. Quality Control Checklist

Before any construction plan is delivered to a customer, a senior engineer must verify all items on this checklist. Plans failing any item must be corrected before approval.

- [ ] **Building Dimensions**: Width, length, and eave height match customer selections exactly
- [ ] **Door Accuracy**: All doors appear on correct walls at correct positions as configured
- [ ] **Door Sizing**: Door widths and heights are labeled correctly on all elevations
- [ ] **Dimension Chains**: All dimension chains add up correctly to total wall lengths
- [ ] **Height Verification**: Eave height and peak height calculations are correct
- [ ] **Concrete Specification**: Foundation type and thickness displayed correctly (if applicable)
- [ ] **Roof Plan**: Ridge direction is correct and roof pitch is noted (3:12)
- [ ] **Accessories**: Gutters shown if selected; ventilation shown if selected
- [ ] **Title Block**: Customer name and complete building specifications are correct
- [ ] **Completeness**: All 6 sheets are present and properly numbered (S-1 through S-6)
- [ ] **Scale Bar**: Scale indicator is accurate and legible on all detail sheets
- [ ] **Door Spacing**: No doors overlap; all doors respect 2.5-foot minimum clearance from corners
- [ ] **Text Quality**: No overlapping text; all dimensions and labels are legible
- [ ] **Color Application**: Building colors match customer selections on all elevations
- [ ] **Professional Appearance**: Document meets company quality standards for customer delivery

---

## 9. File Naming Convention

### Standalone Construction Plan Download
```
137-Construction-Plan-{ClientName}-{YYYY-MM-DD}.pdf
```

**Example**: `137-Construction-Plan-Smith-Farm-2025-02-14.pdf`

### Contract-Embedded Plans
When construction plans are included within a contract document, they appear as integrated sheets following the contract terms and preceding signature lines. No separate file naming convention applies; the contract filename is used for the entire document.

---

## 10. Change Management

### Plan Regeneration
- Plans are generated on-demand at the time of request (contract download or standalone download)
- Plans are **not cached** between sessions or requests
- Each plan generation reads current state from the Zustand store with localStorage persistence middleware

### Source of Truth
- The Zustand estimator store (with localStorage persistence) is the authoritative source for all building configuration data
- Previous plan versions are not archived or stored
- If customer modifications are made to building selections, plans must be regenerated to reflect current configuration
- Senior engineers must compare updated plans against previous versions to identify all changes

### Modification Workflow
1. Customer modifies building configuration in estimator
2. New plan is generated on request
3. Senior engineer reviews all sheets for accuracy
4. Plan is approved and delivered to customer
5. Previous plan versions are discarded

---

## 11. Known Limitations

The following limitations apply to the automated construction plan generator and should be documented in customer communications when relevant:

- **2D Only**: Plans are two-dimensional line drawings; no 3D renderings or perspective views are provided
- **Font Limitations**: jsPDF rendering limits fonts to Helvetica; custom typefaces are not supported
- **Door Swing Direction**: Door swing direction is not indicated in the aerial plan view; refer to elevation views for swing orientation
- **Window Positioning**: Window positions are not user-configurable within the estimator; windows appear in standard locations on elevations and are documented in the window schedule
- **Breezeway Openings**: Breezeway or opening configurations are not yet reflected in generated plans; notation may be added to construction notes as required
- **Color Display**: Colors in PDF may vary slightly from actual metal panel colors depending on printer settings and monitor calibration
- **Print Quality**: Full-color printing is recommended for best appearance; black and white printing will reduce visual clarity

---

## 12. Related Documentation

- Zustand Store Structure: `/docs/STORE-STRUCTURE.md`
- Estimator Component Documentation: `/docs/ESTIMATOR-COMPONENTS.md`
- Customer Contract Procedure: `/docs/CONTRACT-PROCEDURE-SOP.md`
- Plan Generator Technical Guide: `/docs/PLAN-GENERATOR-TECHNICAL.md`

---

**Document Version**: 1.0
**Last Updated**: February 14, 2025
**Owner**: Senior Engineering Team
**Next Review Date**: August 14, 2025

---

*This Standard Operating Procedure is the property of 13|7 FrameWorks and is intended for internal use by authorized personnel only.*
