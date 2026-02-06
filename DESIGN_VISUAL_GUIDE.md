# 🎨 CropGuard AI - Visual Design Guide

## Civora Nexus Brand Kit Implementation

---

## 🎯 Brand Colors

### Primary Brand Color
```
Color Name: Teal (Primary)
Hex Code:   #1B9AAA
RGB:        (27, 154, 170)
Usage:      Buttons, links, primary UI elements, section borders
```

### Secondary Brand Color
```
Color Name: Dark Teal (Primary Dark)
Hex Code:   #16808D
RGB:        (22, 128, 141)
Usage:      Headers, footer, dark sections, gradients
```

### Accent Color
```
Color Name: Light Teal
Hex Code:   #4DB8C4
RGB:        (77, 184, 196)
Usage:      Hover states, light accents, interactive elements
```

---

## 🎨 Status Colors

### Alert Colors
```
Success:   #22C55E  (Green)    - Low severity, positive actions
Warning:   #FF8C00  (Orange)   - Medium severity, cautions
Danger:    #EF4444  (Red)      - High severity, critical issues
Info:      #3B82F6  (Blue)     - Informational messages
```

---

## 📐 Design Specifications

### Typography
```
Font Family:  Segoe UI, Tahoma, Geneva, Verdana, sans-serif
Base Size:    16px (desktop), 14px (mobile)
Line Height:  1.6 (body), 1.4 (headings)

Heading Sizes:
  H1: 2rem    (32px)
  H2: 1.75rem (28px)
  H3: 1.2rem  (19px)
  H4: 1.1rem  (18px)
  Body: 1rem  (16px)
```

### Spacing Units
```
Extra Small:  0.25rem (4px)
Small:        0.5rem  (8px)
Medium:       1rem    (16px)
Large:        1.5rem  (24px)
Extra Large:  2rem    (32px)
2X Large:     3rem    (48px)
```

### Border Radius
```
Small:   0.375rem (6px)   - Small elements, inputs
Medium:  0.5rem   (8px)   - Standard elements
Large:   0.75rem  (12px)  - Sections, cards
Extra:   1rem     (16px)  - Major containers
```

---

## 🎭 Visual Effects

### Shadows (Elevation)
```
Level 1 (sm):   0 1px 2px rgba(0,0,0,0.05)     - Subtle
Level 2 (md):   0 4px 6px rgba(0,0,0,0.1)      - Standard cards
Level 3 (lg):   0 10px 15px rgba(0,0,0,0.1)    - Elevated sections
Level 4 (xl):   0 20px 25px rgba(0,0,0,0.1)    - Maximum elevation
```

### Animations & Transitions
```
Fast:    150ms ease-in-out   - Quick interactions
Normal:  300ms ease-in-out   - Standard transitions
Slow:    500ms ease-in-out   - Noticed animations

Animation Effects:
  - Float:    Logo continuously floats up/down
  - Pulse:    Attention-grabbing fade effect
  - Slide-in: Alerts enter from the side
  - Fade-in:  Elements smoothly appear
```

---

## 🖼️ Component Styling

### Headers
```
Style:       Gradient (Teal → Dark Teal)
Text Color:  White
Padding:     Generous (24-32px)
Shadow:      Large elevation
Position:    Sticky (stays on top)
Content:     Logo, company name, branding
```

### Buttons
**Primary Button**
```
Background:  Gradient (Teal → Dark Teal)
Text:        White
Padding:     12px 24px
Border:      None
Shadow:      Medium
Hover:       Enhanced shadow + upward motion
```

**Secondary Button**
```
Background:  Light / Transparent
Border:      2px Teal
Text:        Teal
Padding:     12px 24px
Hover:       Teal background + white text
```

### Cards & Sections
```
Background:  White or subtle gradient
Border:      Left border (4px) in Teal
Padding:     24px
Shadow:      Medium elevation
Hover:       Enhanced shadow + slight lift
Radius:      12px corners
```

