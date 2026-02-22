# AutoRepara - Panduan SEO & Deployment

## 🎯 Checklist SEO Pre-Launch

### 1. Environment Variables
```env
# Production URLs
NEXT_PUBLIC_BASE_URL=https://www.autorepara.mx

# Google Verification
GOOGLE_SITE_VERIFICATION=your-google-verification-code

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

### 2. Google Search Console Setup

**A. Verify Website Ownership**
1. Go to https://search.google.com/search-console
2. Add property: www.autorepara.mx
3. Verification method pilih salah satu:
   - HTML tag (already in layout.tsx)
   - Google Analytics
   - DNS verification

**B. Submit Sitemap**
1. Setelah verified, go to "Sitemaps"
2. Submit: `https://www.autorepara.mx/sitemap.xml`
3. Submit: `https://www.autorepara.mx/es/sitemap.xml` (if separate)

**C. Request Indexing**
Submit these important pages untuk indexing cepat:
- Homepage: `/`
- About: `/about`
- Contact: `/contact`
- Partnership: `/partnership`
- Search: `/search`

### 3. Google Business Profile

**Create Business Listing:**
1. Go to https://business.google.com
2. Create profile untuk ketiga kantor:

**CDMX Office:**
```
Business Name: AutoRepara - Oficina Principal
Category: Business Consulting Service / Auto Repair Directory
Address: Avenida Paseo de la Reforma 505, Cuauhtémoc, 06500, CDMX
Phone: +52 (55) 5000-0000
Website: https://www.autorepara.mx
Hours: Mon-Fri 9:00-18:00, Sat 9:00-14:00
```

**Guadalajara Office:**
```
Business Name: AutoRepara Guadalajara
Category: Business Consulting Service
Address: Av. Chapultepec 480, Americana, 44160, Jalisco
Phone: +52 (33) 3000-0000
```

**Monterrey Office:**
```
Business Name: AutoRepara Monterrey
Category: Business Consulting Service
Address: Av. Constitución 1075, Centro, 64000, Nuevo León
Phone: +52 (81) 8000-0000
```

### 4. Bing Webmaster Tools

1. Go to https://www.bing.com/webmasters
2. Add site: www.autorepara.mx
3. Verify ownership
4. Submit sitemap: `https://www.autorepara.mx/sitemap.xml`

### 5. Social Media Setup

**A. Facebook Business Page**
```
Page Name: AutoRepara México
Category: Automotive Repair Shop / Internet Company
About: Directorio líder de talleres mecánicos certificados en México
Website: https://www.autorepara.mx
Phone: +52 (55) 5000-0000
Email: info@autorepara.mx
```

**B. Instagram Business**
```
Username: @autoreparamx
Bio: 🚗 Directorio #1 de Talleres en México
     🔧 +5,000 Talleres Certificados
     ⭐ Reseñas Reales
     📍 32 Estados
     🔗 Link: www.autorepara.mx
```

**C. Twitter/X**
```
Handle: @AutoReparaMX
Bio: Directorio líder de talleres mecánicos en México 🇲🇽 | +5,000 talleres certificados | Encuentra el mejor servicio automotriz cerca de ti
```

**D. LinkedIn Company**
```
Company Name: AutoRepara
Industry: Internet
Company Size: 11-50 employees
Headquarters: Ciudad de México, CDMX
Founded: 2018
```

**Update in StructuredData.tsx:**
```tsx
"sameAs": [
  "https://www.facebook.com/AutoReparaMX",
  "https://www.instagram.com/autoreparamx",
  "https://twitter.com/AutoReparaMX",
  "https://www.linkedin.com/company/autorepara"
]
```

## 📊 On-Page SEO Checklist

### Already Implemented ✅
- [x] Title tags optimized
- [x] Meta descriptions
- [x] Header tags hierarchy (H1, H2, H3)
- [x] Alt text for images
- [x] Internal linking
- [x] Mobile responsive
- [x] Fast loading speed
- [x] HTTPS ready
- [x] Structured data (JSON-LD)
- [x] Sitemap.xml
- [x] Robots.txt
- [x] Canonical URLs
- [x] Language alternatives (hreflang)
- [x] Open Graph tags
- [x] Twitter Card tags

### To Implement Later:
- [ ] Blog content strategy
- [ ] Local SEO optimization per city
- [ ] User reviews integration
- [ ] FAQ schema markup per page
- [ ] Video content
- [ ] Image optimization (WebP format)

## 🔍 Keyword Strategy

### Primary Keywords (Already Targeted):
1. talleres mecánicos México
2. reparación automotriz
3. mecánico cerca de mi
4. directorio talleres
5. talleres certificados

### Secondary Keywords:
6. taller de autos CDMX
7. taller de autos Guadalajara
8. taller de autos Monterrey
9. auto repair Mexico
10. servicio automotriz México

### Long-tail Keywords:
11. mejor taller mecánico cerca de mi
12. talleres mecánicos certificados CDMX
13. dónde reparar mi auto en México
14. directorio talleres automotrices México
15. talleres mecánicos con buenas reseñas

### Content Ideas for Blog:
- "Top 10 Talleres en Ciudad de México"
- "Cómo Elegir un Taller Mecánico Confiable"
- "Señales de un Buen Mecánico"
- "Mantenimiento Preventivo: Guía Completa"
- "Precios Justos: Qué Esperar en un Servicio Automotriz"

## 📈 Analytics Setup

