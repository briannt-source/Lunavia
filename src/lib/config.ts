/**
 * lib/config.ts
 * 
 * Production Environment Validator.
 * Prevents silent failures in the pilot by checking for required keys at boot.
 */

const REQUIRED_KEYS = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM',
];

export function validateConfig() {
    const missing = REQUIRED_KEYS.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('❌ CONFIGURATION WARNING: Missing environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));

        if (process.env.NODE_ENV === 'production') {
            const ultraCritical = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
            const missingUltra = missing.filter(k => ultraCritical.includes(k));

            if (missingUltra.length > 0) {
                console.error('❌ CRITICAL: Database or Auth secrets missing. System shutdown initiated.');
                process.exit(1);
            } else {
                console.warn('⚠️  Production service keys (SMTP) missing. System will run but emails will fail.');
            }
        } else {
            console.warn('⚠️  Development mode: System will continue but some features will fail.');
        }
    } else {
        console.log('✅ Configuration validated: All critical production keys are present.');
    }
}
