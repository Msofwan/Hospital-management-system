import Link from "next/link";

import { fetchDoctors } from "@/lib/publicApi";

export default async function HomePage() {
  const doctors = await fetchDoctors().catch(() => []);
  const featuredDoctors = doctors.slice(0, 3);

  return (
    <>
      <section className="bg-primary text-white py-5">
        <div className="container py-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <h1 className="display-5 fw-semibold mb-3">Compassionate care for every stage of life</h1>
              <p className="lead mb-4">
                MedCare Hospital combines expert clinicians, modern facilities, and digital tools so you can book appointments,
                review your health information, and stay connected with your care team.
              </p>
              <div className="d-flex gap-3">
                <Link href="/appointment" className="btn btn-light btn-lg text-primary fw-semibold">
                  Book an Appointment
                </Link>
                <Link href="/services" className="btn btn-outline-light btn-lg">
                  Explore Services
                </Link>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="bg-white text-dark rounded-4 p-4 shadow-lg">
                <h2 className="h5 text-uppercase text-primary">Why patients choose MedCare</h2>
                <ul className="list-unstyled mb-0 mt-3">
                  <li className="mb-2">✓ 24/7 emergency and critical care</li>
                  <li className="mb-2">✓ Integrated electronic medical records</li>
                  <li className="mb-2">✓ Dedicated specialists across 20+ disciplines</li>
                  <li className="mb-0">✓ Convenient telemedicine and follow-up support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h3 className="h5 text-primary">Find your specialist</h3>
                  <p className="text-muted">Browse our doctor directory to learn about provider expertise, languages, and availability.</p>
                  <Link href="/doctors" className="stretched-link">View doctors</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h3 className="h5 text-primary">Plan your visit</h3>
                  <p className="text-muted">Check services, clinic hours, and pre-appointment guidance tailored to your needs.</p>
                  <Link href="/services" className="stretched-link">See services</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h3 className="h5 text-primary">Access your records</h3>
                  <p className="text-muted">Our secure patient portal keeps lab results, medications, and visit summaries in one place.</p>
                  <Link href="/patient-portal" className="stretched-link">Patient portal</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="h3 mb-1">Featured physicians</h2>
              <p className="text-muted mb-0">Meet some of the specialists delivering exceptional care at MedCare.</p>
            </div>
            <Link href="/doctors" className="btn btn-outline-primary">Browse all doctors</Link>
          </div>
          {featuredDoctors.length === 0 ? (
            <p className="text-muted">Provider profiles will appear here once schedules are published.</p>
          ) : (
            <div className="row g-4">
              {featuredDoctors.map((doctor) => (
                <div className="col-md-4" key={doctor.id}>
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <h4 className="h5 text-primary">{doctor.firstName} {doctor.lastName}</h4>
                      <p className="mb-1">{doctor.specialization ?? "General Practitioner"}</p>
                      {doctor.department && <p className="text-muted mb-0">{doctor.department}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="h3 mb-3">Need urgent assistance?</h2>
              <p className="mb-0">Our emergency team is available 24/7. Call <strong>(555) 123-4567</strong> or visit the Emergency Center at 123 Healing Avenue.</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link href="/contact" className="btn btn-light btn-lg text-primary fw-semibold">Get directions</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}