# Massage2Wellness Website

A complete massage therapy business website with online booking system and admin dashboard.

## Features

### Client-Facing Features
- **Homepage**: Relaxing design with hero section, service previews, and about section
- **Services Page**: Detailed service descriptions, pricing, and package deals
- **About Page**: Business story, team information, and customer testimonials
- **Contact Page**: Contact information, interactive contact form, and FAQ section
- **Online Booking System**: 4-step booking process with service selection, date/time picker, customer details, and payment options
- **Role-Based Login**: Separate client and admin access with different features
- **Client Portal**: Personal dashboard for customers to manage appointments and view wellness journey

### Admin Features
- **Dashboard**: Overview stats, quick actions, and recent activity
- **Booking Management**: View, edit, and manage all bookings with filtering options
- **Customer Management**: Customer database with booking history
- **Message Management**: Handle contact form submissions
- **Settings**: Business hours, pricing, and data management
- **Tablet Optimization**: Admin interface specifically designed for tablet use
- **Settings**: Business hours, pricing, and data management

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Components**: Reusable navigation and footer components
- **Authentication**: Role-based login system (Client/Admin)
- **Storage**: LocalStorage (for demo purposes)
- **Fonts**: Google Fonts (Playfair Display, Open Sans)
- **Icons**: Font Awesome
- **Design**: Responsive, mobile-first approach with component architecture

## File Structure

```
├── index.html              # Homepage
├── services.html           # Services and pricing page
├── about.html             # About us page
├── contact.html           # Contact page
├── booking.html           # Online booking system
├── login.html             # Role-based login page
├── client-portal.html     # Client dashboard
├── admin.html             # Admin dashboard
├── components/
│   ├── nav.html           # Reusable navigation component
│   └── footer.html        # Reusable footer component
├── styles/
│   └── main.css           # Main stylesheet (includes login & portal styles)
└── scripts/
    ├── main.js            # Core functionality
    ├── components.js      # Component loader system
    ├── contact.js         # Contact form handling
    ├── booking.js         # Booking system logic
    ├── login.js           # Authentication system
    ├── client-portal.js   # Client dashboard functionality
    └── admin.js           # Admin dashboard functionality
```

## Design Features

### Color Scheme

- Primary: #8B7355 (Warm brown)
- Secondary: #A69180 (Light brown)
- Accent: #D4C4B0 (Cream)
- Background: #FAF9F7 (Off-white)

### Typography

- Headings: Playfair Display (serif)
- Body: Open Sans (sans-serif)

### Responsive Design

- Mobile-first approach
- Tablet optimized for admin use
- Touch-friendly interface
- Optimized for various screen sizes

## Setup Instructions

1. **Local Development**:

   - Open `index.html` in a web browser
   - No server setup required for basic functionality

2. **Demo Login Credentials**:

   - **Client Access**:
     - Email: `client@demo.com`
     - Password: `client123`
   - **Admin Access**:
     - Email: `admin@massage2wellness.com`
     - Password: `admin123`

3. **Testing the System**:
   - Click "Login" in navigation to access role-based portals
   - Use booking system to create test appointments
   - Admin can manage all bookings and customer data

## Key Components

### Booking System

- Service selection with add-ons
- Date and time availability checking
- Customer information collection
- Payment method selection (placeholder for integration)
- Booking confirmation and storage

### Admin Dashboard

- Real-time booking statistics
- Booking management with status updates
- Customer database and search
- Contact message management
- Business settings configuration

### Data Storage

- LocalStorage for bookings and messages
- Simple JSON structure for easy data management
- Export functionality for data backup

## Mobile & Tablet Optimization

The website is specifically optimized for tablet use in the admin dashboard:

- Touch-friendly buttons (minimum 44px touch targets)
- Responsive grid layouts
- Optimized navigation for tablet screens
- Easy-to-use booking interface on mobile devices

## Future Enhancements

- Real payment processing integration
- Email notification system
- Calendar integration
- Advanced reporting features
- Multi-language support
- SEO optimization

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is created for demonstration purposes. All rights reserved to Massage2Wellness.
---

**Note**: This is a demo website using LocalStorage for data persistence. In a production environment, you would need to integrate with a backend database and payment processing system.
