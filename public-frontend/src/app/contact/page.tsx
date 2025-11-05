import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Location | MedCare Hospital",
};

export default function ContactPage() {
  return (
    <section className="py-5">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-6">
            <h1 className="display-6 fw-semibold mb-3">We’re here when you need us</h1>
            <p className="lead text-muted">Reach out to schedule visits, ask questions, or get directions. Our patient experience team responds within one business day.</p>
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body p-4">
                <h2 className="h5 text-primary">Main Hospital</h2>
                <p className="mb-1">123 Healing Avenue</p>
                <p className="mb-1">Wellness City, 12345</p>
                <p className="mb-3">Parking garage entrance on Recovery Road.</p>
                <p className="mb-1">Phone: (555) 123-4567</p>
                <p className="mb-0">Email: info@medcarehospital.com</p>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h2 className="h5 text-primary mb-3">Visiting hours & directions</h2>
                <ul className="list-unstyled mb-4">
                  <li className="mb-2">• General visiting hours: 8 a.m. – 8 p.m.</li>
                  <li className="mb-2">• ICU visits by appointment only</li>
                  <li className="mb-2">• Pharmacy open daily 7 a.m. – 9 p.m.</li>
                  <li className="mb-0">• Free valet parking available at main entrance</li>
                </ul>
                <div className="ratio ratio-4x3 rounded overflow-hidden">
                  <iframe
                    title="MedCare Hospital map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509392!2d144.95373531531676!3d-37.81627974201137!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ5JzAwLjYiUyAxNDTCsDU3JzE0LjIiRQ!5e0!3m2!1sen!2sus!4v1614036800000!5m2!1sen!2sus"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
