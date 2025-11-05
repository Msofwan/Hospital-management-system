"use client";

import { useMemo, useState } from "react";

import type { DoctorProfile } from "../types/public";
import DoctorCard from "./DoctorCard";

interface DoctorDirectoryProps {
  doctors: DoctorProfile[];
}

export default function DoctorDirectory({ doctors }: DoctorDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("" );
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const departments = useMemo(() => {
    const unique = new Set<string>();
    doctors.forEach((doctor) => {
      if (doctor.department) {
        unique.add(doctor.department);
      }
    });
    return Array.from(unique).sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesDepartment = departmentFilter === "all" || doctor.department === departmentFilter;
      const term = searchTerm.trim().toLowerCase();
      if (!term) {
        return matchesDepartment;
      }
      const haystack = `${doctor.firstName} ${doctor.lastName} ${doctor.specialization ?? ""} ${doctor.department ?? ""}`.toLowerCase();
      return matchesDepartment && haystack.includes(term);
    });
  }, [doctors, departmentFilter, searchTerm]);

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body p-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-6">
                <label htmlFor="doctorSearch" className="form-label">Search by name or specialty</label>
                <input
                  id="doctorSearch"
                  className="form-control"
                  placeholder="e.g. cardiology or Dr. Carter"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="departmentFilter" className="form-label">Filter by department</label>
                <select
                  id="departmentFilter"
                  className="form-select"
                  value={departmentFilter}
                  onChange={(event) => setDepartmentFilter(event.target.value)}
                >
                  <option value="all">All departments</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2 text-md-end">
                <small className="text-muted d-block">
                  Showing {filteredDoctors.length} of {doctors.length}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
      {filteredDoctors.length === 0 ? (
        <div className="col-12">
          <div className="alert alert-info mb-0">No doctors match your search. Try adjusting your filters.</div>
        </div>
      ) : (
        filteredDoctors.map((doctor) => (
          <div className="col-md-6 col-lg-4" key={doctor.id}>
            <DoctorCard doctor={doctor} />
          </div>
        ))
      )}
    </div>
  );
}
