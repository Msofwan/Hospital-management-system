export interface ServiceCategory {
  title: string;
  description: string;
  offerings: string[];
  emoji: string;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    title: 'Emergency & Critical Care',
    description: '24/7 emergency department equipped with advanced trauma and critical care units.',
    offerings: ['Emergency response teams', 'Intensive Care Unit', 'Cardiac monitoring', 'On-site laboratory'],
    emoji: '❤️',
  },
  {
    title: 'Specialty Clinics',
    description: 'Comprehensive specialist services tailored to your ongoing health needs.',
    offerings: ['Cardiology', 'Neurology', 'Orthopedics', 'Women’s health & OB/GYN'],
    emoji: '🏥',
  },
  {
    title: 'Outpatient Services',
    description: 'Convenient outpatient care designed around your schedule and comfort.',
    offerings: ['Primary care visits', 'Diagnostic imaging', 'Telemedicine consultations', 'Chronic disease management'],
    emoji: '🩺',
  },
  {
    title: 'Wellness & Preventive Care',
    description: 'Programs that support lifelong wellness for you and your family.',
    offerings: ['Annual physicals', 'Vaccination programs', 'Nutrition counseling', 'Rehabilitation & physiotherapy'],
    emoji: '🌿',
  },
];
