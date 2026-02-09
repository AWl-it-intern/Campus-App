export default function AdminActions() {
  const handleCreateJob = () => {
    alert("Job Created sucessfully");
  };

  const handleAssignJob = () => {
    alert("Job Assigned to User(name) Sucessfully!!");
  };

  const handleCreateNewUser = () => {
    fetch("http://localhost:5000/candidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        college:"new",
        AssignedJob:""
      }),
    });
    alert("New User Inserted to Db Sucessfully!!!");
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md text-center">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          Admin Dashboard
        </h1>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleCreateJob}
            className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
          >
            Create Job
          </button>

          <button
            onClick={handleAssignJob}
            className="px-6 py-2 rounded-lg border border-green-600 text-green-700 font-medium hover:bg-green-100 transition"
          >
            Assign Job
          </button>

          <button
            onClick={handleCreateNewUser}
            className="px-6 py-2 rounded-lg border border-green-600 text-green-700 font-medium hover:bg-green-100 transition"
          >
            Insert New User
          </button>
        </div>
      </div>
    </div>
  );
}
