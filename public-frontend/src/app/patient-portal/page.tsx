import type { Metadata } from "next";

import PatientPortalLoginForm from "@/components/PatientPortalLoginForm";
import { PATIENT_PORTAL_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Patient Portal | MedCare Hospital",
};

export default function PatientPortalPage() {
  return (
    <section className="py-5">
      <div className="container">
        <div className="row g-5 align-items-center">
          <div className="col-lg-6">
            <h1 className="display-6 fw-semibold mb-3">Stay connected with your care team</h1>
            <p className="lead text-muted">The MedCare Patient Portal gives you secure access to visit summaries, lab results, prescriptions, and billing information—anytime, anywhere.</p>
            <ul className="list-unstyled mt-4">
              <li className="mb-2">• Review appointment notes and discharge instructions</li>
              <li className="mb-2">• Request prescription refills and message your clinicians</li>
              <li className="mb-2">• Pay invoices and download insurance documents</li>
              <li className="mb-0">• Share medical records with other providers securely</li>
            </ul>
          </div>
          <div className="col-lg-5 ms-lg-auto">
            <PatientPortalLoginForm />
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body p-4">
                <h2 className="h5 text-primary">Already registered?</h2>
                <p className="mb-3">Use your credentials to sign in to the MedCare Patient Portal.</p>
                <a
                  className="btn btn-primary w-100 mb-3"
                  href={PATIENT_PORTAL_URL}
                  rel="noopener noreferrer"
                >
                  Go to patient portal
                </a>
                <h3 className="h6 text-uppercase text-muted">Need an account?</h3>
                <p className="mb-0 small">Our registration team will send you an activation email once your first appointment is scheduled. Call Sofwan at (62) 818-0928-7882 for assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
