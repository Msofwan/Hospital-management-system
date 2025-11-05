import type { DoctorProfile } from "../types/public";

interface DoctorCardProps {
  doctor: DoctorProfile;
}

const DAY_ORDER: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const fullName = `${doctor.firstName} ${doctor.lastName}`.trim();
  const sortedSchedules = [...doctor.schedules].sort((a, b) => {
    const dayComparison = (DAY_ORDER[a.dayOfWeek] || 8) - (DAY_ORDER[b.dayOfWeek] || 8);
    if (dayComparison !== 0) {
      return dayComparison;
    }
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-primary">{fullName}</h5>
        <p className="card-text mb-1">
          <strong>Specialization:</strong> {doctor.specialization ?? "General Practitioner"}
        </p>
        {doctor.department && (
          <p className="card-text mb-1">
            <strong>Department:</strong> {doctor.department}
          </p>
        )}
        {doctor.employmentType && (
          <p className="card-text mb-1">
            <strong>Employment:</strong> {doctor.employmentType}
          </p>
        )}
        {doctor.nextAvailableSlots.length > 0 && (
          <div className="mt-3">
            <h6 className="text-muted text-uppercase small">Next Availability</h6>
            <ul className="list-unstyled small mb-0">
              {doctor.nextAvailableSlots.slice(0, 3).map((slot, index) => {
                const slotDate = new Date(slot);
                return (
                  <li key={`${doctor.id}-slot-${index}`}>
                    {slotDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    {" · "}
                    {slotDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <div className="mt-3">
          <h6 className="text-muted text-uppercase small">Weekly Availability</h6>
          {sortedSchedules.length === 0 ? (
            <p className="small mb-0">Schedule information coming soon.</p>
          ) : (
            <ul className="list-unstyled small mb-0">
              {sortedSchedules.map((schedule, index) => (
                <li key={`${schedule.dayOfWeek}-${schedule.startTime}-${index}`}>
                  <strong>{schedule.dayOfWeek}:</strong> {schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}
                  {schedule.location ? ` · ${schedule.location}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
