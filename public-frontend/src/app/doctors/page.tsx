import type { Metadata } from "next";

import DoctorDirectory from "@/components/DoctorDirectory";
import { fetchDoctors } from "@/lib/publicApi";

export const metadata: Metadata = {
  title: "Our Doctors | MedCare Hospital",
};

export default async function DoctorsPage() {
  const doctors = await fetchDoctors().catch(() => []);

  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-6 fw-semibold">Meet our medical team</h1>
          <p className="lead text-muted">Search by specialty, department, or provider name to find the right expert for your care.</p>
        </div>
        <DoctorDirectory doctors={doctors} />
      </div>
    </section>
  );
}
