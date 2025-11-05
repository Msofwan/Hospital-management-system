import type { Metadata } from "next";

import { SERVICE_CATEGORIES } from "@/data/services";

export const metadata: Metadata = {
  title: "Services | MedCare Hospital",
};

export default function ServicesPage() {
  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-6 fw-semibold">Comprehensive care tailored to you</h1>
          <p className="lead text-muted">Our services span preventive health, diagnostics, specialist care, and rehabilitation—so every visit is coordinated and seamless.</p>
        </div>
        <div className="row g-4">
          {SERVICE_CATEGORIES.map((category) => (
            <div className="col-md-6" key={category.title}>
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="display-6" aria-hidden>{category.emoji}</span>
                    <h2 className="h4 mb-0">{category.title}</h2>
                  </div>
                  <p className="text-muted">{category.description}</p>
                  <ul className="list-unstyled mb-0">
                    {category.offerings.map((offering) => (
                      <li className="mb-2" key={offering}>• {offering}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
