import { useState } from "react";

export default function ApplicationForm() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    dob: "",
    hometown: "",
    homestate: "",
    pgDegree: "",
    pgSpec1: "",
    pgSpec2: "",
    gradDegree: "",
    gradSpec: "",
    gradPercentage: "",
    twelfthPercentage: "",
    tenthPercentage: "",
    internshipCompany: "",
    internshipProject: "",
    workExpCompany: "",
    totalExperience: "",
    resume: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Application submitted!");
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-[#baf0fb] to-[#c9f2a8] flex justify-center items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-7xl flex flex-col md:flex-row gap-8
                   h-[90vh] overflow-auto"
      >
        {/* Left column: Personal + Academics */}
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-4xl font-bold text-[#0f766e] text-center md:text-left mb-6">
            Application Form
          </h1>

          {/* Personal */}
          <div>
            <h3 className="font-semibold text-[#0d9488] mb-3 text-lg">Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input input-bordered w-full p-3 text-base" type="text" name="name" placeholder="Name" onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="contact" placeholder="Contact No." onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="email" placeholder="E-mail" onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="dob" placeholder="Date of Birth" onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="hometown" placeholder="Hometown" onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="homestate" placeholder="Home State" onChange={handleChange} />
            </div>
          </div>

          {/* Academics */}
          <div>
            <h3 className="font-semibold text-[#0d9488] mb-3 text-lg">Academics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input input-bordered w-full p-3 text-base" type="text" name="pgDegree" placeholder="PG Degree" onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="pgSpec1" placeholder="PG Specialization 1" onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="pgSpec2" placeholder="PG Specialization 2" onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="gradDegree" placeholder="Graduation Degree" onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="gradSpec" placeholder="Graduation Specialization" onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="gradPercentage" placeholder="Graduation %" onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="twelfthPercentage" placeholder="12th / Polytechnic %" onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="tenthPercentage" placeholder="10th %" onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Right column: Experience + Document */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Experience */}
          <div>
            <h3 className="font-semibold text-[#0d9488] mb-3 text-lg">Experience</h3>
            <div className="grid grid-cols-1 gap-4">
              <input className="input input-bordered w-full p-3 text-base" type="text" name="internshipCompany" placeholder="Summer Internship Company" onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="internshipProject" placeholder="Summer Internship Project Title" onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="workExpCompany" placeholder="Work Experience Company (if any)" onChange={handleChange} />
              <input className="input input-bordered w-full p-3 text-base" type="text" name="totalExperience" placeholder="Total Work Experience (months)" onChange={handleChange} />
            </div>
          </div>

          {/* Document */}
          <div>
            <h3 className="font-semibold text-[#0d9488] mb-3 text-lg">Document</h3>
            <label className="w-full text-center cursor-pointer flex items-center justify-center p-3
                   bg-linear-to-r from-[#14b8a6] to-[#4ade80] 
                   text-black font-medium">
              Resume
              <input type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleChange} className="hidden" />
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn w-full bg-linear-to-r from-[#14b8a6] to-[#4ade80] text-white font-semibold hover:opacity-90 p-3 text-lg"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
}
