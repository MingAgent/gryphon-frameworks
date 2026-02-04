# Application Flow Demo

This document describes the complete user flow through the Burnett Metal Building Sales application.

## User Journey (10 Steps)

### Step 1: Package Selection
- User views three package tiers side-by-side
- Each card shows features and starting price
- Clicking a package advances to Step 2

**Packages:**
- **Basic** - Starting at $15,000
- **Better** - Starting at $22,000  
- **Best** - Starting at $30,000

### Step 2: Size Selection
- User sees selected package name
- Three size options displayed with calculated prices
- Price adjusts based on package and size multiplier

**Sizes:**
- 20x30 (600 sq ft)
- 30x40 (1,200 sq ft)
- 40x60 (2,400 sq ft)

### Step 3: Add-ons Selection
- Interactive list of 7 optional add-ons
- Each has +/- quantity buttons
- Real-time quantity display
- Users can add multiple of each item

### Step 4: Order Review
- Complete summary of selections
- Package + Size with price
- All selected add-ons with quantities and prices
- **Total price prominently displayed**

### Step 5: Customer Information
- Full Name (required)
- Email Address (required, validated)
- Phone Number (required)
- Address (required, textarea)

### Step 6: Contract Terms - General Provisions
- Scrollable legal text covering:
  - Scope of Work
  - Pricing and Payment
  - Timeline
- Required checkbox to agree

### Step 7: Contract Terms - Warranties
- Scrollable legal text covering:
  - Warranties
  - Permits and Inspections
  - Site Preparation
  - Changes and Modifications
- Required checkbox to agree

### Step 8: Contract Terms - Final Provisions
- Scrollable legal text covering:
  - Cancellation Policy
  - Liability and Insurance
  - Dispute Resolution
  - Entire Agreement Clause
- Required checkbox to agree

### Step 9: Owner Signature
- Typed full name field (required)
- Touch/mouse-enabled signature pad
- Clear signature button
- Date field (defaults to today)
- Validation ensures all fields completed

### Step 10: Contractor Signature
- Same format as Step 9
- Typed full name for contractor
- Contractor signature pad
- Date field
- "Complete & Send" button

### Completion
- Contract data compiled
- Email sent via EmailJS (when configured)
- Success modal appears
- "Start New Contract" button to reset

## Navigation
- **Previous Button** - Go back to previous step (disabled on Step 1)
- **Next Button** - Advance to next step (validates current step)
- **Progress Bar** - Visual indicator showing current position

## Features

### Real-time Validation
- Email format checking
- Required field validation
- Signature presence checking
- Checkbox confirmation verification

### Price Calculation
- Base price = Package price × Size multiplier
- Add-ons = Sum of (Add-on price × Quantity)
- Total = Base price + Add-ons total

### Responsive Design
- Works on desktop, tablet, and mobile
- Touch-optimized signature pads
- Mobile-friendly form layouts

### Professional Appearance
- Clean, modern UI
- Burnett Custom Homes branding
- Blue color scheme
- Card-based layouts
- Hover effects and transitions

## Technical Notes

### Libraries Used
- **Tailwind CSS** - Utility-first styling
- **SignaturePad** - Touch signature capture
- **EmailJS** - Email service integration

### Browser Requirements
- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection (for CDN resources)
- Touch or mouse input

### Data Flow
1. User makes selections (stored in JavaScript state)
2. Each step validates before proceeding
3. Final step compiles all data
4. Data formatted for email
5. EmailJS sends contract
6. Success confirmation shown

### Security Considerations
- No sensitive data stored locally
- Email uses EmailJS secure service
- Signature images encoded as base64
- Form validation on all inputs

## Customization Options

Easily customizable via JavaScript arrays:
- Package tiers and pricing
- Size options and multipliers
- Add-on items and prices
- Contract legal terms
- Email template

See README.md for detailed customization instructions.
