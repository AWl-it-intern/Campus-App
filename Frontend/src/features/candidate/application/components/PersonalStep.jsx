import TextInput from "./TextInput";

export default function PersonalStep({ formData, updatePersonalField }) {
  return (
    <>
      <TextInput
        label="Full Name"
        required
        type="text"
        value={formData.personal.fullName}
        onChange={(event) => updatePersonalField("fullName", event.target.value)}
        placeholder="Enter your full name"
      />

      <TextInput
        label="Email"
        required
        type="email"
        value={formData.personal.email}
        onChange={(event) => updatePersonalField("email", event.target.value)}
        placeholder="Enter your email"
      />

      <TextInput
        label="Contact Number"
        required
        type="text"
        value={formData.personal.contactNumber}
        onChange={(event) => updatePersonalField("contactNumber", event.target.value)}
        placeholder="Enter contact number"
      />

      <TextInput
        label="Date of Birth"
        required
        type="date"
        value={formData.personal.dob}
        onChange={(event) => updatePersonalField("dob", event.target.value)}
      />

      <TextInput
        label="Hometown"
        required
        type="text"
        value={formData.personal.hometown}
        onChange={(event) => updatePersonalField("hometown", event.target.value)}
        placeholder="Enter your hometown"
      />
    </>
  );
}
