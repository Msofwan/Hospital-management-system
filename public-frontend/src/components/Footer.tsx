export default function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container d-flex flex-column flex-lg-row justify-content-between gap-3">
        <div>
          <h6 className="fw-semibold mb-2">MedCare Hospital</h6>
          <p className="mb-0 small">123 Healing Avenue, Wellness City, 12345</p>
          <p className="mb-0 small">Phone: (555) 123-4567 · Email: info@medcarehospital.com</p>
        </div>
        <div className="text-lg-end small">
          <p className="mb-1">Open 24/7 for emergency care</p>
          <p className="mb-0">© {new Date().getFullYear()} MedCare Hospital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
