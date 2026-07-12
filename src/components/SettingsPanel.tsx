import React, { useState } from 'react';
import { X, Shield, Moon, Share2, Users, Phone, Plus, Trash2, Edit2, Check, Loader2 } from 'lucide-react';
import { useSafety } from '../contexts/SafetyContext';
import type { EmergencyContact } from '../types';
import toast from 'react-hot-toast';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isNightMode: boolean;
}

export function SettingsPanel({ isOpen, onClose, isNightMode }: SettingsPanelProps) {
  const {
    safetySettings,
    toggleNightMode,
    toggleWomenSafetyMode,
    emergencyContacts,
    addEmergencyContact,
    removeEmergencyContact,
    updateSettings,
    isLoading,
  } = useSafety();

  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [isAddingContact, setIsAddingContact] = useState(false);

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Please enter name and phone number');
      return;
    }

    setIsAddingContact(true);
    try {
      await addEmergencyContact({
        name: newContact.name,
        phone: newContact.phone,
        relationship: newContact.relationship || 'Other',
        is_primary: emergencyContacts.length === 0,
      });
      setNewContact({ name: '', phone: '', relationship: '' });
      setShowAddContact(false);
      toast.success('Emergency contact added');
    } catch {
      toast.error('Failed to add contact');
    } finally {
      setIsAddingContact(false);
    }
  };

  const handleRemoveContact = async (id: string) => {
    if (!confirm('Are you sure you want to remove this contact?')) return;
    try {
      await removeEmergencyContact(id);
      toast.success('Contact removed');
    } catch {
      toast.error('Failed to remove contact');
    }
  };

  if (!isOpen) return null;

  const bgClass = isNightMode ? 'bg-night-bg' : 'bg-gray-50';
  const cardClass = isNightMode ? 'bg-night-card border-night-border' : 'bg-white border-gray-200';
  const textClass = isNightMode ? 'text-night-text' : 'text-gray-900';
  const subTextClass = isNightMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`relative w-full max-w-md h-full ${bgClass} shadow-xl overflow-y-auto`}
      >
        <div className={`sticky top-0 ${cardClass} border-b p-4 flex items-center justify-between z-10`}>
          <h2 className={`text-xl font-bold ${textClass}`}>Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Safety Modes */}
          <div className={`${cardClass} border rounded-xl p-4`}>
            <h3 className={`text-sm font-semibold mb-4 ${textClass}`}>SAFETY MODES</h3>

            <div className="space-y-4">
              <ToggleOption
                icon={<Shield className="w-5 h-5 text-pink-500" />}
                title="Women's Safety Mode"
                description="Enables enhanced route safety scoring for women's safety"
                checked={safetySettings?.womenSafetyMode ?? true}
                onChange={toggleWomenSafetyMode}
                isNightMode={isNightMode}
              />

              <ToggleOption
                icon={<Moon className="w-5 h-5 text-blue-400" />}
                title="Night Mode"
                description="Optimizes routes for night travel with better lighting priority"
                checked={isNightMode}
                onChange={toggleNightMode}
                isNightMode={isNightMode}
              />

              <ToggleOption
                icon={<Share2 className="w-5 h-5 text-green-500" />}
                title="Auto Trip Sharing"
                description="Automatically share trips with primary contacts"
                checked={safetySettings?.shareTripAutomatically ?? false}
                onChange={() => updateSettings({ shareTripAutomatically: !safetySettings?.shareTripAutomatically })}
                isNightMode={isNightMode}
              />
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className={`${cardClass} border rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${textClass}`}>EMERGENCY CONTACTS</h3>
              <button
                onClick={() => setShowAddContact(true)}
                className="p-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {emergencyContacts.length === 0 ? (
              <div className={`text-center py-6 ${subTextClass}`}>
                <Phone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No emergency contacts added</p>
                <p className="text-xs">Add contacts for SOS alerts</p>
              </div>
            ) : (
              <div className="space-y-2">
                {emergencyContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onRemove={handleRemoveContact}
                    isNightMode={isNightMode}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Add Contact Form */}
          {showAddContact && (
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4`}>
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddContact(false)} />
              <div className={`relative ${cardClass} border rounded-xl p-6 w-full max-w-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary-100">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${textClass}`}>Add Emergency Contact</h4>
                    <p className={`text-xs ${subTextClass}`}>They'll receive SOS alerts</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isNightMode ? 'bg-night-bg border-night-border text-night-text' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-2 focus:ring-primary-500`}
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={newContact.phone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isNightMode ? 'bg-night-bg border-night-border text-night-text' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-2 focus:ring-primary-500`}
                  />
                  <select
                    value={newContact.relationship}
                    onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${isNightMode ? 'bg-night-bg border-night-border text-night-text' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-2 focus:ring-primary-500`}
                  >
                    <option value="">Select relationship</option>
                    <option value="Family">Family</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddContact(false)}
                    className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddContact}
                    disabled={isAddingContact}
                    className="flex-1 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAddingContact ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleOption({
  icon,
  title,
  description,
  checked,
  onChange,
  isNightMode,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  isNightMode: boolean;
}) {
  return (
    <button
      onClick={onChange}
      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-night-bg transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gray-100">
          {icon}
        </div>
        <div className="text-left">
          <p className={`text-sm font-medium ${isNightMode ? 'text-night-text' : 'text-gray-900'}`}>
            {title}
          </p>
          <p className={`text-xs ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {description}
          </p>
        </div>
      </div>
      <div
        className={`w-12 h-6 rounded-full p-1 transition-colors ${
          checked ? 'bg-primary-500' : isNightMode ? 'bg-night-border' : 'bg-gray-300'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </button>
  );
}

function ContactCard({
  contact,
  onRemove,
  isNightMode,
}: {
  contact: EmergencyContact;
  onRemove: (id: string) => void;
  isNightMode: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl ${
        isNightMode ? 'bg-night-bg' : 'bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-primary-600 font-semibold">
            {contact.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className={`text-sm font-medium ${isNightMode ? 'text-night-text' : 'text-gray-900'}`}>
            {contact.name}
          </p>
          <p className={`text-xs ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {contact.phone} • {contact.relationship}
          </p>
        </div>
      </div>
      <button
        onClick={() => onRemove(contact.id)}
        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default SettingsPanel;
