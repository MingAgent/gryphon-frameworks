# Burnett Metal Building Sales App

A comprehensive metal building sales application for Burnett Custom Homes, featuring a guided contract signing flow with electronic signatures.

## Features

- **3-Tier Package System**: Basic, Better, and Best packages with detailed features
- **Multiple Size Options**: 3 sizes per tier (20x30, 30x40, 40x60)
- **Add-ons Wizard**: Customizable add-ons with quantity selectors including:
  - Windows
  - Walk-in Doors
  - Overhead Doors
  - Insulation Upgrades
  - Concrete Floor
  - Electrical Package
  - HVAC Rough-in
- **10-Step Guided Flow**: Intuitive step-by-step process for completing sales
- **Contract Terms**: Comprehensive legal terms split across multiple steps
- **Electronic Signatures**: Touch-enabled signature pads for both owner and contractor
- **Email Integration**: Contract delivery via EmailJS
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Vanilla JavaScript**: No frameworks, pure JavaScript
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **SignaturePad**: Touch-enabled signature capture library
- **EmailJS**: Email delivery service for contracts
- **Single HTML File**: Entire app in one file for easy deployment

## Quick Start

### Option 1: Open Directly
Simply open `index.html` in a web browser. No server required!

### Option 2: Local Development Server
For a better development experience:

```bash
# Install dependencies
npm install

# Start development server
npm start
```

This will start a local server at `http://localhost:8080` and open it in your default browser.

## GitHub Pages Deployment

This app is configured for GitHub Pages deployment:

1. Go to your repository Settings
2. Navigate to Pages section
3. Under "Source", select the branch you want to deploy (e.g., `main` or `copilot/build-metal-building-sales-app`)
4. Click Save
5. Your app will be available at: `https://<username>.github.io/<repository-name>/`

Alternatively, you can deploy using the GitHub Actions workflow.

## EmailJS Setup

To enable email functionality:

1. Sign up for a free account at [EmailJS](https://www.emailjs.com/)
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template with the following variables:
   - `{{to_email}}`
   - `{{customer_name}}`
   - `{{package_name}}`
   - `{{size_name}}`
   - `{{total_price}}`
   - `{{owner_name}}`
   - `{{contractor_name}}`
   - `{{contract_date}}`
4. Get your User ID from EmailJS dashboard
5. In `index.html`, replace `YOUR_EMAILJS_USER_ID` with your actual User ID
6. Uncomment the EmailJS sending code in the `sendContractEmail()` function
7. Replace `YOUR_SERVICE_ID` and `YOUR_TEMPLATE_ID` with your actual IDs

## Usage Guide

### Step-by-Step Process

1. **Select Package**: Choose from Basic, Better, or Best packages
2. **Select Size**: Pick building size (20x30, 30x40, or 40x60)
3. **Select Add-ons**: Add optional features with quantities
4. **Review Order**: Confirm package, size, add-ons, and total price
5. **Customer Information**: Enter contact details
6. **Contract Terms Part 1**: Read and agree to general provisions
7. **Contract Terms Part 2**: Read and agree to warranties
8. **Contract Terms Part 3**: Read and agree to final provisions
9. **Owner Signature**: Sign contract with typed name and signature pad
10. **Contractor Signature**: Contractor signs to complete the contract

### Package Details

**Basic Package** - Starting at $15,000
- 26-gauge steel panels
- Standard trim
- 20-year warranty
- Basic insulation

**Better Package** - Starting at $22,000
- 24-gauge steel panels
- Premium trim
- 30-year warranty
- Enhanced insulation
- Upgraded doors

**Best Package** - Starting at $30,000
- 22-gauge steel panels
- Designer trim options
- 40-year warranty
- Premium insulation
- Commercial-grade doors
- Custom color options

### Size Pricing

Prices are calculated based on building size:
- **20x30** (600 sq ft): Base price × 1.0
- **30x40** (1,200 sq ft): Base price × 1.8
- **40x60** (2,400 sq ft): Base price × 2.5

## File Structure

```
burnett-metal-building-closer/
├── index.html          # Main application file
├── package.json        # NPM configuration
├── README.md           # This file
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions deployment workflow
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers with touch support

## Customization

### Modifying Packages
Edit the `packages` array in `index.html`:
```javascript
const packages = [
    {
        id: 'basic',
        name: 'Basic Package',
        description: 'Essential quality for standard needs',
        features: [...],
        basePrice: 15000
    },
    ...
];
```

### Modifying Sizes
Edit the `sizes` array:
```javascript
const sizes = [
    { id: 'small', name: '20x30', sqft: 600, multiplier: 1.0 },
    ...
];
```

### Modifying Add-ons
Edit the `addons` array:
```javascript
const addons = [
    { id: 'windows', name: 'Windows', price: 350, unit: 'window' },
    ...
];
```

### Styling
The app uses Tailwind CSS. Modify the HTML classes or add custom CSS in the `<style>` section.

## Support

For issues or questions, please open an issue on GitHub.

## License

MIT License - feel free to use this for your business needs.

## Credits

Built with:
- [Tailwind CSS](https://tailwindcss.com/)
- [SignaturePad](https://github.com/szimek/signature_pad)
- [EmailJS](https://www.emailjs.com/)

---

© 2026 Burnett Custom Homes. All rights reserved.