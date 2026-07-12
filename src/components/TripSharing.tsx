import React from 'react';
import { Share2, Link, Copy, Check, X, Users } from 'lucide-react';
import { useSafety } from '../contexts/SafetyContext';
import type { Trip } from '../types';

interface TripSharingProps {
  trip: Trip | null;
  isNightMode: boolean;
}

export function TripSharing({ trip, isNightMode }: TripSharingProps) {
  const { emergencyContacts, addEmergencyContact } = useSafety();
  const [isOpen, setIsOpen] = React.useState(false);
  const [shareLink, setShareLink] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [newContact, setNewContact] = React.useState({ name: '', phone: '', relationship: '' });
  const [showAddContact, setShowAddContact] = React.useState(false);

  const handleShare = () => {
    if (!trip) {
      setShareLink(`https://safeher.app/trip/demo-${Date.now()}`);
    } else {
      setShareLink(`https://safeher.app/trip/${trip.id}`);
    }
    setIsOpen(true);
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      addEmergencyContact({
        name: newContact.name,
        phone: newContact.phone,
        relationship: newContact.relationship || 'Other',
      });
      setNewContact({ name: '', phone: '', relationship: '' });
      setShowAddContact(false);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
          isNightMode
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        <Share2 className="w-5 h-5" />
        <span>Share Trip</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className={`relative rounded-2xl shadow-2xl w-full max-w-md overflow-hidden ${
            isNightMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Header */}
            <div className={`p-4 flex items-center justify-between border-b ${
              isNightMode ? 'bg-primary-900 border-gray-700' : 'bg-primary-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary-500" />
                <div>
                  <h3 className={`font-bold ${isNightMode ? 'text-white' : 'text-gray-900'}`}>
                    Live Trip Sharing
                  </h3>
                  <p className={`text-xs ${isNightMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Share your journey in real-time
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className={`p-2 rounded-lg hover:${isNightMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <X className={`w-5 h-5 ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {/* Share Link */}
              {shareLink && (
                <div className="mb-4">
                  <label className={`text-sm font-medium mb-1 block ${isNightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                        isNightMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                      } border`}
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        copied
                          ? 'bg-green-500 text-white'
                          : 'bg-primary-500 hover:bg-primary-600 text-white'
                      }`}
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Emergency Contacts */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-medium ${isNightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Emergency Contacts
                  </label>
                  <button
                    onClick={() => setShowAddContact(true)}
                    className="text-xs text-primary-500 hover:text-primary-600"
                  >
                    + Add Contact
                  </button>
                </div>

                {emergencyContacts.length === 0 ? (
                  <p className={`text-sm italic ${isNightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    No emergency contacts added
                  </p>
                ) : (
                  <div className="space-y-2">
                    {emergencyContacts.map((contact) => (
                      <div key={contact.id} className={`flex items-center gap-3 p-2 rounded-lg ${
                        isNightMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-bold text-sm">
                            {contact.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isNightMode ? 'text-white' : 'text-gray-900'}`}>
                            {contact.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {contact.phone} - {contact.relationship}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Contact Form */}
              {showAddContact && (
                <div className={`p-3 rounded-lg border ${isNightMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <input
                    type="text"
                    placeholder="Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg mb-2 text-sm ${
                      isNightMode ? 'bg-gray-600 text-white border-gray-500' : 'bg-white text-gray-900 border-gray-200'
                    } border`}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg mb-2 text-sm ${
                      isNightMode ? 'bg-gray-600 text-white border-gray-500' : 'bg-white text-gray-900 border-gray-200'
                    } border`}
                  />
                  <select
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg mb-2 text-sm ${
                      isNightMode ? 'bg-gray-600 text-white border-gray-500' : 'bg-white text-gray-900 border-gray-200'
                    } border`}
                  >
                    <option value="">Select Relationship</option>
                    <option value="Family">Family</option>
                    <option value="Friend">Friend</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddContact(false)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                        isNightMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddContact}
                      className="flex-1 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TripSharing;
