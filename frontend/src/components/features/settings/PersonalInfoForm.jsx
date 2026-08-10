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
    height: initialData.height || 175,
    goal: initialData.goal || 'maintain'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      <div>
        <h3 className="font-serif text-[22px] text-black font-bold mb-1">Personal Information</h3>
        <p className="font-sans text-xs text-muted">Update your profile parameters, biometrics, and fitness goal.</p>
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
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] text-label uppercase tracking-[1.5px] block font-medium">
            DIETARY GOAL
          </label>
          <select
            className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 font-sans text-sm text-black focus:outline-none focus:border-black transition-colors"
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
          >
            <option value="maintain">Healthy / Maintain Weight</option>
            <option value="build_muscle">Build Muscle / Gain Mass</option>
            <option value="fat_loss">Fat Loss / Calorie Deficit</option>
          </select>
        </div>
      </div>

      {/* Dynamic BMI and Health Status Info Box */}
      {formData.weight > 0 && formData.height > 0 && (
        <div className="p-4 bg-surface border border-border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <span className="font-mono text-[10px] text-label uppercase block">BODY MASS INDEX (BMI)</span>
            <span className="font-serif text-xl font-bold text-black mt-1 block">
              {(formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)} kg/m²
            </span>
          </div>
          <div className="font-sans text-xs">
            <span className="text-muted block">Status:</span>
            {(() => {
              const bmiVal = formData.weight / Math.pow(formData.height / 100, 2);
              if (bmiVal < 18.5) return <span className="font-semibold text-yellow-600">Underweight</span>;
              if (bmiVal < 25) return <span className="font-semibold text-green-600">Normal / Healthy</span>;
              if (bmiVal < 30) return <span className="font-semibold text-orange-600">Overweight</span>;
              return <span className="font-semibold text-red-600">Obese</span>;
            })()}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="primary">
          Save Changes
        </Button>
      </div>
    </form>
  );
};
