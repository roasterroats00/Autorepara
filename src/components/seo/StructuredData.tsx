import { Setting } from "@/db/schema";
import { DEFAULT_SETTINGS } from "@/lib/settings";

interface SchemaProps {
    settings?: Setting | null;
}

export function OrganizationSchema({ settings }: SchemaProps) {
    const s = settings || DEFAULT_SETTINGS;
    const siteUrl = "https://www.autorepara.net";

    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": s.siteName,
        "legalName": s.legalName,
        "url": siteUrl,
        "logo": `${siteUrl}/uploads/workshops/autorepara.png`,
        "description": s.siteDescriptionEn,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "262 Baker Avenue",
            "addressLocality": "Fort Worth",
            "addressRegion": "TX",
            "postalCode": "76102",
            "addressCountry": "US"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 32.7555,
            "longitude": -97.3308
        },
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "telephone": s.contactPhone,
                "contactType": "customer service",
                "email": s.contactEmail,
                "availableLanguage": ["Spanish", "English"],
                "areaServed": "US"
            }
        ],
        "sameAs": [
            s.socialLinks?.facebook,
            s.socialLinks?.twitter,
            s.socialLinks?.instagram,
            s.socialLinks?.linkedin
        ].filter(Boolean),
        "foundingDate": "2018",
        "areaServed": {
            "@type": "Country",
            "name": "USA"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function LocalBusinessSchema({ settings }: SchemaProps) {
    const s = settings || DEFAULT_SETTINGS;
    const siteUrl = "https://www.autorepara.net";

    const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": `${s.siteName} - HQ`,
        "image": `${siteUrl}/uploads/workshops/autorepara.png`,
        "@id": siteUrl,
        "url": siteUrl,
        "telephone": s.contactPhone,
        "priceRange": "$$",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "262 Baker Avenue",
            "addressLocality": "Fort Worth",
            "addressRegion": "TX",
            "postalCode": "76102",
            "addressCountry": "US"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 32.7555,
            "longitude": -97.3308
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function WebsiteSchema({ settings }: SchemaProps) {
    const s = settings || DEFAULT_SETTINGS;
    const siteUrl = "https://www.autorepara.net";

    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": s.siteName,
        "alternateName": `${s.siteName} USA`,
        "url": siteUrl,
        "description": s.siteDescriptionEn,
        "inLanguage": ["es-MX", "en-US"],
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${siteUrl}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function WorkshopSchema({ workshop, lang }: { workshop: any; lang: string }) {
    const description = lang === 'es'
        ? (workshop.descriptionEs || workshop.descriptionEn)
        : (workshop.descriptionEn || workshop.descriptionEs);

    const faqs = lang === 'es' ? (workshop.faqEs || []) : (workshop.faqEn || []);

    const schema: any = {
        "@context": "https://schema.org",
        "@type": "AutoRepair",
        "name": workshop.name,
        "image": workshop.images?.[0] || workshop.logoUrl || "https://www.autorepara.net/uploads/workshops/autorepara.png",
        "@id": `https://www.autorepara.net/workshop/${workshop.slug || workshop.id}`,
        "url": `https://www.autorepara.net/workshop/${workshop.slug || workshop.id}`,
        "telephone": workshop.phone,
        "email": workshop.email,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": workshop.address,
            "addressLocality": workshop.city?.name,
            "addressRegion": workshop.state?.code,
            "addressCountry": "MX"
        },
        "description": description?.substring(0, 300),
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": workshop.latitude,
            "longitude": workshop.longitude
        },
        "openingHoursSpecification": workshop.businessHours ? Object.entries(workshop.businessHours).map(([day, hours]: [string, any]) => {
            if (hours === 'closed') return null;
            return {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
                "opens": hours?.open || "09:00",
                "closes": hours?.close || "18:00"
            };
        }).filter(Boolean) : [],
        "aggregateRating": workshop.rating ? {
            "@type": "AggregateRating",
            "ratingValue": workshop.rating,
            "reviewCount": workshop.reviewCount || 1,
            "bestRating": "5",
            "worstRating": "1"
        } : undefined
    };

    // Add FAQ if available
    if (faqs.length > 0) {
        schema.mainEntity = faqs.map((faq: any) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }));
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url.startsWith('http') ? item.url : `https://www.autorepara.net${item.url}`
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
