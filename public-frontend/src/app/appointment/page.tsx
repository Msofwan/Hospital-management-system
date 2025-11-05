import type { Metadata } from "next";

import AppointmentForm from "@/components/AppointmentForm";
import { fetchDoctors } from "@/lib/publicApi";

export const metadata: Metadata = {
  title: "Book an Appointment | MedCare Hospital",
};

export default async function AppointmentPage() {
  const doctors = await fetchDoctors().catch(() => []);

  return (
    <section className="py-5">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-7">
            <AppointmentForm doctors={doctors} />
          </div>
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h2 className="h5 text-primary">What happens next?</h2>
                <ol className="mt-3 ps-3">
                  <li className="mb-2">Our scheduling team reviews your request within one business day.</li>
                  <li className="mb-2">We contact you by phone or email to confirm provider availability.</li>
                  <li className="mb-0">After confirmation, you receive a portal invitation to complete pre-visit forms.</li>
                </ol>
              </div>
            </div>
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h2 className="h6 text-uppercase text-muted">Need immediate help?</h2>
                <p className="mb-2">Call our care coordinators at <strong>(555) 987-6543</strong>.</p>
                <p className="mb-0">Emergency concerns? Visit our Emergency Center open 24/7.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
