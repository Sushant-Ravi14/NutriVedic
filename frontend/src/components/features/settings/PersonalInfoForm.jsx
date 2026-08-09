import React, { useState } from 'react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';

export const PersonalInfoForm = ({ initialData = {}, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || 'Aarav',
    lastName: initialData.lastName || 'Sharma',
    email: initialData.email || 'aarav@example.com',
    age: initialData.age || 28,
    weight: initialData.weight || 72,
    height: initialData.height || 175
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      <div>
        <h3 className="font-serif text-[22px] text-black font-bold mb-1">Personal Information</h3>
        <p className="font-sans text-xs text-muted">Update your profile parameters and biometrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="FIRST NAME"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        />
        <Input
          label="LAST NAME"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        />
        <Input
          label="EMAIL ADDRESS"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled
        />
        <Input
          label="AGE"
          type="number"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
        />
        <Input
          label="WEIGHT (KG)"
          type="number"
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
        />
        <Input
          label="HEIGHT (CM)"
          type="number"
          value={formData.height}
          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary">
          Save Changes
        </Button>
      </div>
    </form>
  );
};
