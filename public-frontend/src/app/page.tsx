import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Hospital Management</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Doctor Directory</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Department Information</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Appointment Booking</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Contact/Location</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="p-5 mb-4 bg-light rounded-3">
          <div className="container-fluid py-5">
            <h1 className="display-5 fw-bold">Welcome to the Hospital Management System</h1>
            <p className="col-md-8 fs-4">Your health is our priority. Easily book appointments, find doctors, and manage your health records.</p>
            <button className="btn btn-primary btn-lg" type="button">Book an Appointment</button>
          </div>
        </div>
      </div>
    </div>
  );
}