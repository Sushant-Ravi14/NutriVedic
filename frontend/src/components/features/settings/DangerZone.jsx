import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { deleteAccountApi } from '../../../api/user.api';
import { useAuthStore } from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';

export const DangerZone = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteAccountApi();
    clearAuth();
    navigate('/');
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h3 className="font-serif text-[22px] text-negative font-bold mb-1">Danger Zone</h3>
        <p className="font-sans text-xs text-muted">Irreversible account actions.</p>
      </div>

      <div className="border border-[#fca5a5] rounded-card p-6 bg-red-50/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h4 className="font-sans font-semibold text-sm text-negative">Delete Account</h4>
          <p className="font-sans text-xs text-muted mt-0.5 max-w-md">
            Permanently delete your profile, meal logs, scanned food history, and customized diet plans. This action cannot be undone.
          </p>
        </div>
        <Button variant="danger" onClick={() => setModalOpen(true)}>
          Delete my account
        </Button>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Confirm Account Deletion">
        <p className="font-sans text-sm text-black mb-6">
          Are you sure you want to permanently delete your account? All saved nutrition logs and custom plans will be lost.
        </p>
        <div className="flex items-center gap-3 justify-end">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
