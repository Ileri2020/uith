const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Departments
    const cardiodept = await prisma.department.upsert({
        where: { name: 'Cardiology' },
        update: {},
        create: { name: 'Cardiology', description: 'Heart and vascular care' },
    });

    const generaldept = await prisma.department.upsert({
        where: { name: 'General Medicine' },
        update: {},
        create: { name: 'General Medicine', description: 'General health services' },
    });

    // 2. Create Doctors
    const doctor1 = await prisma.user.upsert({
        where: { email: 'doctor@example.com' },
        update: {},
        create: {
            email: 'doctor@example.com',
            password: hashedPassword,
            first_name: 'Emily',
            last_name: 'Johnson',
            role: 'doctor',
            sub_profession: 'Cardiology',
            level: 'Consultant',
            appointment_price: 100,
            department_id: cardiodept.id,
            rating: 4.8,
            total_ratings: 50,
        },
    });

    const doctor2 = await prisma.user.upsert({
        where: { email: 'surgeon@example.com' },
        update: {},
        create: {
            email: 'surgeon@example.com',
            password: hashedPassword,
            first_name: 'Michael',
            last_name: 'Williams',
            role: 'doctor',
            sub_profession: 'General Surgery',
            level: 'Professor',
            appointment_price: 150,
            department_id: generaldept.id,
            rating: 4.9,
            total_ratings: 120,
        },
    });

    // 3. Create Nurses
    const nurse1 = await prisma.user.upsert({
        where: { email: 'nurse@example.com' },
        update: {},
        create: {
            email: 'nurse@example.com',
            password: hashedPassword,
            first_name: 'Sarah',
            last_name: 'Brown',
            role: 'nurse',
            sub_profession: 'Intensive Care',
            level: 'Senior Registrar',
            appointment_price: 50,
            department_id: generaldept.id,
            rating: 4.7,
            total_ratings: 80,
        },
    });

    // 4. Create Pharmacists
    const pharmacist1 = await prisma.user.upsert({
        where: { email: 'pharmacist@example.com' },
        update: {},
        create: {
            email: 'pharmacist@example.com',
            password: hashedPassword,
            first_name: 'David',
            last_name: 'Miller',
            role: 'pharmacist',
            sub_profession: 'Clinical Pharmacy',
            level: 'Registrar',
            appointment_price: 40,
            rating: 4.6,
            total_ratings: 30,
        },
    });

    // 5. Create a Patient
    const patient1 = await prisma.user.upsert({
        where: { email: 'patient@example.com' },
        update: {},
        create: {
            email: 'patient@example.com',
            password: hashedPassword,
            first_name: 'John',
            last_name: 'Doe',
            role: 'patient',
            blood_type: 'O+',
            date_of_birth: '1990-01-01',
        },
    });

    // 6. Create Posts & Announcements
    await prisma.post.createMany({
        data: [
            {
                title: 'Maintaining Heart Health',
                description: 'Tips for a healthy cardiovascular system.',
                type: 'post',
                authorId: doctor1.id,
            },
            {
                title: 'New Policy: Masking Required',
                description: 'Masks are now mandatory in all hospital corridors.',
                type: 'announcement',
                authorId: nurse1.id,
            },
            {
                title: 'Flu Vaccines Available',
                description: 'Get your seasonal flu shot at the pharmacy starting Monday.',
                type: 'announcement',
                authorId: pharmacist1.id,
            },
        ],
    });

    // 7. Create some Forms
    const form1 = await prisma.form.create({
        data: {
            title: 'Medical History Form',
            description: 'Standard medical history intake form',
            ownerId: doctor1.id,
            fields: {
                "Allergies": "string",
                "Current Medications": "string",
                "Previous Surgeries": "string"
            }
        }
    });

    console.log('Seed data created successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
