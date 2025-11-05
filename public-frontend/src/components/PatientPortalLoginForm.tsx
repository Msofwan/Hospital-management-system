"use client";

import { FormEvent, useState } from "react";

import {
  fetchPatientPortalProfile,
  requestPatientPortalSession,
} from "../lib/publicApi";
import type {
  PatientPortalLoginRequest,
  PatientPortalProfile,
} from "../types/public";

export default function PatientPortalLoginForm() {
  const [formState, setFormState] = useState<PatientPortalLoginRequest>({
    email: "",
    dateOfBirth: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<{ token: string; expiresAt: string } | null>(null);
  const [profile, setProfile] = useState<PatientPortalProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const handleChange = (field: keyof PatientPortalLoginRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setProfile(null);

    try {
      const response = await requestPatientPortalSession(formState);
      setTokenInfo(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request secure session.");
      setTokenInfo(null);
    } finally {
      setSubmitting(false);
    }
  };

  const loadProfile = async () => {
    if (!tokenInfo) return;
    setLoadingProfile(true);
    setError(null);
    try {
      const data = await fetchPatientPortalProfile(tokenInfo.token);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load profile.");
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h2 className="h5 mb-3">Request a secure login link</h2>
        <p className="text-muted small">
          Enter your contact details. We&apos;ll verify your record and issue a short-lived access token for the patient portal.
        </p>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
            <label htmlFor="portalEmail" className="form-label">Email on file</label>
            <input
              id="portalEmail"
              type="email"
              required
              className="form-control"
              value={formState.email}
              onChange={handleChange("email")}
            />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="portalDob" className="form-label">Date of birth</label>
            <input
              id="portalDob"
              type="date"
              required
              className="form-control"
              value={formState.dateOfBirth}
              onChange={handleChange("dateOfBirth")}
            />
          </div>
          <div className="col-12">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Checking records..." : "Send secure link"}
            </button>
          </div>
        </form>
        {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}

        {tokenInfo && (
          <div className="alert alert-info mt-4" role="alert">
            <h3 className="h6">Secure session issued</h3>
            <p className="mb-2">
              Use the token below to sign into the portal within the next 15 minutes. For production deployments,
              send this token via email or SMS instead of displaying it directly.
            </p>
            <code className="d-block text-break">{tokenInfo.token}</code>
            <p className="mb-0 small text-muted">Expires at: {new Date(tokenInfo.expiresAt).toLocaleString()}</p>
            <button className="btn btn-outline-secondary btn-sm mt-3" type="button" onClick={loadProfile} disabled={loadingProfile}>
              {loadingProfile ? "Loading profile..." : "Preview portal data"}
            </button>
          </div>
        )}

        {profile && (
          <div className="mt-4">
            <h3 className="h6 mb-2">Upcoming appointments</h3>
            {profile.upcomingAppointments.length === 0 ? (
              <p className="small text-muted mb-2">No upcoming appointments on file.</p>
            ) : (
              <ul className="list-group mb-3">
                {profile.upcomingAppointments.map((appointment) => (
                  <li key={appointment.id} className="list-group-item">
                    <strong>{new Date(appointment.appointmentDate).toLocaleString()}</strong>
                    <br />
                    <span className="small text-muted">{appointment.reason}</span>
                  </li>
                ))}
              </ul>
            )}
            <h3 className="h6 mb-2">Recent invoices</h3>
            {profile.recentInvoices.length === 0 ? (
              <p className="small text-muted mb-0">No invoices found.</p>
            ) : (
              <ul className="list-group">
                {profile.recentInvoices.map((invoice) => (
                  <li key={invoice.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                      Invoice #{invoice.id}
                      <br />
                      <span className="small text-muted">Issued {new Date(invoice.dateIssued).toLocaleDateString()}</span>
                    </span>
                    <span className="badge bg-light text-dark">
                      ${invoice.amount.toFixed(2)} · {invoice.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