### Google Analytics 4

**Implementation:**
```tsx
// Add to src/app/layout.tsx in <head>

{process.env.NEXT_PUBLIC_GA_ID && (
  <>
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
    />
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
        `,
      }}
    />
  </>
)}
```

**Events to Track:**
```javascript
// Search initiated
gtag('event', 'search', {
  search_term: searchQuery
});

// Workshop viewed
gtag('event', 'view_item', {
  item_name: workshopName,
  item_category: 'Workshop'
});

// Contact form submitted
gtag('event', 'generate_lead', {
  lead_type: 'Contact Form'
});

// Partnership inquiry
gtag('event', 'generate_lead', {
  lead_type: 'Partnership'
});
```

## 🎯 Conversion Tracking

### Key Conversions:
1. Contact form submissions
2. Phone number clicks
3. WhatsApp clicks
4. Email clicks
5. Partnership plan selection
6. Workshop detail views
7. Search usage

### Facebook Pixel (Optional)

```tsx
// Add to layout.tsx
{process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
  <script
    dangerouslySetInnerHTML={{
      __html: `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
        fbq('track', 'PageView');
      `,
    }}
  />
)}
```

## 🔧 Technical SEO

### Page Speed Optimization

**Current Best Practices:**
- [x] Next.js Image optimization
- [x] Code splitting
- [x] Lazy loading components
- [x] Minified CSS/JS

**To Implement:**
```bash
# Install sharp for image optimization
npm install sharp

# Build and analyze
npm run build
npm run start
```

**Check Performance:**
- https://pagespeed.web.dev/
- Test both mobile and desktop
- Aim for 90+ score

### Security Headers

Add to `next.config.ts`:
```ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

## 📱 Local SEO Strategy

### For Each City:

**Mexico City:**
- Create dedicated landing page: `/ciudad-de-mexico` or `/cdmx`
- Target keywords: "talleres CDMX", "mecánico Ciudad de México"
- List all workshops in CDMX
- Include neighborhood-specific content

**Guadalajara:**
- Landing page: `/guadalajara` or `/gdl`
- Keywords: "talleres Guadalajara Jalisco"
- Highlight Guadalajara specific workshops

**Monterrey:**
- Landing page: `/monterrey` or `/mty`
- Keywords: "talleres Monterrey Nuevo León"
- Focus on Monterrey area workshops

### Google Maps Integration

Consider adding interactive map showing:
- All workshop locations
- Filter by city/state
- Click for details
- Get directions

## 🎁 Content Marketing Strategy

### 1. Blog Topics (SEO-Optimized)
```
Month 1-2: Educational Content
- "10 Señales de que Necesitas Cambiar el Aceite"
- "Cuándo Revisar los Frenos de tu Auto"
- "Mantenimiento Preventivo: Guía Completa"

Month 3-4: Trust Building
- "Cómo Elegir un Taller Mecánico Confiable"
- "Preguntas que Debes Hacer a tu Mecánico"
- "Precios Justos: Qué Esperar en Servicios"

Month 5-6: Local Content
- "Mejores Talleres en CDMX 2026"
- "Top Talleres en Guadalajara"
- "Talleres Especializados en Monterrey"
```

### 2. Video Content Ideas
- Workshop tours
- Mechanic interviews
- How-to guides
- Customer testimonials
- Common car problems explained

### 3. Social Media Content Calendar
```
Monday: Tip of the week
Tuesday: Customer testimonial
Wednesday: Workshop spotlight
Thursday: Educational content
Friday: FAQ answer
Saturday: Weekend reminder
Sunday: Motivational/Fun content
```

## 📊 Monthly SEO Tasks

### Week 1:
- [ ] Review Google Analytics
- [ ] Check Search Console performance
- [ ] Analyze top performing pages
- [ ] Identify ranking improvements

### Week 2:
- [ ] Create new blog content
- [ ] Update old content
- [ ] Fix any broken links
- [ ] Optimize slow pages

### Week 3:
- [ ] Build backlinks
- [ ] Guest posting opportunities
- [ ] Partner collaborations
- [ ] Directory submissions

### Week 4:
- [ ] Social media updates
- [ ] Review competitors
- [ ] Update workshops data
- [ ] Plan next month content

## 🚀 Launch Day Checklist

**24 Hours Before:**
- [ ] Final QA testing
- [ ] Check all forms work
- [ ] Test all links
- [ ] Verify contact information
- [ ] Test mobile responsiveness
- [ ] Check load times

**Launch Day:**
- [ ] Deploy to production
- [ ] Submit sitemap to Google
- [ ] Submit sitemap to Bing
- [ ] Test live site
- [ ] Monitor for errors
- [ ] Set up monitoring alerts

**Week After Launch:**
- [ ] Monitor analytics daily
- [ ] Check indexing status
- [ ] Respond to any feedback
- [ ] Fix any reported issues
- [ ] Start content marketing

## 📞 Support Contacts

**Technical Issues:**
- Email: soporte@autorepara.mx
- Phone: +52 (55) 5000-0000

**Business Inquiries:**
- Email: ventas@autorepara.mx
- Phone: +52 (55) 5000-0000

**General Information:**
- Email: info@autorepara.mx
- Phone: +52 (55) 5000-0000

---

**Good luck with your launch!** 🚀

Remember: SEO is a long-term strategy. Results typically take 3-6 months to fully materialize. Be patient and consistent!
