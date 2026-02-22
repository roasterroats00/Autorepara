-- =============================================
-- AutoRepair Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. STATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(5) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    workshop_count INTEGER DEFAULT 0,
    city_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. CITIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    state_id UUID REFERENCES states(id) ON DELETE CASCADE,
    description TEXT,
    description_es TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    workshop_count INTEGER DEFAULT 0,
    meta_title_en VARCHAR(255),
    meta_title_es VARCHAR(255),
    meta_description_en TEXT,
    meta_description_es TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. SERVICES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_es VARCHAR(255),
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon VARCHAR(100),
    image TEXT,
    description TEXT,
    description_es TEXT,
    display_order INTEGER DEFAULT 0,
    workshop_count INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    avatar TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. WORKSHOPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS workshops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    
    -- Location
    address TEXT,
    city_id UUID REFERENCES cities(id),
    zip_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Contact
    phone VARCHAR(50),
    phone_secondary VARCHAR(50),
    email VARCHAR(255),
    website TEXT,
    
    -- Descriptions
    description TEXT,
    description_es TEXT,
    short_description VARCHAR(500),
    short_description_es VARCHAR(500),
    
    -- Media
    logo TEXT,
    cover_image TEXT,
    images JSONB DEFAULT '[]',
    
    -- Business Hours
    business_hours JSONB DEFAULT '{}',
    
    -- Ratings
    rating DECIMAL(2, 1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_title_es VARCHAR(255),
    meta_description TEXT,
    meta_description_es TEXT,
    
    -- FAQ
    faq JSONB DEFAULT '[]',
    faq_es JSONB DEFAULT '[]',
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'inactive')),
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- AI Enrichment
    ai_enriched BOOLEAN DEFAULT false,
    ai_enriched_at TIMESTAMP WITH TIME ZONE,
    
    -- Ownership
    owner_id UUID REFERENCES users(id),
    claimed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. WORKSHOP_SERVICES (Junction Table)
-- =============================================
CREATE TABLE IF NOT EXISTS workshop_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workshop_id, service_id)
);

-- =============================================
-- 7. PAGES TABLE (CMS)
-- =============================================
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    title_es VARCHAR(255),
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT,
    content_es TEXT,
    excerpt TEXT,
    excerpt_es TEXT,
    type VARCHAR(50) DEFAULT 'page' CHECK (type IN ('page', 'blog')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    featured_image TEXT,
    meta_title VARCHAR(255),
    meta_title_es VARCHAR(255),
    meta_description TEXT,
    meta_description_es TEXT,
    author_id UUID REFERENCES users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. MEDIA TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    url TEXT NOT NULL,
    mime_type VARCHAR(100),
    size INTEGER,
    alt_text VARCHAR(255),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. IMPORT_JOBS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    successful_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    column_mapping JSONB DEFAULT '{}',
    enrichment_options JSONB DEFAULT '{}',
    error_log JSONB DEFAULT '[]',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_workshops_city_id ON workshops(city_id);
CREATE INDEX IF NOT EXISTS idx_workshops_status ON workshops(status);
CREATE INDEX IF NOT EXISTS idx_workshops_slug ON workshops(slug);
CREATE INDEX IF NOT EXISTS idx_cities_state_id ON cities(state_id);
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_type ON pages(type);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);

-- =============================================
-- SAMPLE DATA: States
-- =============================================
INSERT INTO states (name, code, slug) VALUES
('Alabama', 'AL', 'alabama'),
('Alaska', 'AK', 'alaska'),
('Arizona', 'AZ', 'arizona'),
('Arkansas', 'AR', 'arkansas'),
('California', 'CA', 'california'),
('Colorado', 'CO', 'colorado'),
('Connecticut', 'CT', 'connecticut'),
('Delaware', 'DE', 'delaware'),
('Florida', 'FL', 'florida'),
('Georgia', 'GA', 'georgia'),
('Hawaii', 'HI', 'hawaii'),
('Idaho', 'ID', 'idaho'),
('Illinois', 'IL', 'illinois'),
('Indiana', 'IN', 'indiana'),
('Iowa', 'IA', 'iowa'),
('Kansas', 'KS', 'kansas'),
('Kentucky', 'KY', 'kentucky'),
('Louisiana', 'LA', 'louisiana'),
('Maine', 'ME', 'maine'),
('Maryland', 'MD', 'maryland'),
('Massachusetts', 'MA', 'massachusetts'),
('Michigan', 'MI', 'michigan'),
('Minnesota', 'MN', 'minnesota'),
('Mississippi', 'MS', 'mississippi'),
('Missouri', 'MO', 'missouri'),
('Montana', 'MT', 'montana'),
('Nebraska', 'NE', 'nebraska'),
('Nevada', 'NV', 'nevada'),
('New Hampshire', 'NH', 'new-hampshire'),
('New Jersey', 'NJ', 'new-jersey'),
('New Mexico', 'NM', 'new-mexico'),
('New York', 'NY', 'new-york'),
('North Carolina', 'NC', 'north-carolina'),
('North Dakota', 'ND', 'north-dakota'),
('Ohio', 'OH', 'ohio'),
('Oklahoma', 'OK', 'oklahoma'),
('Oregon', 'OR', 'oregon'),
('Pennsylvania', 'PA', 'pennsylvania'),
('Rhode Island', 'RI', 'rhode-island'),
('South Carolina', 'SC', 'south-carolina'),
('South Dakota', 'SD', 'south-dakota'),
('Tennessee', 'TN', 'tennessee'),
('Texas', 'TX', 'texas'),
('Utah', 'UT', 'utah'),
('Vermont', 'VT', 'vermont'),
('Virginia', 'VA', 'virginia'),
('Washington', 'WA', 'washington'),
('West Virginia', 'WV', 'west-virginia'),
('Wisconsin', 'WI', 'wisconsin'),
('Wyoming', 'WY', 'wyoming')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SAMPLE DATA: Services
-- =============================================
INSERT INTO services (name, name_es, slug, icon, is_popular) VALUES
('Oil Change', 'Cambio de Aceite', 'oil-change', 'oil_barrel', true),
('Brake Repair', 'Reparación de Frenos', 'brake-repair', 'tire_repair', true),
('Tire Service', 'Servicio de Llantas', 'tire-service', 'rotate_right', true),
('AC Repair', 'Reparación de A/C', 'ac-repair', 'ac_unit', true),
('Engine Repair', 'Reparación de Motor', 'engine-repair', 'settings', true),
('Transmission', 'Transmisión', 'transmission', 'precision_manufacturing', true),
('Battery Service', 'Servicio de Batería', 'battery', 'battery_charging_full', true),
('Auto Body & Paint', 'Carrocería y Pintura', 'auto-body', 'car_crash', true),
('Window Tinting', 'Polarizado de Vidrios', 'window-tinting', 'window', false),
('Car Wash', 'Lavado de Autos', 'car-wash', 'local_car_wash', false),
('Wheel Alignment', 'Alineación', 'wheel-alignment', 'adjust', false),
('Car Inspection', 'Inspección Vehicular', 'inspection', 'checklist', false),
('Auto Electrician', 'Electricista Automotriz', 'auto-electrician', 'electrical_services', false),
('Muffler & Exhaust', 'Mofle y Escape', 'muffler-exhaust', 'air', false),
('Mobile Mechanic', 'Mecánico a Domicilio', 'mobile-mechanic', 'home_repair_service', false)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- Done!
-- =============================================
SELECT 'Database schema created successfully!' as message;
