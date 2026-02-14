# 13|7 FrameWorks Construction Plans
## Automated Architectural Drawing Generation Project Plan

**Project Name:** Standardized Construction Plan Set Development
**Version:** 1.0
**Last Updated:** February 14, 2026
**Status:** Planning Phase

---

## Executive Summary

This project establishes a systematic approach to generating professional architectural construction plan sets automatically from customer building selections in the 13|7 FrameWorks metal building estimator application. The implementation will produce standardized, production-ready drawings that meet professional architectural standards and can be integrated into customer contracts and distributed as standalone PDF documents.

---

## Objective

Develop a modular drawing engine that transforms customer building specifications into a complete six-sheet construction document set (S-1 through S-6), ensuring consistency, accuracy, and professional presentation across all building configurations.

---

## Standardized Sheet Set Definition

The construction plan set consists of six professional-grade sheets, each serving a specific purpose in communicating building design and specifications.

### Sheet S-1: Site / Aerial Plan (Top-Down Floor Plan)

**Purpose:** Provide a comprehensive overhead view of the building footprint and door/window locations.

**Content Requirements:**
- Building footprint with professional border and title block
- All door placements drawn to scale and differentiated by type:
  - Walk doors in orange
  - Overhead/roll-up doors in teal
- Complete dimension chains on all four walls:
  - Flow from drip edge → first door → subsequent doors → final drip edge
  - Each opening dimensioned individually with gaps between doors
- Overall building dimensions as outer dimension layer (width × length)
- Scale bar with ratio notation
- Comprehensive legend identifying all elements
- North arrow for site orientation
- Wall identification labels (FRONT, BACK, LEFT, RIGHT)
- Subtle 10-foot reference grid overlay inside building footprint for spatial reference

**Scale:** 1/8" = 1' (adjustable based on building size)

---

### Sheet S-2: Front & Rear Elevations

**Purpose:** Present detailed front and rear building profiles with exact door placement and height information.

**Content Requirements:**
- **Front Elevation:**
  - Gable end profile showing 3:12 roof pitch
  - Eave height dimension
  - Doors drawn to scale and proportionally positioned
  - Door type labels for identification

- **Rear Elevation:**
  - Matching format to front elevation
  - Same dimensional and labeling standards

- **Shared Features for Both Elevations:**
  - Dimension chains below each elevation showing:
    - Drip edge to first door
    - Individual door widths
    - Gaps between doors
    - Drip edge to opposite corner
  - Height dimensions on right side showing:
    - Eave height
    - Peak rise above eave
  - 4-inch concrete slab marker with crosshatch pattern (if applicable)
  - Ground line with earth hatching for reference
  - DRIP EDGE labels positioned at top corners
  - Door size callouts in clear text format (e.g., "10'×10'", "12'×12'")

**Scale:** 1/8" = 1' or 1/4" = 1' depending on building height

---

### Sheet S-3: Left & Right Elevations

**Purpose:** Display side wall profiles and door placements for complete building definition.

**Content Requirements:**
- Side wall elevation showing eave line (flat profile)
- Door placements drawn to scale
- Height dimensions matching S-2 format
- Complete dimension chains:
  - Drip edge to doors
  - Individual door widths
  - Gap measurements between doors
- 4-inch concrete slab marker with hatching (if applicable)
- Ground line with earth hatching
- All height callouts dimensioned consistently with front/rear elevations

**Scale:** 1/8" = 1' or 1/4" = 1'

---

### Sheet S-4: Roof Plan

**Purpose:** Illustrate roof structure, pitch, and selected roof-mounted components.

**Content Requirements:**
- Top-down orthographic view of complete roof
- Ridge line shown as dashed centerline
- Roof slope direction arrows indicating 3:12 pitch on all sloped surfaces
- Overall roof dimensions matching building footprint
- Gutter locations and notation (if selected by customer)
- Ventilation ridge vent locations and spacing (if selected)
- Drip edge notation clearly marked on all four sides
- Any roof penetrations or curbs noted and dimensioned

**Scale:** 1/8" = 1'

---

### Sheet S-5: Foundation / Concrete Plan

**Purpose:** Communicate foundation strategy and concrete specifications based on customer selection.

**Content Varies by Foundation Type:**