### Form Inputs
```
Border:      2px solid Light Gray
Background:  White
Padding:     12px
Focus:       Teal border + glow effect
Hover:       Light Teal border
Radius:      8px
Font:        14-16px sans-serif
```

### Alerts
**Critical (Red)**
```
Background:  Linear gradient (Light Red)
Border:      5px left (Red)
Text:        Dark Gray
Icon:        Emoji or icon
Animation:   Slide in from left
```

**Warning (Orange)**
```
Background:  Linear gradient (Light Orange)
Border:      5px left (Orange)
Text:        Dark Gray
Icon:        Emoji or icon
Animation:   Slide in from left
```

**Info (Blue)**
```
Background:  Linear gradient (Light Blue)
Border:      5px left (Blue)
Text:        Dark Gray
Icon:        Emoji or icon
Animation:   Slide in from left
```

---

## 📱 Responsive Breakpoints

### Desktop (1200px+)
```
Layout:      Full width, multi-column grids
Map:         400px height
Forms:       Multiple columns
Spacing:     Full spacing scale
Font:        16px base
```

### Tablet (768px - 1199px)
```
Layout:      Adjusted grid, 2 columns
Map:         350px height
Forms:       1-2 columns
Spacing:     Moderate spacing
Font:        16px base
```

### Mobile (480px - 767px)
```
Layout:      Single column
Map:         300px height
Forms:       Single column
Spacing:     Reduced spacing
Font:        14px base
```

### Small Mobile (< 480px)
```
Layout:      Full-width single column
Map:         250px height
Forms:       Full-width inputs
Spacing:     Minimal spacing
Font:        14px base (reduced)
Buttons:     Larger touch targets
```

---

## 🎨 Color Usage Examples

### Page Sections
```
Header:      Dark Teal gradient background
Main:        Light gray-blue background (#F8FAFC)
Sections:    White with teal accent borders
Footer:      Dark Teal gradient matching header
```

### Interactive Elements
```
Primary Action:    Teal button (gradient)
Secondary Action:  Light button with teal border
Hover States:      Light Teal color changes
Active States:     Dark Teal with shadow
Disabled:          50% opacity, not-allowed cursor
```

### Data Visualization
```
High Severity:     Red (#EF4444)
Medium Severity:   Orange (#FF8C00)
Low Severity:      Green (#22C55E)
Informational:     Blue (#3B82F6)
```

### Form States
```
Normal:      Light gray border
Focus:       Teal border + soft glow
Error:       Red border + error message
Success:     Green border + confirmation
Disabled:    Gray border + disabled styling
```

---

## 🎯 Design Tokens Reference

### Color Tokens
```
--primary-color:      #1B9AAA  (Main brand)
--primary-dark:       #16808D  (Dark variant)
--primary-light:      #4DB8C4  (Light variant)
--success-color:      #22C55E  (Success green)
--warning-color:      #FF8C00  (Warning orange)
--danger-color:       #EF4444  (Danger red)
--info-color:         #3B82F6  (Info blue)
--dark-color:         #142C52  (Dark blue-gray)
--text-color:         #1F2937  (Body text)
--text-light:         #6B7280  (Secondary text)
--light-color:        #F8FAFC  (Background)
--border-color:       #E5E7EB  (Borders)
```

### Spacing Tokens
```
--spacing-xs:    0.25rem  (4px)
--spacing-sm:    0.5rem   (8px)
--spacing-md:    1rem     (16px)
--spacing-lg:    1.5rem   (24px)
--spacing-xl:    2rem     (32px)
--spacing-2xl:   3rem     (48px)
```

### Typography Tokens
```
--font-family:           Segoe UI, Tahoma...
--font-size-base:        16px
--font-weight-normal:    400
--font-weight-medium:    500
--font-weight-bold:      700
```

### Effect Tokens
```
--shadow-sm:  0 1px 2px rgba(0,0,0,0.05)
--shadow-md:  0 4px 6px rgba(0,0,0,0.1)
--shadow-lg:  0 10px 15px rgba(0,0,0,0.1)
--shadow-xl:  0 20px 25px rgba(0,0,0,0.1)
```

---

## 📐 Grid System

