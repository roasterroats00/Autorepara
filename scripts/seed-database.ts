// Seed script for AutoRepara database
// Run with: npx tsx scripts/seed-database.ts

import { db } from '../src/db';
import { states, cities, services, workshops, workshopServices } from '../src/db/schema';

async function seed() {
    console.log('🌱 Starting database seed...\n');

    // 1. Seed States (Mexico)
    console.log('📍 Seeding states...');
    const statesData = [
        { name: 'Ciudad de México', code: 'CDMX', slug: 'ciudad-de-mexico' },
        { name: 'Jalisco', code: 'JAL', slug: 'jalisco' },
        { name: 'Nuevo León', code: 'NLE', slug: 'nuevo-leon' },
        { name: 'Estado de México', code: 'MEX', slug: 'estado-de-mexico' },
        { name: 'Puebla', code: 'PUE', slug: 'puebla' },
        { name: 'Guanajuato', code: 'GTO', slug: 'guanajuato' },
        { name: 'Veracruz', code: 'VER', slug: 'veracruz' },
        { name: 'Yucatán', code: 'YUC', slug: 'yucatan' },
    ];

    await db.insert(states).values(statesData).onConflictDoNothing();
    console.log(`   ✓ Inserted ${statesData.length} states`);

    // Get inserted states
    const insertedStates = await db.select().from(states);
    const stateMap = Object.fromEntries(insertedStates.map(s => [s.slug, s.id]));

    // 2. Seed Cities
    console.log('🏙️ Seeding cities...');
    const citiesData = [
        // CDMX
        { name: 'Mexico City Centro', slug: 'mexico-city-centro', stateId: stateMap['ciudad-de-mexico'] },
        { name: 'Polanco', slug: 'polanco', stateId: stateMap['ciudad-de-mexico'] },
        { name: 'Coyoacán', slug: 'coyoacan', stateId: stateMap['ciudad-de-mexico'] },
        // Jalisco
        { name: 'Guadalajara', slug: 'guadalajara', stateId: stateMap['jalisco'] },
        { name: 'Zapopan', slug: 'zapopan', stateId: stateMap['jalisco'] },
        // Nuevo León
        { name: 'Monterrey', slug: 'monterrey', stateId: stateMap['nuevo-leon'] },
        { name: 'San Pedro Garza García', slug: 'san-pedro-garza-garcia', stateId: stateMap['nuevo-leon'] },
        // Estado de México
        { name: 'Toluca', slug: 'toluca', stateId: stateMap['estado-de-mexico'] },
        { name: 'Naucalpan', slug: 'naucalpan', stateId: stateMap['estado-de-mexico'] },
        // Puebla
        { name: 'Puebla City', slug: 'puebla-city', stateId: stateMap['puebla'] },
        // Guanajuato
        { name: 'León', slug: 'leon', stateId: stateMap['guanajuato'] },
        // Yucatán
        { name: 'Mérida', slug: 'merida', stateId: stateMap['yucatan'] },
    ];

    await db.insert(cities).values(citiesData).onConflictDoNothing();
    console.log(`   ✓ Inserted ${citiesData.length} cities`);

    // Get inserted cities
    const insertedCities = await db.select().from(cities);
    const cityMap = Object.fromEntries(insertedCities.map(c => [c.slug, c.id]));

    // 3. Seed Services
    console.log('🔧 Seeding services...');
    const servicesData = [
        { name: 'Oil Change', nameEs: 'Cambio de Aceite', slug: 'oil-change', icon: 'oil_barrel', isPopular: true },
        { name: 'Brake Repair', nameEs: 'Reparación de Frenos', slug: 'brake-repair', icon: 'emergency', isPopular: true },
        { name: 'Engine Diagnostics', nameEs: 'Diagnóstico de Motor', slug: 'engine-diagnostics', icon: 'engineering', isPopular: true },
        { name: 'Tire Services', nameEs: 'Servicios de Llantas', slug: 'tire-services', icon: 'tire_repair', isPopular: true },
        { name: 'AC Repair', nameEs: 'Reparación de A/C', slug: 'ac-repair', icon: 'ac_unit', isPopular: false },
        { name: 'Transmission', nameEs: 'Transmisión', slug: 'transmission', icon: 'settings', isPopular: false },
        { name: 'Electrical', nameEs: 'Sistema Eléctrico', slug: 'electrical', icon: 'bolt', isPopular: false },
        { name: 'Body Work', nameEs: 'Hojalatería y Pintura', slug: 'body-work', icon: 'format_paint', isPopular: false },
        { name: 'Suspension', nameEs: 'Suspensión', slug: 'suspension', icon: 'speed', isPopular: false },
        { name: 'General Maintenance', nameEs: 'Mantenimiento General', slug: 'general-maintenance', icon: 'build', isPopular: true },
    ];

    await db.insert(services).values(servicesData).onConflictDoNothing();
    console.log(`   ✓ Inserted ${servicesData.length} services`);

    // Get inserted services
    const insertedServices = await db.select().from(services);

    // 4. Seed Workshops
    console.log('🔩 Seeding workshops...');
    const workshopsData = [
        {
            name: 'AutoMex Centro',
            slug: 'automex-centro',
            slugEs: 'automex-centro',
            cityId: cityMap['mexico-city-centro'],
            address: 'Av. Insurgentes Sur 1234, Col. Del Valle',
            phone: '+52 55 1234 5678',
            email: 'contacto@automexcentro.com',
            descriptionEn: 'Professional auto repair shop in the heart of Mexico City with over 20 years of experience.',
            descriptionEs: 'Taller mecánico profesional en el corazón de la Ciudad de México con más de 20 años de experiencia.',
            rating: 4.8,
            reviewCount: 156,
            status: 'active' as const,
            isVerified: true,
            isFeatured: true,
        },
        {
            name: 'Taller Guadalajara Express',
            slug: 'taller-guadalajara-express',
            slugEs: 'taller-guadalajara-express',
            cityId: cityMap['guadalajara'],
            address: 'Av. Vallarta 567, Col. Americana',
            phone: '+52 33 9876 5432',
            email: 'info@gdlexpress.com',
            descriptionEn: 'Fast and reliable auto repair services in Guadalajara. Specialized in Japanese and Korean vehicles.',
            descriptionEs: 'Servicios de reparación automotriz rápidos y confiables en Guadalajara. Especializados en vehículos japoneses y coreanos.',
            rating: 4.6,
            reviewCount: 89,
            status: 'active' as const,
            isVerified: true,
            isFeatured: true,
        },
        {
            name: 'Monterrey Auto Pro',
            slug: 'monterrey-auto-pro',
            slugEs: 'monterrey-auto-pro',
            cityId: cityMap['monterrey'],
            address: 'Blvd. Constitución 890, Col. Centro',
            phone: '+52 81 4567 8901',
            email: 'servicio@mtyautopro.com',
            descriptionEn: 'Premium auto repair services in Monterrey. We specialize in European luxury vehicles.',
            descriptionEs: 'Servicios premium de reparación automotriz en Monterrey. Nos especializamos en vehículos europeos de lujo.',
            rating: 4.9,
            reviewCount: 203,
            status: 'active' as const,
            isVerified: true,
            isFeatured: true,
        },
        {
            name: 'Polanco Elite Motors',
            slug: 'polanco-elite-motors',
            slugEs: 'polanco-elite-motors',
            cityId: cityMap['polanco'],
            address: 'Av. Presidente Masaryk 456, Polanco',
            phone: '+52 55 2345 6789',
            email: 'contact@polancoelite.com',
            descriptionEn: 'Luxury vehicle specialists in Polanco. BMW, Mercedes, Audi certified technicians.',
            descriptionEs: 'Especialistas en vehículos de lujo en Polanco. Técnicos certificados BMW, Mercedes, Audi.',
            rating: 4.7,
            reviewCount: 124,
            status: 'active' as const,
            isVerified: true,
            isFeatured: false,
        },
        {
            name: 'Zapopan Auto Center',
            slug: 'zapopan-auto-center',
            slugEs: 'zapopan-auto-center',
            cityId: cityMap['zapopan'],
            address: 'Av. Patria 1234, Zapopan Centro',
            phone: '+52 33 1111 2222',
            email: 'info@zapopanauto.com',
            descriptionEn: 'Complete auto care center in Zapopan. From minor repairs to major overhauls.',
            descriptionEs: 'Centro de servicio automotriz completo en Zapopan. Desde reparaciones menores hasta overhauls mayores.',
            rating: 4.5,
            reviewCount: 67,
            status: 'active' as const,
            isVerified: false,
            isFeatured: false,
        },
        {
            name: 'Mérida Motors',
            slug: 'merida-motors',
            slugEs: 'merida-motors',
            cityId: cityMap['merida'],
            address: 'Calle 60 x 47, Centro Histórico',
            phone: '+52 999 123 4567',
            email: 'hola@meridamotors.com',
            descriptionEn: 'Yucatan\'s premier auto repair shop. Serving the community for over 15 years.',
            descriptionEs: 'El taller automotriz premier de Yucatán. Sirviendo a la comunidad por más de 15 años.',
            rating: 4.4,
            reviewCount: 45,
            status: 'active' as const,
            isVerified: true,
            isFeatured: false,
        },
    ];

    await db.insert(workshops).values(workshopsData).onConflictDoNothing();
    console.log(`   ✓ Inserted ${workshopsData.length} workshops`);

    // Get inserted workshops
    const insertedWorkshops = await db.select().from(workshops);

    // 5. Seed Workshop-Service relationships
    console.log('🔗 Linking workshops to services...');
    const workshopServiceLinks: { workshopId: string; serviceId: string }[] = [];

    for (const workshop of insertedWorkshops) {
        // Assign 3-6 random services to each workshop
        const numServices = 3 + Math.floor(Math.random() * 4);
        const shuffledServices = [...insertedServices].sort(() => Math.random() - 0.5);

        for (let i = 0; i < numServices && i < shuffledServices.length; i++) {
            workshopServiceLinks.push({
                workshopId: workshop.id,
                serviceId: shuffledServices[i].id,
            });
        }
    }

    await db.insert(workshopServices).values(workshopServiceLinks).onConflictDoNothing();
    console.log(`   ✓ Created ${workshopServiceLinks.length} workshop-service links`);

    console.log('\n✅ Database seeding complete!');
    console.log(`   📊 Summary:`);
    console.log(`      - States: ${statesData.length}`);
    console.log(`      - Cities: ${citiesData.length}`);
    console.log(`      - Services: ${servicesData.length}`);
    console.log(`      - Workshops: ${workshopsData.length}`);
    console.log(`      - Workshop-Service Links: ${workshopServiceLinks.length}`);

    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
