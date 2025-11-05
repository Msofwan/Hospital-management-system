"use client";

import { FormEvent, useMemo, useState } from "react";

import { submitAppointmentRequest } from "../lib/publicApi";
import type { AppointmentRequestPayload, DoctorProfile } from "../types/public";

interface AppointmentFormProps {
  doctors: DoctorProfile[];
}

const INITIAL_FORM: AppointmentRequestPayload = {
  fullName: "",
  email: "",
  phoneNumber: "",
  preferredDate: "",
  preferredTime: "",
  reason: "",
  preferredDoctorId: null,
};

export default function AppointmentForm({ doctors }: AppointmentFormProps) {
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const upcomingDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  }, []);

  const selectedDoctor = useMemo(() => {
    if (!formState.preferredDoctorId) return undefined;
    return doctors.find((doctor) => doctor.id === formState.preferredDoctorId);
  }, [doctors, formState.preferredDoctorId]);

  const slotSuggestions = useMemo(() => {
    if (!selectedDoctor) return [] as string[];
    return selectedDoctor.nextAvailableSlots.slice(0, 3);
  }, [selectedDoctor]);

  const handleChange = (field: keyof AppointmentRequestPayload) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDoctorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setFormState((prev) => ({
      ...prev,
      preferredDoctorId: value ? Number(value) : null,
      preferredTime: prev.preferredTime,
    }));
  };

  const applySuggestedSlot = (isoDateTime: string) => {
    const slot = new Date(isoDateTime);
    const dateValue = slot.toISOString().split("T")[0];
    const timeValue = slot.toISOString().split("T")[1]?.slice(0, 5) ?? "";
    setFormState((prev) => ({
      ...prev,
      preferredDate: dateValue,
      preferredTime: timeValue,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await submitAppointmentRequest(formState);
      setSuccessMessage("Thank you! Your request has been submitted.");
      setFormState(INITIAL_FORM);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to submit request right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card shadow-sm border-0" onSubmit={handleSubmit}>
      <div className="card-body p-4">
        <h2 className="h4 mb-3">Tell us about your visit</h2>
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="fullName" className="form-label">Full Name</label>
            <input
              id="fullName"
              className="form-control"
              required
              value={formState.fullName}
              onChange={handleChange("fullName")}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              required
              value={formState.email}
              onChange={handleChange("email")}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
            <input
              id="phoneNumber"
              className="form-control"
              required
              value={formState.phoneNumber}
              onChange={handleChange("phoneNumber")}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="preferredDate" className="form-label">Preferred Date</label>
            <input
              id="preferredDate"
              type="date"
              className="form-control"
              required
              min={upcomingDates[0]}
              max={upcomingDates[upcomingDates.length - 1]}
              value={formState.preferredDate}
              onChange={handleChange("preferredDate")}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="preferredTime" className="form-label">Preferred Time</label>
            <input
              id="preferredTime"
              type="time"
              className="form-control"
              value={formState.preferredTime}
              onChange={handleChange("preferredTime")}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="preferredDoctorId" className="form-label">Preferred Doctor (optional)</label>
            <select
              id="preferredDoctorId"
              className="form-select"
              value={formState.preferredDoctorId ?? ""}
              onChange={handleDoctorChange}
            >
              <option value="">Any available provider</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.firstName} {doctor.lastName}
                </option>
              ))}
            </select>
            {slotSuggestions.length > 0 && (
              <div className="mt-2">
                <p className="small text-muted mb-1">Next available with this provider:</p>
                <div className="d-flex flex-wrap gap-2">
                  {slotSuggestions.map((slot) => {
                    const slotDate = new Date(slot);
                    const label = `${slotDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${slotDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
                    return (
                      <button
                        type="button"
                        key={slot}
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => applySuggestedSlot(slot)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="col-12">
            <label htmlFor="reason" className="form-label">Reason for Visit</label>
            <textarea
              id="reason"
              rows={4}
              className="form-control"
              value={formState.reason}
              onChange={handleChange("reason")}
            />
          </div>
        </div>
        {errorMessage && <div className="alert alert-danger mt-3" role="alert">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success mt-3" role="alert">{successMessage}</div>}
        <div className="d-flex justify-content-end mt-4">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </form>
  );
}