### Desktop Grid
```
Max Width:     1200px
Padding:       24px sides
Column Gap:    24px
Row Gap:       24px
Columns:       3-4 auto-fit
```

### Tablet Grid
```
Max Width:     Full width
Padding:       16px sides
Column Gap:    16px
Row Gap:       16px
Columns:       2 auto-fit
```

### Mobile Grid
```
Max Width:     Full width
Padding:       12px sides
Column Gap:    12px
Row Gap:       12px
Columns:       1 (single column)
```

---

## ✨ Animation Effects

### Logo Float Animation
```
Duration:     3 seconds
Easing:       ease-in-out
Motion:       Up/down 10px continuously
Effect:       Draws attention to header
```

### Button Hover Animation
```
Duration:     300ms
Easing:       ease-in-out
Motion:       Upward 2px
Shadow:       Enhanced
Cursor:       pointer
```

### Card Hover Animation
```
Duration:     300ms
Easing:       ease-in-out
Transform:    Upward 4px
Shadow:       Increased elevation
Cursor:       default
```

### Alert Slide-In Animation
```
Duration:     300ms
Easing:       ease-in-out
Direction:    From left
Opacity:      0 to 1
Transform:    -20px to 0
```

---

## 🎯 Branding Checklist

✅ Civora Nexus colors implemented
✅ Professional typography system
✅ Consistent spacing throughout
✅ Clear visual hierarchy
✅ Smooth animations and transitions
✅ Responsive on all devices
✅ Accessibility considerations
✅ Modern, polished appearance
✅ Company attribution visible
✅ All interactive elements styled

---

## 📋 CSS Class Reference

### Layout Classes
```
.container          - Main content wrapper
.section            - Content sections
.section-header     - Section title area
.header             - Top navigation bar
.footer             - Bottom section
```

### Button Classes
```
.btn              - Base button styles
.btn-primary      - Primary action button
.btn-secondary    - Secondary action button
.btn-danger       - Destructive action button
.btn-success      - Positive action button
```

### Form Classes
```
.form-group       - Form input group
.form-grid        - Grid layout for forms
.input            - Input field styling
```

### Card Classes
```
.report-card      - Data report card
.recommendation-card - Recommendation card
```

### Alert Classes
```
.alert            - Base alert style
.alert-critical   - High severity alert
.alert-warning    - Medium severity alert
.alert-info       - Low severity alert
```

### Utility Classes
```
.text-center      - Center text alignment
.text-primary     - Primary color text
.text-dark        - Dark color text
.text-light       - Light color text
.bg-primary       - Primary background
.bg-light         - Light background
.hidden           - Display: none
.mt-* / .mb-*     - Margin top/bottom
.p-*              - Padding
```

---

## 🎨 Design Resources

### Font
- Primary: Segoe UI (system font)
- Fallback: Tahoma, Geneva, Verdana, sans-serif

### Icons
- Emoji icons (built-in, no dependencies)
- SVG logos (custom brand logos)

### Images
- Civora Nexus logo
- CropGuard branding
- Product screenshots

---

## 📱 Mobile-First Approach

Design prioritizes:
1. Mobile devices (base styles)
2. Enhanced for tablets (768px+)
3. Optimized for desktop (1200px+)

All components:
- Touch-friendly sizing (44px minimum)
- Clear tap targets
- Readable on small screens
- Optimized for performance

---

## ✅ Quality Standards

### Accessibility (WCAG AA)
- Color contrast: 4.5:1 minimum for text
- Focus indicators: Clear and visible
- Keyboard navigation: Fully supported
- Semantic HTML: Proper structure

### Performance
- CSS loading: < 50KB
- Animation performance: 60fps
- Responsive images: Optimized
- No render-blocking resources

### Browser Support
- Modern browsers: Chrome, Firefox, Safari, Edge
- Mobile browsers: iOS Safari, Chrome Mobile
- Fallbacks: For older browsers

---

**Design System: Civora Nexus Pvt. Ltd.**
**Project: CropGuard AI**
**Specification Date: January 22, 2026**