**If Concrete Slab Selected:**
- Building outline positioned on sheet
- Slab boundary dimensions (width × length)
- Concrete thickness notation (e.g., "4\" CONCRETE SLAB", "5\" SLAB", "6\" SLAB")
- #4 rebar spacing and placement note (e.g., "#4 REBAR @ 18\" O.C. EACH WAY")
- Expansion joint pattern shown with typical spacing (usually 25' intervals)
- Perimeter thickened edge detail if applicable
- Slope notation for drainage (if required)

**If Pier Foundation Selected:**
- Building outline with pier locations marked
- Pier locations positioned at perimeter (approximately every 10 feet)
- Pier diameter notation (e.g., "12\" DIA. PIER")
- Pier depth notation relative to grade (e.g., "4' DEEP")
- Grade beam or thickened edge detail at perimeter (if applicable)
- Pier spacing dimensions

**If No Foundation (Owner Responsibility):**
- Building footprint outline only
- Clear notation: "FOUNDATION BY OWNER"
- Reference to customer responsibility for site preparation

**Scale:** 1/8" = 1'

---

### Sheet S-6: Door & Window Schedule + Construction Notes

**Purpose:** Provide specifications, schedules, and general construction guidance in tabular and narrative format.

**Content Requirements:**

**Door Schedule Table:**
- Column Headers: Mark, Size (W × H), Type, Wall Location, Position from Left Edge, Quantity
- Rows for each unique door in the building
- Type identification (Walk Door, Overhead 14ga, Overhead 12ga, Wicket, etc.)
- Consistent marking system (D-1, D-2, D-3, etc.)
- Cross-reference to elevation sheets

**Window Schedule Table:**
- Column Headers: Mark, Size, Type, Wall Location, Quantity
- Rows for each window specification
- Window marking system (W-1, W-2, etc.)
- Material and frame type specifications

**General Construction Notes Section:**
- Framing system information (Steel tube, wood frame, etc.)
- Roof system and pitch specification
- Base anchoring requirements (bolt pattern, spacing)
- Building code compliance and permit requirements
- Setback requirements or site restrictions
- Wind and snow load design assumptions (if applicable)
- Material specifications and grades
- Assembly and erection notes

**Material Specifications Section:**
- Metal gauge and finish specifications
- Concrete mix design and strength (if applicable)
- Roofing material and color specifications
- Trim and gutter material specifications
- Insulation type and R-value (if applicable)
- Paint or coating specifications

---

## Project Phases

### Phase 1: Architecture & Planning
**Duration:** Concurrent with initiation
**Deliverables:**
- This project plan document
- Standard Operating Procedures (SOP) for drawing generation
- Technical specifications for all sheet types
- Quality assurance criteria

**Outcome:** Established standards and technical foundation for development

---

### Phase 2: Core Drawing Engine
**Duration:** Foundation development
**Deliverables:**
- Dimension line helpers and utilities
- Title block generation and positioning
- Professional border creation and scaling
- Annotation and callout systems
- Scaling and projection engines
- Layering and element management systems

**Outcome:** Reusable components supporting all sheet types

---

### Phase 3: Sheet Implementation
**Duration:** Sequential sheet development
**Deliverables:**
- Sheet S-1: Site/Aerial Plan generator
- Sheet S-2: Front & Rear Elevations generator
- Sheet S-3: Left & Right Elevations generator
- Sheet S-4: Roof Plan generator
- Sheet S-5: Foundation Plan generator
- Sheet S-6: Schedules and Notes generator

**Outcome:** Complete sheet set generation capability

---

### Phase 4: Functional Testing
**Duration:** 5 use case validation
**Testing Scope:**
- Small Pole Barn configuration
- Medium Workshop configuration
- Large Warehouse configuration
- Carport Style configuration
- Multi-Door Shop configuration

**Deliverables:**
- Test documentation for each use case
- Generated plan sets for review
- Bug reports and refinement recommendations

**Outcome:** Validated drawing generation across building type spectrum

---

### Phase 5: Quality Assurance & Integration
**Duration:** Final refinement and integration
**Deliverables:**
- Integration into contract PDF generation workflow
- Standalone PDF download capability
- Visual consistency review and refinement
- Professional presentation polish

**Outcome:** Production-ready system integrated into application

---

### Phase 6: Deployment
**Duration:** Release and monitoring
**Deliverables:**
- Deployment to production environment
- User documentation and training materials
- Monitoring and support procedures

**Outcome:** Live system delivering construction plans to customers

---

## Test Use Cases

The following five test cases provide comprehensive coverage of building configurations, door combinations, and foundation options.

### Test Case 1: Small Pole Barn
**Building Profile:**
- Dimensions: 30' wide × 40' long
- Eave Height: 10 feet
- Building Type: Pole barn (post frame)
- Foundation: None
- Insulation: None
- Roof Accessories: None

**Door Configuration:**
- 1 Walk door on Front wall
- 1 Overhead door 10'×10' on Front wall
- No other openings

**Validation Focus:**
- Minimal door configuration handling
- Proportional scaling for smaller buildings
- No foundation notation on S-5

---

### Test Case 2: Medium Workshop
**Building Profile:**
- Dimensions: 40' wide × 60' long
- Eave Height: 14 feet
- Building Type: Workshop
- Foundation: 4" concrete slab
- Insulation: Full wall insulation
- Roof Accessories: Gutters

**Door Configuration:**
- 2 Walk doors (1 on Front, 1 on Right wall)
- 2 Overhead doors 12'×12' (1 on Front, 1 on Back wall)

**Validation Focus:**
- Multiple wall placement with positioning logic
- Concrete slab notation and details
- Gutter notation on S-4 and elevation details
- Insulation notation in specifications
- Standard architectural presentation

---

### Test Case 3: Large Warehouse
**Building Profile:**
- Dimensions: 60' wide × 100' long
- Eave Height: 20 feet
- Building Type: Warehouse
- Foundation: 6" concrete slab
- Insulation: Full wall insulation
- Roof Accessories: Gutters, ventilation ridge vent

**Door Configuration:**
- 3 Walk doors (2 on Front, 1 on Back wall)
- 4 Overhead doors 14'×14' (2 on Front, 1 on Left, 1 on Right wall)
- Multiple windows (5-6 locations)

**Validation Focus:**
- Large building scaling and dimensioning
- Complex door placement across multiple walls
- Ridge vent notation on S-4
- Thicker concrete slab detail (6" specification)
- Window schedule completion
- Comprehensive material specifications

---

### Test Case 4: Carport Style
**Building Profile:**
- Dimensions: 50' wide × 50' long
- Eave Height: 12 feet
- Building Type: Carport/pavilion
- Foundation: Piers (no slab)
- Insulation: None
- Roof Accessories: None

**Door Configuration:**
- No walk doors
- 1 Overhead door 10'×8' on Front wall

**Validation Focus:**
- Pier foundation notation on S-5
- Minimal door configuration
- Open-sided building representation
- Foundation by owner considerations

---

### Test Case 5: Multi-Door Shop
**Building Profile:**
- Dimensions: 40' wide × 40' long
- Eave Height: 16 feet
- Building Type: Service shop
- Foundation: 5" concrete slab
- Insulation: Wall insulation only
- Roof Accessories: Gutters, ventilation ridge vent

**Door Configuration:**
- 1 Walk door on Left wall
- 3 Overhead doors 10'×10' (2 on Front, 1 on Right wall)

**Validation Focus:**
- Multiple overhead doors on single wall
- Asymmetric door distribution
- 5" slab specification variant
- Mixed insulation specification
- Proportional dimension chain spacing
- Professional presentation completeness

---

## Customer Selection → Plan Mapping

This section documents how customer selections made during the building configuration process directly impact the generated construction plans.

### Building Dimensions (Width × Length)

**Customer Selection:** Building width and length in feet

**Impact on Plans:**
- **Sheet S-1:** Determines overall scale of floor plan, affects scale bar ratio selection, influences grid spacing visibility
- **Sheets S-2 & S-3:** Width and length drive dimension chain lengths, affect horizontal dimensioning layout
- **Sheet S-4:** Roof plan footprint dimensions match building footprint exactly
- **Sheet S-5:** Foundation plan overall dimensions and slab area calculations

**Technical Implementation:** All dimension chains and overall callouts calculated from selected width/length values

---

### Eave Height

**Customer Selection:** Height from grade to building eave in feet

**Impact on Plans:**
- **Sheets S-2 & S-3:** Eave height shown as primary vertical dimension on right side of each elevation
- **Sheet S-1:** No direct impact (top-down view), but validates door clearance compatibility
- **Elevation Presentations:** Proportional building profile rendering based on eave height-to-width ratio
- **Door Placement Validation:** Ensures selected door heights fit within eave height constraint

**Technical Implementation:** Eave height controls vertical scaling on all elevation views, proportionally renders roofline at 3:12 pitch

---

### Building Type (Pole Barn / Bolt-Up / Carport)

**Customer Selection:** Structural system selected during configuration

**Impact on Plans:**
- **Sheet S-6 Notes Section:** Building type determines framing system descriptions and material specifications
- **Material Specifications:** Type selection drives steel gauge, connection detail requirements, and base anchoring system descriptions
- **General Notes:** Building code applicability and special construction considerations vary by type
- **Foundation Notes:** Type selection may influence recommended foundation approach

**Technical Implementation:** Template selection for construction notes and material specifications based on building type code

---

### Door Selections (Type, Size, Wall, Position)

**Customer Selection:** Each door added includes: type (walk/overhead), size (W × H), wall location (Front/Back/Left/Right), and position from wall edge

**Impact on Plans:**
- **Sheet S-1:** Door symbol placement at specified position on selected wall, correct color coding (orange walk/teal overhead)
- **Sheet S-2 (Front & Rear):** Front wall doors positioned in front elevation, rear wall doors in rear elevation, proportional rendering
- **Sheet S-3 (Left & Right):** Left and right wall doors positioned in respective side elevations
- **Elevation Sheets (All):** Dimension chains calculate gaps between doors, drip edge spacing, showing all door widths and positions
- **Door Schedule (S-6):** Row entry for each unique door with mark number (D-1, D-2, etc.), size, type, wall, position, and quantity
- **Overall Validation:** Door dimensions validated against eave height for clearance

**Technical Implementation:** Door data structure contains wall location, position offset, size, and type; elevation generators position proportionally; schedule generator tabulates all doors with unique marking

---

### Window Selections

**Customer Selection:** Each window added includes: size, wall location, and position on selected wall

**Impact on Plans:**
- **Sheet S-1:** Window symbol placement on selected wall at specified position
- **Elevation Sheets (S-2, S-3):** Window representation in relevant elevations showing proportional sizing and positioning
- **Window Schedule (S-6):** Table row for each unique window type with mark number (W-1, W-2, etc.), size, wall, and quantity
- **Building Presentation:** Windows contribute to professional appearance of elevation drawings

**Technical Implementation:** Window data structure tracks wall, position, and size; elevation generators render proportionally; schedule generator lists all windows with unique marks

---

### Concrete Type (Slab / Piers / None)

**Customer Selection:** Foundation strategy selected from three options

**Impact on Plans:**
- **Sheet S-5 Entirely:** Content structure determined by this selection:
  - **Slab Selected:** Shows slab dimensions, thickness callout, rebar pattern, expansion joint spacing, perimeter detail
  - **Piers Selected:** Shows pier locations, spacing, diameter notation, depth specification, perimeter beam detail
  - **None Selected:** Shows building footprint outline with "FOUNDATION BY OWNER" notation
- **Elevation Sheets (S-2, S-3):** Slab option adds 4" (or specified thickness) slab marker with hatching below building line
- **Building Compatibility:** Foundation type affects structural assumptions documented in construction notes

**Technical Implementation:** Foundation type controls S-5 template selection; elevation template selection includes or excludes slab notation

---

### Concrete Thickness (4", 5", 6")

**Customer Selection:** Slab thickness when concrete slab foundation selected

**Impact on Plans:**
- **Sheet S-5:** Thickness callout shown in foundation plan notation (e.g., "4\" CONCRETE SLAB", "5\" SLAB")
- **Elevation Sheets (S-2, S-3):** Slab marker height proportionally adjusted, thickness value shown below building line
- **Construction Notes (S-6):** Concrete specifications section includes thickness, rebar size and spacing, and compressive strength requirements
- **Rebar Notation:** Rebar specifications may vary slightly by thickness (e.g., smaller spacing for thicker slabs)

**Technical Implementation:** Thickness value stored, dimension callouts formatted with selected value, elevation slab marker height calculation includes thickness parameter

---

### Insulation Selection (None / Wall Only / Full)

**Customer Selection:** Insulation coverage and type selected

**Impact on Plans:**
- **Sheet S-6 Material Specifications:** Insulation type, R-value, and coverage documented in text section
- **General Notes Section:** Installation and performance specifications for selected insulation type
- **No Direct Drawing Impact:** Insulation selection does not affect geometric drawing elements but affects specification documentation

**Technical Implementation:** Insulation type and coverage trigger inclusion of specific text blocks in material specifications section

---

### Gutters Selection (Included / Not Included)

**Customer Selection:** Gutter system selected

**Impact on Plans:**
- **Sheet S-4 (Roof Plan):** If selected, gutter locations shown and labeled around roof perimeter
- **Elevation Sheets (S-2, S-3):** If selected, gutter detail shown at eave line with notation
- **Material Specifications (S-6):** If selected, gutter material, gauge, color, and finish specifications included
- **General Notes:** If selected, gutter installation and drainage notes included

**Technical Implementation:** Gutter flag enables/disables gutter detail elements on roof plan and elevation sheets, triggers material specification text inclusion

---

### Ventilation Ridge Vent Selection (Included / Not Included)

**Customer Selection:** Roof ventilation system selected

**Impact on Plans:**
- **Sheet S-4 (Roof Plan):** If selected, ridge vent shown as dashed line along roof ridge with spacing notation (typically 24" O.C.)
- **Elevation Sheets:** Ridge vent detail visible at roof peak
- **General Notes (S-6):** If selected, ventilation system specifications and maintenance notes included
- **Material Specifications:** Ridge vent material, color, and installation requirements documented

**Technical Implementation:** Ventilation flag enables/disables ridge vent notation on S-4 and elevation details, triggers specification text inclusion

---

### Color Selection (Metal Finish)

**Customer Selection:** Building exterior color/finish selected from available options

**Impact on Plans:**
- **Material Specifications (S-6):** Color name and finish specification clearly noted (e.g., "Charcoal Gray Polyester Coating")
- **Construction Notes:** Color notation for identification and specification purposes
- **No Geometric Impact:** Color selection does not affect drawing geometry or dimensions

**Technical Implementation:** Selected color/finish text inserted into material specifications section for communication purposes

---

## Quality Assurance Criteria

All generated construction plan sets must meet the following professional standards:

### Dimensional Accuracy
- All dimensions automatically calculated from customer input values
- Dimension chains verified to sum correctly to overall dimensions
- Door and window positions validated against specified offsets
- No manual dimension entry or adjustment required

### Professional Presentation
- Clean, consistent line weights and styles across all sheets
- Professional title blocks and borders on each sheet
- Consistent text sizing and font selection
- Proper symbol usage and legend completeness

### Completeness
- All six sheets generated and populated for every plan set
- Door schedule includes all doors; window schedule includes all windows
- Construction notes appropriate to building type and selections
- Material specifications comprehensive and accurate

### Scalability
- Drawings scale appropriately for building size (small to large)
- Text and symbols remain legible at printed scales
- Dimension placement avoids overlaps and conflicts
- Scale bar accurate for chosen scale ratio

### Consistency
- Identical door/window presentations across all relevant sheets
- Consistent dimensioning conventions across all sheets
- Consistent notation and labeling standards
- Matching line work and drafting standards across sheet set

---

## Document Control

**Document Owner:** 13|7 FrameWorks Development Team
**Last Revised:** February 14, 2026
**Version:** 1.0 (Initial Planning Phase)
**Classification:** Project Planning / Internal Use

---

## Appendix: Sheet Quick Reference

| Sheet | Purpose | Primary Content |
|-------|---------|-----------------|
| S-1 | Site/Aerial Plan | Footprint, door/window locations, dimensions, scale bar, north arrow |
| S-2 | Front & Rear Elevations | Building profile, doors, heights, slab detail, door callouts |
| S-3 | Left & Right Elevations | Side wall profile, doors, heights, slab detail, dimensions |
| S-4 | Roof Plan | Roof outline, ridge line, pitch arrows, gutters, vents, dimensions |
| S-5 | Foundation Plan | Slab/pier details, thickness, dimensions, or owner responsibility note |
| S-6 | Schedules & Notes | Door/window tables, material specs, construction notes, site info |

---

**End of Document**
