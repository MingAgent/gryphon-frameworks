# 13|7 FrameWorks Application

A tablet-friendly sales application for 13|7 FrameWorks metal building quotes and contract signing.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## Overview

This is a complete sales tool designed for in-person customer meetings. Sales representatives can walk customers through building selection, add-ons, and a legally-binding contract signing process—all on a tablet or laptop.

## Features

### Quote Builder
- **3 Building Levels**: Basic (Pole Barn), Better (I-Beam), Best (Bolt-Up)
- **3 Sizes Per Level**: 30'×40', 40'×50', 40'×60'
- **Add-Ons Wizard**: Doors, windows, gutters, insulation with quantity controls
- **Real-time Pricing**: Total updates instantly as selections change

### 10-Step Guided Contract Signing
1. **Customer Information** - Name, contact, property address
2. **Change Orders** - $250 fee acknowledgment
3. **Delays & Force Majeure** - Weather, materials, labor
4. **Payment Terms** - 50/25/25 schedule with late fees
5. **Warranties** - 1-year coverage terms
6. **Arbitration Agreement** - Binding arbitration clause
7. **Jury Trial Waiver** - Express waiver
8. **RCLA Notice** - Texas Property Code Ch. 27
9. **Contract Review** - Contractor certification
10. **Signatures** - Dual signature capture

### Signature Capture
- Touch-enabled signature pads (finger/stylus)
- Typed name fields for both parties
- Works on tablets, phones, and desktops

### Email Delivery
- Sends contract summary to customer email
- Sends copy to contractor (bobby@burnettcustoms.net)
- Supports EmailJS integration or mailto fallback

## Tech Stack

- **Vanilla JavaScript** - No framework dependencies
- **Tailwind CSS** - Via CDN for styling
- **HTML5 Canvas** - For signature capture
- **EmailJS** - Optional email delivery service

## Quick Start

### Option 1: GitHub Pages (Recommended)
Simply visit: `https://mingagent.github.io/burnett-metal-building-closer`

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/MingAgent/burnett-metal-building-closer.git
cd burnett-metal-building-closer

# Install dependencies (optional, for local server)
npm install

# Start local server
npm start

# Open http://localhost:3000 in your browser
```

### Option 3: Direct File
Just open `index.html` in any modern web browser.

## Email Configuration (Optional)

To enable automatic email delivery instead of mailto links:

1. Sign up at [EmailJS](https://www.emailjs.com/) (free tier: 200 emails/month)
2. Create an email service and template
3. Update the config in `index.html`:

```javascript
const EMAILJS_PUBLIC_KEY = 'your_public_key';
const EMAILJS_SERVICE_ID = 'your_service_id';
const EMAILJS_TEMPLATE_ID = 'your_template_id';
```

## Contract Terms Included

This application includes the complete 13|7 FrameWorks residential construction contract:

- **Change Order Policy**: $250 per request, $150/hr disruption fee
- **Payment Schedule**: 50% deposit, 25% mid-construction, 25% final
- **Late Payment**: 10% fee + 10% every 72 hours
- **Warranties**: 1 year workmanship, electrical, plumbing, structural
- **Dispute Resolution**: Mediation → Binding Arbitration
- **Jury Waiver**: Express waiver of jury trial rights
- **RCLA Compliance**: Texas Property Code Chapter 27

## Browser Support

- Chrome 80+
- Safari 13+
- Firefox 75+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome for Android)

## File Structure

```
burnett-metal-building-closer/
├── index.html      # Main application (single-file)
├── README.md       # This file
├── package.json    # NPM config for local dev
├── LICENSE         # MIT License
└── .gitignore      # Git ignore rules
```

## Customization

### Pricing
Edit the `PACKAGES` and `ADDONS` objects in `index.html`:

```javascript
const PACKAGES = {
  L1: { name: 'Level 1 - Basic', desc: 'Pole Barn Weld-Up', color: '#3b82f6',
    sizes: {
      '30x40x10': { label: "30' × 40' × 10'", price: 18500 },
      // ... add more sizes
    }},
  // ... add more levels
};
```

### Contractor Info
Search for "13|7 FrameWorks" and "bobby@burnettcustoms.net" to update company details.

### Contract Terms
All legal language is in the `renderSectionContent()` function. Consult your attorney before making changes.

## Deployment

### GitHub Pages
1. Go to repository Settings → Pages
2. Source: Deploy from branch
3. Branch: main, folder: / (root)
4. Save and wait ~1 minute
5. Access at `https://[username].github.io/burnett-metal-building-closer`

### Netlify
1. Connect your GitHub repository
2. Build command: (leave empty)
3. Publish directory: `/`
4. Deploy

### Vercel
1. Import from GitHub
2. Framework: Other
3. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For questions or issues:
- Open a GitHub Issue
- Contact: josh@mingma.io

## Credits

Built with assistance from Claude AI for 13|7 FrameWorks, LLC.

---

**13|7 FrameWorks, LLC**
5416 SW Moody St., Victoria, TX 77905
